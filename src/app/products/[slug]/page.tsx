'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/components/cart/CartContext';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import { formatCurrency } from '@/lib/utils';
import {
  Ruler,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Destination shipping country estimation
  const [destinationCountry, setDestinationCountry] = useState<'India' | 'International'>('India');

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const match = data.products.find((p: Product) => p.slug === slug);
          if (match) {
            setProduct(match);
            if (match.variants && match.variants.length > 0) {
              setSelectedSize(match.variants[0].size);
              setSelectedColor(match.variants[0].color);
            }
          } else {
            setError('Product blueprint not found in archive.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error loading blueprint details');
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-avionics-cyan mx-auto animate-spin" />
        <p className="text-xs font-mono text-slate-400">RETRIEVING BLUEPRINT ARCHIVE SPECIFICATIONS...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center space-y-4">
        <div className="text-4xl font-mono text-red-500 font-bold">404</div>
        <h2 className="text-xl font-mono text-slate-100">BLUEPRINT NOT FOUND</h2>
        <p className="text-xs text-slate-400">{error || 'This flight apparel item does not exist.'}</p>
        <Link
          href="/collection"
          className="inline-block mt-4 px-6 py-2.5 bg-aerospace-900 border border-aerospace-700 text-xs font-mono text-avionics-cyan rounded"
        >
          RETURN TO MASTER CATALOG
        </Link>
      </div>
    );
  }

  // Group variants by size and color
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const availableColors = Array.from(
    new Map(product.variants.map((v) => [v.color, v.colorHex])).entries()
  );

  // Find exact matching variant
  const currentVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) || product.variants[0];

  const currentPrice = currentVariant ? currentVariant.price : product.basePrice;

  const handleAddToCart = () => {
    if (currentVariant) {
      addItem(product, currentVariant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (currentVariant) {
      addItem(product, currentVariant, quantity);
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Breadcrumbs */}
      <nav className="text-xs font-mono text-slate-400 flex items-center space-x-2">
        <Link href="/" className="hover:text-slate-200">HOME</Link>
        <span>/</span>
        <Link href="/collection" className="hover:text-slate-200">CATALOG</Link>
        <span>/</span>
        <span className="text-avionics-cyan uppercase">{product.category}</span>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Gallery Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Display */}
          <div className="relative aspect-[4/3] bg-aerospace-900 border border-aerospace-700/80 rounded-2xl overflow-hidden p-6 flex items-center justify-center">
            {/* Corner CAD markers */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-slate-600" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-slate-600" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-slate-600" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-slate-600" />

            <img
              src={product.images[selectedImageIndex] || product.images[0] || '/products/turbofan-black.svg'}
              alt={product.title}
              className="w-full h-full object-contain"
            />

            {/* Spec Stamp */}
            <div className="absolute bottom-4 left-4 bg-aerospace-950/90 border border-aerospace-800 px-3 py-1 rounded text-[10px] font-mono text-slate-400">
              FRAME: 0{selectedImageIndex + 1} // SCALE 1:1
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg bg-aerospace-900 border-2 overflow-hidden flex-shrink-0 p-1.5 transition ${
                    selectedImageIndex === idx
                      ? 'border-afterburner shadow-md'
                      : 'border-aerospace-800 hover:border-aerospace-700'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Controls & Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Category */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-avionics-cyan uppercase">
              {product.category.toUpperCase()} SERIES // SPEC DWG
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-xs font-mono text-slate-400 pt-1">{product.subtitle}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="py-3 border-y border-aerospace-800/80 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-100">
                {formatCurrency(currentPrice, product.currency)}
              </span>
              <span className="text-xs font-mono text-slate-400">Taxes Included</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-avionics-green">
              <span className="w-2 h-2 rounded-full bg-avionics-green animate-pulse" />
              <span>IN PRODUCTION</span>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">COLORWAY:</span>
              <span className="text-slate-400 font-bold">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map(([colorName, colorHex]) => (
                <button
                  key={colorName}
                  onClick={() => setSelectedColor(colorName)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-mono border flex items-center space-x-2 transition ${
                    selectedColor === colorName
                      ? 'bg-aerospace-800 border-avionics-cyan text-white font-bold ring-1 ring-avionics-cyan/50'
                      : 'bg-aerospace-900 border-aerospace-800 text-slate-400 hover:border-aerospace-700'
                  }`}
                >
                  {colorHex && (
                    <span
                      className="w-3 h-3 rounded-full border border-slate-700"
                      style={{ backgroundColor: colorHex }}
                    />
                  )}
                  <span>{colorName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">DIMENSION / SIZE:</span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-avionics-cyan hover:underline flex items-center space-x-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>SIZE CALIBRATION CHART</span>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 rounded-md text-xs font-mono font-bold border transition text-center ${
                    selectedSize === size
                      ? 'bg-afterburner text-white border-afterburner shadow-md'
                      : 'bg-aerospace-900 border-aerospace-800 text-slate-300 hover:border-aerospace-700 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex space-x-3 items-center">
              {/* Quantity Counter */}
              <div className="flex items-center border border-aerospace-700 rounded-lg bg-aerospace-900 h-12 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-mono font-bold text-slate-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-aerospace-900 hover:bg-aerospace-800 text-slate-100 border border-aerospace-700 hover:border-avionics-cyan rounded-lg text-xs font-mono tracking-wider font-bold uppercase transition flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-afterburner" />
                <span>ADD TO CARGO</span>
              </button>
            </div>

            {/* Buy Now (Direct to Checkout) */}
            <button
              onClick={handleBuyNow}
              className="w-full h-12 bg-afterburner hover:bg-afterburner-hover text-white rounded-lg text-xs font-mono tracking-widest font-bold uppercase shadow-lg shadow-orange-950/40 transition flex items-center justify-center space-x-2"
            >
              <span>INSTANT CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Delivery Estimator */}
          <div className="p-4 rounded-xl bg-aerospace-900/60 border border-aerospace-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-avionics-cyan" />
                <span>FLIGHT LOGISTICS DISPATCH:</span>
              </span>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value as any)}
                className="bg-aerospace-950 border border-aerospace-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none"
              >
                <option value="India">Domestic (India)</option>
                <option value="International">International</option>
              </select>
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {destinationCountry === 'India' ? (
                <span>
                  • Standard Air Courier: <strong>3-5 business days</strong>.<br />
                  • Orders above ₹2,500 qualify for <strong>FREE shipping</strong> (otherwise ₹150 flat).
                </span>
              ) : (
                <span>
                  • Priority Global Courier: <strong>7-12 business days</strong>.<br />
                  • Flat international air dispatch rate of ₹1,400.
                </span>
              )}
            </div>
          </div>

          {/* Technical Specifications */}
          {product.specifications && (
            <div className="border border-aerospace-800 rounded-xl p-4 bg-aerospace-950/40 space-y-2 text-xs font-mono">
              <div className="text-slate-200 font-bold tracking-wider">GARMENT ARCHITECTURE</div>
              <div className="divide-y divide-aerospace-800/60 text-[11px]">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="py-1.5 flex justify-between">
                    <span className="text-slate-400 uppercase">{key}:</span>
                    <span className="text-slate-200 text-right max-w-xs">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-xs text-slate-400 leading-relaxed space-y-2 border-t border-aerospace-800/80 pt-4">
            <div className="text-slate-200 font-mono font-bold">ENGINEERING NOTES</div>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Sizing Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
