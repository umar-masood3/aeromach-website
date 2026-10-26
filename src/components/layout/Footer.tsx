import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-aerospace-950 border-t border-aerospace-800/80 text-slate-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded bg-aerospace-900 border border-aerospace-700 flex items-center justify-center text-afterburner font-mono font-bold text-xs">
                Δ
              </span>
              <span className="font-mono text-base font-bold tracking-widest text-slate-100 uppercase">
                AEROMACH
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Independent aerospace and aviation technical apparel. Engineered from fluid dynamics, propulsion CAD schematics, and flight mechanics principles for aerospace engineers, pilots, and technical minimalists.
            </p>
            <div className="pt-2 text-[10px] font-mono text-slate-400 space-y-1">
              <div>LAT 12.9716° N // LON 77.5946° E // FL380</div>
              <div>OPERATIONAL FLIGHT STATUS: NORMAL // MACH 1.0</div>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3 font-mono">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
              COLLECTIONS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collection?category=schematic" className="hover:text-avionics-cyan transition">
                  The Schematic Series
                </Link>
              </li>
              <li>
                <Link href="/collection?category=principle" className="hover:text-avionics-amber transition">
                  The Principle Series
                </Link>
              </li>
              <li>
                <Link href="/collection?category=culture" className="hover:text-slate-200 transition">
                  Engineering Culture
                </Link>
              </li>
              <li>
                <Link href="/collection" className="hover:text-slate-200 transition">
                  Complete Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Specs & Support */}
          <div className="space-y-3 font-mono">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
              SUPPORT & SPECS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tracking" className="hover:text-avionics-cyan transition">
                  Track Flight Cargo
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-slate-200 transition">
                  Sizing & Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-slate-200 transition">
                  Shipping & Customs
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-slate-200 transition">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-slate-200 transition">
                  Technical FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-200 transition">
                  Contact The Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3 font-mono">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
              GOVERNANCE
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-slate-200 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-200 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-afterburner transition">
                  Founder Terminal [Admin]
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-aerospace-900 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-[11px] font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} Aeromach Aerospace Apparel Lab. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>RAZORPAY VERIFIED GATEWAY</span>
            <span>•</span>
            <span>PRINTIFY DTG FULFILLMENT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
