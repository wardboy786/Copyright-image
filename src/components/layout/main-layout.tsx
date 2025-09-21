'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, History, Gem, Settings, ShieldCheck } from 'lucide-react';
import { Header } from './header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';

const menuItems = [
  { href: '/', label: 'Scan', icon: Scan },
  { href: '/history', label: 'History', icon: History },
  { href: '/premium', label: 'Premium', icon: Gem },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function BottomNavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/90 backdrop-blur-sm border-t md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 group transition-colors',
              (pathname === item.href || (item.href === '/' && pathname.startsWith('/scan'))) 
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

export function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full bg-background">
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">{children}</main>
        </div>
        {isMobile && <BottomNavBar />}
        <Toaster />
      </div>
    </AppProvider>
  );
}
