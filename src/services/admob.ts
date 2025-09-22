// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.

// Do not add any imports from '@capacitor-community/admob' at the top level.

type RewardItem = {
  type: string;
  amount: number;
};

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

  async initialize(): Promise<void> {
    if (!this.isAvailable() || this.isInitialized) {
      if(this.isInitialized) console.log('AdMob already initialized.');
      return;
    }
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      // Replace with your real device ID to see test ads on your phone
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
    if (!this.isAvailable() || !this.isInitialized) {
        if (typeof alert !== 'undefined') {
          // This alert is for debugging purposes on the device.
          // alert("AdMob not available or not initialized. Cannot show banner.");
        }
        return;
    }

    const { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } = await import('@capacitor-community/admob');
    
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: any) => {
      if (typeof alert !== 'undefined') {
        alert('ADMOB FAILED TO LOAD:\n\n' + JSON.stringify(error, null, 2));
      }
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
       if (typeof alert !== 'undefined') {
        alert('Error trying to SHOW banner:\n\n' + JSON.stringify(e, null, 2));
      }
    }
  }


  async hideBanner(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
      console.log('Banner ad hidden.');
    } catch (e) {
      console.warn('Failed to hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    if (!this.isAvailable() || !this.isInitialized) return;
    console.log(`Preparing interstitial ad with ID: ${this.TEST_INTERSTITIAL_ID}`);
    try {
      const { AdMob } = await import('@capacitor-community/admob');
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
    if (!this.isAvailable() || !this.isInitialized) {
      console.error('AdMob not available or not initialized.');
      return null;
    }
    console.log(`Preparing rewarded ad with ID: ${this.TEST_REWARDED_ID}`);

    return new Promise(async (resolve) => {
        const { AdMob } = await import('@capacitor-community/admob');
        // The events are dynamically imported, so we need to get their string values
        const RewardedAdPluginEvents = {
            Rewarded: 'rewardedVideoAdRewarded'
        };

        try {
            const rewardListener = await AdMob.addListener(RewardedAdPluginEvents.Rewarded, (reward: RewardItem) => {
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
