// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';

/**
 * Problem A regression tests, part 3: the checkout interface.
 *
 * These render the real checkout page and assert what a visitor can actually
 * see and click. The page never decides for itself whether simulation is
 * allowed - it asks `/api/checkout/status`, which applies the same server-side
 * guard as the endpoint. The tests therefore drive the page by controlling that
 * response, mirroring what a real deployment would answer.
 *
 * Hiding the button is NOT the fix. The endpoint tests in
 * `__tests__/integration/simulate-test-payment.test.ts` prove the API refuses
 * regardless of what the UI renders.
 */

const pushMock = vi.fn();
const clearCartMock = vi.fn();
const simulateCalls: string[] = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/components/cart/CartContext', () => ({
  useCart: () => ({
    items: [
      {
        product: {
          id: 'p1',
          slug: 'regression-tee',
          title: 'Regression Tee',
          images: ['/products/turbofan-black.svg'],
        },
        variant: {
          id: 'v1',
          size: 'M',
          price: 1499,
          title: 'M / Pitch Black',
          color: 'Pitch Black',
        },
        quantity: 1,
      },
    ],
    clearCart: clearCartMock,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    totalItems: 1,
    totalPrice: 1499,
    isOpen: false,
    openCart: vi.fn(),
    closeCart: vi.fn(),
  }),
}));

const PRICING = {
  items: [],
  subtotal: 1499,
  shippingFee: 150,
  taxAmount: 229,
  totalAmount: 1649,
  currency: 'INR',
  estimatedDeliveryDays: '3-5 business days',
};

type Mode = 'live' | 'sandbox' | 'disabled';

function installFetch(mode: Mode) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: any) => {
      const url = String(input);
      const ok = (data: unknown) =>
        ({ ok: true, status: 200, json: async () => data }) as unknown as Response;

      if (url.includes('/api/checkout/status')) {
        return ok({
          success: true,
          paymentsConfigured: mode === 'live',
          simulatorEnabled: mode === 'sandbox',
          checkoutMode: mode,
        });
      }
      if (url.includes('/api/checkout/calculate')) {
        return ok({ success: true, pricing: PRICING });
      }
      if (url.includes('/api/checkout/create-order')) {
        return ok({
          success: true,
          orderId: 'order_internal_1',
          orderNumber: 'AM-261029-TEST01',
          trackingToken: 'tracking-token-1',
          razorpayOrderId: 'order_gateway_1',
          amount: 1649,
          currency: 'INR',
          keyId: 'rzp_test_key',
          isConfigured: mode === 'live',
        });
      }
      if (url.includes('/api/checkout/simulate-test-payment')) {
        simulateCalls.push(url);
        return ok({ success: true, simulated: true, testOnly: true });
      }
      return ok({ success: false, error: 'unexpected call' });
    })
  );
}

async function renderCheckout(mode: Mode) {
  installFetch(mode);
  const { default: CheckoutPage } = await import('@/app/checkout/page');
  const utils = render(React.createElement(CheckoutPage));
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('/api/checkout/status', expect.anything())
  );
  return utils;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  simulateCalls.length = 0;
});

describe('checkout interface on a demonstration deployment', () => {
  it('shows the checkout-disabled notice and never offers the simulator', async () => {
    await renderCheckout('disabled');

    await waitFor(() => {
      expect(screen.getByTestId('checkout-disabled-banner')).toBeTruthy();
    });

    expect(screen.getByText(/DEMO MODE/i)).toBeTruthy();
    expect(screen.getByText(/not accepting/i)).toBeTruthy();

    // No simulator affordance of any kind.
    expect(screen.queryByText(/SIMULATE TEST PAYMENT/i)).toBeNull();
    expect(screen.queryByText(/SANDBOX TEST/i)).toBeNull();
  });

  it('blocks the pay button so no order can be created', async () => {
    await renderCheckout('disabled');

    await waitFor(() => expect(screen.getByTestId('checkout-disabled-banner')).toBeTruthy());

    const submit = screen.getByRole('button', { name: /AUTHORIZE PAYMENT/i });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    // Even a forced submit makes no network call to create an order.
    fireEvent.submit(submit.closest('form')!);
    await new Promise((r) => setTimeout(r, 40));

    const calls = (global.fetch as any).mock.calls.map((c: any[]) => String(c[0]));
    expect(calls.some((u: string) => u.includes('create-order'))).toBe(false);
    expect(simulateCalls).toHaveLength(0);
  });
});

describe('checkout interface when checkout is available', () => {
  it('enables the pay button and still exposes no simulator action', async () => {
    await renderCheckout('sandbox');

    const submit = await screen.findByRole('button', { name: /AUTHORIZE PAYMENT/i });
    expect((submit as HTMLButtonElement).disabled).toBe(false);

    fireEvent.submit(submit.closest('form')!);
    await new Promise((r) => setTimeout(r, 60));

    // The order WAS created through the real endpoint...
    const calls = (global.fetch as any).mock.calls.map((c: any[]) => String(c[0]));
    expect(calls.some((u: string) => u.includes('create-order'))).toBe(true);

    // ...but the sandbox card was removed from the UI entirely, so nothing may
    // ever invoke the payment simulator.
    expect(screen.queryByText(/SIMULATE TEST PAYMENT/i)).toBeNull();
    expect(simulateCalls).toHaveLength(0);
  });

  it('does not show the demo banner when checkout is available', async () => {
    await renderCheckout('sandbox');
    await screen.findByRole('button', { name: /AUTHORIZE PAYMENT/i });
    expect(screen.queryByTestId('checkout-disabled-banner')).toBeNull();
  });
});
