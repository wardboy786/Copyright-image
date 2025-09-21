// --- AdMob Configuration ---
// LIVE Ad Unit IDs:
const LIVE_BANNER_ID = 'ca-app-pub-8270549953677995/1980800386';
const LIVE_INTERSTITIAL_ID = 'ca-app-pub-8270549953677995/7853385011';
const LIVE_REWARDED_ID = 'ca-app-pub-8270549953677995/7112028608';

// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

// Set to true to use test ads, false for live ads.
const IS_TESTING_MODE = process.env.NODE_ENV === 'development';

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
      return;
    }
    try {
      await AdMob.initialize({
        testingDevices: IS_TESTING_MODE ? ['YOUR_ADVERTISING_ID_HERE'] : [], // Add your test device ID for development
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
        adId: IS_TESTING_MODE ? TEST_BANNER_ID : LIVE_BANNER_ID,
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
      // Don't throw error if hiding fails (e.g., already hidden)
      console.warn('Failed to hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    if (!this.isAvailable() || !this.isInitialized) return;
    try {
      await AdMob.prepareInterstitial({
        adId: IS_TESTING_MODE ? TEST_INTERSTITIAL_ID : LIVE_INTERSTITIAL_ID,
      });
      await AdMob.showInterstitial();
    } catch (e) {
      console.error('Failed to show interstitial ad', e);
    }
  }

  async showRewardedAd(): Promise<RewardItem | null> {
    if (!this.isAvailable() || !this.isInitialized) return null;
    try {
      await AdMob.prepareRewardVideoAd({
        adId: IS_TESTING_MODE ? TEST_REWARDED_ID : LIVE_REWARDED_ID,
      });

      return new Promise(async (resolve, reject) => {
        const loadedListener = await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
            console.log('Rewarded video ad is loaded and ready to be displayed.');
        });
        
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: RewardItem) => {
            console.log('Rewarded video ad reward:', reward);
            resolve(reward);
            // Clean up listeners
            loadedListener.remove();
            rewardListener.remove();
            failListener.remove();
        });

        const failListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: any) => {
            console.error('Rewarded video ad failed to load:', error);
            reject(new Error('Failed to load rewarded ad.'));
             // Clean up listeners
            loadedListener.remove();
            rewardListener.remove();
            failListener.remove();
        });
        
        AdMob.showRewardVideoAd().catch(reject);
      });
      
    } catch (e) {
      console.error('Failed to show rewarded ad', e);
      return null;
    }
  }
}

export const AdMobService = AdMobServiceImpl;
