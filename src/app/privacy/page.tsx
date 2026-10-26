import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          LEGAL & TELEMETRY PROTOCOLS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          PRIVACY POLICY
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Last revised: October 2026. How Aeromach handles customer identification, orders, and payment security.
        </p>
      </div>

      <div className="space-y-6 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            1. DATA WE COLLECT
          </h2>
          <p>
            When you place an order on Aeromach, we collect only the necessary information required to process and dispatch your apparel: your name, email address, phone number, and physical shipping address.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            2. PAYMENT CARD SECURITY (PCI-DSS)
          </h2>
          <p>
            Aeromach <strong>never</strong> stores, sees, or processes credit card numbers, debit card details, or banking PINs on our servers. All financial transactions are handled directly through Razorpay, a PCI-DSS Level 1 certified payment gateway authorized by the Reserve Bank of India.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            3. THIRD-PARTY DISCLOSURES (FULFILLMENT & CARRIERS)
          </h2>
          <p>
            Your delivery address and selected garment sizes are securely transmitted via encrypted API to Printify Inc. and assigned air courier partners solely for the purpose of printing, packing, and delivering your package. We never sell, rent, or trade customer data to advertising brokers.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
            4. YOUR RIGHTS & DATA RETENTION
          </h2>
          <p>
            You have the right to request access to the personal data we hold regarding your past orders, or request its deletion subject to statutory tax and invoice retention requirements. Inquiries can be submitted to <strong>privacy@aeromach.aero</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
