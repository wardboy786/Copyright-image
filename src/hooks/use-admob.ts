'use client';
import { useEffect, useState, useCallback } from 'react';
import { isPlatform } from '@capacitor/core';
import { useToast } from './use-toast';
import { 
  AdMob, 
  BannerAdOptions, 
  BannerAdSize, 
  InterstitialAdOptions,
  RewardedAdOptions,
  BannerAdPosition,
  AdMobError
} from '@capacitor-community/admob';

// Use test IDs for development. Replace with your real IDs in production.
const AD_UNITS = {
  // Test Ad Unit IDs from Google
  BANNER: isPlatform('ios') ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-3940256099942544/6300978111',
  REWARDED: isPlatform('ios') ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-3940256099942544/5224354917',
};

// Singleton hook state to prevent multiple initializations
let isAdMobInitialized = false;

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(isAdMobInitialized);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only once to initialize AdMob on native platforms.
    if (!isAdMobInitialized && isPlatform('capacitor')) {
      const initializeAdMob = async () => {
        try {
          await AdMob.initialize({});
          isAdMobInitialized = true;
          setIsInitialized(true);
          console.log('AdMob Initialized');
          // Show banner after initialization
          await showBanner();
        } catch (e) {
          console.error('AdMob initialization failed', e);
        }
      };

      initializeAdMob();
    }
  }, []); // Empty dependency array ensures this runs only once

  const showBanner = useCallback(async () => {
    try {
      const options: BannerAdOptions = {
        adId: AD_UNITS.BANNER,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true, // Keep true during development
      };
      await AdMob.showBanner(options);
      console.log('Banner ad shown');
    } catch (e) {
      console.error('Failed to show banner ad', e);
    }
  }, []);

  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if (!isInitialized) {
        toast({
          title: 'Ad Not Available',
          description: 'Ads are only available in the mobile app.',
          variant: 'destructive',
        });
        return resolve(false);
      }

      try {
        const options: RewardedAdOptions = {
          adId: AD_UNITS.REWARDED,
          isTesting: true,
        };

        const rewardListener = AdMob.addListener('onRewarded', (reward) => {
          console.log('Reward earned:', reward);
          toast({
            title: 'Reward Granted!',
            description: `You've earned ${reward.amount} extra scan.`,
          });
          rewardListener.remove();
          resolve(true); // User earned the reward
        });

        await AdMob.prepareRewarded(options);
        await AdMob.showRewarded();
      } catch (e) {
        const error = e as AdMobError;
        console.error('Failed to show rewarded ad', error);

        // Handle common errors
        if (error.code === 2) { // Ad not ready
           toast({
            title: 'Ad Not Ready',
            description: 'The ad is still loading. Please try again in a moment.',
            variant: 'destructive',
          });
        } else {
           toast({
            title: 'Ad Failed to Load',
            description: 'Please try again later.',
            variant: 'destructive',
          });
        }
        resolve(false);
      }
    });
  }, [isInitialized, toast]);

  return { isInitialized, showRewarded };
}