'use client';
import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/context/app-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata cannot be exported from a client component.
// If you need to set metadata, you would typically do this in a server component
// that wraps your client-side layout. For this case, we'll comment it out
// to resolve the immediate build error. A better long-term solution would be
// to restructure the layout composition.

// export const metadata: Metadata = {
//   title: 'ImageRights AI',
//   description: 'AI-Powered Copyright Analysis for Images',
//   icons: {
//     icon: '/images/favicon.ico',
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProvider>
          <MainLayout>{children}</MainLayout>
        </AppProvider>
      </body>
    </html>
  );
}