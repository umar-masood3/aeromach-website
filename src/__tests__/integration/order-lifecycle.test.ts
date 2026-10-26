import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../lib/prisma';
import { calculateOrderPricing } from '../../lib/pricing';
import { razorpayService } from '../../lib/razorpay';
import { enqueueFulfillment, processFulfillmentJob, reconcileOrderStatus } from '../../lib/fulfillment-queue';
import { generateOrderNumber, generateTrackingToken } from '../../lib/utils';

describe('Integration Tests: End-to-End Order Lifecycle, Payment & Outbox Fulfillment', () => {
  let testVariant: any;

  beforeAll(async () => {
    testVariant = await prisma.productVariant.findFirst({
      where: {
        isAvailable: true,
        printifyVariantId: { not: null },
      },
      include: { product: true },
    });

    if (!testVariant) {
      throw new Error('Seed data required: productVariant with printifyVariantId not found.');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('executes complete purchase-to-fulfillment pipeline successfully', async () => {
    // 1. Authoritative price calculation
    const pricing = await calculateOrderPricing(
      [{ variantId: testVariant.id, quantity: 1 }],
      'India'
    );

    // 2. Create pending order in database
    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        trackingToken,
        customerName: 'A. P. J. Abdul Kalam',
        customerEmail: 'kalam@drdo.gov.in',
        customerPhone: '+91 99999 88888',
        shippingAddress1: 'DRDO Missile Complex, Kanchanbagh',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500058',
        country: 'India',
        currency: 'INR',
        subtotal: pricing.subtotal,
        shippingFee: pricing.shippingFee,
        taxAmount: pricing.taxAmount,
        totalAmount: pricing.totalAmount,
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        items: {
          create: [
            {
              variantId: testVariant.id,
              productTitle: testVariant.product.title,
              variantTitle: testVariant.title,
              size: testVariant.size,
              color: testVariant.color,
              unitPrice: testVariant.price,
              quantity: 1,
              totalPrice: testVariant.price,
              printifyVariantId: testVariant.printifyVariantId,
            },
          ],
        },
      },
      include: { items: true },
    });

    expect(order.id).toBeTruthy();
    expect(order.paymentStatus).toBe('PENDING');
    expect(order.fulfillmentStatus).toBe('UNFULFILLED');

    // 3. Simulate payment verification
    const razorpayOrderId = `order_test_${order.orderNumber}`;
    const razorpayPaymentId = `pay_test_${Date.now()}`;
    const validSignature = razorpayService.generateTestSignature(razorpayOrderId, razorpayPaymentId);

    const isVerified = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature,
    });
    expect(isVerified).toBe(true);

    // Update order to PAID
    const paidOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature,
      },
    });

    expect(paidOrder.paymentStatus).toBe('PAID');

    // 4. Enqueue fulfillment job (Durable outbox)
    const jobId = await enqueueFulfillment(paidOrder.id);
    expect(jobId).toBeTruthy();

    // Verify job record exists in database
    const job = await prisma.fulfillmentJob.findUnique({
      where: { id: jobId },
    });
    expect(job).toBeDefined();
    expect(job?.orderId).toBe(paidOrder.id);

    // 5. Verify order updated with Printify provider details
    // Allow queue processor to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updatedOrder = await prisma.order.findUnique({
      where: { id: paidOrder.id },
      include: { fulfillmentJobs: true },
    });

    expect(updatedOrder?.printifyOrderId).toBeTruthy();
    expect(['SUBMITTED_TO_PRINTIFY', 'AWAITING_PRODUCTION', 'IN_PRODUCTION']).toContain(
      updatedOrder?.fulfillmentStatus
    );

    // 6. Idempotency test: Re-enqueuing does NOT duplicate fulfillment
    const secondJobId = await enqueueFulfillment(paidOrder.id);
    expect(secondJobId).toBe(jobId);

    const totalJobsForOrder = await prisma.fulfillmentJob.count({
      where: { orderId: paidOrder.id },
    });
    expect(totalJobsForOrder).toBe(1);

    // 7. Status Reconciliation test
    const reconcileResult = await reconcileOrderStatus(paidOrder.id);
    expect(reconcileResult.reconciled).toBe(true);

    const reconciledOrder = await prisma.order.findUnique({
      where: { id: paidOrder.id },
    });
    expect(reconciledOrder?.carrier).toBeTruthy();
    expect(reconciledOrder?.trackingNumber).toBeTruthy();
  });

  it('preserves paid order when fulfillment submission fails (Rule 6: Never erase customer money)', async () => {
    // Create an order with an unmapped/invalid variant ID to test resilience
    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    const failedOrder = await prisma.order.create({
      data: {
        orderNumber,
        trackingToken,
        customerName: 'Kalpana Chawla',
        customerEmail: 'chawla@nasa.aero',
        shippingAddress1: 'Karnal Space Institute',
        city: 'Karnal',
        state: 'Haryana',
        postalCode: '132001',
        country: 'India',
        currency: 'INR',
        subtotal: 1499,
        shippingFee: 150,
        taxAmount: 228,
        totalAmount: 1649,
        paymentStatus: 'PAID', // Verified paid!
        fulfillmentStatus: 'UNFULFILLED',
        items: {
          create: [
            {
              productTitle: 'Corrupted Unmapped Variant Test',
              variantTitle: 'Custom Fail',
              size: 'M',
              color: 'Pitch Black',
              unitPrice: 1499,
              quantity: 1,
              totalPrice: 1499,
              printifyVariantId: null, // Intentionally unmapped!
            },
          ],
        },
      },
    });

    // Enqueue fulfillment
    const jobId = await enqueueFulfillment(failedOrder.id);

    // Wait for worker attempt
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Reload order from database
    const orderAfterFailure = await prisma.order.findUnique({
      where: { id: failedOrder.id },
      include: { fulfillmentJobs: true },
    });

    // CRITICAL: Order MUST still exist!
    expect(orderAfterFailure).toBeDefined();
    // CRITICAL: Payment status MUST remain PAID!
    expect(orderAfterFailure?.paymentStatus).toBe('PAID');
    // Fulfillment status MUST reflect the error
    expect(orderAfterFailure?.fulfillmentStatus).toBe('SUBMISSION_FAILED');
    expect(orderAfterFailure?.adminNotes).toContain('Last fulfillment attempt failed');

    // Job record must be marked for retry or failed with details
    const failedJob = orderAfterFailure?.fulfillmentJobs[0];
    expect(failedJob?.lastError).toContain('no mapped Printify variant ID');
    expect(failedJob?.status).toMatch(/FAILED|RETRY_SCHEDULED/);
  });
});
