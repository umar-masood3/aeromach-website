'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from './CartContext';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-aerospace-900 border-l border-aerospace-700/60 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-aerospace-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-avionics-cyan animate-pulse" />
              <h2 className="text-sm font-mono tracking-widest text-slate-100 uppercase">
                CARGO MANIFEST [{itemCount}]
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-aerospace-800 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-aerospace-800 flex items-center justify-center text-slate-500 font-mono text-xl">
                  00
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-mono text-slate-300">MANIFEST EMPTY</p>
                  <p className="text-xs text-slate-500">No aerospace apparel currently added.</p>
                </div>
                <button
                  onClick={closeCart}
                  className="inline-block mt-4 px-5 py-2.5 bg-aerospace-800 hover:bg-aerospace-700 text-xs font-mono tracking-wider text-avionics-cyan border border-aerospace-600 rounded transition"
                >
                  EXPLORE BLUEPRINTS
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variant.id}
                  className="p-3.5 bg-aerospace-950/60 border border-aerospace-800 rounded-lg flex space-x-4 items-center group hover:border-aerospace-700 transition"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 relative bg-aerospace-900 rounded overflow-hidden flex-shrink-0 border border-aerospace-800">
                    <img
                      src={item.product.images[0] || '/products/turbofan-black.svg'}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-slate-100 truncate">
                      {item.product.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-aerospace-800 text-slate-300">
                        {item.variant.size}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.variant.color}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-200 mt-1">
                      {formatCurrency(item.variant.price)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => removeItem(item.variant.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-aerospace-700 rounded bg-aerospace-900">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        className="p-1 text-slate-400 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-aerospace-800 bg-aerospace-950/80 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Standard Shipping</span>
                  <span className="font-mono text-avionics-cyan">
                    {subtotal >= 2500 ? 'FREE (ORDER > ₹2,500)' : 'CALCULATED AT CHECKOUT'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-aerospace-800/60 flex justify-between items-baseline">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  ESTIMATED TOTAL
                </span>
                <span className="text-lg font-mono font-bold text-slate-100">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-afterburner hover:bg-afterburner-hover text-white text-xs font-mono tracking-widest uppercase font-semibold rounded shadow-lg transition"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full block text-center py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
                >
                  VIEW FULL MANIFEST & SPECIFICATIONS
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-avionics-green" />
                <span>SERVER-VERIFIED SECURE CHECKOUT</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
