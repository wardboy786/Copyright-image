'use client';

import { useState, useEffect } from 'react';
import { AdMobService } from '@/services/admob';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TestAdsPage() {
  const [status, setStatus] = useState('Not initialized');
  // Use a state to hold the service instance to ensure it's client-side
  const [adMobService, setAdMobService] = useState<typeof AdMobService | null>(null);

  useEffect(() => {
    // Instantiate the service only on the client
    setAdMobService(AdMobService);
    
    // Initialize AdMob when the component mounts
    initializeAdMob(AdMobService);
  }, []);

  const initializeAdMob = async (service: typeof AdMobService) => {
    setStatus('Initializing AdMob...');
    await service.initialize();
    setStatus('AdMob initialized - Ready to test ads');
  };

  const testBanner = async () => {
    if (!adMobService) return;
    setStatus('Showing banner ad...');
    await adMobService.showBanner();
    setStatus('Banner ad shown (check bottom of screen)');
  };

  const hideBanner = async () => {
    if (!adMobService) return;
    setStatus('Hiding banner ad...');
    await adMobService.hideBanner();
    setStatus('Banner ad hidden');
  };

  const testInterstitial = async () => {
    if (!adMobService) return;
    setStatus('Showing interstitial ad...');
    await adMobService.showInterstitialAd();
    setStatus('Interstitial ad shown');
  };

  const testRewarded = async () => {
    if (!adMobService) return;
    setStatus('Showing rewarded ad...');
    const reward = await adMobService.showRewardedAd();
    setStatus(`Rewarded ad completed. Reward: ${reward ? 'YES - ' + reward.amount + ' ' + reward.type : 'NO'}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AdMob Test Page</CardTitle>
        </CardHeader>
        <CardContent>
           <Alert className="bg-primary/10 border-primary/20">
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 space-y-3">
            <Button onClick={testBanner} className="w-full" disabled={!adMobService}>
              Show Banner Ad
            </Button>

            <Button onClick={hideBanner} className="w-full" variant="secondary" disabled={!adMobService}>
              Hide Banner Ad
            </Button>

            <Button onClick={testInterstitial} className="w-full" disabled={!adMobService}>
              Show Interstitial Ad
            </Button>

            <Button onClick={testRewarded} className="w-full" disabled={!adMobService}>
              Show Rewarded Ad
            </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-amber-500/10 border-amber-500/20">
        <CardHeader>
            <CardTitle className="text-amber-400 text-lg">What to look for:</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>A "Test Ad" label on all advertisements.</li>
              <li>Generic content (e.g., puzzles, simple games), not real brand ads.</li>
              <li>Successful console logs for each ad action in your device's logcat.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
