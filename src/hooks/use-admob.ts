'use client';
import { AdMob, AdMobRewardItem, RewardAdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize, RewardAdPluginEvents, InterstitialAdPluginEvents, AdOptions } from '@capacitor-community/admob';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

// This hook is designed to run on native platforms.
// It will not work in a web browser.
const useAdMob = () => {
  const initialize = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Skipped initialization (not a native platform).');
        return;
    }
    try {
      await AdMob.initialize({
        testingDevices: ['63ea8cfd-404a-433d-8614-54595bf28c84'],
        initializeForTesting: false,
      });
      console.log('AdMob: Initialized successfully on native platform.');
    } catch (error) {
      console.error('AdMob: Initialization failed on native platform:', error);
    }
  };

  const showBanner = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Skipped showing banner (not a native platform).');
        return;
    }
    try {
      const options: BannerAdOptions = {
        adId: 'ca-app-pub-8270549953677995/1980800386', // Production Banner Ad ID
        position: BannerAdPosition.BOTTOM_CENTER,
        // This margin lifts the ad by the height of the bottom nav bar (64px)
        margin: 64, 
        adSize: BannerAdSize.BANNER,
        isTesting: false,
      };
      await AdMob.showBanner(options);
      console.log('AdMob: Banner ad shown successfully.');
    } catch (error: any) {
      console.error('AdMob: Failed to show banner ad:', error);
    }
  };

  const showRewarded = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Skipped showing rewarded ad (not a native platform).');
        await Toast.show({
            text: 'Ads are only available in the mobile app.',
            duration: 'long'
        });
        return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      let rewardListener: any;
      let closeListener: any;
      let failListener: any;

      const cleanup = () => {
        if (rewardListener) rewardListener.remove();
        if (closeListener) closeListener.remove();
        if (failListener) failListener.remove();
      };

      rewardListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('AdMob: Reward earned:', reward);
        Toast.show({
          text: `Reward Earned! You got 1 extra scan.`,
          duration: 'long',
        });
        cleanup();
        resolve(true);
      });

      closeListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('AdMob: Rewarded ad closed');
        cleanup();
        resolve(false);
      });

      failListener = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: any) => {
        console.error('AdMob: Rewarded ad failed to load:', error);
        Toast.show({
          text: 'Ad Not Available. Please try again later.',
          duration: 'long',
        });
        cleanup();
        resolve(false);
      });

      const options: RewardAdOptions = {
        adId: 'ca-app-pub-8270549953677995/9887135558', // Production Rewarded Ad ID
        isTesting: false,
      };
      
      console.log('AdMob: Preparing rewarded ad...');
      AdMob.prepareRewardVideoAd(options)
      .then(() => {
        console.log('AdMob: Showing rewarded ad...');
        AdMob.showRewardVideoAd()
      })
      .catch((error: any) => {
        console.error('AdMob: Error preparing/showing rewarded ad:', error);
        cleanup();
        resolve(false);
      });
    });
  };

  const prepareInterstitial = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Skipped preparing interstitial ad (not a native platform).');
        return;
    }
    try {
        const options: AdOptions = {
            adId: 'ca-app-pub-8270549953677995/3986929859', // Production Interstitial Ad ID
            isTesting: false,
        };
        await AdMob.prepareInterstitial(options);
        console.log('AdMob: Interstitial ad prepared successfully.');
    } catch (error) {
        console.error('AdMob: Failed to prepare interstitial ad:', error);
    }
  };

  const showInterstitial = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
        console.log('AdMob: Skipped showing interstitial ad (not a native platform).');
        return;
    }
    try {
        await AdMob.showInterstitial();
        console.log('AdMob: Interstitial ad shown successfully.');
    } catch (error) {
        console.error('AdMob: Failed to show interstitial ad:', error);
    }
  };

  return {
    initialize,
    showBanner,
    showRewarded,
    prepareInterstitial,
    showInterstitial,
  };
};

export default useAdMob;
