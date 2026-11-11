import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cookii Operations — Bengaluru Command Center',
  description: 'Operations dispatch, cook verification queue, and live tracking map for Cookii Bengaluru.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAF7F2] text-[#1E1B18]">
        {children}
      </body>
    </html>
  );
}

