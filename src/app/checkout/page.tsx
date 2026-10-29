'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { formatCurrency } from "@/lib/utils";
import { PricingBreakdown } from "@/types";
import { type CheckoutMode } from "@/lib/payment-simulator";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Zap,
} from "lucide-react";

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
    name: "Vikram Sarabhai",
    email: "sarabhai@isro.aero",
    phone: "+91 98765 43210",
    address1: "ISRO Headquarters, Antariksh Bhavan, New BEL Road",
    address2: "Propulsion Division, Suite 402",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560094",
    country: "India",
  });

  // Server-Authoritative Pricing State
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Checkout availability, decided by the server (never by this client).
  // null = not yet known, which is treated as "not allowed" until answered.
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode | null>(null);

  // Only an explicit server answer unlocks checkout; null (unknown) does not.
  const checkoutAllowed = checkoutMode === "live" || checkoutMode === "sandbox";

  // Checkout Execution State
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Ask the server what checkout is allowed to do. Fail closed if it cannot say.
  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutMode() {
      try {
        const res = await fetch("/api/checkout/status", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        setCheckoutMode(
          data?.checkoutMode === "live" || data?.checkoutMode === "sandbox"
            ? data.checkoutMode
            : "disabled",
        );
      } catch {
        if (!cancelled) setCheckoutMode("disabled");
      }
    }

    loadCheckoutMode();
    return () => {
      cancelled = true;
    };
  }, []);

  // Recalculate server-authoritative pricing whenever items or country changes
  useEffect(() => {
    async function fetchServerPricing() {
      if (items.length === 0) return;

      try {
        setCalculating(true);
        setPricingError(null);

        const res = await fetch("/api/checkout/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          setPricingError(data.error || "Server pricing calculation failed");
        }
      } catch (err: any) {
        setPricingError(
          err.message || "Error connecting to server pricing engine",
        );
      } finally {
        setCalculating(false);
      }
    }

    fetchServerPricing();
  }, [items, formData.country]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side courtesy check only; the API enforces this independently.
    if (checkoutMode === "disabled") {
      setCheckoutError(
        "Checkout is disabled on this demonstration deployment. No payment is collected and no order is placed.",
      );
      return;
    }

    setCheckoutError(null);
    setSubmitting(true);

    try {
      // 1. Create order on server
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(orderData.error || "Order creation failed");
      }

      setCreatedOrder(orderData);

      // 2. If Razorpay is live and window.Razorpay exists, open modal
      if (
        orderData.isConfigured &&
        typeof window !== "undefined" &&
        window.Razorpay
      ) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: "Aeromach Apparel Lab",
          description: `Order ${orderData.orderNumber}`,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#FF5E1E",
          },
          handler: async function (response: any) {
            // Verify payment server-side
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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
              setCheckoutError(
                verifyData.error || "Payment signature verification failed.",
              );
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
      setCheckoutError(err.message || "Error initiating checkout");
      setSubmitting(false);
    }
  };


  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-xl font-mono text-slate-100">
          NO FLIGHT APPAREL IN CARGO
        </h2>
        <p className="text-xs text-slate-400">
          Please select blueprints before checking out.
        </p>
        <button
          onClick={() => router.push("/collection")}
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
        <span className="text-xs font-mono text-avionics-cyan">
          SECURE DISPATCH // CHECKOUT PROTOCOL
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          DELIVERY & PAYMENT AUTHORIZATION
        </h1>
      </div>

      {/* Demonstration deployment notice. Shown whenever nobody can pay. */}
      {checkoutMode === "disabled" && (
        <div
          data-testid="checkout-disabled-banner"
          className="p-5 bg-amber-950/50 border-2 border-amber-600/70 rounded-xl space-y-2"
        >
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-mono font-bold tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>DEMO MODE // CHECKOUT DISABLED</span>
          </div>
          <p className="text-xs font-mono text-amber-100/90 leading-relaxed">
            This is a demonstration deployment of Aeromach. It is not accepting
            real orders: no payment will be collected, nothing will be
            manufactured or shipped, and the merchandise shown is not for sale
            here.
          </p>
        </div>
      )}

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
                    <option value="India">
                      India (Domestic Priority Air Courier)
                    </option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-slate-400">
                    DELIVERY ADDRESS LINE 1 *
                  </label>
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
                  <label className="text-slate-400">
                    APARTMENT / SUITE / LAB (OPTIONAL)
                  </label>
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
                disabled={submitting || calculating || !checkoutAllowed}
                className="w-full py-4 bg-afterburner hover:bg-afterburner-hover disabled:bg-aerospace-800 disabled:cursor-not-allowed text-white text-xs font-mono"
              >
                {submitting ? "PROCESSING..." : "AUTHORIZE PAYMENT"}
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}