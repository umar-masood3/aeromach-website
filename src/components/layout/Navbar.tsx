'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Compass, Shield, Menu, X } from 'lucide-react';
import { useCart } from '../cart/CartContext';

export function Navbar() {
  const { openCart, itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-aerospace-950/90 backdrop-blur-md border-b border-aerospace-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Aircraft Wing / Mach Icon */}
              <div className="w-8 h-8 rounded bg-aerospace-900 border border-aerospace-700 flex items-center justify-center text-afterburner font-mono font-bold text-sm group-hover:border-afterburner transition">
                Δ
              </div>
              <div>
                <span className="font-mono text-base font-extrabold tracking-widest text-slate-100 uppercase group-hover:text-afterburner transition">
                  AEROMACH
                </span>
                <span className="hidden sm:block text-[9px] font-mono tracking-wider text-slate-400 uppercase -mt-1">
                  AEROSPACE APPAREL LAB // EST. 2026
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-mono tracking-wider">
              <Link
                href="/collection"
                className="text-slate-300 hover:text-white transition hover:underline underline-offset-4 decoration-afterburner"
              >
                CATALOG
              </Link>
              <Link
                href="/collection?category=schematic"
                className="text-slate-400 hover:text-avionics-cyan transition"
              >
                THE SCHEMATIC
              </Link>
              <Link
                href="/collection?category=principle"
                className="text-slate-400 hover:text-avionics-amber transition"
              >
                THE PRINCIPLE
              </Link>
              <Link
                href="/collection?category=culture"
                className="text-slate-400 hover:text-slate-200 transition"
              >
                CULTURE
              </Link>
              <Link
                href="/about"
                className="text-slate-400 hover:text-slate-200 transition"
              >
                ABOUT
              </Link>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/tracking"
              className="p-2 text-slate-400 hover:text-avionics-cyan transition rounded-md hover:bg-aerospace-900 flex items-center space-x-1.5 text-xs font-mono"
              title="Track Flight Cargo / Order"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden lg:inline">TRACK</span>
            </Link>

            <Link
              href="/admin"
              className="p-2 text-slate-400 hover:text-slate-200 transition rounded-md hover:bg-aerospace-900 text-xs font-mono"
              title="Founder / Admin Access"
            >
              <Shield className="w-4 h-4" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-slate-300 hover:text-white rounded-md bg-aerospace-900 border border-aerospace-800 hover:border-aerospace-700 transition flex items-center space-x-2"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-4 h-4 text-afterburner" />
              <span className="text-xs font-mono font-bold text-slate-200">
                {itemCount}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-afterburner rounded-full ring-2 ring-aerospace-950 animate-pulse" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-aerospace-800 bg-aerospace-950 px-4 py-4 space-y-3 font-mono text-xs">
          <Link
            href="/collection"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-afterburner"
          >
            → COMPLETE CATALOG
          </Link>
          <Link
            href="/collection?category=schematic"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-400 hover:text-avionics-cyan"
          >
            → THE SCHEMATIC SERIES
          </Link>
          <Link
            href="/collection?category=principle"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-400 hover:text-avionics-amber"
          >
            → THE PRINCIPLE SERIES
          </Link>
          <Link
            href="/collection?category=culture"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-400 hover:text-slate-200"
          >
            → ENGINEERING CULTURE
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-400 hover:text-slate-200"
          >
            → BRAND MANIFESTO & LAB
          </Link>
          <Link
            href="/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-avionics-cyan hover:underline"
          >
            → TRACK ORDER STATUS
          </Link>
        </div>
      )}
    </header>
  );
}
