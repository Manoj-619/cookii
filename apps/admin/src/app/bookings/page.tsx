'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  ChefHat,
  IndianRupee,
  FileText,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { bookingsApi } from '@/lib/api';
import { Booking, BookingStatusType } from '@/lib/types';
import { MOCK_BOOKINGS } from '@/lib/mockData';

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getAll({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchQuery.trim() || undefined,
      });
      setBookings(data);
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filterStatus, searchQuery]);

  // Compute status counts
  const totalCount = MOCK_BOOKINGS.length;
  const upcomingCount = MOCK_BOOKINGS.filter((b) => b.status === 'UPCOMING').length;
  const inProgressCount = MOCK_BOOKINGS.filter((b) => b.status === 'IN_PROGRESS').length;
  const completedCount = MOCK_BOOKINGS.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = MOCK_BOOKINGS.filter((b) => b.status === 'CANCELLED').length;

  const tabs = [
    { id: 'ALL', label: 'All Bookings', count: totalCount },
    { id: 'UPCOMING', label: 'Upcoming', count: upcomingCount },
    { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
    { id: 'COMPLETED', label: 'Completed', count: completedCount },
    { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount },
  ];

  // Pagination calculation
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const displayedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (id: string, newStatus: BookingStatusType) => {
    const updated = await bookingsApi.updateStatus(id, newStatus);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (selectedBooking?.id === id) {
        setSelectedBooking(updated);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Bookings & Dispatch
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Manage live home cook requests, monitor active prep sessions, and resolve exceptions.
          </p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-[22px] p-4 border border-emerald-900/5 shadow-sm space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
          {tabs.map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterStatus(tab.id);
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

        {/* Search input */}
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
              placeholder="Search by Booking ID (BK-8901), customer, or cook..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{displayedBookings.length}</strong> of{' '}
            <strong>{bookings.length}</strong> bookings
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Cook</th>
                <th className="py-3.5 px-5">Date & Slot</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-gray-500">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-gray-900 text-sm">No bookings found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Try adjusting your search query or tab filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-emerald-50/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <td className="py-4 px-5 font-mono font-bold text-xs text-[#059669]">
                      {booking.id}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <p className="text-xs text-gray-500">{booking.customerPhone}</p>
                    </td>
                    <td className="py-4 px-5">
                      {booking.cookName ? (
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <span>🍳</span> {booking.cookName}
                          </p>
                          <p className="text-xs text-gray-500">{booking.cookPhone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                          Assigning cook...
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-gray-900 text-xs">{booking.date}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" /> {booking.timeSlot}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={booking.status} size="sm" />
                    </td>
                    <td className="py-4 px-5 text-right font-extrabold text-gray-900">
                      ₹{booking.amount.toLocaleString('en-IN')}
                    </td>
                    <td
                      className="py-4 px-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#059669] hover:bg-emerald-50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {bookings.length > itemsPerPage && (
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

      {/* Booking Details Modal Dialog */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[22px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-gray-900">
                    {selectedBooking.id}
                  </span>
                  <StatusBadge status={selectedBooking.status} size="sm" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Requested on {new Date(selectedBooking.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-5">
              {/* Service & Menu details */}
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {selectedBooking.serviceType.replace('_', ' ')} • {selectedBooking.pax} Guests
                  </span>
                  <h4 className="text-base font-bold text-gray-900 mt-0.5">
                    {selectedBooking.cuisine}
                  </h4>
                  {selectedBooking.notes && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      "{selectedBooking.notes}"
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Payable</span>
                  <span className="text-xl font-extrabold text-[#059669]">
                    ₹{selectedBooking.amount}
                  </span>
                </div>
              </div>

              {/* Customer & Cook Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer card */}
                <div className="p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Customer Information
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{selectedBooking.customerName}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.customerPhone}
                  </p>
                  <p className="text-xs text-gray-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedBooking.address}</span>
                  </p>
                </div>

                {/* Cook card */}
                <div className="p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <ChefHat className="w-3.5 h-3.5 text-[#059669]" /> Cook Information
                  </div>
                  {selectedBooking.cookName ? (
                    <>
                      <p className="font-bold text-gray-900 text-sm">{selectedBooking.cookName}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.cookPhone}
                      </p>
                      <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block font-semibold">
                        Bengaluru Verified Fleet
                      </p>
                    </>
                  ) : (
                    <div className="py-2 text-xs text-amber-600 font-medium">
                      No cook currently confirmed. Dispatch algorithm is scanning within 5km radius.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Status Modifiers */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Operations Dispatch Actions
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedBooking.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'COMPLETED')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}

                  {selectedBooking.status !== 'IN_PROGRESS' && selectedBooking.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'IN_PROGRESS')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors"
                    >
                      Set In Progress
                    </button>
                  )}

                  {selectedBooking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel & Process Refund
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
