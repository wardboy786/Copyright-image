
// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
// This service is designed to be client-side only.

type AdMobPlugin = import('@capacitor-community/admob').AdMobPlugin;
type BannerAdSize = import('@capacitor-community/admob').BannerAdSize;
type BannerAdPosition = import('@capacitor-community/admob').BannerAdPosition;
type RewardItem = import('@capacitor-community/admob').RewardItem;
type BannerAdPluginEvents = import('@capacitor-community/admob').BannerAdPluginEvents;
type RewardAdPluginEvents = import('@capacitor-community/admob').RewardAdPluginEvents;

class AdMobServiceImpl {
  private static instance: AdMobServiceImpl;
  private isInitialized = false;
  private admob: AdMobPlugin | null = null;
  private enums: {
    BannerAdSize?: typeof BannerAdSize;
    BannerAdPosition?: typeof BannerAdPosition;
    BannerAdPluginEvents?: typeof BannerAdPluginEvents;
    RewardAdPluginEvents?: typeof RewardAdPluginEvents;
  } = {};

  // Ad Unit IDs
  private readonly TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
  private readonly TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
  private readonly TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

  public static getInstance(): AdMobServiceImpl {
    if (!AdMobServiceImpl.instance) {
      AdMobServiceImpl.instance = new AdMobServiceImpl();
    }
    return AdMobServiceImpl.instance;
  }

  private isAvailable(): boolean {
    return typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable('AdMob');
  }

  private async loadAdMobModule() {
    if (this.admob) return this.admob;

    if (this.isAvailable()) {
      const admobModule = await import('@capacitor-community/admob');
      this.admob = admobModule.AdMob;
      this.enums = {
        BannerAdSize: admobModule.BannerAdSize,
        BannerAdPosition: admobModule.BannerAdPosition,
        BannerAdPluginEvents: admobModule.BannerAdPluginEvents,
        RewardAdPluginEvents: admobModule.RewardAdPluginEvents,
      };
      return this.admob;
    }
    return null;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('AdMob already initialized.');
      return;
    }
    
    const AdMob = await this.loadAdMobModule();
    if (!AdMob) return;

    try {
      const testingDevices = ['YOUR_ADVERTISING_ID_HERE'];
      
      await AdMob.initialize({
        testingDevices,
      });

      this.isInitialized = true;
      console.log('AdMob Initialized');
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }

  async showBanner(): Promise<void> {
    const AdMob = await this.loadAdMobModule();
    const { BannerAdPluginEvents, BannerAdSize, BannerAdPosition } = this.enums;

    if (!AdMob || !this.isInitialized || !BannerAdPluginEvents || !BannerAdSize || !BannerAdPosition) return;
    
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: any) => {
      console.error('ADMOB FAILED TO LOAD:', error);
    });

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('Ad loaded successfully');
    });

    try {
      await AdMob.showBanner({
        adId: this.TEST_BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
    } catch (e) {
       console.error('Error trying to SHOW banner:', e);
    }
  }

  async hideBanner(): Promise<void> {
    const AdMob = await this.loadAdMobModule();
    if (!AdMob) return;
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden.');
    } catch (e) {
      console.warn('Failed to hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    const AdMob = await this.loadAdMobModule();
    if (!AdMob || !this.isInitialized) return;
    
    console.log(`Preparing interstitial ad with ID: ${this.TEST_INTERSTITIAL_ID}`);
    try {
      await AdMob.prepareInterstitial({
        adId: this.TEST_INTERSTITIAL_ID,
      });
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown successfully.');
    } catch (e) {
      console.error('Failed to show interstitial ad', e);
    }
  }

  async showRewardedAd(): Promise<RewardItem | null> {
    const AdMob = await this.loadAdMobModule();
    const { RewardAdPluginEvents } = this.enums;

    if (!AdMob || !this.isInitialized || !RewardAdPluginEvents) {
      console.error('AdMob not initialized or unavailable.');
      return null;
    }
    
    console.log(`Preparing rewarded ad with ID: ${this.TEST_REWARDED_ID}`);

    return new Promise(async (resolve) => {
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: RewardItem) => {
            console.log('Rewarded video ad reward received:', reward);
            rewardListener.remove();
            resolve(reward);
        });
        
        const closeListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            console.log('Rewarded video ad dismissed by user.');
            rewardListener.remove();
            closeListener.remove();
            resolve(null);
        });

        try {
            await AdMob.prepareRewardVideoAd({
                adId: this.TEST_REWARDED_ID,
            });
            await AdMob.showRewardVideoAd();
            console.log('showRewardVideoAd called.');
        } catch (e) {
            console.error('Failed to prepare or show rewarded ad', e);
            rewardListener.remove();
            closeListener.remove();
            resolve(null);
        }
    });
  }
}

// Export a single instance of the service
export const AdMobService = AdMobServiceImpl.getInstance();
