'use client';
import { useCallback, useState, useEffect } from 'react';
import { isPlatform } from '@capacitor/core';
import { AdMob, BannerAdOptions, AdMobBannerSize, RewardItem, AdOptions } from '@capacitor-community/admob';
import { useToast } from './use-toast';

// Use test IDs for development. Replace with your real IDs in production.
const AD_UNITS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const initializeAndShowBanner = useCallback(async () => {
    if (!isPlatform('capacitor')) {
      return;
    }
     if (isInitialized) {
      return;
    }

    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
      });
      setIsInitialized(true);
      
      const bannerOptions: BannerAdOptions = {
        adId: AD_UNITS.BANNER,
        adSize: AdMobBannerSize.ADAPTIVE_BANNER,
        position: 'bottom',
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(bannerOptions);

    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }, [isInitialized]);

  useEffect(() => {
    initializeAndShowBanner();
  }, [initializeAndShowBanner]);


  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if (!isInitialized || !isPlatform('capacitor')) {
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

      const rewardListener = await AdMob.addListener('rewardedVideoUserDidEarnReward', (reward: RewardItem) => {
          console.log('Reward earned:', reward);
          resolve(true); // User earned the reward
      });

      const closeListener = await AdMob.addListener('rewardedVideoDidDismiss', () => {
          rewardListener.remove();
          closeListener.remove();
          // This will resolve as false if the reward listener hasn't already resolved it as true
          setTimeout(() => resolve(false), 100); 
      });

      try {
        await AdMob.prepareRewarded(options);
        await AdMob.showRewarded();
      } catch (e) {
        console.error('Error showing rewarded ad:', e);
        // Clean up listeners on failure
        rewardListener.remove();
        closeListener.remove();
        toast({
          title: 'Ad Failed to Load',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        resolve(false);
      }
    });
  }, [isInitialized, toast]);

  return { showRewarded, isInitialized };
}
