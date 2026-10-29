/**
 * Central policy for the Aeromach test-payment simulator (Problem A).
 *
 * The simulator exists only so that developers can exercise the checkout flow
 * locally without live Razorpay credentials. It must never be reachable from a
 * deployed environment, and it must never cause a real supplier order.
 *
 * Rules enforced here:
 *   1. The simulator is DISABLED unless NODE_ENV is explicitly one of the
 *      recognised local environments ("development" or "test").
 *   2. Even inside those environments it additionally requires the explicit
 *      opt-in flag `ENABLE_TEST_PAYMENT_SIMULATOR === "true"`.
 *   3. Every other state fails CLOSED: missing NODE_ENV, "production",
 *      "staging", "preview", "staging-preview", typo'd values, empty strings.
 *
 * `NODE_ENV` is the primary guard because hosting platforms set it themselves
 * and it is not part of application configuration, so a deployer cannot turn
 * the simulator back on by editing a .env file alone.
 */

export const SIMULATOR_OPT_IN_ENV_VAR = 'ENABLE_TEST_PAYMENT_SIMULATOR';

/**
 * The ONLY runtime environments in which the simulator may ever be considered.
 * Anything not in this set is treated as non-local and therefore blocked.
 */
export const LOCAL_ONLY_ENVIRONMENTS: ReadonlySet<string> = new Set([
  'development',
  'test',
]);

/**
 * Prefix applied to payment IDs minted by the simulator. Used as a durable
 * marker so that downstream code (notably the fulfillment queue) can refuse to
 * treat a simulated payment as something a supplier should be paid to produce.
 */
export const SIMULATED_PAYMENT_ID_PREFIX = 'pay_sim_';

/**
 * Fulfillment status written by the simulator. Deliberately NOT one of the real
 * lifecycle states (UNFULFILLED / QUEUED / SUBMITTED_TO_PRINTIFY / ...) so that
 * no existing worker, reconciler or admin action treats it as work to be done.
 */
export const SIMULATED_FULFILLMENT_STATUS = 'SIMULATED_TEST_ONLY';

export interface PaymentSimulatorDecision {
  enabled: boolean;
  reason: string;
}

type EnvLike = Record<string, string | undefined>;

/**
 * Decide whether the simulator endpoint may be used, with a human-readable
 * reason suitable for server logs. Pure: takes the environment as a parameter
 * so it can be exhaustively tested without mutating process.env.
 */
export function evaluatePaymentSimulator(
  env: EnvLike = process.env
): PaymentSimulatorDecision {
  const nodeEnv = env.NODE_ENV;

  if (!nodeEnv) {
    return { enabled: false, reason: 'NODE_ENV is not set; failing closed' };
  }

  if (!LOCAL_ONLY_ENVIRONMENTS.has(nodeEnv)) {
    return {
      enabled: false,
      reason: `NODE_ENV="${nodeEnv}" is not a local environment; simulator is production-blocked`,
    };
  }

  const flag = env[SIMULATOR_OPT_IN_ENV_VAR];
  if (flag !== 'true') {
    return {
      enabled: false,
      reason: `${SIMULATOR_OPT_IN_ENV_VAR} is ${JSON.stringify(flag ?? null)}; explicit "true" opt-in required`,
    };
  }

  return {
    enabled: true,
    reason: `local ${nodeEnv} environment with explicit opt-in`,
  };
}

export function isPaymentSimulatorEnabled(env: EnvLike = process.env): boolean {
  return evaluatePaymentSimulator(env).enabled;
}

export function isSimulatedPaymentId(paymentId: string | null | undefined): boolean {
  return typeof paymentId === 'string' && paymentId.startsWith(SIMULATED_PAYMENT_ID_PREFIX);
}

export function isSimulatedFulfillmentStatus(status: string | null | undefined): boolean {
  return status === SIMULATED_FULFILLMENT_STATUS;
}

/**
 * What the checkout page should offer a visitor.
 *
 *   live     - real payments are configured; normal Razorpay flow.
 *   sandbox  - local dev/test with the simulator explicitly enabled.
 *   disabled - demonstration deployment: nobody can pay, nothing is produced.
 */
export type CheckoutMode = 'live' | 'sandbox' | 'disabled';

export function resolveCheckoutMode(params: {
  paymentsConfigured: boolean;
  simulatorEnabled: boolean;
  nodeEnv?: string;
}): CheckoutMode {
  const nodeEnv = params.nodeEnv ?? process.env.NODE_ENV;

  // The simulator is only ever surfaced locally, regardless of what the caller
  // believes about `simulatorEnabled`.
  const sandboxAllowed =
    params.simulatorEnabled && !!nodeEnv && LOCAL_ONLY_ENVIRONMENTS.has(nodeEnv);

  if (sandboxAllowed) return 'sandbox';
  if (params.paymentsConfigured) return 'live';
  return 'disabled';
}