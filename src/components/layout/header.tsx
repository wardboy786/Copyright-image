'use client';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/hooks/use-app-context';
import { MAX_FREE_SCANS } from '@/hooks/use-scans';
import { AnimatePresence, motion } from 'framer-motion';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'ImageRights AI';
  if (pathname.startsWith('/history')) return 'Scan History';
  if (pathname.startsWith('/scan')) return 'Scan Result';
  if (pathname.startsWith('/premium')) return 'Premium';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/about')) return 'About Us';
  if (pathname.startsWith('/contact')) return 'Contact Us';
  if (pathname.startsWith('/privacy')) return 'Privacy Policy';
  if (pathname.startsWith('/terms')) return 'Terms of Use';
  return 'ImageRights AI';
};

function DailyLimitCounter() {
    const { isInitialized, isPremium, todaysScanCount } = useAppContext();

    if (!isInitialized || isPremium) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ScanLine className="w-5 h-5"/>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={todaysScanCount}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {MAX_FREE_SCANS - todaysScanCount}
                </motion.span>
            </AnimatePresence>
             <span>/ {MAX_FREE_SCANS}</span>
        </div>
    )
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-md">
        <ShieldCheck className="w-6 h-6 text-primary"/>
        <span className="sr-only">ImageRights AI</span>
      </Link>

      <div className="flex-1 flex justify-center">
        {!isHomePage && <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>}
      </div>

      <div className="w-24 flex justify-end">
          {isHomePage && <DailyLimitCounter />}
      </div>
    </header>
  );
}
