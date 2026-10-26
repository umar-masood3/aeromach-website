import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminAccess(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const paymentStatus = searchParams.get('paymentStatus');
    const fulfillmentStatus = searchParams.get('fulfillmentStatus');

    const where: any = {};

    if (query) {
      where.OR = [
        { orderNumber: { contains: query } },
        { customerEmail: { contains: query } },
        { customerName: { contains: query } },
      ];
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus && fulfillmentStatus !== 'ALL') {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        fulfillmentJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}
