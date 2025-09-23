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

  return { initialize, showBanner, showRewarded };
};

export default useAdMob;
