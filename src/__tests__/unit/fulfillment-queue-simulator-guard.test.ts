import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Problem A regression tests, part 4: defence in depth.
 *
 * The simulator endpoint no longer calls the fulfillment queue at all, but a
 * future refactor (or an admin action, or a webhook replay) could try to. So
 * the queue itself refuses to turn a simulated payment into a real supplier
 * order. This test proves that refusal and proves Printify is never dialled.
 */

const createOrderSpy = vi.fn(async () => ({ id: 'pf_should_never_happen' }));
const getOrderSpy = vi.fn();

vi.mock('@/lib/printify', () => ({
  printify: {
    createOrder: (...args: any[]) => createOrderSpy(...(args as [])),
    getOrder: (...args: any[]) => getOrderSpy(...(args as [])),
    sendToProduction: vi.fn(),
    isConfigured: () => false,
  },
}));

const orderFixture = (overrides: Record<string, unknown> = {}) => ({
  id: 'order_1',
  orderNumber: 'AM-261029-DEAD01',
  paymentStatus: 'PAID',
  fulfillmentStatus: 'UNFULFILLED',
  razorpayPaymentId: 'pay_sim_abc123',
  customerName: 'Regression Tester',
  customerEmail: 'tester@example.com',
  customerPhone: '+91 90000 00000',
  shippingAddress1: '1 Test Range',
  shippingAddress2: null,
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560001',
  country: 'India',
  items: [],
  ...overrides,
});

let currentOrder: any;

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: async () => currentOrder,
      update: vi.fn(),
    },
    fulfillmentJob: {
      findUnique: async () => null,
      create: vi.fn(),
      update: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  },
}));

import { enqueueFulfillment } from '@/lib/fulfillment-queue';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fulfillment queue refuses simulated payments', () => {
  it('rejects an order carrying the simulator payment-id prefix', async () => {
    currentOrder = orderFixture({ razorpayPaymentId: 'pay_sim_abc123' });

    await expect(enqueueFulfillment('order_1')).rejects.toThrow(
      /simulated test order/i
    );

    // Nothing was disclosed to the supplier.
    expect(createOrderSpy).not.toHaveBeenCalled();
  });

  it('rejects an order left in the test-only fulfillment status', async () => {
    currentOrder = orderFixture({
      razorpayPaymentId: null,
      fulfillmentStatus: 'SIMULATED_TEST_ONLY',
    });

    await expect(enqueueFulfillment('order_1')).rejects.toThrow(
      /simulated test order/i
    );
    expect(createOrderSpy).not.toHaveBeenCalled();
  });

  it('still rejects a simulated order that was hand-edited back to UNFULFILLED', async () => {
    // Belt and braces: the payment-id marker alone is enough.
    currentOrder = orderFixture({
      razorpayPaymentId: 'pay_sim_zzz',
      fulfillmentStatus: 'UNFULFILLED',
    });

    await expect(enqueueFulfillment('order_1')).rejects.toThrow(
      /simulated test order/i
    );
    expect(createOrderSpy).not.toHaveBeenCalled();
  });

  it('still rejects unpaid orders', async () => {
    currentOrder = orderFixture({ paymentStatus: 'PENDING', razorpayPaymentId: null });

    await expect(enqueueFulfillment('order_1')).rejects.toThrow(/unpaid order/i);
    expect(createOrderSpy).not.toHaveBeenCalled();
  });
});
