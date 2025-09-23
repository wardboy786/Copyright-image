// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
// This service is designed to be client-side only.

// Dynamically import types to avoid server-side build errors
type AdMobPlugin = import('@capacitor-community/admob').AdMobPlugin;
type RewardItem = import('@capacitor-community/admob').RewardItem;

class AdMobServiceImpl {
  private static instance: AdMobServiceImpl;
  private isInitialized = false;
  private AdMob: AdMobPlugin | null = null;

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

  private async getAdMobInstance(): Promise<AdMobPlugin | null> {
    if (this.AdMob) {
      return this.AdMob;
    }
    if (this.isAvailable()) {
      const { AdMob } = await import('@capacitor-community/admob');
      this.AdMob = AdMob;
      return this.AdMob;
    }
    return null;
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable() || this.isInitialized) {
      if(this.isInitialized) console.log('AdMob already initialized.');
      return;
    }

    try {
      const AdMob = await this.getAdMobInstance();
      if (!AdMob) return;
      
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
    if (!this.isInitialized) return;
    
    const AdMob = await this.getAdMobInstance();
    if (!AdMob) return;

    const { BannerAdPluginEvents } = await import('@capacitor-community/admob');
    
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: any) => {
      console.error('ADMOB FAILED TO LOAD:', error);
    });

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('Ad loaded successfully');
    });

    try {
      await AdMob.showBanner({
        adId: this.TEST_BANNER_ID,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
      });
    } catch (e) {
       console.error('Error trying to SHOW banner:', e);
    }
  }


  async hideBanner(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const AdMob = await this.getAdMobInstance();
      if (!AdMob) return;
      await AdMob.hideBanner();
      console.log('Banner ad hidden.');
    } catch (e) {
      console.warn('Failed to hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    if (!this.isInitialized) return;
    console.log(`Preparing interstitial ad with ID: ${this.TEST_INTERSTITIAL_ID}`);
    try {
      const AdMob = await this.getAdMobInstance();
      if (!AdMob) return;
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
    if (!this.isInitialized) {
      console.error('AdMob not initialized.');
      return null;
    }
    console.log(`Preparing rewarded ad with ID: ${this.TEST_REWARDED_ID}`);

    return new Promise(async (resolve) => {
        const AdMob = await this.getAdMobInstance();
        if (!AdMob) {
            resolve(null);
            return;
        }

        const { RewardedAdPluginEvents } = await import('@capacitor-community/admob');

        try {
            const rewardListener = AdMob.addListener(RewardedAdPluginEvents.Rewarded, (reward: RewardItem) => {
                console.log('Rewarded video ad reward received:', reward);
                rewardListener.remove();
                resolve(reward);
            });

            await AdMob.prepareRewardVideoAd({
                adId: this.TEST_REWARDED_ID,
            });
            await AdMob.showRewardVideoAd();
            console.log('showRewardVideoAd called.');
        } catch (e) {
            console.error('Failed to prepare or show rewarded ad', e);
            resolve(null);
        }
    });
  }
}

// Export a single instance of the service
export const AdMobService = AdMobServiceImpl.getInstance();
