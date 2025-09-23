'use client';

import { useAdMob } from '@/hooks/use-admob';

/**
 * This component's sole purpose is to activate the useAdMob hook,
 * which handles initialization and banner ad display.
 * It renders nothing to the DOM.
 */
export function AdMobController() {
  useAdMob(); // This initializes AdMob and shows the banner on native platforms
  return null;
}
