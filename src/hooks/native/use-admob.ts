'use client';

import { isPlatform } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  RewardedAdOptions,
  AdMobRewarded,
} from '@capacitor-community/admob';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

// --- !!! IMPORTANT !!! ---
// This is the REAL implementation that will be used on native mobile devices.
// The `use-admob.web.ts` file provides an empty mock for web/server builds.
// ---

const AD_UNITS = {
  // Test Ad Unit IDs from Google. Replace with your own IDs for production.
  BANNER: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  REWARDED: {
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  },
};

export function useAdMob() {
  const { toast } = useToast();

  const initialize = useCallback(async () => {
    try {
      await AdMob.initialize({});
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }, []);

  const showBanner = useCallback(async () => {
    try {
      const options: BannerAdOptions = {
        adId: isPlatform('ios') ? AD_UNITS.BANNER.ios : AD_UNITS.BANNER.android,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true, // Use test ads during development
      };
      await AdMob.showBanner(options);
    } catch (e) {
      console.error('Banner ad failed', e);
    }
  }, []);

  const showRewarded = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const options: RewardedAdOptions = {
        adId: isPlatform('ios') ? AD_UNITS.REWARDED.ios : AD_UNITS.REWARDED.android,
        isTesting: true,
      };

      const rewardListener = AdMob.addListener('rewardedVideoUserDidEarnReward', (reward) => {
        console.log('AdMob reward earned:', reward);
        toast({ title: 'Reward Earned!', description: `You earned ${reward.amount} extra scan(s).` });
        resolve(true); // Resolve with true when reward is earned
      });

      const closeListener = AdMob.addListener('rewardedVideoDidDismiss', () => {
        rewardListener.remove();
        closeListener.remove();
        failListener.remove();
        resolve(false); // Resolve with false if ad is closed without reward
      });
      
      const failListener = AdMob.addListener('rewardedVideoDidFailToLoad', (error) => {
          console.error("Rewarded ad failed to load", error);
           toast({
              variant: 'destructive',
              title: 'Ad Not Available',
              description: 'Could not load an ad. Please try again later.',
            });
           rewardListener.remove();
           closeListener.remove();
           failListener.remove();
           resolve(false); // Resolve with false on failure
      });


      AdMob.prepareRewarded(options)
        .then(() => AdMob.showRewarded())
        .catch(e => {
            console.error("Error preparing/showing rewarded ad", e);
            resolve(false);
        });
    });
  }, [toast]);

  return { initialize, showBanner, showRewarded };
}

export default useAdMob;
