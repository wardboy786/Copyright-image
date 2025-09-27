
'use client';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/hooks/use-app-context';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

function DailyLimitCounter() {
    const { isInitialized, isPremium, todaysScanCount, totalAllowedScans } = useAppContext();

    if (!isInitialized || isPremium) {
        return null;
    }

    const scansLeft = totalAllowedScans - todaysScanCount;

    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Zap className="w-5 h-5"/>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={scansLeft}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {Math.max(0, scansLeft)}
                </motion.span>
            </AnimatePresence>
             <span>/ {totalAllowedScans}</span>
        </div>
    )
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-md">
        <Image src="/images/logo.svg" alt="Photorights AI Logo" width={32} height={32} className="w-8 h-8 text-primary dark:brightness-0 dark:invert"/>
        <span className="font-bold text-foreground">Photorights AI</span>
      </Link>

      <div className="flex-1 flex justify-center">
      </div>

      <div className="flex items-center justify-end w-24">
          {(pathname.startsWith('/scan')) && <DailyLimitCounter />}
      </div>
    </header>
  );
}
