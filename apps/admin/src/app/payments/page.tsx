'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import StatsCard from '@/components/StatsCard';
import { paymentsApi } from '@/lib/api';
import { PaymentTransaction, PaymentType } from '@/lib/types';
import { MOCK_PAYMENTS } from '@/lib/mockData';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>(MOCK_PAYMENTS);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadPayments = async () => {
    try {
      const data = await paymentsApi.getAll({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setPayments(data);
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    loadPayments();
  }, [typeFilter, searchQuery]);

  const bookingPaymentsCount = MOCK_PAYMENTS.filter(
    (p) => p.type === 'BOOKING_PAYMENT'
  ).length;
  const walletTopupsCount = MOCK_PAYMENTS.filter(
    (p) => p.type === 'WALLET_TOPUP'
  ).length;
  const refundsCount = MOCK_PAYMENTS.filter((p) => p.type === 'REFUND').length;

  const tabs = [
    { id: 'ALL', label: 'All Transactions', count: MOCK_PAYMENTS.length },
    { id: 'BOOKING_PAYMENT', label: 'Booking Payments', count: bookingPaymentsCount },
    { id: 'WALLET_TOPUP', label: 'Wallet Topups', count: walletTopupsCount },
    { id: 'REFUND', label: 'Refunds', count: refundsCount },
  ];

  const totalPages = Math.ceil(payments.length / itemsPerPage) || 1;
  const displayedPayments = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Payments & Settlements
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Razorpay gateway transactions, UPI double-entry ledger, and cook payout disbursement.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Bengaluru transactions CSV...')}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-[#059669]" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Processed GMV"
          value="₹18,42,900"
          subtitle="All transactions via Razorpay"
          trend={{ value: 16.2, isPositive: true, label: 'this month' }}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="text-[#059669]"
        />

        <StatsCard
          title="Platform Take Rate"
          value="₹2,76,435"
          subtitle="15% net commission"
          trend={{ value: 14.5, isPositive: true, label: 'margin' }}
          icon={CreditCard}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Cook Fleet Payouts"
          value="₹15,66,465"
          subtitle="Direct bank settlements"
          trend={{ value: 98.4, isPositive: true, label: 'on-time payout' }}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-[#059669]"
        />

        <StatsCard
          title="Refund Rate"
          value="0.8%"
          subtitle="₹520 refunded this week"
          trend={{ value: 0.2, isPositive: false, label: 'lower is better' }}
          icon={RotateCcw}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Razorpay Integration Status Card */}
      <div className="bg-[#0D1117] rounded-[22px] p-5 md:p-6 border border-[#21262D] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
            RZP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm">
                Razorpay Payment Gateway Integration
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected • Live
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Account: <code className="text-gray-300">rzp_live_ZapEat_blr</code> • Webhook endpoints responding in 85ms • Automated T+1 settlements to cook bank accounts active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://dashboard.razorpay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Razorpay Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Filter and Transactions Table */}
      <div className="bg-white rounded-[22px] p-4 border border-emerald-900/5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
          {tabs.map((tab) => {
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTypeFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Transaction ID, Razorpay ID, or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{displayedPayments.length}</strong> of{' '}
            <strong>{payments.length}</strong> transactions
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-5">Transaction & Razorpay ID</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Type & Description</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
                <th className="py-3.5 px-5">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedPayments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-emerald-50/20 transition-colors group"
                >
                  <td className="py-4 px-5">
                    <p className="font-mono font-bold text-xs text-gray-900">{p.id}</p>
                    <p className="font-mono text-[11px] text-[#059669] mt-0.5">
                      {p.razorpayPaymentId}
                    </p>
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-semibold text-gray-900">{p.customerName}</p>
                    {p.bookingId && (
                      <p className="font-mono text-xs text-gray-500">{p.bookingId}</p>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        p.type === 'BOOKING_PAYMENT'
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.type === 'WALLET_TOPUP'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-purple-50 text-purple-800'
                      }`}
                    >
                      {p.type.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                  </td>
                  <td className="py-4 px-5 text-xs font-semibold text-gray-700">
                    <span className="px-2 py-1 rounded bg-gray-100">{p.method}</span>
                  </td>
                  <td className="py-4 px-5">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-4 px-5 text-right font-extrabold text-gray-900">
                    {p.type === 'REFUND' ? (
                      <span className="text-purple-700">-₹{p.amount}</span>
                    ) : (
                      <span>+₹{p.amount.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-xs text-gray-500 font-medium">
                    {new Date(p.createdAt).toLocaleDateString()}
                    <br />
                    <span className="text-[11px] text-gray-400">
                      {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {payments.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
