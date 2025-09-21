'use client';
import { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { useScans } from '@/hooks/use-scans';
import { ScanHistoryList } from '@/components/copyright-sentry/scan-history-list';
import { DailyLimitIndicator } from '@/components/copyright-sentry/daily-limit-indicator';
import { AdBanner } from '@/components/copyright-sentry/ad-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const { scans, isPremium, isInitialized } = useScans();

  useEffect(() => {
    if (scans.length > 0 && !latestScan) {
      setLatestScan(scans[0]);
    }
  }, [scans, latestScan]);
  
  const handleScanComplete = (scan: ScanResult) => {
    setLatestScan(scan);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
           <ImageUploader onScanComplete={handleScanComplete} />
           {!isPremium && <AdBanner />}
        </div>
        <div className="flex flex-col gap-6">
          <DailyLimitIndicator />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Scans</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/history">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isInitialized ? (
                <ScanHistoryList scans={scans.slice(0, 5)} />
              ) : (
                <p className="text-muted-foreground text-sm">Loading history...</p>
              )}
            </CardContent>
          </Card>
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
