'use client';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/hooks/use-app-context';
import { MAX_FREE_SCANS } from '@/hooks/use-scans';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

function DailyLimitCounter() {
    const { isInitialized, isPremium, todaysScanCount } = useAppContext();

    if (!isInitialized || isPremium) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Zap className="w-5 h-5"/>
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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-md">
        <Image src="/images/logo.svg" alt="ImageRights AI Logo" width={24} height={24} className="w-6 h-6 text-primary"/>
        <span className="font-bold hidden sm:inline-block">ImageRights AI</span>
      </Link>

      <div className="flex-1 flex justify-center">
      </div>

      <div className="flex items-center justify-end w-24">
          {(pathname.startsWith('/scan')) && <DailyLimitCounter />}
      </div>
    </header>
  );
}
