import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    const eventId = event.id || `pf_evt_${Date.now()}_${Math.random()}`;
    const eventType = event.type || 'order:updated';

    // Deduplication check
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    await prisma.webhookEvent.create({
      data: {
        provider: 'PRINTIFY',
        eventId,
        eventType,
        payload: rawBody,
        status: 'PROCESSED',
      },
    });

    const resource = event.resource || {};
    const printifyOrderId = resource.id;

    if (printifyOrderId) {
      const order = await prisma.order.findFirst({
        where: { printifyOrderId: String(printifyOrderId) },
      });

      if (order) {
        let newFulfillmentStatus = order.fulfillmentStatus;
        let carrier = order.carrier;
        let trackingNumber = order.trackingNumber;
        let trackingUrl = order.trackingUrl;

        if (eventType === 'order:sent-to-production' || resource.status === 'in_production') {
          newFulfillmentStatus = 'IN_PRODUCTION';
        } else if (eventType === 'order:shipment:created' || resource.status === 'fulfilled') {
          newFulfillmentStatus = 'SHIPPED';
        } else if (eventType === 'order:shipment:delivered') {
          newFulfillmentStatus = 'DELIVERED';
        }

        if (resource.shipments && resource.shipments.length > 0) {
          const s = resource.shipments[0];
          carrier = s.carrier || carrier;
          trackingNumber = s.number || trackingNumber;
          trackingUrl = s.url || trackingUrl;
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfillmentStatus: newFulfillmentStatus,
            printifyStatus: resource.status || order.printifyStatus,
            carrier,
            trackingNumber,
            trackingUrl,
          },
        });

        await prisma.auditLog.create({
          data: {
            orderId: order.id,
            action: 'PRINTIFY_WEBHOOK_UPDATE',
            actor: 'WEBHOOK',
            details: `Updated status to ${newFulfillmentStatus} via event ${eventType}`,
          },
        });
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Printify webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
