'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app-context';

// In a real app, this would be wired to an ad SDK.
// We simulate it for demonstration purposes.

const AD_DISPLAY_CHANCE = 0.3; // 30% chance to show an ad on navigation
const AD_DURATION = 2500; // 2.5 seconds

export function InterstitialAd() {
  const { isPremium } = useAppContext();
  const pathname = usePathname();
  const [showAd, setShowAd] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Don't show ad on the first load or for premium users
    if (isPremium) {
      return;
    }

    // On route change, decide if we should show an ad
    if (Math.random() < AD_DISPLAY_CHANCE) {
      setShowAd(true);
      setKey(prev => prev + 1); // Force re-render for animation
      const timer = setTimeout(() => {
        setShowAd(false);
      }, AD_DURATION);

      return () => clearTimeout(timer);
    }
  }, [pathname, isPremium]);

  return (
    <AnimatePresence>
      {showAd && (
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center"
        >
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-semibold text-lg">Loading Advertisement...</p>
            <p className="text-sm text-gray-400">Your content will resume shortly.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
