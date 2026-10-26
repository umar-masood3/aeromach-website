import { describe, it, expect } from 'vitest';
import { razorpayService } from '../../lib/razorpay';
import crypto from 'crypto';

describe('Unit Tests: Razorpay Payment Processing & Verification', () => {
  it('creates gateway order with amount in correct currency denomination', async () => {
    const order = await razorpayService.createGatewayOrder(1499, 'AM-TEST-001');

    expect(order).toBeDefined();
    expect(order.id).toBeTruthy();
    expect(order.amount).toBe(149900); // 1499.00 * 100 paise
    expect(order.currency).toBe('INR');
  });

  it('validates authentic cryptographic HMAC-SHA256 payment signature', () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';

    // Generate valid signature using test secret
    const validSignature = razorpayService.generateTestSignature(orderId, paymentId);

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
    });

    expect(isValid).toBe(true);
  });

  it('rejects tampered payment ID', () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';
    const validSignature = razorpayService.generateTestSignature(orderId, paymentId);

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_tampered_attack',
      razorpaySignature: validSignature,
    });

    expect(isValid).toBe(false);
  });

  it('rejects tampered order ID', () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';
    const validSignature = razorpayService.generateTestSignature(orderId, paymentId);

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: 'order_different_order',
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
    });

    expect(isValid).toBe(false);
  });

  it('rejects forged or arbitrary signature string', () => {
    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: 'order_test_998877',
      razorpayPaymentId: 'pay_test_112233',
      razorpaySignature: 'fake_random_hex_signature_abcdef1234567890',
    });

    expect(isValid).toBe(false);
  });

  it('rejects missing or empty signature parameters', () => {
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
});
