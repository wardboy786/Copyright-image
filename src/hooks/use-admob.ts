'use client';
import { useEffect, useState, useCallback } from 'react';
import { isPlatform } from '@capacitor/core';
import { useToast } from './use-toast';
import type { 
  AdMob as AdMobType, 
  BannerAd as BannerAdType, 
  RewardedAd as RewardedAdType, 
  InterstitialAd as InterstitialAdType,
  AdMobBannerSize as AdMobBannerSizeType
} from '@capacitor-community/admob';

// Use test IDs for development. Replace with your real IDs in production.
const AD_UNITS = {
  // Your real App ID
  APP_ID: 'ca-app-pub-8270549953677995~3019098622',
  // Test Ad Unit IDs from Google
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

// Store dynamically imported modules in a state-like object
let admobModules: {
    AdMob: typeof AdMobType;
    BannerAd: typeof BannerAdType;
    RewardedAd: typeof RewardedAdType;
    InterstitialAd: typeof InterstitialAdType;
    AdMobBannerSize: typeof AdMobBannerSizeType;
} | null = null;

export function useAdmob() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const initialize = useCallback(async () => {
    if (!isPlatform('capacitor')) {
      return; // Don't run on web
    }

    if (isInitialized) {
        return; // Already initialized
    }

    try {
      // Dynamically import the module only on the client side
      const admob = await import('@capacitor-community/admob');
      admobModules = {
          AdMob: admob.AdMob,
          BannerAd: admob.BannerAd,
          RewardedAd: admob.RewardedAd,
          InterstitialAd: admob.InterstitialAd,
          AdMobBannerSize: admob.AdMobBannerSize,
      }

      await admobModules.AdMob.initialize({
        appId: AD_UNITS.APP_ID,
        // requestTrackingAuthorization: true, // Optional for iOS
      });
      
      setIsInitialized(true);
      // Pre-load ads after initialization
      await prepareInterstitial();
      await prepareRewarded();
    } catch (error) {
      console.error('AdMob initialization failed', error);
    }
  }, [isInitialized]);

  // --- Banner Ad ---
  const showBanner = useCallback(async () => {
    if (!isInitialized || !admobModules) return;
    try {
      const banner = new admobModules.BannerAd({
        adUnitId: AD_UNITS.BANNER,
        size: admobModules.AdMobBannerSize.ADAPTIVE_BANNER,
        position: 'bottom',
        margin: 0,
        isTesting: true, // Keep true during development
      });
      await banner.show();
    } catch (error) {
      console.error('Failed to show banner ad', error);
    }
  }, [isInitialized]);

  // --- Interstitial Ad ---
  const prepareInterstitial = useCallback(async () => {
    if (!isInitialized || !admobModules) return;
    try {
      const interstitial = new admobModules.InterstitialAd({
        adUnitId: AD_UNITS.INTERSTITIAL,
        isTesting: true,
      });
      await interstitial.load();
    } catch (error) {
      console.error('Failed to prepare interstitial ad', error);
    }
  }, [isInitialized]);

  const showInterstitial = useCallback(async () => {
    if (!isInitialized || !admobModules) return;
    try {
       const interstitial = new admobModules.InterstitialAd({
        adUnitId: AD_UNITS.INTERSTITIAL,
        isTesting: true,
      });
      await interstitial.load();
      await interstitial.show();
    } catch (error) {
      console.error('Failed to show interstitial ad', error);
    }
  }, [isInitialized]);


  // --- Rewarded Ad ---
  const prepareRewarded = useCallback(async () => {
    if (!isInitialized || !admobModules) return;
    try {
      const rewarded = new admobModules.RewardedAd({
        adUnitId: AD_UNITS.REWARDED,
        isTesting: true,
      });
      await rewarded.load();
    } catch (error) {
      console.error('Failed to prepare rewarded ad', error);
    }
  }, [isInitialized]);

  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise(async (resolve) => {
      if (!isInitialized || !admobModules) {
        toast({
          title: 'Ad Not Available',
          description: 'Ads are only available in the mobile app.',
          variant: 'destructive',
        });
        return resolve(false);
      }

      try {
        const rewarded = new admobModules.RewardedAd({
          adUnitId: AD_UNITS.REWARDED,
          isTesting: true,
        });

        // Event listener for the reward
        const rewardListener = await rewarded.addListener('rewarded', (reward) => {
            console.log('Reward earned:', reward);
            toast({
              title: 'Reward Granted!',
              description: `You've earned ${reward.amount} extra scan.`,
            });
            resolve(true); // User earned the reward
        });

        // Event listener for ad dismissal
        const dismissListener = await rewarded.addListener('dismissed', () => {
            console.log('Rewarded ad dismissed');
            rewardListener.remove(); // Clean up listeners
            dismissListener.remove();
            resolve(false); // Ad was closed without earning reward
        });

        await rewarded.load();
        await rewarded.show();

      } catch (error) {
        console.error('Failed to show rewarded ad', error);
        toast({
          title: 'Ad Failed to Load',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        resolve(false);
      }
    });
  }, [isInitialized, toast]);

  return { initialize, isInitialized, showBanner, showInterstitial, showRewarded };
}
