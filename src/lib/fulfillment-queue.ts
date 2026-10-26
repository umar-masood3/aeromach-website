import { prisma } from './prisma';
import { printify, CreatePrintifyOrderPayload, PrintifyOrderLineItem } from './printify';

export async function enqueueFulfillment(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  if (order.paymentStatus !== 'PAID') {
    throw new Error(`Cannot fulfill unpaid order. Payment status is ${order.paymentStatus}`);
  }

  // Idempotency: verify no existing fulfillment job or completed submission
  const idempotencyKey = `fulfillment_${order.id}`;
  const existingJob = await prisma.fulfillmentJob.findUnique({
    where: { idempotencyKey },
  });

  if (existingJob) {
    if (existingJob.status === 'COMPLETED') {
      return existingJob.id;
    }
    // If pending or failed, proceed to process/retry
    return existingJob.id;
  }

  // Create new durable job record
  const job = await prisma.fulfillmentJob.create({
    data: {
      orderId: order.id,
      idempotencyKey,
      status: 'PENDING',
      attempts: 0,
      payload: JSON.stringify({
        orderNumber: order.orderNumber,
        itemsCount: order.items.length,
      }),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { fulfillmentStatus: 'QUEUED' },
  });

  await prisma.auditLog.create({
    data: {
      orderId: order.id,
      action: 'FULFILLMENT_QUEUED',
      actor: 'SYSTEM',
      details: `Enqueued fulfillment job ${job.id}`,
    },
  });

  // Execute processing asynchronously
  processFulfillmentJob(job.id).catch((err) => {
    console.error(`Error processing fulfillment job ${job.id}:`, err);
  });

  return job.id;
}

export async function processFulfillmentJob(jobId: string): Promise<boolean> {
  const job = await prisma.fulfillmentJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!job) return false;
  if (job.status === 'COMPLETED') return true;

  const { order } = job;

  // Mark job as PROCESSING
  await prisma.fulfillmentJob.update({
    where: { id: job.id },
    data: {
      status: 'PROCESSING',
      attempts: { increment: 1 },
    },
  });

  try {
    // 1. Validate line items have Printify mappings
    const lineItems: PrintifyOrderLineItem[] = [];

    for (const item of order.items) {
      if (!item.printifyVariantId) {
        throw new Error(
          `Item "${item.productTitle} (${item.variantTitle})" has no mapped Printify variant ID.`
        );
      }

      lineItems.push({
        variant_id: item.printifyVariantId,
        quantity: item.quantity,
      });
    }

    // 2. Parse customer names
    const nameParts = order.customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'Aeromach';

    // 3. Construct official Printify order payload
    const payload: CreatePrintifyOrderPayload = {
      external_id: order.orderNumber,
      label: `Aeromach Order ${order.orderNumber}`,
      line_items: lineItems,
      shipping_method: 1, // Standard shipping
      send_shipping_notification: false, // We send our own branded notifications
      address_to: {
        first_name: firstName,
        last_name: lastName,
        email: order.customerEmail,
        phone: order.customerPhone || undefined,
        country: order.country.length === 2 ? order.country : 'IN',
        region: order.state,
        address1: order.shippingAddress1,
        address2: order.shippingAddress2 || undefined,
        city: order.city,
        zip: order.postalCode,
      },
    };

    // 4. Submit order to Printify API
    const printifyOrder = await printify.createOrder(payload);

    // 5. Update order and complete job
    await prisma.order.update({
      where: { id: order.id },
      data: {
        printifyOrderId: printifyOrder.id,
        printifyStatus: printifyOrder.status,
        fulfillmentStatus: 'SUBMITTED_TO_PRINTIFY',
      },
    });

    // 6. Initiate production workflow if auto-approved
    try {
      await printify.sendToProduction(printifyOrder.id);
      await prisma.order.update({
        where: { id: order.id },
        data: { fulfillmentStatus: 'AWAITING_PRODUCTION' },
      });
    } catch (prodErr: any) {
      console.warn(`Printify send-to-production note: ${prodErr.message}`);
    }

    await prisma.fulfillmentJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        response: JSON.stringify(printifyOrder),
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: 'PRINTIFY_SUBMISSION_SUCCESS',
        actor: 'SYSTEM',
        details: `Successfully submitted to Printify. Provider Order ID: ${printifyOrder.id}`,
      },
    });

    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown Printify submission error';
    console.error(`Fulfillment job ${job.id} failed:`, errorMessage);

    const attemptsSoFar = job.attempts + 1;
    const isExhausted = attemptsSoFar >= job.maxAttempts;

    // RULE 6: Never erase customer order! Keep paid order intact and flag for operational review
    await prisma.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: 'SUBMISSION_FAILED',
        adminNotes: `Last fulfillment attempt failed: ${errorMessage}`,
      },
    });

    // Schedule retry with exponential backoff if not exhausted
    const delayMinutes = Math.pow(2, attemptsSoFar);
    const nextRetryAt = isExhausted
      ? null
      : new Date(Date.now() + delayMinutes * 60 * 1000);

    await prisma.fulfillmentJob.update({
      where: { id: job.id },
      data: {
        status: isExhausted ? 'FAILED' : 'RETRY_SCHEDULED',
        lastError: errorMessage,
        nextRetryAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: 'PRINTIFY_SUBMISSION_FAILED',
        actor: 'SYSTEM',
        details: `Submission attempt ${attemptsSoFar}/${job.maxAttempts} failed: ${errorMessage}`,
      },
    });

    return false;
  }
}

export async function reconcileOrderStatus(orderId: string): Promise<any> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || !order.printifyOrderId) {
    return { reconciled: false, reason: 'No Printify order ID associated' };
  }

  const printifyOrder = await printify.getOrder(order.printifyOrderId);

  // Map Printify status to local fulfillment status
  let newFulfillmentStatus = order.fulfillmentStatus;
  let carrier = order.carrier;
  let trackingNumber = order.trackingNumber;
  let trackingUrl = order.trackingUrl;

  if (printifyOrder.status === 'in_production') {
    newFulfillmentStatus = 'IN_PRODUCTION';
  } else if (printifyOrder.status === 'fulfilled') {
    newFulfillmentStatus = 'SHIPPED';
  }

  if (printifyOrder.shipments && printifyOrder.shipments.length > 0) {
    const shipment = printifyOrder.shipments[0];
    carrier = shipment.carrier || carrier;
    trackingNumber = shipment.number || trackingNumber;
    trackingUrl = shipment.url || trackingUrl;
    newFulfillmentStatus = shipment.delivered_at ? 'DELIVERED' : 'SHIPPED';
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      printifyStatus: printifyOrder.status,
      fulfillmentStatus: newFulfillmentStatus,
      carrier,
      trackingNumber,
      trackingUrl,
    },
  });

  await prisma.auditLog.create({
    data: {
      orderId: order.id,
      action: 'STATUS_RECONCILED',
      actor: 'ADMIN',
      details: `Reconciled with Printify status: ${printifyOrder.status}`,
    },
  });

  return { reconciled: true, order: updatedOrder };
}
