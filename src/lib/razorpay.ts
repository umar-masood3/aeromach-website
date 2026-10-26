import crypto from 'crypto';
import Razorpay from 'razorpay';

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

class RazorpayService {
  private keyId: string | undefined;
  private keySecret: string | undefined;
  private webhookSecret: string | undefined;
  private client: Razorpay | null = null;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (this.isConfigured()) {
      this.client = new Razorpay({
        key_id: this.keyId!,
        key_secret: this.keySecret!,
      });
    }
  }

  public isConfigured(): boolean {
    return (
      Boolean(this.keyId) &&
      this.keyId !== 'rzp_test_your_key_id' &&
      this.keyId !== 'rzp_test_aeromach_placeholder' &&
      Boolean(this.keySecret) &&
      this.keySecret !== 'your_razorpay_key_secret' &&
      this.keySecret !== 'aeromach_secret_placeholder'
    );
  }

  public getKeyId(): string {
    return this.keyId || 'rzp_test_aeromach_placeholder';
  }

  /**
   * Creates a Razorpay gateway order
   * @param amount In INR Rupees (e.g. 1499.00)
   * @param receipt Unique internal order number (e.g. AM-2610-A1B2)
   */
  public async createGatewayOrder(
    amount: number,
    receipt: string,
    notes: Record<string, string> = {}
  ): Promise<RazorpayOrderResult> {
    const amountInPaise = Math.round(amount * 100);

    if (this.isConfigured() && this.client) {
      const order = await this.client.orders.create({
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

    // Sandbox / Test Simulator Adapter
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
   * Verifies payment signature using HMAC SHA256
   * signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
   */
  public verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const secret = this.keySecret || 'aeromach_secret_placeholder';
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Constant-time comparison
    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(razorpaySignature, 'utf8');
      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Generates a valid test signature for sandbox / automated QA testing
   */
  public generateTestSignature(razorpayOrderId: string, razorpayPaymentId: string): string {
    const secret = this.keySecret || 'aeromach_secret_placeholder';
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verifies Razorpay Webhook signature
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.webhookSecret || 'aeromach_webhook_secret_placeholder';
    if (!signature || !rawBody) return false;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(signature, 'utf8');
      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
