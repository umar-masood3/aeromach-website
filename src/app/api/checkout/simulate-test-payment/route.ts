import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  evaluatePaymentSimulator,
  SIMULATED_FULFILLMENT_STATUS,
  SIMULATED_PAYMENT_ID_PREFIX,
  isSimulatedPaymentId,
} from "@/lib/payment-simulator";

/**
 * TEST-ONLY PAYMENT SIMULATOR
 * -------------------------------------------------------------------------
 * SECURITY NOTICE (Problem A):
 *
 * This endpoint used to mark an order PAID for anyone who called it, and then
 * pushed that order into Printify production. Both behaviours are gone:
 *
 *   * It is gated by `evaluatePaymentSimulator()`, which fails closed in every
 *     environment except an explicit local `development`/`test` runtime that
 *     has also opted in with ENABLE_TEST_PAYMENT_SIMULATOR="true". A production
 *     deployment cannot reach the handler at all, whatever the flag says.
 *   * It NEVER calls `enqueueFulfillment()` and therefore can never submit an
 *     order to a real supplier. Orders it touches are stamped with a
 *     test-only fulfillment status so no other worker will pick them up.
 *
 * Blocked requests are answered with 404 so that a public deployment does not
 * advertise the existence of a debug endpoint.
 */

// The simulator reads request-time environment state; never cache or prerender.
export const dynamic = "force-dynamic";

const BLOCKED_RESPONSE = { success: false, error: "Not found" };

/**
 * The simulator does NOT fabricate a cryptographic signature. Minting one would
 * require the real RAZORPAY_KEY_SECRET, and any value that "looks valid" is a
 * liability if it ever leaks into a real verification path. This literal is
 * unmistakably not a signature, and the order is simultaneously stamped
 * SIMULATED_TEST_ONLY so it can never reach fulfilment.
 */
const SIMULATED_SIGNATURE_MARKER = "simulated-no-signature";

export async function POST(request: NextRequest) {
  const decision = evaluatePaymentSimulator();

  if (!decision.enabled) {
    // No body parsing, no database access, no provider calls before this point.
    console.warn(`[payment-simulator] request blocked: ${decision.reason}`);
    return NextResponse.json(BLOCKED_RESPONSE, { status: 404 });
  }

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON body" },
        { status: 400 },
      );
    }

    const orderId = body?.orderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    // Never let a simulator run overwrite a genuine payment record.
    if (
      order.paymentStatus === "PAID" &&
      !isSimulatedPaymentId(order.razorpayPaymentId)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order is already paid through a real payment gateway; refusing to simulate.",
        },
        { status: 409 },
      );
    }

    const razorpayOrderId =
      order.razorpayOrderId || `order_sim_${order.orderNumber}`;
    const razorpayPaymentId = `${SIMULATED_PAYMENT_ID_PREFIX}${Math.random().toString(36).substring(2, 12)}`;
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: SIMULATED_SIGNATURE_MARKER,
        // Explicitly test-only: keeps the order out of every real fulfillment path.
        fulfillmentStatus: SIMULATED_FULFILLMENT_STATUS,
        adminNotes:
          "TEST MODE: simulated payment. No supplier submission performed.",
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: "PAYMENT_SIMULATED_TEST",
        actor: "TEST_SIMULATOR",
        details: `Simulated test payment ${razorpayPaymentId}. Fulfillment intentionally NOT enqueued.`,
      },
    });

    // Intentionally no enqueueFulfillment() call here. A simulated payment must
    // never trigger real manufacturing, even in a local environment.

    return NextResponse.json({
      success: true,
      simulated: true,
      testOnly: true,
      orderNumber: updatedOrder.orderNumber,
      trackingToken: updatedOrder.trackingToken,
      paymentId: razorpayPaymentId,
      fulfillmentStatus: updatedOrder.fulfillmentStatus,
      fulfillmentDispatched: false,
    });
  } catch (error: any) {
    console.error("[payment-simulator] error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Payment simulation error" },
      { status: 500 },
    );
  }
}

/** Explicitly refuse every other verb so the route cannot be probed. */
export async function GET() {
  return NextResponse.json(BLOCKED_RESPONSE, { status: 404 });
}
