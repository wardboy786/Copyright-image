'use client';

// --- !!! IMPORTANT !!! ---
// This is the MOCK implementation for the AdMob hook.
// It is used for web and server-side rendering where native Capacitor plugins are not available.
// It provides the same function signatures but with empty implementations.
// ---

const useAdMob = () => {
  const initialize = async () => {
    console.log('AdMob: Initialize (Web Mock)');
  };

  const showBanner = async () => {
    console.log('AdMob: Show Banner (Web Mock)');
  };
  
  const showRewarded = async (): Promise<boolean> => {
      console.log('AdMob: Show Rewarded Ad (Web Mock)');
      return Promise.resolve(false);
  }

  const prepareInterstitial = async (): Promise<void> => {
    console.log('AdMob: Prepare Interstitial Ad (Web Mock)');
    return Promise.resolve();
  }

  const showInterstitial = async (): Promise<void> => {
    console.log('AdMob: Show Interstitial Ad (Web Mock)');
    return Promise.resolve();
  }

  return { initialize, showBanner, showRewarded, prepareInterstitial, showInterstitial };
};

export default useAdMob;
