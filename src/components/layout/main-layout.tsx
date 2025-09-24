'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, History, Gem, Settings, Home } from 'lucide-react';
import { Header } from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SplashScreen } from './splash-screen';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scan', label: 'Scan', icon: Scan },
  { href: '/history', label: 'History', icon: History },
  { href: '/premium', label: 'Premium', icon: Gem },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const AdMobController = dynamic(
  () => import('@/components/layout/admob-controller').then((mod) => mod.AdMobController),
  { ssr: false }
);


function BottomNavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/90 backdrop-blur-sm border-t md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 group transition-colors',
              (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}


function AppContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { isInitialized: isAppContextInitialized } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);
  
  
  if (showSplash && !isAppContextInitialized) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && isAppContextInitialized && <SplashScreen onAnimationComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={cn('flex min-h-screen w-full bg-background', !isAppContextInitialized && 'opacity-0')}>
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-32 md:pb-8">
            {children}
          </main>
        </div>
        {isMobile && <BottomNavBar />}
        <Toaster />
        <AdMobController />
      </div>
    </>
  );
}


export function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppContent>{children}</AppContent>
    </ThemeProvider>
  );
}
