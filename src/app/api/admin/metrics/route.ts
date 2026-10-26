import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminAccess(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalOrders,
      pendingPaymentOrders,
      paidAwaitingFulfillment,
      inProductionOrders,
      shippedOrders,
      deliveredOrders,
      failedJobsCount,
      failedOrdersCount,
      recentRevenueAgg,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          fulfillmentStatus: { in: ['UNFULFILLED', 'QUEUED'] },
        },
      }),
      prisma.order.count({
        where: { fulfillmentStatus: { in: ['SUBMITTED_TO_PRINTIFY', 'AWAITING_PRODUCTION', 'IN_PRODUCTION'] } },
      }),
      prisma.order.count({ where: { fulfillmentStatus: 'SHIPPED' } }),
      prisma.order.count({ where: { fulfillmentStatus: 'DELIVERED' } }),
      prisma.fulfillmentJob.count({ where: { status: { in: ['FAILED', 'RETRY_SCHEDULED'] } } }),
      prisma.order.count({ where: { fulfillmentStatus: 'SUBMISSION_FAILED' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: { orderNumber: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrders,
        totalRevenue: recentRevenueAgg._sum.totalAmount || 0,
        pendingPaymentOrders,
        paidAwaitingFulfillment,
        inProductionOrders,
        shippedOrders,
        deliveredOrders,
        failedJobsCount,
        failedOrdersCount,
        requiresActionCount: failedJobsCount + failedOrdersCount,
      },
      recentActivity: recentAuditLogs,
    });
  } catch (error: any) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}
