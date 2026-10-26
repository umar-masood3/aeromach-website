'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();

  const freeShippingThreshold = 2500;
  const differenceToFreeShipping = freeShippingThreshold - subtotal;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-aerospace-900 border border-aerospace-800 flex items-center justify-center text-slate-500 font-mono text-2xl">
          00
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-mono text-slate-100">
            CARGO MANIFEST IS EMPTY
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            You currently have no flight apparel loaded into your manifest.
          </p>
        </div>
        <Link
          href="/collection"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-afterburner hover:bg-afterburner-hover text-white text-xs font-mono tracking-widest uppercase font-bold rounded-lg shadow-lg transition"
        >
          <span>EXPLORE MASTER CATALOG</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Header */}
      <div className="border-b border-aerospace-800 pb-4 flex justify-between items-end">
        <div>
          <span className="text-xs font-mono text-avionics-cyan">CARGO TELEMETRY</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            SHOPPING BAG & MANIFEST
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-mono text-slate-500 hover:text-red-400 transition"
        >
          CLEAR ALL [{itemCount}]
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-aerospace-900/80 border border-aerospace-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center space-x-2 text-slate-300">
            <Truck className="w-4 h-4 text-avionics-cyan" />
            <span>
              {qualifiesForFreeShipping
                ? 'FREE DOMESTIC SHIPPING UNLOCKED'
                : `ADD ${formatCurrency(differenceToFreeShipping)} MORE FOR FREE DOMESTIC SHIPPING`}
            </span>
          </span>
          <span className="text-slate-400 font-bold">
            {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-aerospace-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-avionics-cyan to-afterburner rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Line Items Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.variant.id}
              className="p-4 sm:p-5 bg-aerospace-900/60 border border-aerospace-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-aerospace-950 rounded-lg overflow-hidden border border-aerospace-800 p-2 flex-shrink-0">
                  <img
                    src={item.product.images[0] || '/products/turbofan-black.svg'}
                    alt={item.product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-bold text-slate-100 hover:text-afterburner transition"
                  >
                    {item.product.title}
                  </Link>
                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-aerospace-800 text-slate-300">
                      SIZE: {item.variant.size}
                    </span>
                    <span>COLOR: {item.variant.color}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 font-bold sm:hidden">
                    {formatCurrency(item.variant.price * item.quantity)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                {/* Quantity Controls */}
                <div className="flex items-center border border-aerospace-700 rounded-lg bg-aerospace-950 px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Total Price */}
                <div className="hidden sm:block text-right min-w-[80px]">
                  <span className="text-sm font-mono font-bold text-slate-100">
                    {formatCurrency(item.variant.price * item.quantity)}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400">
                    ({formatCurrency(item.variant.price)} ea)
                  </span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.variant.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Column (4 cols) */}
        <div className="lg:col-span-4 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 border-b border-aerospace-800 pb-3">
            FLIGHT BILLING SUMMARY
          </h2>

          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Items Subtotal ({itemCount})</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Standard Domestic Shipping</span>
              <span className="text-avionics-cyan font-bold">
                {qualifiesForFreeShipping ? 'FREE' : '₹150.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Taxes (GST 18%)</span>
              <span className="text-slate-400">Included In Subtotal</span>
            </div>
          </div>

          <div className="pt-4 border-t border-aerospace-800 flex justify-between items-baseline font-mono">
            <span className="text-xs uppercase text-slate-300 font-bold">ESTIMATED TOTAL</span>
            <span className="text-xl font-bold text-slate-100">
              {formatCurrency(subtotal + (qualifiesForFreeShipping ? 0 : 150))}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-afterburner hover:bg-afterburner-hover text-white text-xs font-mono tracking-widest uppercase font-bold rounded-lg shadow-lg transition"
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/collection"
              className="w-full block text-center py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
            >
              ← CONTINUE SHOPPING
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono pt-2 border-t border-aerospace-800/80">
            <ShieldCheck className="w-4 h-4 text-avionics-green" />
            <span>ENCRYPTED & AUTHENTICATED SERVER-SIDE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
