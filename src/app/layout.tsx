'use client';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/context/app-provider';
import { PurchaseProvider } from '@/context/purchase-context';

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
        {/* The PurchaseProvider now wraps the AppProvider, ensuring purchase status is available everywhere */}
        <PurchaseProvider>
          <AppProvider>
            <MainLayout>{children}</MainLayout>
          </AppProvider>
        </PurchaseProvider>
      </body>
    </html>
  );
}
