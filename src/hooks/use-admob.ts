'use client';
import { useCallback, useState } from 'react';
import { isPlatform } from '@capacitor/core';
import { AdMob, AdOptions, BannerAdOptions, AdMobBannerSize, RewardItem } from '@capacitor-community/admob';
import { useToast } from './use-toast';

// Use test IDs for development. Replace with your real IDs in production.
const AD_UNITS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const initialize = useCallback(async () => {
    // Prevent re-initialization and ensure it runs only on Capacitor platforms
    if (isInitialized || !isPlatform('capacitor')) {
        return;
    }

    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
      });
      setIsInitialized(true);
      console.log('AdMob initialized successfully.');
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }, [isInitialized]);

  const showBanner = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
        const options: BannerAdOptions = {
            adId: AD_UNITS.BANNER,
            adSize: AdMobBannerSize.ADAPTIVE_BANNER,
            position: 'bottom',
            margin: 0,
            isTesting: true,
        };
        await AdMob.showBanner(options);
    } catch (error) {
        console.error('Failed to show banner ad:', error);
    }
  }, [isInitialized]);

  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if (!isInitialized) {
        toast({
          title: 'Ad Not Available',
          description: 'Ads can only be shown in the mobile app.',
          variant: 'destructive',
        });
        return resolve(false);
      }

      const options: AdOptions = {
        adId: AD_UNITS.REWARDED,
        isTesting: true,
      };

      try {
        const rewardListener = await AdMob.addListener('rewardedVideoUserDidEarnReward', (reward: RewardItem) => {
          console.log('Reward earned:', reward);
          resolve(true); // User earned the reward
        });
        
        const closeListener = await AdMob.addListener('rewardedVideoDidDismiss', () => {
            // This event can fire even after the reward is earned, so we must clean up listeners.
            rewardListener.remove();
            closeListener.remove();
            // If the promise hasn't been resolved by the reward event, it means the user closed the ad early.
            // We use a timeout to check this, as directly resolving here would conflict with the reward event.
            setTimeout(() => resolve(false), 100); 
        });

        await AdMob.prepareRewarded(options);
        await AdMob.showRewarded();
      } catch (e) {
        console.error('Error showing rewarded ad:', e);
        toast({
          title: 'Ad Failed to Load',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        resolve(false);
      }
    });
  }, [isInitialized, toast]);

  return { initialize, showBanner, showRewarded, isInitialized };
}
