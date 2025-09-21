'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { useScans } from '@/hooks/use-scans';
import { DailyLimitIndicator } from '@/components/copyright-sentry/daily-limit-indicator';
import { AdBanner } from '@/components/copyright-sentry/ad-banner';

export default function Home() {
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const { isPremium } = useScans();
  
  const handleScanComplete = (scan: ScanResult) => {
    setLatestScan(scan);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ImageUploader onScanComplete={handleScanComplete} />
        </div>
        <div className="flex flex-col gap-6">
          <DailyLimitIndicator />
          {!isPremium && <AdBanner />}
        </div>
      </div>
      
      {latestScan && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Latest Scan Result</h2>
          <ScanResults scan={latestScan} />
        </div>
      )}
    </div>
  );
}
