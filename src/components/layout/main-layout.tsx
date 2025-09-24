'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, History, Gem, Settings, Home, Loader2 } from 'lucide-react';
import { Header } from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SplashScreen } from './splash-screen';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';

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

function GlobalScanIndicator() {
  const { isScanning, scanProgress } = useAppContext();
  const isMobile = useIsMobile();
  
  // The ad banner is 50px tall. The bottom nav bar is 64px tall.
  // The indicator should sit on top of the nav bar, or on top of the ad if it's present.
  const adHeight = 50; 
  const navHeight = 64;
  const bottomOffset = isMobile ? `${navHeight}px` : '16px';


  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 pointer-events-none"
          style={{
            bottom: isMobile ? bottomOffset : '0px',
            paddingBottom: isMobile ? '0' : '1rem',
          }}
        >
          <div className="max-w-2xl mx-auto p-3 bg-primary/20 backdrop-blur-sm rounded-lg border border-primary/30 pointer-events-auto">
             <div className="flex items-center gap-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-foreground">Analysis in progress...</p>
                    <Progress value={scanProgress} className="h-2 mt-1"/>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function BottomNavBar() {
  const pathname = usePathname();
  const { isPremium } = useAppContext();
  
  // Total height of the ad banner (50px) + the nav bar itself (64px) = 114px.
  // This padding prevents content from being hidden behind the ad and nav bar.
  // When premium, the ad is gone, so we only need to account for the nav bar.
  const navPadding = isPremium ? '64px' : '114px';

  return (
    <nav 
      className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/90 backdrop-blur-sm border-t md:hidden"
      style={{
        paddingBottom: `env(safe-area-inset-bottom)`,
        // The ad banner has a margin of 64px, so we don't need to offset the nav bar itself.
      }}
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
  const { isInitialized: isAppContextInitialized, isPremium, isScanning } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);
  
  if (showSplash && !isAppContextInitialized) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }
  
  // The total padding needed at the bottom of the main content area.
  // For non-premium users, this is ad height (50px) + nav bar height (64px) = 114px.
  // For premium users, it's just the nav bar height (64px).
  // If a scan is in progress, we add more padding to not obscure content.
  let mobilePaddingBottom = !isPremium ? `114px` : `64px`;
  if (isScanning) {
    mobilePaddingBottom = `calc(${mobilePaddingBottom} + 70px)`; // Add space for the indicator
  }


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
        {isMobile && <BottomNavBar />}
        <GlobalScanIndicator />
        <Toaster />
        {!isPremium && <AdMobController />}
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
