'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, History, Gem, Settings, Home } from 'lucide-react';
import { Header } from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AdBanner } from '../copyright-sentry/ad-banner';
import { SplashScreen } from './splash-screen';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { AdMobService } from '@/services/admob';
import { InterstitialAd } from '../copyright-sentry/interstitial-ad';


const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scan', label: 'Scan', icon: Scan },
  { href: '/history', label: 'History', icon: History },
  { href: '/premium', label: 'Premium', icon: Gem },
  { href: '/settings', label: 'Settings', icon: Settings },
];

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
  const { isInitialized } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize AdMob service once the app is ready and on the client
    if (typeof window !== 'undefined') {
        AdMobService.initialize().catch(err => {
            console.error("Failed to initialize AdMob Service:", err);
        });
    }
  }, []);

  if (showSplash && !isInitialized) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && isInitialized && <SplashScreen onAnimationComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={cn('flex min-h-screen w-full bg-background', !isInitialized && 'opacity-0')}>
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-32 md:pb-8">
            <InterstitialAd />
            {children}
          </main>
          {isMobile && (
              <div className="fixed bottom-16 left-0 w-full z-40">
                  <AdBanner />
              </div>
          )}
        </div>
        {isMobile && <BottomNavBar />}
        <Toaster />
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
