import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Lookup by tracking token or order id
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ trackingToken: id }, { id: id }, { orderNumber: id }],
      },
      include: {
        items: {
          select: {
            id: true,
            productTitle: true,
            variantTitle: true,
            size: true,
            color: true,
            unitPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Sanitize customer and financial information for public customer view
    const safeOrder = {
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)),
      shippingAddress: {
        city: order.city,
        state: order.state,
        country: order.country,
        postalCode: order.postalCode,
      },
      currency: order.currency,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      items: order.items,
    };

    return NextResponse.json({ success: true, order: safeOrder });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
}
