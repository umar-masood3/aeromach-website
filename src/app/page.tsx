import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight, Compass, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { NewsletterForm } from '@/components/NewsletterForm';

export const revalidate = 60; // ISR cache 60s

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    include: {
      variants: {
        where: { isAvailable: true },
      },
    },
    take: 6,
  });

  const parsedProducts = featuredProducts.map((p) => ({
    ...p,
    images: JSON.parse(p.images),
    specifications: p.specifications ? JSON.parse(p.specifications) : null,
  }));

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. Atmospheric Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aerospace-900 via-aerospace-950 to-aerospace-950 border-b border-aerospace-800/80 pt-16 pb-24 lg:pt-24 lg:pb-32 technical-grid-bg">
        {/* Subtle decorative aerospace vector lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="20%" x2="100%" y2="80%" stroke="#00E5FF" strokeWidth="0.5" strokeDasharray="10,15" />
            <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#FF5E1E" strokeWidth="0.5" strokeDasharray="12,18" />
            <circle cx="85%" cy="30%" r="180" fill="none" stroke="#7E95BC" strokeWidth="0.5" />
            <circle cx="85%" cy="30%" r="280" fill="none" stroke="#7E95BC" strokeWidth="0.5" strokeDasharray="6,8" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-aerospace-900 border border-aerospace-700/80 text-[11px] font-mono text-avionics-cyan">
                <span className="w-2 h-2 rounded-full bg-afterburner animate-ping" />
                <span>SUPERSONIC DISPATCH // ISSUE 01 RELEASED</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 font-sans leading-none">
                AEROSPACE APPAREL. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-500">
                  ENGINEERED FROM PHYSICS.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
                Precision aircraft turbofan schematics, aerodynamic vector balance, and fluid dynamics principles translated into minimal, high-density technical streetwear.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/collection"
                  className="inline-flex items-center justify-center space-x-3 px-7 py-3.5 bg-afterburner hover:bg-afterburner-hover text-white text-xs font-mono tracking-widest uppercase font-bold rounded-lg shadow-lg shadow-orange-950/40 transition duration-200 group"
                >
                  <span>EXPLORE BLUEPRINTS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-aerospace-900/80 hover:bg-aerospace-800 text-slate-300 text-xs font-mono tracking-widest uppercase rounded-lg border border-aerospace-700 transition duration-200"
                >
                  THE LAB MANIFESTO
                </Link>
              </div>

              {/* Technical Specifications Meta Tag */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-avionics-green" />
                  <span>100% AIRLUME COMBED COTTON</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-avionics-amber" />
                  <span>NEO-PIGMENT DTG PRINT</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-avionics-cyan" />
                  <span>PRE-SHRUNK TACTICAL FIT</span>
                </div>
              </div>
            </div>

            {/* Hero Graphic Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-aerospace-900 border border-aerospace-700/80 rounded-2xl p-4 shadow-2xl shadow-cyan-950/20 group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-aerospace-950 border border-aerospace-800 relative flex items-center justify-center">
                  <img
                    src="/products/turbofan-black.svg"
                    alt="Turbofan Axial Flow Propulsion Schematic"
                    className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Floating spec pill */}
                  <div className="absolute top-3 right-3 bg-aerospace-900/90 border border-avionics-cyan/40 px-2.5 py-1 rounded text-[10px] font-mono text-avionics-cyan">
                    CAD DWG: TF-8804
                  </div>
                </div>

                <div className="mt-4 px-2 flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="text-slate-200 font-bold">THE TURBOFAN SCHEMATIC TEE</span>
                    <span className="block text-slate-400 text-[10px]">Dual-Spool High-Bypass Model</span>
                  </div>
                  <div className="text-right">
                    <span className="text-afterburner font-bold">₹1,499</span>
                    <span className="block text-slate-400 text-[10px]">Direct-To-Garment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Pillar Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-aerospace-800 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-avionics-cyan uppercase">
              DESIGN ARCHITECTURE
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans mt-1">
              THE THREE FOUNDATIONAL SERIES
            </h2>
          </div>
          <Link
            href="/collection"
            className="text-xs font-mono text-afterburner hover:text-orange-400 flex items-center space-x-1"
          >
            <span>VIEW ALL APPAREL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. The Schematic */}
          <Link
            href="/collection?category=schematic"
            className="group p-6 bg-aerospace-900/40 border border-aerospace-800 hover:border-avionics-cyan/60 rounded-xl space-y-4 transition duration-300 hover:bg-aerospace-900/80"
          >
            <div className="w-10 h-10 rounded-lg bg-aerospace-800 border border-aerospace-700 flex items-center justify-center text-avionics-cyan font-mono font-bold text-sm">
              01
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-avionics-cyan transition">
                The Schematic Series
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Precision engineering linework. High-bypass axial turbofans, NACA airfoil sections, and boundary layer transitions derived from authentic CAD data.
              </p>
            </div>
            <div className="text-[11px] font-mono text-avionics-cyan flex items-center space-x-1 pt-2">
              <span>EXPLORE SCHEMATICS</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. The Principle */}
          <Link
            href="/collection?category=principle"
            className="group p-6 bg-aerospace-900/40 border border-aerospace-800 hover:border-avionics-amber/60 rounded-xl space-y-4 transition duration-300 hover:bg-aerospace-900/80"
          >
            <div className="w-10 h-10 rounded-lg bg-aerospace-800 border border-aerospace-700 flex items-center justify-center text-avionics-amber font-mono font-bold text-sm">
              02
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-avionics-amber transition">
                The Principle Series
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                First principles of flight. Dynamic equilibrium of Lift, Weight, Thrust, and Drag; supersonic Mach cone angles; and compressible gas dynamics.
              </p>
            </div>
            <div className="text-[11px] font-mono text-avionics-amber flex items-center space-x-1 pt-2">
              <span>EXPLORE PRINCIPLES</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Engineering Culture */}
          <Link
            href="/collection?category=culture"
            className="group p-6 bg-aerospace-900/40 border border-aerospace-800 hover:border-slate-500 rounded-xl space-y-4 transition duration-300 hover:bg-aerospace-900/80"
          >
            <div className="w-10 h-10 rounded-lg bg-aerospace-800 border border-aerospace-700 flex items-center justify-center text-slate-300 font-mono font-bold text-sm">
              03
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition">
                Engineering Culture
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Authentic aerospace humor and mathematical tributes. Navier-Stokes turbulence warnings, Bernoulli energy conservation, and propulsion satire.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-300 flex items-center space-x-1 pt-2">
              <span>EXPLORE CULTURE</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-aerospace-800 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-afterburner uppercase">
              SELECTED BLUEPRINTS
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans mt-1">
              CURRENT FLIGHT APPAREL
            </h2>
          </div>
          <Link
            href="/collection"
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <span>VIEW ALL 6 MODELS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {parsedProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 4. Engineering Quality & Substrate Specs Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-aerospace-900 border border-aerospace-800 p-8 lg:p-12 relative overflow-hidden technical-grid-bg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
                FABRIC & PRINT SPECIFICATION
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                BUILT WITH RIGOROUS MANUFACTURING TOLERANCES.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                We reject generic low-micron dropship blanks. Aeromach candidates utilize retail-grade 100% Airlume combed cotton for lightweight tees (142 GSM) and preshrunk 50/50 heavyweight fleece (271 GSM) for winter flight hoodies. Neo-pigment water-based DTG inks yield wash-fast micro-detail on CAD vectors.
              </p>
              <div className="pt-2 flex flex-wrap gap-6 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">T-SHIRT SUBSTRATE</span>
                  <span className="font-bold text-slate-100">Bella+Canvas 3001</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">HOODIE SUBSTRATE</span>
                  <span className="font-bold text-slate-100">Gildan 18500 Heavy Blend</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">INK TECHNOLOGY</span>
                  <span className="font-bold text-slate-100">Kornit Water-Based DTG</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <Link
                href="/size-guide"
                className="px-6 py-4 rounded-xl bg-aerospace-950 border border-aerospace-700 hover:border-avionics-cyan transition text-center space-y-1 block group"
              >
                <div className="text-xs font-mono text-avionics-cyan font-bold tracking-wider group-hover:underline">
                  VIEW FULL SIZING CHART →
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Anatomical chest & length specs (in & cm)
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dispatch Sign-up (Newsletter / Mission Log) */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-afterburner uppercase tracking-widest">
            AEROMACH DISPATCH
          </span>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
            BE NOTIFIED OF ENGINE SCHEMATIC RELEASES
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Zero promotional clutter. Only engineering notes, newly drafted flight blueprints, and limited production runs.
          </p>
        </div>

        <NewsletterForm />
      </section>
    </div>
  );
}
