export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  size: string;
  color: string;
  colorHex?: string | null;
  sku?: string | null;
  price: number;
  costPrice?: number | null;
  isAvailable: boolean;
  printifyVariantId?: number | null;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  category: 'schematic' | 'principle' | 'culture' | string;
  specifications?: Record<string, string> | null;
  careInstructions?: string | null;
  images: string[];
  basePrice: number;
  currency: string;
  isPublished: boolean;
  isFeatured: boolean;
  printifyProductId?: string | null;
  printifyBlueprintId?: number | null;
  printifyProviderId?: number | null;
  variants: ProductVariant[];
  lastSyncedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface PricingBreakdown {
  items: Array<{
    variantId: string;
    productTitle: string;
    variantTitle: string;
    size: string;
    color: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  estimatedDeliveryDays: string;
}
