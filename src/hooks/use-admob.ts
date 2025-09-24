'use client';
import { AdMob, AdMobRewardItem } from '@capacitor-community/admob';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

// This hook is designed to run on native platforms.
// It will not work in a web browser.
const useAdMob = () => {
  const initialize = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Generic test device ID for simulators
        initializeForTesting: true,
      });
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  };

  const showBanner = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.showBanner({
        adId: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad ID
        position: 'BOTTOM_CENTER',
        margin: 0,
        adSize: 'BANNER',
      });
      console.log('Banner ad shown successfully');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  };

  const showRewarded = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
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

      rewardListener = AdMob.addListener('rewardedVideoDidEarnReward', (reward: AdMobRewardItem) => {
        console.log('Reward earned:', reward);
        Toast.show({
          text: `Reward Earned! You got 1 extra scan.`,
          duration: 'long',
        });
        cleanup();
        resolve(true);
      });

      closeListener = AdMob.addListener('rewardedVideoDidDismiss', () => {
        console.log('Rewarded ad closed');
        cleanup();
        resolve(false);
      });

      failListener = AdMob.addListener('rewardedVideoDidFailToLoad', (error: any) => {
        console.error('Rewarded ad failed to load:', error);
        Toast.show({
          text: 'Ad Not Available. Please try again later.',
          duration: 'long',
        });
        cleanup();
        resolve(false);
      });

      AdMob.prepareRewardedVideoAd({
        adId: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ad ID
      })
      .then(() => AdMob.showRewardedVideoAd())
      .catch((error: any) => {
        console.error('Error preparing/showing rewarded ad:', error);
        cleanup();
        resolve(false);
      });
    });
  };

  return {
    initialize,
    showBanner,
    showRewarded,
  };
};

export default useAdMob;
