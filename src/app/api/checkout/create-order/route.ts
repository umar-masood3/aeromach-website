import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateOrderPricing } from '@/lib/pricing';
import { razorpayService } from '@/lib/razorpay';
import { generateOrderNumber, generateTrackingToken } from '@/lib/utils';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1, 'Variant ID is required'),
      quantity: z.number().int().positive('Quantity must be greater than zero'),
    })
  ).min(1, 'At least one item is required in the cart'),
  customer: z.object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email address is required'),
    phone: z.string().min(8, 'Valid phone number is required'),
    address1: z.string().min(5, 'Delivery address is required'),
    address2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State / Province is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = createOrderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { items, customer } = parseResult.data;

    // 1. Authoritative server-side price calculation
    const pricing = await calculateOrderPricing(items, customer.country);

    // 2. Generate secure identifiers
    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    // 3. Persist pending order with line item snapshots in database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          trackingToken,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress1: customer.address1,
          shippingAddress2: customer.address2,
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          country: customer.country,
          currency: pricing.currency,
          subtotal: pricing.subtotal,
          shippingFee: pricing.shippingFee,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
        },
      });

      // Snapshot line items
      for (const lineItem of pricing.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: lineItem.variantId,
            productTitle: lineItem.productTitle,
            variantTitle: lineItem.variantTitle,
            size: lineItem.size,
            color: lineItem.color,
            unitPrice: lineItem.unitPrice,
            quantity: lineItem.quantity,
            totalPrice: lineItem.totalPrice,
            printifyBlueprintId: lineItem.printifyBlueprintId,
            printifyPrintProviderId: lineItem.printifyProviderId,
            printifyVariantId: lineItem.printifyVariantId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          orderId: order.id,
          action: 'ORDER_CREATED',
          actor: 'CUSTOMER',
          details: `Order created with total ${pricing.totalAmount} ${pricing.currency}`,
        },
      });

      return order;
    });

    // 4. Create gateway order with Razorpay
    const gatewayOrder = await razorpayService.createGatewayOrder(
      pricing.totalAmount,
      newOrder.orderNumber,
      {
        orderId: newOrder.id,
        customerEmail: customer.email,
      }
    );

    // Update order with razorpayOrderId
    await prisma.order.update({
      where: { id: newOrder.id },
      data: { razorpayOrderId: gatewayOrder.id },
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      trackingToken: newOrder.trackingToken,
      razorpayOrderId: gatewayOrder.id,
      amount: pricing.totalAmount,
      currency: pricing.currency,
      keyId: razorpayService.getKeyId(),
      isConfigured: razorpayService.isConfigured(),
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while creating order',
      },
      { status: 500 }
    );
  }
}
