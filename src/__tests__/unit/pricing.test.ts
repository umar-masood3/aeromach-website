import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateOrderPricing } from '../../lib/pricing';
import { prisma } from '../../lib/prisma';

// Mock Prisma for deterministic, isolated unit testing
vi.mock('../../lib/prisma', () => ({
  prisma: {
    productVariant: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

describe('Unit Tests: Server-Authoritative Pricing & Validation', () => {
  const sampleVariantId = 'var_turbofan_m_black';
  const sampleVariantPrice = 1499;

  const mockVariant = {
    id: sampleVariantId,
    productId: 'prod_turbofan_01',
    title: 'M / Pitch Black',
    size: 'M',
    color: 'Pitch Black',
    price: sampleVariantPrice,
    costPrice: 850,
    isAvailable: true,
    printifyVariantId: 12002,
    product: {
      id: 'prod_turbofan_01',
      title: 'The Turbofan Schematic T-Shirt',
      isPublished: true,
      printifyBlueprintId: 12,
      printifyProviderId: 29,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.productVariant.findUnique as any).mockImplementation(({ where }: { where: { id: string } }) => {
      if (where.id === sampleVariantId) {
        return Promise.resolve(mockVariant);
      }
      return Promise.resolve(null);
    });
  });

  it('calculates correct item totals and subtotal for single item', async () => {
    const result = await calculateOrderPricing(
      [{ variantId: sampleVariantId, quantity: 1 }],
      'India'
    );

    expect(result.subtotal).toBe(sampleVariantPrice);
    expect(result.items.length).toBe(1);
    expect(result.items[0].unitPrice).toBe(sampleVariantPrice);
    expect(result.items[0].totalPrice).toBe(sampleVariantPrice);
  });

  it('calculates correct subtotal for multiple quantities', async () => {
    const result = await calculateOrderPricing(
      [{ variantId: sampleVariantId, quantity: 3 }],
      'India'
    );

    expect(result.subtotal).toBe(sampleVariantPrice * 3);
    expect(result.items[0].quantity).toBe(3);
    expect(result.items[0].totalPrice).toBe(sampleVariantPrice * 3);
  });

  it('applies domestic shipping fee below ₹2,500 threshold', async () => {
    // Single tee (₹1,499) is below ₹2,500
    const result = await calculateOrderPricing(
      [{ variantId: sampleVariantId, quantity: 1 }],
      'India'
    );

    expect(result.subtotal).toBe(1499);
    expect(result.shippingFee).toBe(150);
    expect(result.totalAmount).toBe(1499 + 150);
  });

  it('applies free domestic shipping at or above ₹2,500 threshold', async () => {
    // Two tees (₹2,998) exceeds ₹2,500 threshold
    const result = await calculateOrderPricing(
      [{ variantId: sampleVariantId, quantity: 2 }],
      'India'
    );

    expect(result.subtotal).toBe(2998);
    expect(result.shippingFee).toBe(0);
    expect(result.totalAmount).toBe(2998);
  });

  it('applies international shipping rate for non-domestic destinations', async () => {
    const result = await calculateOrderPricing(
      [{ variantId: sampleVariantId, quantity: 1 }],
      'United States'
    );

    expect(result.shippingFee).toBe(1400);
    expect(result.totalAmount).toBe(result.subtotal + 1400);
  });

  it('rejects empty cart arrays', async () => {
    await expect(calculateOrderPricing([], 'India')).rejects.toThrow(
      'Cart cannot be empty'
    );
  });

  it('rejects zero or negative quantities', async () => {
    await expect(
      calculateOrderPricing([{ variantId: sampleVariantId, quantity: 0 }], 'India')
    ).rejects.toThrow('Invalid item quantity');

    await expect(
      calculateOrderPricing([{ variantId: sampleVariantId, quantity: -2 }], 'India')
    ).rejects.toThrow('Invalid item quantity');
  });

  it('rejects non-existent product variant IDs', async () => {
    await expect(
      calculateOrderPricing([{ variantId: 'invalid_cuid_nonexistent', quantity: 1 }], 'India')
    ).rejects.toThrow('Product variant not found');
  });
});
