'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Wallet,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  PlusCircle,
  CheckCircle2,
  X,
  IndianRupee,
} from 'lucide-react';
import { customersApi } from '@/lib/api';
import { Customer } from '@/lib/types';
import { MOCK_CUSTOMERS } from '@/lib/mockData';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(250);
  const [creditReason, setCreditReason] = useState('Apology promo credit for delay');
  const [creditSuccess, setCreditSuccess] = useState(false);
  const itemsPerPage = 8;

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll({ search: searchQuery.trim() || undefined });
      setCustomers(data);
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const totalPages = Math.ceil(customers.length / itemsPerPage) || 1;
  const displayedCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? { ...c, walletBalance: c.walletBalance + Number(creditAmount) }
          : c
      )
    );
    setCreditSuccess(true);
    setTimeout(() => {
      setCreditSuccess(false);
      setSelectedCustomer(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Registered Bangalore households, order frequencies, and Cookii Wallet ledger balances.
          </p>
        </div>
      </div>

      {/* Search and Metrics */}
      <div className="bg-white rounded-[22px] p-4 border border-emerald-900/5 shadow-sm space-y-4">
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
              placeholder="Search by customer name, phone, or area (e.g. Koramangala)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{displayedCustomers.length}</strong> of{' '}
            <strong>{customers.length}</strong> customers
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Phone & Locality</th>
                <th className="py-3.5 px-5 text-center">Bookings</th>
                <th className="py-3.5 px-5 text-right">Wallet Balance</th>
                <th className="py-3.5 px-5 text-right">Total Spent</th>
                <th className="py-3.5 px-5">Joined</th>
                <th className="py-3.5 px-5">Last Active</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-xs">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-900 text-sm">No customers found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Check your search query keywords.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-emerald-50/20 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#059669] font-bold text-xs flex items-center justify-center shrink-0">
                          {cust.avatar || cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{cust.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" /> {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-gray-900 text-xs">{cust.phone}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" /> {cust.locality}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="font-extrabold text-xs text-gray-900 px-2.5 py-1 rounded-full bg-gray-100">
                        {cust.bookingsCount}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-extrabold text-gray-900">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                          cust.walletBalance > 1000
                            ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                            : 'bg-gray-50 text-gray-800'
                        }`}
                      >
                        <Wallet className="w-3 h-3" />
                        ₹{cust.walletBalance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-xs text-gray-900">
                      ₹{cust.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-600 font-medium">
                      {cust.joinedDate}
                    </td>
                    <td className="py-4 px-5 text-xs text-emerald-700 font-medium">
                      {cust.lastActive}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-[#059669] hover:bg-emerald-50 transition-colors inline-flex items-center gap-1"
                        title="Add Wallet Promo Credit"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Credit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {customers.length > itemsPerPage && (
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

      {/* Add Wallet Credit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[22px] w-full max-w-md p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#059669]" />
                <span>Issue Wallet Promo Credit</span>
              </h4>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {creditSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto mb-2" />
                <p className="font-bold text-gray-900">₹{creditAmount} credited successfully!</p>
                <p className="text-xs text-gray-500 mt-1">
                  Updated wallet balance: ₹{selectedCustomer.walletBalance + Number(creditAmount)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddCredit} className="mt-4 space-y-4">
                <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-700">
                  Crediting user: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone})
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Credit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    required
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Reason / Audit Log Note
                  </label>
                  <input
                    type="text"
                    required
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-1.5"
                  >
                    <IndianRupee className="w-3.5 h-3.5" /> Credit Wallet
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
