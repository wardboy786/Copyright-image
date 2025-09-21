// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

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
      return;
    }
    try {
      await AdMob.initialize({
        // Replace 'YOUR_ADVERTISING_ID_HERE' with your actual advertising ID for testing
        testingDevices: ['YOUR_ADVERTISING_ID_HERE'], 
        requestTrackingAuthorization: true,
      });
      this.isInitialized = true;
      console.log('AdMob Initialized');
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }

  async showBanner(): Promise<void> {
    if (!this.isAvailable() || !this.isInitialized) return;
    try {
      await AdMob.showBanner({
        adId: TEST_BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
    } catch (e) {
      console.error('Failed to show banner ad', e);
    }
  }

  async hideBanner(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await AdMob.hideBanner();
    } catch (e) {
      console.warn('Failed to hide banner ad (it might already be hidden)', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    if (!thisisAvailable() || !this.isInitialized) return;
    try {
      await AdMob.prepareInterstitial({ adId: TEST_INTERSTITIAL_ID });
      await AdMob.showInterstitial();
    } catch (e) {
      console.error('Failed to show interstitial ad', e);
    }
  }

  async showRewardedAd(): Promise<RewardItem | null> {
    if (!this.isAvailable() || !this.isInitialized) return null;
    
    return new Promise(async (resolve) => {
      let rewardListener: any;
      let failListener: any;

      const cleanup = () => {
        rewardListener?.remove();
        failListener?.remove();
      };
      
      rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: RewardItem) => {
        console.log('Rewarded video ad reward:', reward);
        cleanup();
        resolve(reward);
      });

      failListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: any) => {
        console.error('Rewarded video ad failed to load:', error);
        cleanup();
        resolve(null);
      });
      
      try {
        await AdMob.prepareRewardVideoAd({ adId: TEST_REWARDED_ID });
        await AdMob.showRewardVideoAd();
      } catch (e) {
        console.error('Failed to prepare or show rewarded ad', e);
        cleanup();
        resolve(null);
      }
    });
  }
}

export const AdMobService = AdMobServiceImpl;
