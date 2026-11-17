'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ChefHat,
  IndianRupee,
  Activity,
  Bell,
  Ticket,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { SendNotificationModal } from '@/components/SendNotificationModal';
import { CreateCouponModal } from '@/components/CreateCouponModal';
import { opsApi, bookingsApi } from '@/lib/api';
import { Booking, DashboardMetrics } from '@/lib/types';
import { MOCK_DASHBOARD_METRICS, MOCK_BOOKINGS } from '@/lib/mockData';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(MOCK_DASHBOARD_METRICS);
  const [recentBookings, setRecentBookings] = useState<Booking[]>(MOCK_BOOKINGS.slice(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [activeBar, setActiveBar] = useState<number | null>(6); // Default Sunday/today
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, b] = await Promise.all([
        opsApi.getMetrics(),
        bookingsApi.getAll(),
      ]);
      setMetrics(m);
      setRecentBookings(b.slice(0, 10));
    } catch {
      // Keep mock fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxRevenue = Math.max(...metrics.revenueChart.map((d) => d.revenue), 100000);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117] rounded-[22px] p-6 md:p-8 text-white border border-[#21262D] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time Bengaluru Operations Dispatch</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Command Center Overview
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Live monitoring across Koramangala, Indiranagar, HSR Layout, Whitefield & Bellandur.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>Send Notification</span>
          </button>

          <button
            onClick={() => setIsCouponOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>Create Coupon</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Metrics"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Bookings"
          value={metrics.totalBookings.toLocaleString('en-IN')}
          subtitle="All-time orders"
          trend={{
            value: metrics.totalBookingsTrend,
            isPositive: true,
            label: 'vs last week',
          }}
          icon={CalendarCheck}
          iconBg="bg-emerald-50"
          iconColor="text-[#059669]"
        />

        <StatsCard
          title="Active Right Now"
          value={metrics.activeNow}
          subtitle="In-progress & en route"
          trend={{
            value: 4,
            isPositive: true,
            label: 'more than usual',
          }}
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Today's Revenue"
          value={`₹${metrics.todayRevenue.toLocaleString('en-IN')}`}
          subtitle="Gross Merchandise Value"
          trend={{
            value: metrics.todayRevenueTrend,
            isPositive: true,
            label: 'vs yesterday',
          }}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="text-[#059669]"
        />

        <StatsCard
          title="Cooks Online"
          value={`${metrics.cooksOnline} / ${metrics.cooksTotal}`}
          subtitle="Fleet active in Bengaluru"
          trend={{
            value: 8.5,
            isPositive: true,
            label: 'availability rate',
          }}
          icon={ChefHat}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Grid: 7-Day Revenue Trend + Zone Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bars Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">7-Day Revenue Trend</h3>
              <p className="text-xs text-gray-500">Gross order revenue across Bengaluru zones</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                Mon - Sun
              </span>
            </div>
          </div>

          {/* Interactive CSS Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-gray-100">
            {metrics.revenueChart.map((point, idx) => {
              const heightPercent = Math.round((point.revenue / maxRevenue) * 100);
              const isSelected = activeBar === idx;

              return (
                <div
                  key={point.day}
                  onMouseEnter={() => setActiveBar(idx)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip on Hover / Active */}
                  <div
                    className={`text-[10px] font-bold text-gray-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mb-2 transition-all duration-150 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100'
                    }`}
                  >
                    ₹{(point.revenue / 1000).toFixed(1)}k
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[42px] bg-gray-100 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#047857] to-[#059669] shadow-md shadow-emerald-700/20'
                          : 'bg-emerald-600/70 group-hover:bg-[#059669]'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 text-xs font-semibold transition-colors ${
                      isSelected ? 'text-[#059669]' : 'text-gray-500'
                    }`}
                  >
                    {point.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart footer stats */}
          <div className="mt-4 pt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> Daily booking GMV
            </span>
            <span>
              Peak: <strong>₹98,600</strong> (Saturday)
            </span>
          </div>
        </div>

        {/* Bengaluru Zone Performance Breakdown (1 Column) */}
        <div className="bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Zone Dispatch Live</h3>
                <p className="text-xs text-gray-500">Fleet density & active requests</p>
              </div>
              <MapPin className="w-4 h-4 text-[#059669]" />
            </div>

            <div className="space-y-3.5">
              {metrics.zoneBreakdown.map((zone) => (
                <div
                  key={zone.zone}
                  className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-emerald-50/40 hover:border-emerald-200/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900 mb-1">
                    <span>{zone.zone}</span>
                    <span className="text-[#059669]">₹{zone.todayGmv.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>{zone.activeCooks} cooks online</span>
                    <span className="font-semibold text-blue-600">
                      {zone.liveBookings} live jobs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#059669]">
            <Link href="/cooks" className="hover:underline flex items-center gap-1">
              <span>View Cook Allocation Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table (Last 10) */}
      <div className="bg-white rounded-[22px] border border-emerald-900/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Bookings Dispatch</h3>
            <p className="text-xs text-gray-500">Real-time Bengaluru customer requests and cook allocations</p>
          </div>
          <Link
            href="/bookings"
            className="text-xs font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 transition-colors"
          >
            <span>View All Bookings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3 px-5">Booking ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Assigned Cook</th>
                <th className="py-3 px-5">Meal & Locality</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-emerald-50/20 transition-colors group"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-xs text-gray-900">
                    {b.id}
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-gray-900">{b.customerName}</p>
                    <p className="text-xs text-gray-500">{b.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-5">
                    {b.cookName ? (
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>🍳</span> {b.cookName}
                        </p>
                        <p className="text-xs text-gray-500">{b.cookPhone}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                        Searching...
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-medium text-gray-900">{b.cuisine}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" /> {b.locality}
                    </p>
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-gray-900">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href={`/bookings?id=${b.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#059669] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SendNotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <CreateCouponModal
        isOpen={isCouponOpen}
        onClose={() => setIsCouponOpen(false)}
        onCouponCreated={() => loadData()}
      />
    </div>
  );
}
