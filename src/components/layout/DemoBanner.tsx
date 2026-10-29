'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function DemoBanner() {
  // Shows banner unless explicitly disabled with NEXT_PUBLIC_DEMO_MODE="false"
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

  if (!isDemo) return null;

  return (
    <aside aria-label="Demo mode notice" className="bg-gradient-to-r from-amber-950/80 via-aerospace-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-center text-[11px] sm:text-xs font-mono text-amber-200/90 flex items-center justify-center space-x-2">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
      <span>
        <strong className="text-amber-300 font-bold">PORTFOLIO DEMO MODE:</strong> Payment collection and order fulfillment are disabled. No live charges or physical shipments will occur.
      </span>
    </aside>
  );
}
