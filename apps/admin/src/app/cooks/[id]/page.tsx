'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChefHat,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileText,
  IndianRupee,
  Calendar,
  ExternalLink,
  Award,
  Clock,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { cooksApi } from '@/lib/api';
import { Cook, CookDocument, Booking } from '@/lib/types';
import { MOCK_COOKS, MOCK_BOOKINGS } from '@/lib/mockData';

export default function CookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cookId = params.id as string;

  const [cook, setCook] = useState<Cook | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadCook = async () => {
    setLoading(true);
    const data = await cooksApi.getById(cookId);
    if (data) {
      setCook(data);
    } else {
      // Fallback
      const fallback = MOCK_COOKS.find((c) => c.id === cookId);
      if (fallback) {
        setCook({
          ...fallback,
          recentBookings: MOCK_BOOKINGS.filter((b) => b.cookId === cookId),
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCook();
  }, [cookId]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleApproveDocument = async (docId: string) => {
    await cooksApi.verifyDocument(cookId, docId, 'APPROVED');
    showNotification('Document approved successfully');
    loadCook();
  };

  const handleRejectDocument = async (docId: string) => {
    if (!rejectionReason.trim()) return;
    await cooksApi.verifyDocument(cookId, docId, 'REJECTED', rejectionReason);
    setRejectingDocId(null);
    setRejectionReason('');
    showNotification('Document rejected with feedback');
    loadCook();
  };

  const handleApproveAllKYC = async () => {
    const updated = await cooksApi.approveAllKYC(cookId);
    if (updated) {
      setCook(updated);
      showNotification('All KYC documents approved. Cook is now VERIFIED!');
    }
  };

  const handleSuspendCook = async () => {
    if (confirm('Are you sure you want to suspend this cook? Active dispatches will be reassigned.')) {
      const updated = await cooksApi.suspendCook(cookId);
      if (updated) {
        setCook(updated);
        showNotification('Cook has been SUSPENDED from platform');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-600">Loading cook dossier...</p>
      </div>
    );
  }

  if (!cook) {
    return (
      <div className="bg-white rounded-[22px] p-12 text-center border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Cook Profile Not Found</h3>
        <p className="text-xs text-gray-500 mt-1">
          No cook was found with ID: <code>{cookId}</code>
        </p>
        <Link
          href="/cooks"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Cooks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-emerald-900 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Breadcrumb Navigation & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/cooks"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cook Management</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {cook.status !== 'VERIFIED' && (
            <button
              onClick={handleApproveAllKYC}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve All KYC</span>
            </button>
          )}

          {cook.status !== 'SUSPENDED' ? (
            <button
              onClick={handleSuspendCook}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Suspend Cook</span>
            </button>
          ) : (
            <button
              onClick={handleApproveAllKYC}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reinstate Partner</span>
            </button>
          )}
        </div>
      </div>

      {/* Cook Profile Card */}
      <div className="bg-white rounded-[22px] p-6 md:p-8 border border-emerald-900/5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start md:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#059669] text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/20">
              {cook.avatar || cook.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                  {cook.name}
                </h2>
                <StatusBadge status={cook.status} size="md" />
                {cook.isOnline && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#059669]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {cook.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {cook.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#059669]" /> {cook.zone}, Bengaluru
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Rating</span>
              <div className="flex items-center gap-1 font-extrabold text-lg text-gray-900">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{cook.rating.toFixed(2)}</span>
                <span className="text-xs text-gray-400 font-normal">({cook.reviewCount})</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Jobs Done</span>
              <span className="font-extrabold text-lg text-gray-900">{cook.totalJobs}</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Experience</span>
              <span className="font-extrabold text-lg text-gray-900">{cook.experienceYears} yrs</span>
            </div>
          </div>
        </div>

        {/* Cook Cuisines & Languages Tags */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Specialized Cuisines
            </span>
            <div className="flex flex-wrap gap-2">
              {cook.cuisines.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-lg bg-emerald-50 text-[#059669] font-semibold border border-emerald-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Spoken Languages
            </span>
            <div className="flex flex-wrap gap-2">
              {cook.languages.map((l) => (
                <span
                  key={l}
                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-medium"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: KYC Verification Documents (2 cols) + Earnings Summary (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KYC Document Verification Dossier (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#059669]" />
                <span>KYC & Background Verification Documents</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review legal certificates, criminal check certificates, and food safety credentials
              </p>
            </div>
          </div>

          {/* Document list */}
          <div className="space-y-4">
            {cook.documents && cook.documents.length > 0 ? (
              cook.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shrink-0 shadow-xs">
                      <FileText className="w-5 h-5 text-[#059669]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900">{doc.title}</h4>
                        <StatusBadge status={doc.status} size="sm" />
                      </div>
                      {doc.documentNumber && (
                        <p className="text-xs font-mono text-gray-500 mt-0.5">
                          ID: {doc.documentNumber}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      {doc.rejectionReason && (
                        <p className="text-xs text-rose-600 mt-1 font-medium bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                          Rejection Reason: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Document */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </a>

                    {doc.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleApproveDocument(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {doc.status !== 'REJECTED' && (
                      <button
                        onClick={() => setRejectingDocId(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                No KYC documents uploaded yet by this cook.
              </div>
            )}
          </div>
        </div>

        {/* Earnings Summary Card (1 column) */}
        <div className="bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#059669]" />
              <span>Earnings & Payout Ledger</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Cook wallet balance and direct bank settlement</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Lifetime Earnings
              </span>
              <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
                ₹{cook.earnings.total.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  This Month
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  ₹{cook.earnings.thisMonth.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Pending Payout
                </span>
                <span className="text-lg font-bold text-amber-900 mt-0.5 block">
                  ₹{cook.earnings.pendingPayout.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Bank details */}
            <div className="p-4 rounded-xl border border-gray-200 space-y-1.5 text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider block text-[10px]">
                Registered Bank Account
              </span>
              <p className="font-bold text-gray-900">{cook.earnings.bankName}</p>
              <p className="text-gray-500 font-mono">
                A/C No: •••••••• {cook.earnings.accountNumberLast4}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Route Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking History Table */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Recent Service History</h3>
          <p className="text-xs text-gray-500">Bookings cooked by this partner across Bengaluru</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3 px-5">Booking ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Meal & Locality</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cook.recentBookings && cook.recentBookings.length > 0 ? (
                cook.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-emerald-50/20">
                    <td className="py-3.5 px-5 font-mono font-bold text-xs text-gray-900">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-gray-900">
                      {b.customerName}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-gray-900 text-xs">{b.cuisine}</p>
                      <p className="text-xs text-gray-500">{b.locality}</p>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">
                      {b.date} • {b.timeSlot}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-gray-900">
                      ₹{Math.round(b.amount * 0.85)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                    No recent booking history found for this cook.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Document Modal Dialog */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[22px] w-full max-w-md p-6 shadow-2xl border border-gray-100">
            <h4 className="text-base font-bold text-gray-900 mb-1">Reject Document</h4>
            <p className="text-xs text-gray-500 mb-4">
              Specify the reason why this document did not meet verification criteria. The cook will receive this feedback via SMS and app notification.
            </p>

            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document photo is blurry / Expired certificate / Name mismatch on Aadhaar..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectingDocId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectDocument(rejectingDocId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
