'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  Search,
  Filter,
  Star,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileCheck,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { cooksApi } from '@/lib/api';
import { Cook, CookVerificationStatusType } from '@/lib/types';
import { MOCK_COOKS } from '@/lib/mockData';

export default function CooksManagementPage() {
  const [cooks, setCooks] = useState<Cook[]>(MOCK_COOKS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadCooks = async () => {
    try {
      const data = await cooksApi.getAll({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setCooks(data);
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    loadCooks();
  }, [statusFilter, searchQuery]);

  // Status counts
  const totalCount = MOCK_COOKS.length;
  const verifiedCount = MOCK_COOKS.filter((c) => c.status === 'VERIFIED').length;
  const pendingCount = MOCK_COOKS.filter((c) => c.status === 'PENDING').length;
  const reviewCount = MOCK_COOKS.filter((c) => c.status === 'UNDER_REVIEW').length;
  const suspendedCount = MOCK_COOKS.filter((c) => c.status === 'SUSPENDED').length;

  const tabs = [
    { id: 'ALL', label: 'All Cooks', count: totalCount },
    { id: 'VERIFIED', label: 'Verified', count: verifiedCount },
    { id: 'PENDING', label: 'Pending Review', count: pendingCount },
    { id: 'UNDER_REVIEW', label: 'Under Review', count: reviewCount },
    { id: 'SUSPENDED', label: 'Suspended', count: suspendedCount },
  ];

  const totalPages = Math.ceil(cooks.length / itemsPerPage) || 1;
  const displayedCooks = cooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleQuickApprove = async (cookId: string) => {
    await cooksApi.updateStatus(cookId, 'VERIFIED');
    setCooks((prev) =>
      prev.map((c) => (c.id === cookId ? { ...c, status: 'VERIFIED' } : c))
    );
  };

  const handleQuickReject = async (cookId: string) => {
    await cooksApi.updateStatus(cookId, 'REJECTED');
    setCooks((prev) =>
      prev.map((c) => (c.id === cookId ? { ...c, status: 'REJECTED' } : c))
    );
  };

  const handleQuickSuspend = async (cookId: string) => {
    await cooksApi.suspendCook(cookId);
    setCooks((prev) =>
      prev.map((c) =>
        c.id === cookId ? { ...c, status: 'SUSPENDED', isOnline: false } : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Cook Fleet Management
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Monitor partner cooks, verify Aadhaar & police clearance documents, and manage platform permissions.
          </p>
        </div>

        {/* Quick Pending Counter Pill */}
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>{pendingCount} cook KYC applications require review</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[22px] p-4 border border-emerald-900/5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
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
              placeholder="Search by cook name, phone, or zone (e.g. HSR Layout)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{displayedCooks.length}</strong> of <strong>{cooks.length}</strong> cooks
          </div>
        </div>
      </div>

      {/* Cooks Table */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-5">Cook Name</th>
                <th className="py-3.5 px-5">Phone & Area</th>
                <th className="py-3.5 px-5">Verification Status</th>
                <th className="py-3.5 px-5">Rating</th>
                <th className="py-3.5 px-5 text-center">Total Jobs</th>
                <th className="py-3.5 px-5">Joined</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedCooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <ChefHat className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-900 text-sm">No cooks found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try resetting your filter or search keywords.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedCooks.map((cook) => (
                  <tr
                    key={cook.id}
                    className="hover:bg-emerald-50/20 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#059669] font-bold text-sm flex items-center justify-center shrink-0">
                          {cook.avatar || cook.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/cooks/${cook.id}`}
                            className="font-bold text-gray-900 hover:text-[#059669] hover:underline"
                          >
                            {cook.name}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <span>{cook.languages.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-gray-900 text-xs">{cook.phone}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" /> {cook.zone}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={cook.status} size="sm" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{cook.rating.toFixed(2)}</span>
                        <span className="text-gray-400 font-normal">({cook.reviewCount})</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center font-bold text-gray-900 text-xs">
                      {cook.totalJobs}
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-600 font-medium">
                      {cook.joinedDate}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View KYC link */}
                        <Link
                          href={`/cooks/${cook.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-[#059669] hover:border-emerald-300 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View KYC</span>
                        </Link>

                        {/* Quick Approve if pending or under review */}
                        {(cook.status === 'PENDING' || cook.status === 'UNDER_REVIEW') && (
                          <button
                            onClick={() => handleQuickApprove(cook.id)}
                            title="Approve Cook"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Quick Reject if pending */}
                        {cook.status === 'PENDING' && (
                          <button
                            onClick={() => handleQuickReject(cook.id)}
                            title="Reject Verification"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Suspend if verified */}
                        {cook.status === 'VERIFIED' && (
                          <button
                            onClick={() => handleQuickSuspend(cook.id)}
                            title="Suspend Cook"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {cooks.length > itemsPerPage && (
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
