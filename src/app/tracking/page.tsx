'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Search, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TrackingSearchPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await res.json();
      if (data.success && data.trackingToken) {
        router.push(`/order/${data.trackingToken}`);
      } else {
        setError(data.error || 'No matching order could be found.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with flight telemetry database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-aerospace-900 border border-aerospace-800 flex items-center justify-center text-avionics-cyan">
          <Compass className="w-6 h-6" />
        </div>
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          FLIGHT DISPATCH RADAR
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          TRACK YOUR FLIGHT CARGO
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Enter your order reference code and the email address used during checkout to inspect live production and shipment status.
        </p>
      </div>

      <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleLookup} className="space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-slate-300">ORDER REFERENCE NUMBER *</label>
            <input
              type="text"
              required
              placeholder="e.g. AM-2610-8492"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-avionics-cyan"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300">CUSTOMER EMAIL *</label>
            <input
              type="email"
              required
              placeholder="engineer@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-avionics-cyan"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-[11px] text-red-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-afterburner hover:bg-afterburner-hover disabled:bg-aerospace-800 text-white font-bold tracking-widest uppercase rounded-lg shadow-lg transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>QUERYING FLIGHT NETWORK...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>INSPECT ORDER TELEMETRY</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-aerospace-800 text-center text-[10px] font-mono text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-avionics-green" />
          <span>CRYPTOGRAPHICALLY VERIFIED ACCESS PROTOCOL</span>
        </div>
      </div>
    </div>
  );
}
