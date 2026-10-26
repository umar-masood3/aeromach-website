import React from 'react';
import Link from 'next/link';
import { RotateCcw, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          QUALITY ASSURANCE & GUARANTEE
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          RETURNS & REPLACEMENTS POLICY
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Honest disclosure on print-on-demand manufacturing, misprint guarantees, and defect replacements.
        </p>
      </div>

      <div className="space-y-8 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
        {/* Quality Guarantee Box */}
        <div className="bg-aerospace-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center space-x-2 text-avionics-green font-mono font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-avionics-green" />
            <span>100% REPLACEMENT GUARANTEE FOR DEFECTS OR MISPRINTS</span>
          </div>
          <p className="text-slate-300">
            If your Aeromach apparel arrives with a manufacturing flaw, seam tear, incorrect size/color from what you ordered, or print defect (misalignment, ink bleeding), we will provide an <strong>immediate free replacement or full refund</strong>.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
            1. ON-DEMAND CUSTOM PRINTING CONSIDERATIONS
          </h2>
          <p>
            Because every single piece of apparel is made on-demand specifically for you, we cannot offer buyer's remorse returns, change-of-heart exchanges, or ordering multiple sizes to try on and return the rest.
          </p>
          <p className="text-slate-400 font-mono text-xs">
            Please consult our <Link href="/size-guide" className="text-avionics-cyan underline">Size Calibration Guide</Link> before placing your order to ensure an accurate fit.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
            2. HOW TO FILE A REPLACEMENT CLAIM (WITHIN 14 DAYS)
          </h2>
          <p>
            If your item has a quality defect, please file a claim within <strong>14 calendar days</strong> of parcel delivery:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-400 font-mono text-xs">
            <li>Email our flight lab at <strong>support@aeromach.aero</strong> with subject: <code>CLAIM [Your Order Number]</code>.</li>
            <li>Attach 1-2 clear photographs showing the defect (e.g. print flaw, torn seam, or packaging barcode).</li>
            <li>State whether you prefer a free expedited replacement or a full refund to your original payment method.</li>
          </ol>
          <p className="pt-2 text-slate-300">
            Our engineers will review the telemetry within 24 hours and trigger a new replacement production run immediately upon verification.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
            3. REFUND PROCESSING
          </h2>
          <p>
            Approved refunds are credited back to the original method of payment (via Razorpay) within 5 to 7 business days, depending on your financial institution's processing cycles.
          </p>
        </div>
      </div>
    </div>
  );
}
