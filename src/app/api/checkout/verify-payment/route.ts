import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpayService } from '@/lib/razorpay';
import { enqueueFulfillment } from '@/lib/fulfillment-queue';

export async function POST(request: NextRequest) {
  try {
    // PROBLEM B: refuse to verify anything when no genuine key secret exists.
    // Without this, an unconfigured deployment would attempt verification and
    // (previously) accept signatures derived from a published placeholder.
    if (!razorpayService.canVerifyPaymentSignature()) {
      console.error(
        '[verify-payment] RAZORPAY_KEY_SECRET is not configured. Refusing to verify payments.'
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification is not available on this deployment.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification parameters' },
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

    // Idempotency check: If already paid, return success without duplicate work
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        trackingToken: order.trackingToken,
        fulfillmentStatus: order.fulfillmentStatus,
        message: 'Payment already verified',
      });
    }

    // Verify order IDs match
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Gateway order mismatch' },
        { status: 400 }
      );
    }

    // Server-side cryptographic HMAC-SHA256 signature verification
    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      await prisma.auditLog.create({
        data: {
          orderId: order.id,
          action: 'PAYMENT_VERIFICATION_FAILED',
          actor: 'SYSTEM',
          details: `Invalid signature for payment ${razorpayPaymentId}`,
        },
      });

      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed. Untrusted payment payload.' },
        { status: 400 }
      );
    }

    // Update order status transactionally
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: 'PAYMENT_VERIFIED',
        actor: 'SYSTEM',
        details: `Payment ${razorpayPaymentId} verified successfully for ${updatedOrder.totalAmount} ${updatedOrder.currency}`,
      },
    });

    // Enqueue fulfillment job (Rule 6: separate payment and fulfillment)
    try {
      await enqueueFulfillment(updatedOrder.id);
    } catch (fulfillErr: any) {
      console.error('Error enqueuing fulfillment:', fulfillErr);
      // Notice: Payment is STILL verified and preserved even if queue fails!
    }

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      trackingToken: updatedOrder.trackingToken,
      fulfillmentStatus: updatedOrder.fulfillmentStatus,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification encountered an internal error' },
      { status: 500 }
    );
  }
}
