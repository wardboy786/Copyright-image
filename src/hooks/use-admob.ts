'use client';
import { AdMob, AdMobRewardItem, RewardAdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize, RewardAdPluginEvents } from '@capacitor-community/admob';
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
        initializeForTesting: true,
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
        adId: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad ID
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0, // Set to 0, we'll handle spacing with CSS
        adSize: BannerAdSize.BANNER,
        isTesting: true,
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
        adId: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ad ID
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

  return {
    initialize,
    showBanner,
    showRewarded,
  };
};

export default useAdMob;
