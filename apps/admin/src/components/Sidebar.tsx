'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  ChefHat,
  Users,
  CreditCard,
  Ticket,
  Settings,
  LogOut,
  MapPin,
  X,
} from 'lucide-react';
import { adminAuthApi } from '@/lib/api';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: CalendarCheck,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      name: 'Cooks',
      href: '/cooks',
      icon: ChefHat,
      badge: '2 Pending',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
    },
    {
      name: 'Coupons',
      href: '/coupons',
      icon: Ticket,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await adminAuthApi.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#0D1117] text-gray-200 h-full flex flex-col justify-between border-r border-[#21262D] select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="p-6 flex items-center justify-between border-b border-[#21262D]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3FA366] to-[#5BBF7F] flex items-center justify-center text-xl shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-wider">
                  ZAPEAT
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3FA366] text-white uppercase tracking-wider">
                  Ops
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#059669]" /> Bengaluru Metro HQ
              </p>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#161B22]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Status indicator */}
        <div className="mx-4 my-3 px-3 py-2 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
            </span>
            <span className="text-gray-300 font-medium text-[11px]">System Status</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400">All Healthy</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-md shadow-emerald-950/50 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-[#161B22]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Version */}
      <div className="p-4 border-t border-[#21262D] space-y-3">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#161B22] border border-[#30363D]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
              PS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Priya Sharma
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Senior Ops Lead
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#21262D] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-mono">
          <span>Zapeat Ops v1.2.4</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Prod
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
