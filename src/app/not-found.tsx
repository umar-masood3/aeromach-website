import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-28 sm:py-36 text-center space-y-6 font-mono">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-aerospace-900 border border-aerospace-800 flex items-center justify-center text-afterburner text-2xl font-bold">
        Δ
      </div>

      <div className="space-y-2">
        <span className="text-xs text-avionics-cyan uppercase tracking-widest">
          TELEMETRY ANOMALY // 404
        </span>
        <h1 className="text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          FLIGHT PATH LOST (OFF RADAR)
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested coordinate or flight apparel specification does not exist in the active aerodrome database.
        </p>
      </div>

      <div className="pt-4 flex justify-center space-x-4">
        <Link
          href="/"
          className="px-6 py-3 bg-aerospace-900 hover:bg-aerospace-800 text-xs text-slate-200 border border-aerospace-700 rounded-lg transition"
        >
          RETURN TO AIRFIELD (HOME)
        </Link>
        <Link
          href="/collection"
          className="px-6 py-3 bg-afterburner hover:bg-afterburner-hover text-white text-xs font-bold rounded-lg shadow-lg transition flex items-center space-x-1.5"
        >
          <span>BROWSE MASTER CATALOG</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
