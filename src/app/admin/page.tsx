'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import {
  Shield,
  ShieldAlert,
  RefreshCw,
  Search,
  Package,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Activity,
  Layers,
  Lock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [activity, setActivity] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [filterFulfillment, setFilterFulfillment] = useState('ALL');

  // Check login on load
  useEffect(() => {
    const savedKey = localStorage.getItem('aeromach_admin_key');
    if (savedKey) {
      setAuthKey(savedKey);
      verifyKey(savedKey);
    }
  }, []);

  const verifyKey = async (keyToTest: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToTest }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('aeromach_admin_key', keyToTest);
        loadDashboardData(keyToTest);
      } else {
        setAuthError(data.error || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error authenticating');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (activeKey: string) => {
    try {
      setLoading(true);
      const headers = { 'x-admin-key': activeKey };

      const [metricsRes, ordersRes, healthRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/health', { headers }),
      ]);

      const [metricsData, ordersData, healthData] = await Promise.all([
        metricsRes.json(),
        ordersRes.json(),
        healthRes.json(),
      ]);

      if (metricsData.success) {
        setMetrics(metricsData.metrics);
        setActivity(metricsData.recentActivity || []);
      }
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
      if (healthData.success) {
        setHealth(healthData.health);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    verifyKey(authKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('aeromach_admin_key');
    setIsAuthenticated(false);
    setAuthKey('');
  };

  // Admin Actions
  const handleRetryOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      setMessage(null);
      const res = await fetch(`/api/admin/orders/${orderId}/retry`, {
        method: 'POST',
        headers: { 'x-admin-key': authKey },
      });
      const data = await res.json();
      setMessage(data.message || (data.success ? 'Retry successful' : 'Retry recorded failure'));
      loadDashboardData(authKey);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReconcileOrder = async (orderId: string) => {
    try {
      setActionLoading(`rec_${orderId}`);
      setMessage(null);
      const res = await fetch(`/api/admin/orders/${orderId}/reconcile`, {
        method: 'POST',
        headers: { 'x-admin-key': authKey },
      });
      const data = await res.json();
      setMessage(data.success ? 'Reconciled successfully with Printify' : data.reason || 'Reconciliation failed');
      loadDashboardData(authKey);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncPrintify = async () => {
    try {
      setActionLoading('sync');
      setMessage(null);
      const res = await fetch('/api/admin/products/sync', {
        method: 'POST',
        headers: { 'x-admin-key': authKey },
      });
      const data = await res.json();
      setMessage(data.message || 'Catalog synced successfully');
      loadDashboardData(authKey);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = filterPayment === 'ALL' || o.paymentStatus === filterPayment;
    const matchesFulfillment =
      filterFulfillment === 'ALL' || o.fulfillmentStatus === filterFulfillment;

    return matchesSearch && matchesPayment && matchesFulfillment;
  });

  // If unauthenticated: render login prompt
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 sm:py-32 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-aerospace-900 border border-aerospace-700 flex items-center justify-center text-afterburner">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-slate-100">
            FOUNDER TERMINAL ACCESS
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Restricted flight operations dashboard. Enter your administrative key.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-slate-300">ADMIN SECRET KEY</label>
            <input
              type="password"
              required
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-3 bg-aerospace-950 border border-aerospace-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-avionics-cyan font-mono text-xs"
            />
          </div>

          {authError && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs font-mono text-red-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-afterburner hover:bg-afterburner-hover disabled:bg-aerospace-800 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg transition"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER OPERATIONS CENTER'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-aerospace-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-avionics-cyan">
            <span className="w-2 h-2 rounded-full bg-avionics-cyan animate-pulse" />
            <span>AEROMACH OPERATIONS CENTER // FLIGHT LEVEL 400</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
            FOUNDER ADMINISTRATION
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            onClick={handleSyncPrintify}
            disabled={actionLoading === 'sync'}
            className="px-4 py-2 bg-aerospace-900 hover:bg-aerospace-800 border border-aerospace-700 text-avionics-cyan rounded flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'sync' ? 'animate-spin' : ''}`} />
            <span>SYNC PRINTIFY CATALOG</span>
          </button>
          <button
            onClick={() => loadDashboardData(authKey)}
            className="p-2 bg-aerospace-900 border border-aerospace-700 text-slate-300 hover:text-white rounded"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-aerospace-950 border border-aerospace-800 text-slate-400 hover:text-red-400 rounded transition"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {message && (
        <div className="p-4 bg-aerospace-900 border border-avionics-cyan/60 rounded-xl text-xs font-mono text-avionics-cyan flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Integration Health Indicators Banner */}
      {health && (
        <div className="p-4 bg-aerospace-900/60 border border-aerospace-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">DATABASE STATUS</span>
            <span className="text-avionics-green font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{health.database} (SQLITE)</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">PRINTIFY INTEGRATION</span>
            <span className={`font-bold ${health.printify.configured ? 'text-avionics-green' : 'text-avionics-amber'}`}>
              {health.printify.mode} ({health.printify.status})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">PAYMENT GATEWAY</span>
            <span className={`font-bold ${health.payment.configured ? 'text-avionics-green' : 'text-avionics-amber'}`}>
              RAZORPAY ({health.payment.mode})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">PENDING OUTBOX JOBS</span>
            <span className="text-slate-200 font-bold">
              {health.jobs.pending} queued / {health.jobs.failed} failed
            </span>
          </div>
        </div>
      )}

      {/* Metrics Row (Real DB numbers) */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400">TOTAL ORDERS</span>
            <div className="text-2xl font-mono font-bold text-slate-100">{metrics.totalOrders}</div>
          </div>

          <div className="p-4 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400">TOTAL REVENUE</span>
            <div className="text-2xl font-mono font-bold text-afterburner">
              {formatCurrency(metrics.totalRevenue)}
            </div>
          </div>

          <div className="p-4 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400">PAID AWAITING FULFILL</span>
            <div className="text-2xl font-mono font-bold text-avionics-cyan">
              {metrics.paidAwaitingFulfillment}
            </div>
          </div>

          <div className="p-4 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400">IN PRODUCTION</span>
            <div className="text-2xl font-mono font-bold text-avionics-amber">
              {metrics.inProductionOrders}
            </div>
          </div>

          <div className="p-4 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400">SHIPPED MISSIONS</span>
            <div className="text-2xl font-mono font-bold text-avionics-green">
              {metrics.shippedOrders + metrics.deliveredOrders}
            </div>
          </div>

          <div className="p-4 bg-aerospace-900 border border-aerospace-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400">ACTION REQUIRED</span>
            <div className={`text-2xl font-mono font-bold ${metrics.requiresActionCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              {metrics.requiresActionCount}
            </div>
          </div>
        </div>
      )}

      {/* Order Management Section */}
      <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-aerospace-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
              ORDER RECOVERY & LIFECYCLE MANAGEMENT
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Inspect payment verification, trigger Printify retries, and reconcile statuses.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Order # or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-aerospace-950 border border-aerospace-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-avionics-cyan"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Payment:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-aerospace-950 border border-aerospace-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Payment States</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Fulfillment:</span>
            <select
              value={filterFulfillment}
              onChange={(e) => setFilterFulfillment(e.target.value)}
              className="bg-aerospace-950 border border-aerospace-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Fulfillment States</option>
              <option value="UNFULFILLED">UNFULFILLED</option>
              <option value="QUEUED">QUEUED</option>
              <option value="SUBMITTED_TO_PRINTIFY">SUBMITTED</option>
              <option value="AWAITING_PRODUCTION">AWAITING PRODUCTION</option>
              <option value="IN_PRODUCTION">IN PRODUCTION</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="SUBMISSION_FAILED">SUBMISSION FAILED</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto border border-aerospace-800 rounded-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-aerospace-950 text-slate-400 border-b border-aerospace-800">
              <tr>
                <th className="py-3 px-4">ORDER REF</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">PAYMENT</th>
                <th className="py-3 px-4">FULFILLMENT</th>
                <th className="py-3 px-4">PRINTIFY ID</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aerospace-800/60 text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    NO ORDERS RECORDED MATCHING QUERY
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-aerospace-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-100 font-medium truncate max-w-xs">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          order.fulfillmentStatus === 'SUBMISSION_FAILED'
                            ? 'bg-red-950/80 text-red-400 border border-red-800'
                            : order.fulfillmentStatus === 'SHIPPED'
                            ? 'bg-cyan-950/80 text-avionics-cyan border border-cyan-800'
                            : 'bg-aerospace-800 text-slate-300'
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.printifyOrderId ? (
                        <span className="text-[10px] text-slate-300 font-bold">
                          {order.printifyOrderId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {/* Customer tracking link */}
                      <Link
                        href={`/order/${order.trackingToken}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-avionics-cyan inline-block"
                        title="View Public Tracking Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {/* Retry fulfillment button */}
                      {order.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleRetryOrder(order.id)}
                          disabled={actionLoading === order.id}
                          className="px-2.5 py-1 bg-aerospace-800 hover:bg-aerospace-700 text-[10px] text-avionics-cyan rounded border border-aerospace-700 transition"
                          title="Retry Printify submission"
                        >
                          {actionLoading === order.id ? 'SUBMITTING...' : 'RETRY FULFILL'}
                        </button>
                      )}

                      {/* Reconcile button if printify order exists */}
                      {order.printifyOrderId && (
                        <button
                          onClick={() => handleReconcileOrder(order.id)}
                          disabled={actionLoading === `rec_${order.id}`}
                          className="px-2.5 py-1 bg-aerospace-800 hover:bg-aerospace-700 text-[10px] text-slate-300 rounded border border-aerospace-700 transition"
                          title="Reconcile status from Printify"
                        >
                          {actionLoading === `rec_${order.id}` ? 'CHECKING...' : 'RECONCILE'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent System Activity Log */}
      <div className="bg-aerospace-900 border border-aerospace-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-aerospace-800 pb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-avionics-cyan" />
          <span>REAL-TIME AUDIT TRAIL & SYSTEM ACTIVITY</span>
        </h3>

        <div className="space-y-2 text-xs font-mono">
          {activity.length === 0 ? (
            <p className="text-slate-500 py-4">No recent activity logs.</p>
          ) : (
            activity.map((act) => (
              <div
                key={act.id}
                className="p-2.5 bg-aerospace-950/60 border border-aerospace-800 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-bold text-avionics-cyan px-2 py-0.5 rounded bg-aerospace-900 border border-aerospace-800">
                    {act.actor}
                  </span>
                  <span className="font-bold text-slate-200">{act.action}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-md">{act.details}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(act.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
