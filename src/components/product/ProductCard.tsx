import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.[0] || '/products/turbofan-black.svg';
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const categoryLabels: Record<string, { label: string; color: string }> = {
    schematic: { label: 'SCHEMATIC', color: 'text-avionics-cyan border-avionics-cyan/30' },
    principle: { label: 'PRINCIPLE', color: 'text-avionics-amber border-avionics-amber/30' },
    culture: { label: 'CULTURE', color: 'text-slate-300 border-slate-600' },
  };

  const badgeInfo = categoryLabels[product.category] || {
    label: product.category.toUpperCase(),
    color: 'text-slate-300 border-slate-700',
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-aerospace-900/60 border border-aerospace-800/80 rounded-xl overflow-hidden hover:border-aerospace-600 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col"
    >
      {/* Visual Canvas */}
      <div className="relative aspect-[4/3] bg-aerospace-950 overflow-hidden border-b border-aerospace-800/80 flex items-center justify-center p-4">
        {/* Technical Corner Markers */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-slate-600" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-slate-600" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-slate-600" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-slate-600" />

        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[9px] font-mono tracking-widest px-2 py-0.5 rounded bg-aerospace-950/90 border ${badgeInfo.color}`}
          >
            {badgeInfo.label}
          </span>
        </div>

        {/* Blueprint Callout */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono text-afterburner bg-aerospace-950/90 px-2 py-1 rounded border border-afterburner/40 flex items-center space-x-1">
            <span>INSPECT</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-afterburner transition-colors leading-snug">
            {product.title}
          </h3>
          {product.subtitle && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-mono">
              {product.subtitle}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-aerospace-800/60 flex items-center justify-between">
          <div>
            <span className="text-sm font-mono font-bold text-slate-100">
              {formatCurrency(product.basePrice, product.currency)}
            </span>
          </div>

          {/* Sizes preview */}
          <div className="flex items-center space-x-1">
            {availableSizes.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[9px] font-mono px-1 py-0.5 rounded bg-aerospace-800 text-slate-300"
              >
                {s}
              </span>
            ))}
            {availableSizes.length > 4 && (
              <span className="text-[9px] font-mono text-slate-400">
                +{availableSizes.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
