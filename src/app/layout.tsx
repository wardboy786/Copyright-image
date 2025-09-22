import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ImageRights AI',
  description: 'AI-Powered Copyright Analysis for Images',
  icons: {
    icon: '/images/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
