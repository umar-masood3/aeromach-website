import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body;

    if (!orderNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Order reference number and associated email are required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber.trim(),
        },
        customerEmail: {
          equals: email.trim(),
        },
      },
      select: {
        trackingToken: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'No order found matching the provided order number and email address',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trackingToken: order.trackingToken,
    });
  } catch (error: any) {
    console.error('Track lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to look up order' },
      { status: 500 }
    );
  }
}
