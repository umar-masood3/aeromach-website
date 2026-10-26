import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpayService } from '@/lib/razorpay';
import { enqueueFulfillment } from '@/lib/fulfillment-queue';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature if configured
    if (razorpayService.isConfigured()) {
      const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventId = event.event_id || event.id || `rzp_evt_${Date.now()}_${Math.random()}`;

    // Deduplication check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // Record webhook event before processing
    await prisma.webhookEvent.create({
      data: {
        provider: 'RAZORPAY',
        eventId,
        eventType: event.event || 'unknown',
        payload: rawBody,
        status: 'PROCESSED',
      },
    });

    // Process payment capture / order paid events
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId },
        });

        if (order && order.paymentStatus !== 'PAID') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
            },
          });

          await prisma.auditLog.create({
            data: {
              orderId: order.id,
              action: 'PAYMENT_CONFIRMED_VIA_WEBHOOK',
              actor: 'WEBHOOK',
              details: `Webhook event ${event.event} received and verified`,
            },
          });

          await enqueueFulfillment(order.id);
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
