
// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
// This service is designed to be client-side only.

// This service is now designed to be entirely dynamic to avoid server-side build issues.
class AdMobServiceImpl {
  private static instance: AdMobServiceImpl;
  private isInitialized = false;

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

  private async getAdMob() {
    if (!this.isAvailable()) {
      return null;
    }
    // Dynamically import everything at once
    return await import('@capacitor-community/admob');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('AdMob already initialized.');
      return;
    }
    
    const admob = await this.getAdMob();
    if (!admob) return;

    try {
      const testingDevices = ['YOUR_ADVERTISING_ID_HERE'];
      
      await admob.AdMob.initialize({
        testingDevices,
      });

      this.isInitialized = true;
      console.log('AdMob Initialized');
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }

  async showBanner(): Promise<void> {
    const admob = await this.getAdMob();
    if (!admob || !this.isInitialized) return;
    
    const { BannerAdPluginEvents, BannerAdSize, BannerAdPosition } = admob;

    admob.AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: any) => {
      console.error('ADMOB FAILED TO LOAD:', error);
    });

    admob.AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('Ad loaded successfully');
    });

    try {
      await admob.AdMob.showBanner({
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
    const admob = await this.getAdMob();
    if (!admob) return;
    try {
      await admob.AdMob.hideBanner();
      console.log('Banner ad hidden.');
    } catch (e) {
      console.warn('Failed to hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    const admob = await this.getAdMob();
    if (!admob || !this.isInitialized) return;
    
    console.log(`Preparing interstitial ad with ID: ${this.TEST_INTERSTITIAL_ID}`);
    try {
      await admob.AdMob.prepareInterstitial({
        adId: this.TEST_INTERSTITIAL_ID,
      });
      await admob.AdMob.showInterstitial();
      console.log('Interstitial ad shown successfully.');
    } catch (e) {
      console.error('Failed to show interstitial ad', e);
    }
  }

  async showRewardedAd(): Promise<any | null> {
    const admob = await this.getAdMob();
    if (!admob || !this.isInitialized) {
      console.error('AdMob not initialized or unavailable.');
      return null;
    }
    
    const { RewardAdPluginEvents } = admob;
    
    console.log(`Preparing rewarded ad with ID: ${this.TEST_REWARDED_ID}`);

    return new Promise(async (resolve) => {
        const rewardListener = admob.AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: import('@capacitor-community/admob').RewardItem) => {
            console.log('Rewarded video ad reward received:', reward);
            rewardListener.remove();
            resolve(reward);
        });

        try {
            await admob.AdMob.prepareRewardVideoAd({
                adId: this.TEST_REWARDED_ID,
            });
            await admob.AdMob.showRewardVideoAd();
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
