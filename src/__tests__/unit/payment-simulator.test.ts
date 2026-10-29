import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  evaluatePaymentSimulator,
  isPaymentSimulatorEnabled,
  isSimulatedPaymentId,
  isSimulatedFulfillmentStatus,
  resolveCheckoutMode,
  SIMULATED_FULFILLMENT_STATUS,
  SIMULATED_PAYMENT_ID_PREFIX,
} from '../../lib/payment-simulator';

/**
 * Problem A regression tests, part 1: the environment guard.
 *
 * These are pure functions of an environment object, so the whole matrix can be
 * exercised without touching process.env. `afterEach` additionally proves the
 * real process environment is left exactly as it was found.
 */

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
});

describe('evaluatePaymentSimulator - blocked environments', () => {
  it('rejects production even when the opt-in flag is true', () => {
    const decision = evaluatePaymentSimulator({
      NODE_ENV: 'production',
      ENABLE_TEST_PAYMENT_SIMULATOR: 'true',
    });

    expect(decision.enabled).toBe(false);
    expect(decision.reason).toMatch(/production/i);
  });

  it('rejects production when the flag is false', () => {
    expect(
      evaluatePaymentSimulator({ NODE_ENV: 'production', ENABLE_TEST_PAYMENT_SIMULATOR: 'false' })
        .enabled
    ).toBe(false);
  });

  it('rejects production when the flag is missing', () => {
    expect(evaluatePaymentSimulator({ NODE_ENV: 'production' }).enabled).toBe(false);
  });

  it.each(['staging', 'preview', 'prod', 'PREVIEW', 'staging-preview', 'Development', ''])(
    'rejects unexpected NODE_ENV %j regardless of the flag',
    (nodeEnv) => {
      expect(
        evaluatePaymentSimulator({ NODE_ENV: nodeEnv, ENABLE_TEST_PAYMENT_SIMULATOR: 'true' })
          .enabled
      ).toBe(false);
    }
  );

  it('rejects a missing NODE_ENV even with the flag set (fails closed)', () => {
    expect(evaluatePaymentSimulator({ ENABLE_TEST_PAYMENT_SIMULATOR: 'true' }).enabled).toBe(false);
  });

  it.each(['TRUE', '1', 'yes', 'true ', ''])(
    'treats non-exact flag value %j as disabled in development',
    (flag) => {
      expect(
        evaluatePaymentSimulator({ NODE_ENV: 'development', ENABLE_TEST_PAYMENT_SIMULATOR: flag })
          .enabled
      ).toBe(false);
    }
  );

  it('rejects development when the flag is simply absent', () => {
    expect(evaluatePaymentSimulator({ NODE_ENV: 'development' }).enabled).toBe(false);
  });
});

describe('evaluatePaymentSimulator - permitted environments', () => {
  it.each(['development', 'test'])('allows %s only with an explicit opt-in', (nodeEnv) => {
    const decision = evaluatePaymentSimulator({
      NODE_ENV: nodeEnv,
      ENABLE_TEST_PAYMENT_SIMULATOR: 'true',
    });
    expect(decision.enabled).toBe(true);
  });
});

describe('isPaymentSimulatorEnabled against the live process.env', () => {
  beforeEach(() => {
    // Cast required: @types/node declares NODE_ENV as read-only.
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.ENABLE_TEST_PAYMENT_SIMULATOR = 'true';
  });

  it('reads process.env by default and blocks production', () => {
    // The deployer's flag says "allow everything"; the environment says no.
    expect(process.env.ENABLE_TEST_PAYMENT_SIMULATOR).toBe('true');
    expect(isPaymentSimulatorEnabled()).toBe(false);
  });
});

describe('simulated-payment markers', () => {
  it('recognises simulator-minted payment IDs', () => {
    expect(isSimulatedPaymentId(`${SIMULATED_PAYMENT_ID_PREFIX}abc123`)).toBe(true);
    expect(isSimulatedPaymentId('pay_Nk3jR9realLookingGatewayId')).toBe(false);
    expect(isSimulatedPaymentId(null)).toBe(false);
    expect(isSimulatedPaymentId(undefined)).toBe(false);
  });

  it('recognises the test-only fulfillment status and no real lifecycle state', () => {
    expect(isSimulatedFulfillmentStatus(SIMULATED_FULFILLMENT_STATUS)).toBe(true);
    for (const real of ['UNFULFILLED', 'QUEUED', 'SUBMITTED_TO_PRINTIFY', 'IN_PRODUCTION', 'SHIPPED']) {
      expect(isSimulatedFulfillmentStatus(real)).toBe(false);
    }
  });

  it('does not reuse a real fulfillment lifecycle value', () => {
    expect([
      'UNFULFILLED',
      'QUEUED',
      'SUBMITTED_TO_PRINTIFY',
      'AWAITING_PRODUCTION',
      'IN_PRODUCTION',
      'SHIPPED',
      'DELIVERED',
      'SUBMISSION_FAILED',
      'CANCELLED',
    ]).not.toContain(SIMULATED_FULFILLMENT_STATUS);
  });
});

describe('resolveCheckoutMode', () => {
  it('is disabled on a production deployment with no gateway configured', () => {
    expect(
      resolveCheckoutMode({
        paymentsConfigured: false,
        simulatorEnabled: false,
        nodeEnv: 'production',
      })
    ).toBe('disabled');
  });

  it('never exposes the sandbox in production, even if a caller claims it is enabled', () => {
    expect(
      resolveCheckoutMode({
        paymentsConfigured: false,
        simulatorEnabled: true,
        nodeEnv: 'production',
      })
    ).toBe('disabled');
  });

  it('shows live checkout when a real gateway is configured', () => {
    expect(
      resolveCheckoutMode({
        paymentsConfigured: true,
        simulatorEnabled: false,
        nodeEnv: 'production',
      })
    ).toBe('live');
  });

  it('shows the sandbox only for a local environment with the simulator on', () => {
    expect(
      resolveCheckoutMode({
        paymentsConfigured: false,
        simulatorEnabled: true,
        nodeEnv: 'development',
      })
    ).toBe('sandbox');
  });
});
