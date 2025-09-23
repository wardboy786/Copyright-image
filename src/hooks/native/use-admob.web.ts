'use client';

// This is the web/server-side version of the hook.
// It provides the same API but with empty, non-functional implementations.

import { useState, useCallback } from 'react';

// Singleton hook state to prevent multiple initializations
let isAdMobInitialized = false;

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(isAdMobInitialized);

  const showRewarded = useCallback((): Promise<boolean> => {
    return new Promise(async (resolve) => {
      console.warn('AdMob is not available on the web. Returning false.');
      resolve(false);
    });
  }, []);

  return { isInitialized, showRewarded };
}
