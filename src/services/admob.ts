// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

// --- AdMob Service ---
let AdMob: typeof import('@capacitor-community/admob').AdMob;
let BannerAdSize: typeof import('@capacitor-community/admob').BannerAdSize;
let BannerAdPosition: typeof import('@capacitor-community/admob').BannerAdPosition;
let RewardAdPluginEvents: typeof import('@capacitor-community/admob').RewardAdPluginEvents;


try {
  if (typeof window !== 'undefined') {
    const admobModule = require('@capacitor-community/admob');
    AdMob = admobModule.AdMob;
    BannerAdSize = admobModule.BannerAdSize;
    BannerAdPosition = admobModule.BannerAdPosition;
    RewardAdPluginEvents = admobModule.RewardAdPluginEvents;
  }
} catch (e) {
  console.warn('@capacitor-community/admob not available. Ads will not be shown.');
}

type RewardItem = {
  type: string;
  amount: number;
};

class AdMobServiceImpl {
  private static instance: AdMobServiceImpl;
  private isInitialized = false;

  public static getInstance(): AdMobServiceImpl {
    if (!AdMobServiceImpl.instance) {
      AdMobServiceImpl.instance = new AdMobServiceImpl();
    }
    return AdMobServiceImpl.instance;
  }

  private isAvailable(): boolean {
    return !!AdMob;
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable() || this.isInitialized) {
      if(this.isInitialized) console.log('AdMob already initialized.');
      return;
    }
    try {
      // Add your test device ID for development
      // Find your ID in your device's logs after running the app once.
      const testingDevices = ['YOUR_ADVERTISING_ID_HERE'];
      await AdMob.initialize({ testingDevices, requestTrackingAuthorization: true });
      this.isInitialized = true;
      console.log('AdMob Initialized');
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }

  async showBanner(): Promise<void> {
    if (!this.isAvailable() || !this.isInitialized) return;
    
    const adId = TEST_BANNER_ID;
    console.log(`Attempting to show banner with Ad ID: ${adId}`);

    try {
      await AdMob.showBanner({
        adId: adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      console.log('Banner ad shown successfully.');
    } catch (e) {
      console.error('Failed to show banner ad', e);
    }
  }

  async hideBanner(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden.');
    } catch (e) {
      // Don't throw error if hiding fails (e.g., already hidden)
      console.warn('Failed to hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    if (!this.isAvailable() || !this.isInitialized) return;
    const adId = TEST_INTERSTITIAL_ID;
    console.log(`Preparing interstitial ad with ID: ${adId}`);
    try {
      await AdMob.prepareInterstitial({
        adId,
      });
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown successfully.');
    } catch (e) {
      console.error('Failed to show interstitial ad', e);
    }
  }

  async showRewardedAd(): Promise<RewardItem | null> {
    if (!this.isAvailable() || !this.isInitialized) {
      console.error('AdMob not available or not initialized.');
      return null;
    }
    const adId = TEST_REWARDED_ID;
    console.log(`Preparing rewarded ad with ID: ${adId}`);

    return new Promise(async (resolve) => {
      let rewardListener: any;
      let failListener: any;

      const cleanup = () => {
        rewardListener?.remove();
        failListener?.remove();
      };
      
      try {
        rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: RewardItem) => {
          console.log('Rewarded video ad reward received:', reward);
          cleanup();
          resolve(reward);
        });

        failListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: any) => {
          console.error('Rewarded video ad failed to load:', error);
          cleanup();
          resolve(null); // Resolve with null on failure
        });
        
        await AdMob.prepareRewardVideoAd({
            adId,
        });
        await AdMob.showRewardVideoAd();
        console.log('showRewardVideoAd called.');
      } catch (e) {
        console.error('Failed to prepare or show rewarded ad', e);
        cleanup();
        resolve(null);
      }
    });
  }
}

export const AdMobService = AdMobServiceImpl;
