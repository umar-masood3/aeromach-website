import React from 'react';
import Link from 'next/link';
import { Truck, Globe, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          FLIGHT LOGISTICS & DISPATCH
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          SHIPPING & DISPATCH POLICY
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Complete disclosure of on-demand manufacturing timelines, shipping rates, customs, and air courier tracking.
        </p>
      </div>

      <div className="space-y-8 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-avionics-cyan" />
            <span>1. PRODUCTION TIMELINES (MADE ON DEMAND)</span>
          </h2>
          <p>
            Aeromach operates on a sustainable, zero-waste print-on-demand production model via Printify. Garments are not mass-produced in advance; each piece is individually printed and quality-inspected after your order is confirmed.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-xs">
            <li>Standard Production Window: <strong>1 to 3 business days</strong>.</li>
            <li>Peak Holiday Periods: May extend up to 4 business days.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Truck className="w-4 h-4 text-avionics-amber" />
            <span>2. DOMESTIC SHIPPING (INDIA)</span>
          </h2>
          <p>
            Domestic shipments are routed via leading priority air express carriers (BlueDart, Delhivery, FedEx India, or Xpressbees) depending on your pincode.
          </p>
          <div className="bg-aerospace-950 p-4 rounded-lg font-mono text-xs space-y-1.5 text-slate-300">
            <div>• Transit Time: <strong>3 to 5 business days</strong> following production.</div>
            <div>• Orders <strong>₹2,500 and above</strong>: <strong>FREE STANDARD AIR SHIPPING</strong>.</div>
            <div>• Orders under ₹2,500: Flat rate of <strong>₹150.00</strong>.</div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Globe className="w-4 h-4 text-afterburner" />
            <span>3. INTERNATIONAL AIR COURIER</span>
          </h2>
          <p>
            We dispatch flight apparel worldwide to over 40 countries including the United States, United Kingdom, European Union, Canada, Australia, Japan, and Singapore.
          </p>
          <div className="bg-aerospace-950 p-4 rounded-lg font-mono text-xs space-y-1.5 text-slate-300">
            <div>• Global Transit Time: <strong>7 to 12 business days</strong>.</div>
            <div>• Flat International Rate: <strong>₹1,400.00</strong> (~$17 USD).</div>
            <div>• Tracking: Fully trackable door-to-door waybill number provided.</div>
            <div>• Customs & Duties: International orders may be subject to local VAT/import duties determined by your destination country’s customs authority. These charges are the responsibility of the recipient.</div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6">
          <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-avionics-green" />
            <span>4. REAL-TIME FLIGHT TRACKING</span>
          </h2>
          <p>
            As soon as your parcel is handed over to the courier, an email notification containing your waybill number and direct tracking URL is dispatched. You may also track your shipment at any time through our online <Link href="/tracking" className="text-avionics-cyan underline">Track Order</Link> portal.
          </p>
        </div>
      </div>
    </div>
  );
}
