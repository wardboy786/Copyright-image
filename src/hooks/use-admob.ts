'use client';
import { useCallback, useState } from 'react';
import { isPlatform } from '@capacitor/core';
import type { AdMobPlugin, BannerAdOptions, AdMobBannerSize, RewardedAdOptions, RewardItem } from '@capacitor-community/admob';

// Store dynamically imported modules in a state-like object
let adMobModules: {
  AdMob: AdMobPlugin;
} | null = null;

// Use test IDs for development. Replace with your real IDs in production.
const AD_UNITS = {
  // Test Ad Unit IDs from Google
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    if (!isPlatform('capacitor')) {
      console.log('Not running on a native platform. AdMob will not be initialized.');
      return;
    }

    if (isInitialized) {
      return;
    }

    try {
      // Dynamically import the module only on the client side
      const admob = await import('@capacitor-community/admob');
      adMobModules = {
        AdMob: admob.AdMob,
      };

      await adMobModules.AdMob.initialize({
        requestTrackingAuthorization: true,
      });

      setIsInitialized(true);
      console.log('AdMob initialized successfully.');
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }, [isInitialized]);

  const showBanner = useCallback(async () => {
    if (!isInitialized || !adMobModules) return;

    const options: BannerAdOptions = {
      adId: AD_UNITS.BANNER,
      adSize: 'ADAPTIVE_BANNER' as AdMobBannerSize,
      position: 'bottom',
      margin: 0,
      isTesting: true,
    };
    await adMobModules.AdMob.showBanner(options);
  }, [isInitialized]);

  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if (!isInitialized || !adMobModules) {
        console.error('AdMob is not initialized. Cannot show rewarded ad.');
        return resolve(false);
      }

      const options: RewardedAdOptions = {
        adId: AD_UNITS.REWARDED,
        isTesting: true,
      };

      try {
        const rewardListener = await adMobModules.AdMob.addListener('rewardedVideoUserDidEarnReward', (reward: RewardItem) => {
          console.log('Reward earned:', reward);
          resolve(true); // User earned the reward
          rewardListener.remove(); // Clean up listener
        });
        
        const closeListener = await adMobModules.AdMob.addListener('rewardedVideoDidDismiss', () => {
            resolve(false); // Ad dismissed without reward
            closeListener.remove();
        });

        await adMobModules.AdMob.prepareRewarded(options);
        await adMobModules.AdMob.showRewarded();
      } catch (e) {
        console.error('Error showing rewarded ad:', e);
        resolve(false);
      }
    });
  }, [isInitialized]);

  return { initialize, showBanner, showRewarded, isInitialized };
}
