'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Compass,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const token = params?.token as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${token}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Order telemetry could not be found');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to order telemetry network');
      } finally {
        setLoading(false);
      }
    }

    if (token) loadOrder();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-avionics-cyan mx-auto animate-spin" />
        <p className="text-xs font-mono text-slate-400">CONNECTING TO FLIGHT LOGISTICS TELEMETRY...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-4">
        <div className="text-4xl font-mono text-red-500 font-bold">404</div>
        <h2 className="text-xl font-mono text-slate-100">ORDER NOT FOUND</h2>
        <p className="text-xs text-slate-400">
          The requested flight reference or tracking token is invalid or has expired.
        </p>
        <Link
          href="/tracking"
          className="inline-block mt-4 px-6 py-2.5 bg-aerospace-900 border border-aerospace-700 text-xs font-mono text-avionics-cyan rounded"
        >
          LOOK UP BY ORDER NUMBER & EMAIL
        </Link>
      </div>
    );
  }

  // Stepper milestones
  const steps = [
    { id: 'PLACED', label: 'Order Placed', completed: true },
    { id: 'PAID', label: 'Payment Verified', completed: order.paymentStatus === 'PAID' },
    {
      id: 'QUEUED',
      label: 'Production Queued',
      completed: ['QUEUED', 'SUBMITTED_TO_PRINTIFY', 'AWAITING_PRODUCTION', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(
        order.fulfillmentStatus
      ),
    },
    {
      id: 'PRODUCTION',
      label: 'In Production (Printify)',
      completed: ['AWAITING_PRODUCTION', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(order.fulfillmentStatus),
    },
    {
      id: 'SHIPPED',
      label: 'Flight Courier Dispatched',
      completed: ['SHIPPED', 'DELIVERED'].includes(order.fulfillmentStatus),
    },
    { id: 'DELIVERED', label: 'Mission Delivered', completed: order.fulfillmentStatus === 'DELIVERED' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Top Banner */}
      <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-aerospace-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-avionics-green animate-pulse" />
              <span className="text-xs font-mono text-avionics-cyan">MISSION STATUS // SECURE TELEMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100">
              ORDER {order.orderNumber}
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Dispatched to {order.customerName} ({order.customerEmail})
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs font-mono">
            {/* Payment Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-aerospace-950 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PAYMENT: {order.paymentStatus}</span>
            </div>

            {/* Fulfillment Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-aerospace-950 border border-cyan-500/40 text-avionics-cyan">
              <Package className="w-3.5 h-3.5" />
              <span>FULFILLMENT: {order.fulfillmentStatus}</span>
            </div>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="space-y-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            FLIGHT PROGRESSION LIFECYCLE
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg border text-center space-y-1.5 ${
                  step.completed
                    ? 'bg-aerospace-950 border-avionics-cyan/60 text-slate-100'
                    : 'bg-aerospace-950/40 border-aerospace-800 text-slate-500'
                }`}
              >
                <div className="flex justify-center">
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-avionics-cyan" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="text-[11px] font-mono leading-tight">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Carrier Tracking Notice */}
        {order.trackingNumber && (
          <div className="p-4 bg-aerospace-950 border border-avionics-cyan/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-0.5">
              <div className="text-slate-200 font-bold flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-avionics-cyan" />
                <span>CARRIER: {order.carrier || 'Priority Air Express'}</span>
              </div>
              <div className="text-slate-400">
                Waybill Tracking Number: <strong className="text-slate-200">{order.trackingNumber}</strong>
              </div>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-afterburner hover:bg-afterburner-hover text-white rounded text-xs font-mono transition"
              >
                <span>OPEN CARRIER DISPATCH</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Submission Failure Recovery Notice */}
        {order.fulfillmentStatus === 'SUBMISSION_FAILED' && (
          <div className="p-4 bg-amber-950/40 border border-amber-800 rounded-xl flex items-start space-x-3 text-xs font-mono text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">PRINTIFY ORDER SYNC ATTENTION REQUIRED</span>
              <p className="text-slate-300">
                Your payment was received and securely verified. Our operational team has been notified to re-queue the Printify production job immediately. You do not need to make another payment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Ordered Items Manifest (7 cols) */}
        <div className="md:col-span-7 bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-aerospace-800 pb-3">
            ORDER ITEM MANIFEST
          </h3>

          <div className="divide-y divide-aerospace-800/60">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="text-slate-100 font-bold">{item.productTitle}</div>
                  <div className="text-slate-400 text-[11px]">
                    Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-200 font-bold">{formatCurrency(item.totalPrice)}</div>
                  <div className="text-slate-500 text-[10px]">({formatCurrency(item.unitPrice)} ea)</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-aerospace-800 pt-3 space-y-1.5 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Flight Shipping</span>
              <span className="text-avionics-cyan">
                {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST 18%</span>
              <span>{formatCurrency(order.taxAmount)} (Included)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-aerospace-800 text-sm font-bold text-slate-100">
              <span>TOTAL PAID</span>
              <span className="text-afterburner">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right: Shipping Destination & Flight Lab Support (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 space-y-3 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-aerospace-800 pb-3">
              DELIVERY DESTINATION
            </h3>
            <div className="text-slate-300 space-y-1">
              <div className="font-bold text-slate-100">{order.customerName}</div>
              <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
              <div>{order.shippingAddress.postalCode}</div>
              <div className="text-slate-400 uppercase">{order.shippingAddress.country}</div>
            </div>
          </div>

          <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 space-y-3 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-aerospace-800 pb-3">
              FLIGHT LAB SUPPORT
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Need to modify your destination or inquire regarding manufacturing transit? Contact our flight crew with your order reference.
            </p>
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-block px-4 py-2 bg-aerospace-800 hover:bg-aerospace-700 text-slate-200 rounded text-xs transition"
              >
                TRANSMIT SUPPORT INQUIRY →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
