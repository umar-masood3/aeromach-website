import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { processFulfillmentJob } from '@/lib/fulfillment-queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAccess(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        fulfillmentJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Cannot fulfill unpaid order' },
        { status: 400 }
      );
    }

    let job = order.fulfillmentJobs[0];

    if (!job) {
      job = await prisma.fulfillmentJob.create({
        data: {
          orderId: order.id,
          idempotencyKey: `fulfillment_${order.id}_retry_${Date.now()}`,
          status: 'PENDING',
          attempts: 0,
        },
      });
    } else {
      // Reset job status to PENDING
      job = await prisma.fulfillmentJob.update({
        where: { id: job.id },
        data: {
          status: 'PENDING',
          lastError: null,
          nextRetryAt: null,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: 'MANUAL_RETRY_INITIATED',
        actor: 'ADMIN',
        details: 'Admin triggered manual retry for fulfillment',
      },
    });

    const success = await processFulfillmentJob(job.id);

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        fulfillmentJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success,
      message: success ? 'Fulfillment job executed successfully' : 'Fulfillment attempt recorded error',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error retrying fulfillment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Retry operation failed' },
      { status: 500 }
    );
  }
}
