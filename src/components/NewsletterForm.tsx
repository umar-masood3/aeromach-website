'use client';

import React, { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  if (subscribed) {
    return (
      <div className="p-3 bg-aerospace-900 border border-avionics-green/40 rounded-lg text-xs font-mono text-avionics-green">
        ✓ CALLSIGN RECORDED // YOU ARE SUBSCRIBED TO AEROMACH DISPATCH
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="engineer@domain.com"
        className="flex-1 px-4 py-3 bg-aerospace-900 border border-aerospace-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-avionics-cyan"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-aerospace-800 hover:bg-aerospace-700 text-xs font-mono tracking-wider font-bold text-slate-100 border border-aerospace-600 rounded-lg transition"
      >
        TRANSMIT
      </button>
    </form>
  );
}
