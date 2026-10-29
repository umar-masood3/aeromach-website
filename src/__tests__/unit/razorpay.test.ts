import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import { razorpayService } from '../../lib/razorpay';

/**
 * Razorpay unit tests.
 *
 * PROBLEM B: these previously passed only because `verifyPaymentSignature()`
 * fell back to the hardcoded 'aeromach_secret_placeholder' when no secret was
 * configured. They now inject an explicit test secret and add regression tests
 * proving that the fallback is gone.
 */

const TEST_SECRET = 'test_only_secret_not_a_real_key_0123456789';
const TEST_WEBHOOK_SECRET = 'test_only_webhook_secret_0123456789';

const ENV_KEYS = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'DEMO_MODE',
] as const;

let envSnapshot: Record<string, string | undefined>;

function setEnv(key: string, value: string | undefined) {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) delete env[key];
  else env[key] = value;
}

/** Sign exactly the way Razorpay does, with a chosen secret. */
function sign(orderId: string, paymentId: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

beforeEach(() => {
  envSnapshot = {} as any;
  for (const key of ENV_KEYS) envSnapshot[key] = process.env[key];
  vi.restoreAllMocks();
});

afterEach(() => {
  for (const key of ENV_KEYS) setEnv(key, envSnapshot[key]);
});

function configureRealCredentials() {
  setEnv('RAZORPAY_KEY_ID', 'rzp_test_ABC123REAL');
  setEnv('RAZORPAY_KEY_SECRET', TEST_SECRET);
}

describe('with real credentials configured', () => {
  beforeEach(configureRealCredentials);

  it('creates a gateway order with the amount in paise', async () => {
    // Force the demo adapter so this unit test never makes a network call to
    // Razorpay; the paise conversion being asserted is identical either way.
    setEnv('DEMO_MODE', 'true');
    const order = await razorpayService.createGatewayOrder(1499, 'AM-TEST-001');

    expect(order).toBeDefined();
    expect(order.id).toBeTruthy();
    expect(order.amount).toBe(149900);
    expect(order.currency).toBe('INR');
  });

  it('accepts an authentic HMAC-SHA256 signature', () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';

    const valid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: sign(orderId, paymentId, TEST_SECRET),
    });

    expect(valid).toBe(true);
  });

  it('rejects a tampered payment id', () => {
    const orderId = 'order_test_998877';
    const valid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_tampered_attack',
      razorpaySignature: sign(orderId, 'pay_test_112233', TEST_SECRET),
    });

    expect(valid).toBe(false);
  });

  it('rejects a tampered order id', () => {
    const paymentId = 'pay_test_112233';
    const valid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: 'order_different_order',
      razorpayPaymentId: paymentId,
      razorpaySignature: sign('order_test_998877', paymentId, TEST_SECRET),
    });

    expect(valid).toBe(false);
  });

  it('rejects an arbitrary signature string', () => {
    const valid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: 'order_test_998877',
      razorpayPaymentId: 'pay_test_112233',
      razorpaySignature: 'fake_random_hex_signature_abcdef1234567890',
    });

    expect(valid).toBe(false);
  });

  it('rejects missing or empty parameters', () => {
    expect(
      razorpayService.verifyPaymentSignature({
        razorpayOrderId: '',
        razorpayPaymentId: 'pay_test_112233',
        razorpaySignature: 'sig',
      })
    ).toBe(false);

    expect(
      razorpayService.verifyPaymentSignature({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: '',
        razorpaySignature: 'sig',
      })
    ).toBe(false);
  });

  it('accepts an authentic webhook signature and rejects a tampered body', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    const good = crypto.createHmac('sha256', TEST_WEBHOOK_SECRET).update(body).digest('hex');

    setEnv('RAZORPAY_WEBHOOK_SECRET', TEST_WEBHOOK_SECRET);
    expect(razorpayService.verifyWebhookSignature(body, good)).toBe(true);
    expect(razorpayService.verifyWebhookSignature(body + 'x', good)).toBe(false);
  });
});

describe('PROBLEM B: with no secret configured, verification fails closed', () => {
  beforeEach(() => {
    setEnv('RAZORPAY_KEY_ID', undefined);
    setEnv('RAZORPAY_KEY_SECRET', undefined);
    setEnv('RAZORPAY_WEBHOOK_SECRET', undefined);
  });

  it('reports that it cannot verify a payment signature', () => {
    expect(razorpayService.canVerifyPaymentSignature()).toBe(false);
    expect(razorpayService.isConfigured()).toBe(false);
  });

  it('rejects a signature computed with the historical placeholder secret', () => {
    // This is the exact attack that worked before the fix.
    const forged = sign('order_demo123', 'pay_forged_001', 'aeromach_secret_placeholder');

    const accepted = razorpayService.verifyPaymentSignature({
      razorpayOrderId: 'order_demo123',
      razorpayPaymentId: 'pay_forged_001',
      razorpaySignature: forged,
    });

    expect(accepted).toBe(false);
  });

  it('rejects every string that ships as a placeholder in .env.example', () => {
    const placeholders = [
      'your_razorpay_key_secret',
      'aeromach_secret_placeholder',
      'aeromach_webhook_secret_placeholder',
    ];

    for (const secret of placeholders) {
      setEnv('RAZORPAY_KEY_ID', 'rzp_test_ABC123REAL');
      setEnv('RAZORPAY_KEY_SECRET', secret);

      expect(razorpayService.canVerifyPaymentSignature()).toBe(false);
      expect(
        razorpayService.verifyPaymentSignature({
          razorpayOrderId: 'order_x',
          razorpayPaymentId: 'pay_y',
          razorpaySignature: sign('order_x', 'pay_y', secret),
        })
      ).toBe(false);
    }
  });

  it('ignores an empty or whitespace-only secret', () => {
    for (const secret of ['', '   ']) {
      setEnv('RAZORPAY_KEY_ID', 'rzp_test_ABC123REAL');
      setEnv('RAZORPAY_KEY_SECRET', secret);
      expect(razorpayService.canVerifyPaymentSignature()).toBe(false);
    }
  });

  it('refuses to mint a test signature from a fallback secret', () => {
    expect(() => razorpayService.generateTestSignature('order_1', 'pay_1')).toThrow(
      /RAZORPAY_KEY_SECRET is not configured/
    );
  });

  it('rejects webhooks when no webhook secret is configured', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    const signature = crypto
      .createHmac('sha256', 'aeromach_webhook_secret_placeholder')
      .update(body)
      .digest('hex');

    expect(razorpayService.canVerifyWebhookSignature()).toBe(false);
    expect(razorpayService.verifyWebhookSignature(body, signature)).toBe(false);
  });

  it('does not expose a placeholder key id to the browser', () => {
    expect(razorpayService.getKeyId()).toBeNull();
  });
});
