'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { formatCurrency } from '@/lib/utils';
import { PricingBreakdown } from '@/types';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Zap,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();

  // Customer & Shipping Form State
  const [formData, setFormData] = useState({
    name: 'Vikram Sarabhai',
    email: 'sarabhai@isro.aero',
    phone: '+91 98765 43210',
    address1: 'ISRO Headquarters, Antariksh Bhavan, New BEL Road',
    address2: 'Propulsion Division, Suite 402',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560094',
    country: 'India',
  });

  // Server-Authoritative Pricing State
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Checkout Execution State
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Recalculate server-authoritative pricing whenever items or country changes
  useEffect(() => {
    async function fetchServerPricing() {
      if (items.length === 0) return;

      try {
        setCalculating(true);
        setPricingError(null);

        const res = await fetch('/api/checkout/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              variantId: i.variant.id,
              quantity: i.quantity,
            })),
            country: formData.country,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setPricing(data.pricing);
        } else {
          setPricingError(data.error || 'Server pricing calculation failed');
        }
      } catch (err: any) {
        setPricingError(err.message || 'Error connecting to server pricing engine');
      } finally {
        setCalculating(false);
      }
    }

    fetchServerPricing();
  }, [items, formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setSubmitting(true);

    try {
      // 1. Create order on server
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variant.id,
            quantity: i.quantity,
          })),
          customer: formData,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      setCreatedOrder(orderData);

      // 2. If Razorpay is live and window.Razorpay exists, open modal
      if (orderData.isConfigured && typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: 'Aeromach Apparel Lab',
          description: `Order ${orderData.orderNumber}`,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#FF5E1E',
          },
          handler: async function (response: any) {
            // Verify payment server-side
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/order/${orderData.trackingToken}`);
            } else {
              setCheckoutError(verifyData.error || 'Payment signature verification failed.');
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Unconfigured or sandbox environment: Allow user to simulate verified payment
        setSubmitting(false);
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Error initiating checkout');
      setSubmitting(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdOrder) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/checkout/simulate-test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrder.orderId }),
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order/${createdOrder.trackingToken}`);
      } else {
        setCheckoutError(data.error || 'Payment simulation failed');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Error simulating test payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-xl font-mono text-slate-100">NO FLIGHT APPAREL IN CARGO</h2>
        <p className="text-xs text-slate-400">Please select blueprints before checking out.</p>
        <button
          onClick={() => router.push('/collection')}
          className="px-6 py-2.5 bg-afterburner text-white text-xs font-mono rounded"
        >
          RETURN TO CATALOG
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-aerospace-800 pb-4">
        <span className="text-xs font-mono text-avionics-cyan">SECURE DISPATCH // CHECKOUT PROTOCOL</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          DELIVERY & PAYMENT AUTHORIZATION
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact & Delivery Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleInitiatePayment} className="space-y-6">
            {/* Step 1: Customer Identification */}
            <div className="bg-aerospace-900 border border-aerospace-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-aerospace-800 pb-3">
                <span className="w-5 h-5 rounded-full bg-aerospace-800 flex items-center justify-center text-[10px] font-mono text-avionics-cyan font-bold">
                  01
                </span>
                <h3 className="text-sm font-mono font-bold text-slate-100">
                  CUSTOMER TELEMETRY & CONTACT
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-slate-400">FULL NAME *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">DISPATCH EMAIL *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-aerospace-900 border border-aerospace-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-aerospace-800 pb-3">
                <span className="w-5 h-5 rounded-full bg-aerospace-800 flex items-center justify-center text-[10px] font-mono text-avionics-cyan font-bold">
                  02
                </span>
                <h3 className="text-sm font-mono font-bold text-slate-100">
                  FLIGHT CARGO DESTINATION
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-slate-400">COUNTRY *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  >
                    <option value="India">India (Domestic Priority Air Courier)</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-slate-400">DELIVERY ADDRESS LINE 1 *</label>
                  <input
                    type="text"
                    name="address1"
                    required
                    value={formData.address1}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-slate-400">APARTMENT / SUITE / LAB (OPTIONAL)</label>
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">CITY *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">STATE / PROVINCE *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">POSTAL / PIN CODE *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 focus:outline-none focus:border-avionics-cyan"
                  />
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {checkoutError && (
              <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs font-mono text-red-300 flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Submit / Initiate Button */}
            {!createdOrder ? (
              <button
                type="submit"
                disabled={submitting || calculating}
                className="w-full py-4 bg-afterburner hover:bg-afterburner-hover disabled:bg-aerospace-800 text-white text-xs font-mono tracking-widest uppercase font-bold rounded-xl shadow-xl transition flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>INITIALIZING GATEWAY ORDER...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>PROCEED TO PAYMENT ({formatCurrency(pricing?.totalAmount || 0)})</span>
                  </>
                )}
              </button>
            ) : null}
          </form>

          {/* Sandbox / Simulator Card */}
          {createdOrder && (
            <div className="p-6 bg-aerospace-900 border-2 border-avionics-cyan/60 rounded-xl space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-avionics-cyan font-bold">
                <Zap className="w-4 h-4 text-avionics-cyan" />
                <span>ORDER GENERATED: {createdOrder.orderNumber}</span>
              </div>

              <div className="text-xs font-mono text-slate-300 space-y-1.5">
                <p>
                  Gateway Order ID: <code className="text-avionics-cyan">{createdOrder.razorpayOrderId}</code>
                </p>
                <p>
                  Status: <strong>Order Created & Pending Server Verification</strong>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-avionics-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-aerospace-950 font-bold text-xs font-mono tracking-wider rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>VERIFYING CRYPTOGRAPHIC SIGNATURE & ENQUEUEING PRINTIFY...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>AUTHORIZE & VERIFY PAYMENT (SANDBOX TEST)</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] font-mono text-slate-400 text-center mt-2">
                  Simulates successful HMAC-SHA256 signature, separates payment & fulfillment, and queues Printify order.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Authoritative Order Summary (5 cols) */}
        <div className="lg:col-span-5 bg-aerospace-900 border border-aerospace-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-aerospace-800 pb-3">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
              AUTHORITATIVE PRICE BREAKDOWN
            </h3>
            {calculating && <RefreshCw className="w-3.5 h-3.5 text-avionics-cyan animate-spin" />}
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.variant.id}
                className="flex items-center justify-between text-xs font-mono text-slate-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-aerospace-950 rounded border border-aerospace-800 p-1 flex-shrink-0">
                    <img
                      src={item.product.images[0] || '/products/turbofan-black.svg'}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-slate-100 font-medium truncate max-w-[180px]">
                      {item.product.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.variant.size} • Qty {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-slate-200">
                  {formatCurrency(item.variant.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Math */}
          <div className="border-t border-aerospace-800 pt-4 space-y-2 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200 font-bold">
                {formatCurrency(pricing?.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Flight Courier Shipping</span>
              <span className="text-avionics-cyan font-bold">
                {pricing?.shippingFee === 0 ? 'FREE' : formatCurrency(pricing?.shippingFee || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% Component)</span>
              <span className="text-slate-400">
                {formatCurrency(pricing?.taxAmount || 0)} (Included)
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Estimated Delivery Transit</span>
              <span>{pricing?.estimatedDeliveryDays || '3-5 business days'}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-aerospace-800 pt-4 flex justify-between items-baseline font-mono">
            <span className="text-xs uppercase text-slate-200 font-bold">FINAL TOTAL</span>
            <span className="text-2xl font-bold text-afterburner">
              {formatCurrency(pricing?.totalAmount || 0)}
            </span>
          </div>

          <div className="bg-aerospace-950/70 border border-aerospace-800 rounded-lg p-3.5 space-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-2 text-avionics-cyan font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>SERVER-SIDE VERIFICATION GUARANTEE</span>
            </div>
            <p className="leading-relaxed">
              Every price and variant mapping is validated on the server. Your payment will be verified with an HMAC-SHA256 signature prior to submitting production jobs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
