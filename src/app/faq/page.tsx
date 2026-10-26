'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What substrates and garment blanks does Aeromach utilize?',
      a: 'We select retail-grade apparel blanks for durability and hand-feel. Our standard t-shirts are Bella+Canvas 3001 unisex tees crafted from 100% Airlume combed ring-spun cotton (142 GSM / 4.2 oz). Our heavyweight technical hoodies are Gildan 18500 heavy blend fleece (271 GSM / 8.0 oz) with double-needle stitching, pouch pocket, and matching drawstrings.',
    },
    {
      q: 'How are the technical graphics and equations printed?',
      a: 'All items are printed using modern Direct-To-Garment (DTG) digital print technology. Water-based neo-pigment inks are jetted directly into the fibers, cured at high temperatures for wash-fast permanence. Unlike thick vinyl stickers or heavy plastic rubber transfers, our prints breathe with the garment and capture fine CAD vector line-art without peeling.',
    },
    {
      q: 'How does the on-demand fulfillment pipeline work with Printify?',
      a: 'When you place and pay for an order on Aeromach, your payment is verified server-side with an cryptographic signature. Once confirmed, our server automatically submits a fulfillment job to our global print provider network via Printify. Your item is custom-printed, inspected for quality, packed, and assigned an air courier tracking number.',
    },
    {
      q: 'What are the delivery timelines and shipping costs?',
      a: 'Domestic shipping across India takes approximately 3 to 5 business days after a 2-day production window. Domestic shipping is completely FREE on orders above ₹2,500 (otherwise a flat ₹150 fee applies). International air courier shipping is available to over 40 countries, with transit times averaging 7 to 12 business days at a flat rate of ₹1,400.',
    },
    {
      q: 'How can I track my shipment?',
      a: 'Every customer receives a secure, unique tracking URL (such as /order/your-token) immediately after checkout. You can also visit our Track Order page at any time and enter your order number (e.g. AM-2610-8492) along with your email to see live production status, carrier details, and tracking numbers.',
    },
    {
      q: 'What happens if there is a misprint, flaw, or damage upon delivery?',
      a: 'Because items are custom printed on demand, we cannot accept casual returns for change-of-mind. However, if your garment arrives damaged, with a print defect, misaligned graphic, or wrong size due to our manufacturing error, we provide an immediate 100% free replacement or full refund. Simply report it with photos within 14 days of delivery.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit and debit cards (Visa, MasterCard, RuPay, American Express), UPI (Google Pay, PhonePe, Paytm, BHIM), and Netbanking through our secure Razorpay payment integration.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="border-b border-aerospace-800 pb-6 space-y-2">
        <span className="text-xs font-mono text-avionics-cyan uppercase tracking-widest">
          KNOWLEDGE BASE // FAQ
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Everything you need to know regarding garment specifications, DTG printing, fulfillment, shipping, and warranty.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-aerospace-900 border border-aerospace-800 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center text-xs sm:text-sm font-mono font-bold text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-avionics-cyan flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-sans border-t border-aerospace-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
