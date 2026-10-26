import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          LEGAL TERMS & CONDITIONS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          TERMS OF SERVICE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Effective date: October 2026. Standard governing conditions for use of the Aeromach storefront and flight apparel purchasing.
        </p>
      </div>

      <div className="space-y-6 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            1. ACCEPTANCE OF TERMS
          </h2>
          <p>
            By accessing or ordering from the Aeromach website, you agree to be bound by these Terms of Service and our associated Shipping and Returns policies. If you disagree with any portion of these terms, please do not use our services.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            2. INTELLECTUAL PROPERTY & ORIGINAL VECTOR ARTWORK
          </h2>
          <p>
            All original illustrations, CAD vector reconstructions, aerodynamic diagrams, typography layouts, code, and branding elements appearing on Aeromach are the intellectual property of Aeromach Apparel Lab. Unauthorized reproduction, scraping, commercial redistribution, or counterfeiting of our artwork is strictly prohibited.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            3. PRODUCT AVAILABILITY & PRICING
          </h2>
          <p>
            Prices are published in Indian Rupees (INR) and are subject to change based on production substrate costs and exchange rates. All orders are subject to server-side revalidation of pricing and inventory availability before acceptance. In the rare event an error in pricing occurs, we reserve the right to cancel the order and provide a full refund.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            4. LIMITATION OF LIABILITY
          </h2>
          <p>
            Aeromach and its affiliates shall not be liable for indirect, incidental, or consequential damages resulting from courier delays, customs border holds, or force majeure events beyond our operational control.
          </p>
        </div>
      </div>
    </div>
  );
}
