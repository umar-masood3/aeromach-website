import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';

/**
 * Problem A regression tests, part 2: the endpoint itself.
 *
 * Isolation strategy
 * ------------------
 *  * The project's Prisma datasource is PostgreSQL, which CI does not always
 *    have. So `@/lib/prisma` is replaced with an in-memory fake that records
 *    every call. This makes the suite hermetic AND lets us assert the strongest
 *    possible property for a blocked request: it must not touch the database
 *    at all, not merely "must not commit".
 *  * `@/lib/fulfillment-queue` and `@/lib/printify` are mocked with spies, so
 *    any attempt to submit a supplier order fails the test loudly.
 *  * `process.env` is snapshotted and restored after every test, so ordering
 *    between tests cannot change the outcome.
 */

const dbCalls: string[] = [];
const enqueueSpy = vi.fn(async () => 'mocked-job-id');
const printifyCreateOrderSpy = vi.fn(async () => ({ id: 'pf_should_never_happen' }));

let orderRow: any = null;

vi.mock('@/lib/fulfillment-queue', () => ({
  enqueueFulfillment: (...args: any[]) => enqueueSpy(...(args as [])),
  processFulfillmentJob: vi.fn(async () => true),
  reconcileOrderStatus: vi.fn(async () => ({ reconciled: false })),
}));

vi.mock('@/lib/printify', () => ({
  printify: {
    isConfigured: () => false,
    createOrder: (...args: any[]) => printifyCreateOrderSpy(...(args as [])),
    getOrder: vi.fn(),
    sendToProduction: vi.fn(),
    getShops: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: async (args: any) => {
        dbCalls.push('order.findUnique');
        if (!orderRow || orderRow.id !== args?.where?.id) return null;
        return { ...orderRow };
      },
      update: async (args: any) => {
        dbCalls.push('order.update');
        orderRow = { ...orderRow, ...args.data };
        return { ...orderRow };
      },
    },
    auditLog: {
      create: async () => {
        dbCalls.push('auditLog.create');
        return { id: 'audit_1' };
      },
    },
    fulfillmentJob: {
      findUnique: async () => {
        dbCalls.push('fulfillmentJob.findUnique');
        return null;
      },
      create: async () => {
        dbCalls.push('fulfillmentJob.create');
        return { id: 'job_1' };
      },
      update: async () => {
        dbCalls.push('fulfillmentJob.update');
        return { id: 'job_1' };
      },
      count: async () => 0,
    },
  },
}));

import { POST, GET } from '@/app/api/checkout/simulate-test-payment/route';

const ENV_KEYS = ['NODE_ENV', 'ENABLE_TEST_PAYMENT_SIMULATOR'] as const;
let envSnapshot: Record<string, string | undefined>;

function setEnv(nodeEnv: string | undefined, flag: string | undefined) {
  // Cast required: @types/node declares NODE_ENV as read-only.
  const env = process.env as Record<string, string | undefined>;
  if (nodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = nodeEnv;

  if (flag === undefined) delete env.ENABLE_TEST_PAYMENT_SIMULATOR;
  else env.ENABLE_TEST_PAYMENT_SIMULATOR = flag;
}

function simulateRequest(body: unknown = { orderId: 'order_1' }) {
  return new NextRequest('http://localhost:3000/api/checkout/simulate-test-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makePendingOrder(orderNumber: string) {
  orderRow = {
    id: 'order_1',
    orderNumber,
    trackingToken: `tok-${orderNumber}`,
    paymentStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    adminNotes: null,
    customerName: 'Regression Tester',
    customerEmail: 'tester@example.com',
  };
  return orderRow;
}

beforeEach(() => {
  envSnapshot = {} as any;
  for (const key of ENV_KEYS) envSnapshot[key] = process.env[key];
  vi.clearAllMocks();
  dbCalls.length = 0;
  orderRow = null;
});

afterEach(() => {
  // Restore the environment so test order cannot influence later tests.
  for (const key of ENV_KEYS) {
    const original = envSnapshot[key];
    if (original === undefined) delete (process.env as any)[key];
    else (process.env as any)[key] = original;
  }
});

/** A blocked request must not change state AND must not reach the database. */
function expectNothingHappened() {
  expect(orderRow?.paymentStatus).toBe('PENDING');
  expect(orderRow?.fulfillmentStatus).toBe('UNFULFILLED');
  expect(orderRow?.razorpayPaymentId).toBeNull();

  // Strongest assertion: the handler never even queried the database.
  expect(dbCalls).toHaveLength(0);
  expect(enqueueSpy).not.toHaveBeenCalled();
  expect(printifyCreateOrderSpy).not.toHaveBeenCalled();
}

describe('blocked deployments cannot mark an order PAID', () => {
  it('production + ENABLE_TEST_PAYMENT_SIMULATOR=true is rejected', async () => {
    setEnv('production', 'true');
    makePendingOrder('REG-PROD-TRUE');

    const res = await POST(simulateRequest());

    expect(res.status).toBe(404);
    expect((await res.json()).success).toBe(false);
    expectNothingHappened();
  });

  it('production + flag=false is rejected', async () => {
    setEnv('production', 'false');
    makePendingOrder('REG-PROD-FALSE');

    const res = await POST(simulateRequest());

    expect(res.status).toBe(404);
    expectNothingHappened();
  });

  it('production + flag missing is rejected', async () => {
    setEnv('production', undefined);
    makePendingOrder('REG-PROD-MISSING');

    const res = await POST(simulateRequest());

    expect(res.status).toBe(404);
    expectNothingHappened();
  });

  it.each(['staging', 'preview', 'prod', undefined])(
    'unexpected/missing NODE_ENV (%s) with the flag true is rejected',
    async (nodeEnv) => {
      setEnv(nodeEnv as any, 'true');
      makePendingOrder(`REG-UNEXPECTED-${String(nodeEnv).toUpperCase()}`);

      const res = await POST(simulateRequest());

      expect(res.status).toBe(404);
      expectNothingHappened();
    }
  );

  it('development with the flag missing is rejected (fail closed)', async () => {
    setEnv('development', undefined);
    makePendingOrder('REG-DEV-NOFLAG');

    const res = await POST(simulateRequest());

    expect(res.status).toBe(404);
    expectNothingHappened();
  });

  it('rejects GET probes on the endpoint', async () => {
    setEnv('production', 'true');
    const res = await GET();
    expect(res.status).toBe(404);
    expect(dbCalls).toHaveLength(0);
  });
});

describe('an allowed local request still never reaches the supplier', () => {
  it.each(['development', 'test'])(
    'records a PAID test order in %s, marks it test-only, and enqueues nothing',
    async (nodeEnv) => {
      setEnv(nodeEnv, 'true');
      makePendingOrder(`REG-ALLOWED-${nodeEnv.toUpperCase()}`);

      const res = await POST(simulateRequest());
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.testOnly).toBe(true);
      expect(body.fulfillmentDispatched).toBe(false);

      expect(orderRow.paymentStatus).toBe('PAID');
      expect(orderRow.razorpayPaymentId.startsWith('pay_sim_')).toBe(true);
      // Test-only status keeps the order out of every real fulfillment path.
      expect(orderRow.fulfillmentStatus).toBe('SIMULATED_TEST_ONLY');
      expect(orderRow.adminNotes).toMatch(/TEST MODE/);

      // The critical assertion: no fulfillment job, no provider call.
      expect(dbCalls).not.toContain('fulfillmentJob.create');
      expect(enqueueSpy).not.toHaveBeenCalled();
      expect(printifyCreateOrderSpy).not.toHaveBeenCalled();
    }
  );

  it('refuses to overwrite a genuine gateway payment', async () => {
    setEnv('development', 'true');
    makePendingOrder('REG-REAL-PAYMENT');
    orderRow.paymentStatus = 'PAID';
    orderRow.razorpayPaymentId = 'pay_REALgatewayId123';

    const res = await POST(simulateRequest());

    expect(res.status).toBe(409);
    expect(orderRow.razorpayPaymentId).toBe('pay_REALgatewayId123');
    expect(enqueueSpy).not.toHaveBeenCalled();
  });
});

describe('the endpoint source itself', () => {
  it('no longer imports or calls the fulfillment queue', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/checkout/simulate-test-payment/route.ts'),
      'utf8'
    );

    // Strip comments before asserting on code.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    expect(code).not.toMatch(/from\s+['"]@\/lib\/fulfillment-queue['"]/);
    expect(code).not.toMatch(/enqueueFulfillment\s*\(/);
    expect(code).not.toMatch(/printify/i);
  });
});
