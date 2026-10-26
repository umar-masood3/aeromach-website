import { prisma } from './prisma';

export interface CartInputItem {
  variantId: string;
  quantity: number;
}

export interface ValidatedLineItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  printifyBlueprintId: number | null;
  printifyProviderId: number | null;
  printifyVariantId: number | null;
}

export interface PricingCalculationResult {
  items: ValidatedLineItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  estimatedDeliveryDays: string;
}

export async function calculateOrderPricing(
  cartItems: CartInputItem[],
  country: string = 'India'
): Promise<PricingCalculationResult> {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart cannot be empty for pricing calculation.');
  }

  const validatedItems: ValidatedLineItem[] = [];
  let subtotal = 0;

  for (const item of cartItems) {
    if (!item.variantId || typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(`Invalid item quantity or variant ID: ${JSON.stringify(item)}`);
    }

    // Server-authoritative lookup from database
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error(`Product variant not found: ${item.variantId}`);
    }

    if (!variant.isAvailable || !variant.product.isPublished) {
      throw new Error(`Product variant "${variant.title}" is currently unavailable.`);
    }

    const unitPrice = variant.price;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    validatedItems.push({
      variantId: variant.id,
      productId: variant.productId,
      productTitle: variant.product.title,
      variantTitle: variant.title,
      size: variant.size,
      color: variant.color,
      unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
      printifyBlueprintId: variant.product.printifyBlueprintId,
      printifyProviderId: variant.product.printifyProviderId,
      printifyVariantId: variant.printifyVariantId,
    });
  }

  // Shipping rules
  const isDomestic = country.toLowerCase() === 'india' || country.toLowerCase() === 'in';
  let shippingFee = 0;
  let estimatedDeliveryDays = '4-7 business days';

  if (isDomestic) {
    // Domestic standard: Free over ₹2,500, else ₹150
    shippingFee = subtotal >= 2500 ? 0 : 150;
    estimatedDeliveryDays = '3-5 business days';
  } else {
    // International Air Courier
    shippingFee = 1400;
    estimatedDeliveryDays = '7-12 business days';
  }

  // GST Calculation (18% inclusive component or applicable domestic cess)
  // Standard e-commerce presentation: Subtotal is catalog price, tax is 18% GST included/broken out
  const taxAmount = Math.round((subtotal * 0.18) / 1.18);
  const totalAmount = Math.round(subtotal + shippingFee);

  return {
    items: validatedItems,
    subtotal: Math.round(subtotal),
    shippingFee: Math.round(shippingFee),
    taxAmount: Math.round(taxAmount),
    totalAmount,
    currency: 'INR',
    estimatedDeliveryDays,
  };
}
