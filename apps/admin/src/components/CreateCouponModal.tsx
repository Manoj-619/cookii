'use client';

import React, { useState } from 'react';
import { X, Ticket, CheckCircle2, IndianRupee, Percent } from 'lucide-react';
import { couponsApi } from '@/lib/api';
import { Coupon } from '@/lib/types';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponCreated?: (coupon: Coupon) => void;
}

export function CreateCouponModal({
  isOpen,
  onClose,
  onCouponCreated,
}: CreateCouponModalProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderValue, setMinOrderValue] = useState<number>(400);
  const [maxDiscount, setMaxDiscount] = useState<number>(150);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(1000);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    const newCoupon = await couponsApi.create({
      code: code.toUpperCase().trim(),
      discountPercent: discountType === 'PERCENT' ? Number(discountValue) : undefined,
      discountFlat: discountType === 'FLAT' ? Number(discountValue) : undefined,
      minOrderValue: Number(minOrderValue),
      maxDiscount: discountType === 'PERCENT' ? Number(maxDiscount) : undefined,
      expiryDate,
      usageLimit: Number(usageLimit),
      isActive: true,
      description:
        description ||
        `${discountType === 'PERCENT' ? `${discountValue}% off` : `₹${discountValue} flat discount`} for Bengaluru bookings`,
    });

    setIsSubmitting(false);
    setCreatedSuccess(true);
    if (onCouponCreated) {
      onCouponCreated(newCoupon);
    }

    setTimeout(() => {
      setCreatedSuccess(false);
      setCode('');
      setDescription('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[22px] w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Create Promo Coupon</h3>
              <p className="text-xs text-gray-500">Generate discount coupon for customer acquisition & retention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Coupon Active!</h4>
            <p className="text-sm text-gray-600 max-w-xs mt-1">
              Code <strong className="text-emerald-700">{code.toUpperCase()}</strong> is live in checkout.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Coupon Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BLRFEAST50"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENT')}
                    className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      discountType === 'PERCENT'
                        ? 'bg-[#059669] text-white border-[#059669]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" /> % Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FLAT')}
                    className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      discountType === 'FLAT'
                        ? 'bg-[#059669] text-white border-[#059669]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <IndianRupee className="w-3.5 h-3.5" /> Flat ₹
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  {discountType === 'PERCENT' ? 'Discount Percentage (%)' : 'Flat Discount (₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={discountType === 'PERCENT' ? 100 : 5000}
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Min Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900"
                />
              </div>

              {discountType === 'PERCENT' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900"
                />
              </div>

              {discountType === 'PERCENT' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description / Campaign Note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Weekend special offer for Koramangala & Indiranagar"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all"
              >
                <Ticket className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
