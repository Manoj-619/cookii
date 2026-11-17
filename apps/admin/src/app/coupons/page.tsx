'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  CheckCircle2,
  Clock,
  IndianRupee,
  Percent,
  Calendar,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { CreateCouponModal } from '@/components/CreateCouponModal';
import { couponsApi } from '@/lib/api';
import { Coupon } from '@/lib/types';
import { MOCK_COUPONS } from '@/lib/mockData';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadCoupons = async () => {
    try {
      const data = await couponsApi.getAll();
      setCoupons(data);
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleToggle = async (id: string) => {
    const updated = await couponsApi.toggleActive(id);
    if (updated) {
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesUsed, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Coupons & Promotions
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Configure discount promo codes, manage Bengaluru launch campaigns, and monitor redemptions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-[22px] p-5 border border-emerald-900/5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
            <Ticket className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{activeCount} Live</div>
          <p className="text-xs text-[#059669] font-medium mt-1">Available in checkout</p>
        </div>

        <div className="bg-white rounded-[22px] p-5 border border-emerald-900/5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Redemptions</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {totalRedemptions.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">Across all promo codes</p>
        </div>

        <div className="bg-white rounded-[22px] p-5 border border-emerald-900/5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">GMV Attributed</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">₹14,20,500</div>
          <p className="text-xs text-emerald-700 font-medium mt-1">77% repeat customer rate</p>
        </div>
      </div>

      {/* Coupons List / Table */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Configured Coupons</h3>
          <span className="text-xs text-gray-500">
            {coupons.length} total codes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-5">Discount</th>
                <th className="py-3.5 px-5">Min Order & Cap</th>
                <th className="py-3.5 px-5">Usage Progress</th>
                <th className="py-3.5 px-5">Expiry Date</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Toggle Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => {
                const percentUsed = Math.min(
                  Math.round((coupon.timesUsed / coupon.usageLimit) * 100),
                  100
                );

                return (
                  <tr
                    key={coupon.id}
                    className="hover:bg-emerald-50/20 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-gray-900 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          title="Copy Code"
                          className="p-1 rounded text-gray-400 hover:text-gray-700"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        {coupon.description}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      {coupon.discountPercent ? (
                        <span className="font-extrabold text-sm text-[#059669]">
                          {coupon.discountPercent}% Off
                        </span>
                      ) : (
                        <span className="font-extrabold text-sm text-[#059669]">
                          ₹{coupon.discountFlat} Flat Off
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-700">
                      <p>
                        Min: <strong>₹{coupon.minOrderValue}</strong>
                      </p>
                      {coupon.maxDiscount && (
                        <p className="text-gray-500">
                          Cap: <strong>₹{coupon.maxDiscount}</strong>
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span className="font-bold">{coupon.timesUsed}</span>
                          <span className="text-gray-400">/ {coupon.usageLimit}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${percentUsed}%` }}
                            className={`h-full rounded-full ${
                              percentUsed > 80 ? 'bg-amber-500' : 'bg-[#059669]'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-600 font-medium">
                      {coupon.expiryDate}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          coupon.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            coupon.isActive ? 'bg-[#059669]' : 'bg-gray-400'
                          }`}
                        />
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {/* Interactive iOS style toggle switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(coupon.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          coupon.isActive ? 'bg-[#059669]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            coupon.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreateCouponModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCouponCreated={() => loadCoupons()}
      />
    </div>
  );
}
