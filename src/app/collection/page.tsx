'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

function CollectionContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.error || 'Failed to load catalog');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to database');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        const matchesQuery =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'all', label: 'ALL BLUEPRINTS' },
    { id: 'schematic', label: 'THE SCHEMATIC' },
    { id: 'principle', label: 'THE PRINCIPLE' },
    { id: 'culture', label: 'CULTURE' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-avionics-cyan">
          <span>FLIGHT ARCHIVE // MASTER CATALOG</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-sans">
          AEROSPACE BLUEPRINTS & APPAREL
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Every piece is produced with precision direct-to-garment digital neo-pigment inks on ring-spun Airlume cotton and heavy fleece substrates.
        </p>
      </div>

      {/* Control Bar: Categories, Search & Sort */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 pb-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg border transition duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-afterburner text-white font-bold border-afterburner shadow-md'
                  : 'bg-aerospace-900 text-slate-400 hover:text-slate-100 border-aerospace-800 hover:border-aerospace-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Inputs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search equations, CAD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-aerospace-900 border border-aerospace-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-avionics-cyan"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2 bg-aerospace-900 border border-aerospace-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-aerospace-900">Featured First</option>
              <option value="price-asc" className="bg-aerospace-900">Price: Low to High</option>
              <option value="price-desc" className="bg-aerospace-900">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manifest Count */}
      <div className="text-xs font-mono text-slate-500 flex items-center justify-between">
        <span>MANIFEST: DISPLAYING [{filteredProducts.length}] ITEMS</span>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-avionics-cyan hover:underline"
          >
            Clear category filter
          </button>
        )}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-avionics-cyan mx-auto animate-spin" />
          <p className="text-xs font-mono text-slate-400">LOADING AEROSPACE BLUEPRINT ARCHIVE...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center space-y-3 bg-aerospace-900 border border-red-900/40 rounded-xl p-8">
          <p className="text-sm font-mono text-red-400 font-bold">SYSTEM TELEMETRY ERROR</p>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-aerospace-900/40 border border-aerospace-800 rounded-xl p-12">
          <div className="w-12 h-12 mx-auto rounded-full bg-aerospace-800 flex items-center justify-center text-slate-500 font-mono text-lg">
            ∅
          </div>
          <h3 className="text-sm font-mono text-slate-300">NO BLUEPRINTS MATCHING RADAR FILTER</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-aerospace-800 hover:bg-aerospace-700 text-xs font-mono text-avionics-cyan border border-aerospace-600 rounded transition"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-32 text-center font-mono text-xs text-slate-400">
          <RefreshCw className="w-8 h-8 text-avionics-cyan mx-auto animate-spin mb-4" />
          <span>LOADING AEROMACH BLUEPRINT ARCHIVE...</span>
        </div>
      }
    >
      <CollectionContent />
    </Suspense>
  );
}
