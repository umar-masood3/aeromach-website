'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, ArrowRight } from 'lucide-react';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      router.replace(`/order/${token}`);
    }
  }, [token, router]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6 font-mono">
      <div className="w-16 h-16 mx-auto rounded-full bg-aerospace-900 border border-aerospace-800 flex items-center justify-center text-avionics-cyan">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-100">
          RECONCILING PAYMENT TELEMETRY...
        </h1>
        <p className="text-xs text-slate-400">
          Verifying payment gateway status with server credentials.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/tracking"
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-aerospace-900 border border-aerospace-700 text-xs font-mono text-avionics-cyan rounded"
        >
          <span>LOOK UP FLIGHT STATUS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-32 text-center font-mono text-xs text-slate-400">
          <RefreshCw className="w-8 h-8 text-avionics-cyan mx-auto animate-spin mb-4" />
          <span>RECONCILING PAYMENT...</span>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
