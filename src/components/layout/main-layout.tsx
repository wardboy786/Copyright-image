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


function BottomNavBar({ adHeight }: { adHeight: number }) {
  const pathname = usePathname();
  return (
    <nav 
      className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/90 backdrop-blur-sm border-t md:hidden"
      // The ad will now have its own margin, so we don't need to adjust the nav bar
      // style={{ bottom: `${adHeight}px` }}
    >
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
  const { isPremium } = useAppContext();
  const [adHeight, setAdHeight] = useState(0);
  
  if (showSplash && !isAppContextInitialized) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  // The total padding at the bottom will be for the nav bar (64px) and the ad (50px standard banner)
  const mobilePaddingBottom = isPremium ? '80px' : '130px';

  return (
    <>
      <AnimatePresence>
        {showSplash && isAppContextInitialized && <SplashScreen onAnimationComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={cn('flex min-h-screen w-full bg-background', !isAppContextInitialized && 'opacity-0')}>
        <div className="flex flex-col flex-1">
          <Header />
          <main 
            className="flex-1 p-4 md:p-6 lg:p-8"
            style={{ paddingBottom: isMobile ? mobilePaddingBottom : '32px' }}
          >
            {children}
          </main>
        </div>
        {isMobile && <BottomNavBar adHeight={adHeight} />}
        <Toaster />
        {!isPremium && <AdMobController setAdHeight={setAdHeight} />}
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
