'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { useScans } from '@/hooks/use-scans';
import { AdBanner } from '@/components/copyright-sentry/ad-banner';

export default function Home() {
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const { isPremium } = useScans();
  
  const handleScanComplete = (scan: ScanResult) => {
    setLatestScan(scan);
  };

  return (
    <div className="flex flex-col gap-8">
        <ImageUploader onScanComplete={handleScanComplete} />
      
        {!isPremium && !latestScan && <AdBanner />}
      
        {latestScan && (
            <div>
            <h2 className="text-2xl font-bold mb-4">Latest Scan Result</h2>
            <ScanResults scan={latestScan} />
            </div>
        )}
    </div>
  );
}
