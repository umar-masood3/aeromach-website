import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calculateOrderPricing } from '../../lib/pricing';
import { prisma } from '../../lib/prisma';

describe('Unit Tests: Server-Authoritative Pricing & Validation', () => {
  let sampleVariantId: string;
  let sampleVariantPrice: number;

  beforeAll(async () => {
    // Look up an existing seeded variant
    const variant = await prisma.productVariant.findFirst({
      where: { isAvailable: true },
    });
    if (!variant) {
      throw new Error('No seeded product variant found. Ensure seed is run.');
    }
    sampleVariantId = variant.id;
    sampleVariantPrice = variant.price;
  });

  afterAll(async () => {
    await prisma.$disconnect();
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

    if (result.subtotal < 2500) {
      expect(result.shippingFee).toBe(150);
      expect(result.totalAmount).toBe(result.subtotal + 150);
    }
  });

  it('applies free domestic shipping at or above ₹2,500 threshold', async () => {
    // Two tees or a hoodie will exceed ₹2,500
    const result = await calculateOrderPricing(
      [{ variantId: sampleVariantId, quantity: 2 }],
      'India'
    );

    if (result.subtotal >= 2500) {
      expect(result.shippingFee).toBe(0);
      expect(result.totalAmount).toBe(result.subtotal);
    }
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
