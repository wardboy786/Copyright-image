'use client';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/context/app-provider';
import { PurchaseProvider } from '@/context/purchase-context';
import { DebugOverlay } from '@/components/layout/debug-overlay';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PurchaseProvider>
          <AppProvider>
            <MainLayout>{children}</MainLayout>
            <DebugOverlay />
          </AppProvider>
        </PurchaseProvider>
      </body>
    </html>
  );
}
