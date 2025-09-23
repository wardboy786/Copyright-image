
// --- AdMob Configuration ---
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
// This service is designed to be client-side only.

// A memoized loader to ensure the AdMob module is imported only once.
const getAdMob = (() => {
  let admobInstance: any = null;
  return async () => {
    if (admobInstance) return admobInstance;
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable('AdMob')) {
      const admobModule = await import('@capacitor-community/admob');
      admobInstance = admobModule;
      return admobInstance;
    }
    return null;
  };
})();

// Define types dynamically to avoid server-side build issues
type AdMobPlugin = import('@capacitor-community/admob').AdMobPlugin;
type BannerAdSize = import('@capacitor-community/admob').BannerAdSize;
type BannerAdPosition = import('@capacitor-community/admob').BannerAdPosition;
type RewardItem = import('@capacitor-community/admob').RewardItem;
type BannerAdPluginEvents = import('@capacitor-community/admob').BannerAdPluginEvents;
type RewardAdPluginEvents = import('@capacitor-community/admob').RewardAdPluginEvents;


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

  private async getPlugin(): Promise<{ AdMob: AdMobPlugin; BannerAdSize: typeof BannerAdSize, BannerAdPosition: typeof BannerAdPosition, BannerAdPluginEvents: typeof BannerAdPluginEvents, RewardAdPluginEvents: typeof RewardAdPluginEvents } | null> {
    const admobModule = await getAdMob();
    if (admobModule) {
      return { 
        AdMob: admobModule.AdMob, 
        BannerAdSize: admobModule.BannerAdSize,
        BannerAdPosition: admobModule.BannerAdPosition,
        BannerAdPluginEvents: admobModule.BannerAdPluginEvents,
        RewardAdPluginEvents: admobModule.RewardAdPluginEvents,
      };
    }
    return null;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    const plugin = await this.getPlugin();
    if (!plugin) return;

    try {
      const testingDevices = ['YOUR_ADVERTISING_ID_HERE'];
      
      await plugin.AdMob.initialize({
        testingDevices,
      });

      this.isInitialized = true;
    } catch (e) {
      console.error('AdMob initialization failed', e);
    }
  }

  async showBanner(): Promise<void> {
    const plugin = await this.getPlugin();
    if (!plugin || !this.isInitialized) return;
    
    const { AdMob, BannerAdPluginEvents, BannerAdSize, BannerAdPosition } = plugin;
    
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: any) => {
      console.error('ADMOB BANNER FAILED TO LOAD:', error);
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
    const plugin = await this.getPlugin();
    if (!plugin?.AdMob) return;
    try {
      await plugin.AdMob.hideBanner();
    } catch (e) {
      // Errors can happen if no banner is shown, so we can warn instead of error.
      console.warn('Could not hide banner ad', e);
    }
  }

  async showInterstitialAd(): Promise<void> {
    const plugin = await this.getPlugin();
    if (!plugin || !this.isInitialized) return;
    
    try {
      await plugin.AdMob.prepareInterstitial({
        adId: this.TEST_INTERSTITIAL_ID,
      });
      await plugin.AdMob.showInterstitial();
    } catch (e) {
      console.error('Failed to show interstitial ad', e);
    }
  }

  async showRewardedAd(): Promise<RewardItem | null> {
    const plugin = await this.getPlugin();
    if (!plugin || !this.isInitialized) {
      return null;
    }
    
    const { AdMob, RewardAdPluginEvents } = plugin;

    return new Promise(async (resolve) => {
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: RewardItem) => {
            rewardListener.remove();
            closeListener.remove();
            resolve(reward);
        });
        
        const closeListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            rewardListener.remove();
            closeListener.remove();
            resolve(null);
        });

        try {
            await AdMob.prepareRewardVideoAd({
                adId: this.TEST_REWARDED_ID,
            });
            await AdMob.showRewardVideoAd();
        } catch (e) {
            console.error('Failed to prepare or show rewarded ad', e);
            rewardListener.remove();
            closeListener.remove();
            resolve(null);
        }
    });
  }
}

export const AdMobService = AdMobServiceImpl.getInstance();
