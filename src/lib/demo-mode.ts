/**
 * Demo mode guard.
 *
 * When DEMO_MODE=true (or NODE_ENV=production with DEMO_MODE unset/true),
 * all checkout mutations, Printify fulfillment submissions, and admin
 * write operations are disabled.
 *
 * The demo reads product data normally, but every action that would move
 * real money or submit real orders is blocked at the API level, not just
 * hidden in the UI.
 */
export function isDemoMode(): boolean {
  // Explicit opt-out: set DEMO_MODE=false in your environment to enable
  // full functionality in production (e.g., once you have real credentials).
  if (process.env.DEMO_MODE === 'false') return false;

  // Explicit opt-in
  if (process.env.DEMO_MODE === 'true') return true;

  // Default: treat production as demo unless explicitly opted out.
  return process.env.NODE_ENV === 'production';
}

export function demoBanner(): string {
  return (
    '⚠️ DEMO MODE — This storefront is for demonstration only. ' +
    'Checkout, payments, and order fulfilment are disabled. ' +
    'No real orders are being processed.'
  );
}
