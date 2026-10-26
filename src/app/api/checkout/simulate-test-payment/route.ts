import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpayService } from '@/lib/razorpay';
import { enqueueFulfillment } from '@/lib/fulfillment-queue';

export async function POST(request: NextRequest) {
  try {
    if (process.env.ENABLE_TEST_PAYMENT_SIMULATOR !== 'true' && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Payment simulator is disabled in production' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const razorpayOrderId = order.razorpayOrderId || `order_sim_${order.orderNumber}`;
    const razorpayPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 12)}`;
    const validSignature = razorpayService.generateTestSignature(razorpayOrderId, razorpayPaymentId);

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature,
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: 'PAYMENT_SIMULATED_TEST',
        actor: 'TEST_SIMULATOR',
        details: `Simulated successful test payment: ${razorpayPaymentId}`,
      },
    });

    // Enqueue fulfillment
    await enqueueFulfillment(updatedOrder.id);

    return NextResponse.json({
      success: true,
      simulated: true,
      orderNumber: updatedOrder.orderNumber,
      trackingToken: updatedOrder.trackingToken,
      paymentId: razorpayPaymentId,
      fulfillmentStatus: updatedOrder.fulfillmentStatus,
    });
  } catch (error: any) {
    console.error('Simulate payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment simulation error' },
      { status: 500 }
    );
  }
}
