import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DashboardShell from '@/components/DashboardShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zapeat Ops — Admin Dashboard',
  description: 'Operations dispatch, cook verification queue, live bookings, and fleet tracking for Zapeat Bengaluru.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-[#F6FAF7] text-gray-900 font-sans selection:bg-emerald-500 selection:text-white">
        <DashboardShell>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
