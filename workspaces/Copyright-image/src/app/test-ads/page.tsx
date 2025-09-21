'use client';

import { useState, useEffect } from 'react';
import { AdMobService } from '@/services/admob';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TestAdsPage() {
  const [status, setStatus] = useState('Not initialized');
  const [adMobService, setAdMobService] = useState<AdMobService | null>(null);

  useEffect(() => {
    const service = AdMobService.getInstance();
    setAdMobService(service);
    initializeAdMob(service);
  }, []);

  const initializeAdMob = async (service: AdMobService) => {
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
            <Button onClick={testBanner} className="w-full">
              Show Banner Ad
            </Button>

            <Button onClick={hideBanner} className="w-full" variant="secondary">
              Hide Banner Ad
            </Button>

            <Button onClick={testInterstitial} className="w-full">
              Show Interstitial Ad
            </Button>

            <Button onClick={testRewarded} className="w-full">
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
              <li>Successful console logs for each ad action.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
