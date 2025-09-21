'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, History, Gem, Settings } from 'lucide-react';
import { Header } from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/context/app-provider';

const menuItems = [
  { href: '/', label: 'Scan', icon: Scan },
  { href: '/history', label: 'History', icon: History },
  { href: '/premium', label: 'Premium', icon: Gem },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function BottomNavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/90 backdrop-blur-sm border-t border-border/50 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 group',
              (pathname === item.href || (item.href === '/' && pathname.startsWith('/scan'))) 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function DesktopHeader() {
    const pathname = usePathname();
    return (
        <header className="hidden md:flex items-center gap-8 border-b bg-background/90 backdrop-blur-sm px-6 h-16 sticky top-0 z-50">
             <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                Copyright Sentry
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground ml-auto">
                 {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'transition-colors hover:text-foreground',
                       (pathname === item.href || (item.href === '/' && pathname.startsWith('/scan'))) ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
        </header>
    )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <DesktopHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">{children}</main>
        {isMobile && <BottomNavBar />}
      </div>
    </AppProvider>
  );
}
