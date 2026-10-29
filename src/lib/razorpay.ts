import crypto from 'crypto';
import Razorpay from 'razorpay';
import { isDemoMode } from './demo-mode';

/**
 * PROBLEM B FIX — no secret fallback, ever.
 * -------------------------------------------------------------------------
 * Previously every verification path did this:
 *
 *     const secret = this.keySecret || 'aeromach_secret_placeholder';
 *
 * That literal is committed to a public repository, so on any deployment where
 * RAZORPAY_KEY_SECRET was unset or left at its .env.example placeholder, ANYONE
 * could compute a valid HMAC-SHA256 signature for any order/payment id and POST
 * it to /api/checkout/verify-payment to have an order marked PAID.
 *
 * All fallbacks are gone. Secret resolution is centralised, lazy (read at call
 * time, not captured in the constructor) and FAILS CLOSED: if the secret is
 * missing, empty, or a published placeholder, verification returns false.
 *
 * Rule: never invent a key. No secret => no verification => no payment.
 */

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Values that ship in .env.example or existed as historical fallbacks.
 * Treating these as "configured" is what made the original attack possible.
 */
const PLACEHOLDER_SECRETS: ReadonlySet<string> = new Set([
  'your_razorpay_key_secret',
  'your_razorpay_webhook_secret',
  'aeromach_secret_placeholder',
  'aeromach_webhook_secret_placeholder',
  'generate-a-strong-random-secret-here',
]);

const PLACEHOLDER_KEY_IDS: ReadonlySet<string> = new Set([
  'rzp_test_your_key_id',
  'rzp_test_aeromach_placeholder',
]);

function usableSecret(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (PLACEHOLDER_SECRETS.has(trimmed)) return null;
  return trimmed;
}

class RazorpayService {
  private client: Razorpay | null = null;
  private clientSecretUsed: string | null = null;

  constructor() {
    // The SDK client is only constructed when real credentials exist.
    this.ensureClient();
  }

  /** Read from the environment at call time so tests and cold starts agree. */
  private keyId(): string | null {
    const value = process.env.RAZORPAY_KEY_ID?.trim();
    if (!value || PLACEHOLDER_KEY_IDS.has(value)) return null;
    return value;
  }

  private keySecret(): string | null {
    return usableSecret(process.env.RAZORPAY_KEY_SECRET);
  }

  private webhookSecret(): string | null {
    return usableSecret(process.env.RAZORPAY_WEBHOOK_SECRET);
  }

  /** Build (or rebuild) the SDK client, but only with a genuine secret. */
  private ensureClient(): Razorpay | null {
    const keyId = this.keyId();
    const keySecret = this.keySecret();

    if (!keyId || !keySecret) {
      this.client = null;
      this.clientSecretUsed = null;
      return null;
    }

    if (!this.client || this.clientSecretUsed !== keySecret) {
      this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
      this.clientSecretUsed = keySecret;
    }
    return this.client;
  }

  /**
   * "Can this deployment talk to Razorpay?" — true only with real credentials.
   */
  public isConfigured(): boolean {
    return Boolean(this.keyId()) && Boolean(this.keySecret());
  }

  /**
   * True only when a payment signature can actually be verified, i.e. a real
   * key secret is present. Callers should refuse to accept payments otherwise.
   */
  public canVerifyPaymentSignature(): boolean {
    return this.keySecret() !== null;
  }

  /** True only when a webhook signature can actually be verified. */
  public canVerifyWebhookSignature(): boolean {
    return this.webhookSecret() !== null;
  }

  /**
   * Public key id for the browser checkout widget. Returns null when payments
   * are not configured — callers must not open a checkout without it.
   */
  public getKeyId(): string | null {
    return this.keyId();
  }

  /**
   * Creates a Razorpay gateway order.
   * @param amount In INR Rupees (e.g. 1499.00)
   * @param receipt Unique internal order number (e.g. AM-2610-A1B2)
   */
  public async createGatewayOrder(
    amount: number,
    receipt: string,
    notes: Record<string, string> = {}
  ): Promise<RazorpayOrderResult> {
    const amountInPaise = Math.round(amount * 100);
    const client = this.ensureClient();

    // In demo mode or without credentials, never collect real payments.
    if (client && !isDemoMode()) {
      const order = await client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: String(order.receipt || receipt),
        status: order.status,
      };
    }

    // Sandbox / demo adapter: no real gateway order is created.
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 16)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
    };
  }

  /**
   * Verifies a payment signature: HMAC_SHA256("order_id|payment_id", key_secret).
   *
   * FAILS CLOSED: returns false when no genuine key secret is configured.
   * There is no fallback secret.
   */
  public verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const secret = this.keySecret();
    if (!secret) {
      console.error(
        '[razorpay] RAZORPAY_KEY_SECRET is missing or a placeholder. ' +
          'Refusing to verify any payment signature.'
      );
      return false;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return timingSafeHexEqual(expectedSignature, razorpaySignature);
  }

  /**
   * TEST-ONLY helper used by the local payment simulator and unit tests.
   *
   * Throws rather than inventing a secret, so it cannot silently produce
   * signatures that a production build would accept.
   */
  public generateTestSignature(razorpayOrderId: string, razorpayPaymentId: string): string {
    const secret = this.keySecret();
    if (!secret) {
      throw new Error(
        'Cannot generate a test payment signature: RAZORPAY_KEY_SECRET is not configured. ' +
          'Test signatures are never derived from a hardcoded fallback.'
      );
    }
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verifies a Razorpay webhook signature.
   *
   * FAILS CLOSED: returns false when RAZORPAY_WEBHOOK_SECRET is missing.
   * Callers must treat a false result as "reject the webhook".
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature || !rawBody) return false;

    const secret = this.webhookSecret();
    if (!secret) {
      console.error(
        '[razorpay] RAZORPAY_WEBHOOK_SECRET is missing or a placeholder. ' +
          'Refusing to verify any webhook.'
      );
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return timingSafeHexEqual(expectedSignature, signature);
  }
}

/** Constant-time comparison of two hex digests, tolerant of bad input. */
function timingSafeHexEqual(expected: string, actual: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const actualBuffer = Buffer.from(actual, 'utf8');
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

export const razorpayService = new RazorpayService();
