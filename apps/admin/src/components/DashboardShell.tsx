'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Menu, Bell, MapPin, Search } from 'lucide-react';
import { SendNotificationModal } from '@/components/SendNotificationModal';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // If on login page, render full screen without dashboard shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Get current page title
  const getPageTitle = () => {
    if (pathname.startsWith('/bookings')) return 'Bookings & Dispatch';
    if (pathname.startsWith('/cooks/')) return 'Cook Profile & Verification Dossier';
    if (pathname.startsWith('/cooks')) return 'Cook Fleet Management';
    if (pathname.startsWith('/customers')) return 'Customer Directory';
    if (pathname.startsWith('/payments')) return 'Payments & Settlements';
    if (pathname.startsWith('/coupons')) return 'Coupons & Campaign Promos';
    if (pathname.startsWith('/settings')) return 'Operations Settings';
    return 'Bengaluru Command Center';
  };

  return (
    <div className="flex h-screen bg-[#F6FAF7] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Operations Header */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 md:px-8 flex items-center justify-between shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Live City Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
              </span>
              <span>Bengaluru Live</span>
            </div>

            {/* Notification Trigger Button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              title="Broadcast Notification"
              className="p-2 rounded-xl text-gray-500 hover:text-[#059669] hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#059669]"></span>
            </button>

            {/* Ops Officer Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                PS
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">Priya Sharma</p>
                <p className="text-[10px] text-gray-500 font-medium">Ops Lead</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F6FAF7]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Broadcast Notification Modal */}
      <SendNotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default DashboardShell;
