'use client';

import React, { useState } from 'react';
import { Mail, Compass, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          COMMUNICATIONS CHANNEL
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          CONTACT THE AEROMACH LAB
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Questions about sizing, custom corporate aerospace orders, order telemetry, or technical inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-6 font-mono text-xs text-slate-300">
          <div className="p-5 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-3">
            <div className="text-slate-100 font-bold uppercase tracking-wider flex items-center space-x-2">
              <Mail className="w-4 h-4 text-afterburner" />
              <span>DISPATCH DESK</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Email inquiries are monitored by engineers between 09:00 and 18:00 IST.
            </p>
            <div className="text-avionics-cyan font-bold">ops@aeromach.aero</div>
          </div>

          <div className="p-5 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-2">
            <div className="text-slate-100 font-bold uppercase tracking-wider">LAB LOCATION</div>
            <div className="text-slate-400 text-[11px] leading-relaxed">
              Aeromach Propulsion Apparel Lab<br />
              Bengaluru, Karnataka 560094<br />
              India
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 sm:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-4 font-mono">
              <CheckCircle2 className="w-12 h-12 text-avionics-green mx-auto" />
              <h3 className="text-base font-bold text-slate-100">TRANSMISSION RECEIVED</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Thank you for contacting the flight lab. A response will be dispatched within 24 operational hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2 bg-aerospace-800 text-avionics-cyan text-xs rounded border border-aerospace-700"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300">NAME / CALLSIGN *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Officer Miller"
                  className="w-full px-4 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-avionics-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300">EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  placeholder="miller@aerospace.org"
                  className="w-full px-4 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-avionics-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300">SUBJECT CATEGORY *</label>
                <select className="w-full px-4 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan">
                  <option value="order">Order Status / Tracking Question</option>
                  <option value="sizing">Sizing & Substrate Question</option>
                  <option value="wholesale">Bulk / Engineering Team Order</option>
                  <option value="press">Press & Technical Collaboration</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300">DISPATCH MESSAGE *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your inquiry..."
                  className="w-full px-4 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-avionics-cyan resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-afterburner hover:bg-afterburner-hover text-white font-bold uppercase tracking-widest rounded-lg shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>TRANSMIT MESSAGE TO LAB</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
