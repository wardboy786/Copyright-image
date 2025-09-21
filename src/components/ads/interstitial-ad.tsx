'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-context';
import { AdMobService } from '@/services/admob';


// In a real app, this would be wired to an ad SDK.
// We simulate the logic for when to show an ad.

const AD_DISPLAY_CHANCE = 0.3; // 30% chance to show an ad on navigation

export function InterstitialAd() {
  const { isPremium } = useAppContext();
  const pathname = usePathname();

  useEffect(() => {
    // Don't show ad on the first load or for premium users
    if (isPremium) {
      return;
    }

    // On route change, decide if we should show an ad
    if (Math.random() < AD_DISPLAY_CHANCE) {
      AdMobService.getInstance().showInterstitialAd().catch(err => {
        console.error("Error showing interstitial ad:", err);
      });
    }
  }, [pathname, isPremium]);

  // This component does not render any UI itself.
  // The ad SDK (like AdMob) would handle the ad overlay.
  return null;
}
