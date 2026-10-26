import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Shield, Cpu, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-16">
      {/* Header */}
      <div className="space-y-4 border-b border-aerospace-800 pb-8">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-avionics-cyan">
          <span>THE AEROMACH MANIFESTO</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-sans tracking-tight">
          FORM FOLLOWS FLIGHT. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-500">
            WHERE AERODYNAMICS MEETS APPAREL.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Aeromach was founded on a singular realization: apparel for engineers, aviators, and space scientists had been reduced to generic merchandise, poorly drafted clip-art, or superficial slogans. We set out to change that.
        </p>
      </div>

      {/* Origin Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-wider text-avionics-cyan">
            ORIGINS: THE CAD DRAFTING TABLE
          </h2>
          <p>
            Every Aeromach graphic begins as authentic computational fluid dynamics (CFD) geometry or propulsion CAD blueprints. We take real station numbers, supersonic shock wave angles, and Navier-Stokes momentum equations and typeset them with surgical precision.
          </p>
          <p>
            Whether it is the 11.2:1 bypass ratio station stations on our Turbofan schematic or the symmetrical camber lines of the NACA 0012 profile, we treat the fabric as a technical drawing board.
          </p>
        </div>

        <div className="p-6 bg-aerospace-900 border border-aerospace-800 rounded-2xl technical-grid-bg space-y-4">
          <div className="text-xs font-mono text-afterburner font-bold">
            FOUNDATIONAL DESIGN PRINCIPLES:
          </div>
          <ul className="space-y-3 text-xs font-mono text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-avionics-cyan font-bold">•</span>
              <span><strong>Authentic Mathematics:</strong> Equations are mathematically accurate, not decorative gibberish.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-avionics-cyan font-bold">•</span>
              <span><strong>Restrained Aesthetic:</strong> No neon gradients or crowded template graphics. Clean lines, monochrome graphite, aerospace accents.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-avionics-cyan font-bold">•</span>
              <span><strong>Substrate Integrity:</strong> Ring-spun combed cotton (142 GSM) and preshrunk fleece (271 GSM) constructed for endurance.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sustainable Print On Demand Callout */}
      <div className="p-8 bg-aerospace-900/60 border border-aerospace-800 rounded-2xl space-y-4">
        <span className="text-xs font-mono text-avionics-amber uppercase tracking-widest">
          ON-DEMAND PRODUCTION ETHOS
        </span>
        <h3 className="text-xl font-bold text-slate-100">
          ZERO WAREHOUSE OVERPRODUCTION. ZERO SURPLUS LANDFILL.
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Fast fashion generates millions of metric tons of unsold inventory each year. Aeromach operates on an on-demand manufacturing pipeline via Printify. Each garment is prepared and printed specifically for you when your order is placed, using water-based non-toxic inks and ethical, sweatshop-free blanks.
        </p>
        <div className="pt-2">
          <Link
            href="/collection"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-afterburner hover:bg-afterburner-hover text-white text-xs font-mono tracking-widest uppercase font-bold rounded-lg shadow-lg transition"
          >
            <span>VIEW THE BLUEPRINTS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
