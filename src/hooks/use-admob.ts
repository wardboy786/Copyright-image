'use client';
import { Capacitor } from '@capacitor/core';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  RewardedAdOptions,
  AdMobError,
} from '@capacitor-community/admob';

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

const useAdMob = () => {
  const { toast } = useToast();

  const initialize = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('AdMob: Not running on a native platform.');
      return false;
    }
    try {
      await AdMob.initialize({});
      return true;
    } catch (e) {
      console.error('AdMob initialization failed', e);
      return false;
    }
  }, []);

  const showBanner = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const options: BannerAdOptions = {
        adId: Capacitor.isPlatform('android') ? AD_UNITS.BANNER.android : AD_UNITS.BANNER.ios,
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
    if (!Capacitor.isNativePlatform()) {
      toast({
        variant: 'destructive',
        title: 'Not on Mobile',
        description: 'Ads are only available on the mobile app.',
      });
      return false;
    }

    return new Promise((resolve) => {
      const options: RewardedAdOptions = {
        adId: Capacitor.isPlatform('android') ? AD_UNITS.REWARDED.android : AD_UNITS.REWARDED.ios,
        isTesting: true,
      };

      const rewardListener = AdMob.addListener('rewardedVideoUserDidEarnReward', (reward) => {
        console.log('AdMob reward earned:', reward);
        toast({ title: 'Reward Earned!', description: `You earned ${reward.amount} extra scan.` });
        resolve(true);
      });

      const closeListener = AdMob.addListener('rewardedVideoDidDismiss', () => {
        rewardListener.remove();
        closeListener.remove();
        failListener.remove();
        resolve(false);
      });
      
      const failListener = AdMob.addListener('rewardedVideoDidFailToLoad', (error: AdMobError) => {
        console.error('Rewarded ad failed to load', error);
        toast({
          variant: 'destructive',
          title: 'Ad Not Available',
          description: 'Could not load an ad. Please try again later.',
        });
        rewardListener.remove();
        closeListener.remove();
        failListener.remove();
        resolve(false);
      });

      AdMob.prepareRewarded(options)
        .then(() => AdMob.showRewarded())
        .catch(e => {
          console.error('Error preparing/showing rewarded ad', e);
          resolve(false);
        });
    });
  }, [toast]);

  return { initialize, showBanner, showRewarded };
};

export default useAdMob;
