import { NextResponse } from "next/server";
import { razorpayService } from "@/lib/razorpay";
import {
  evaluatePaymentSimulator,
  resolveCheckoutMode,
} from "@/lib/payment-simulator";

/**
 * Reports what the checkout page is allowed to offer.
 *
 * The client must never decide for itself whether the payment simulator is
 * available - it asks the server, which applies the same guard the endpoint
 * applies. This keeps the browser from depending on NEXT_PUBLIC_* build-time
 * values that can drift from runtime reality, and it means the UI and the API
 * can never disagree about whether simulation is permitted.
 *
 * This endpoint is read-only and leaks nothing sensitive: it reports booleans
 * only, never keys, secrets or environment names.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const simulator = evaluatePaymentSimulator();
  const paymentsConfigured = razorpayService.isConfigured();

  const checkoutMode = resolveCheckoutMode({
    paymentsConfigured,
    simulatorEnabled: simulator.enabled,
  });

  return NextResponse.json(
    {
      success: true,
      paymentsConfigured,
      simulatorEnabled: simulator.enabled,
      checkoutMode,
    },
    {
      headers: {
        // Availability can change on redeploy; never let a CDN pin it.
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
