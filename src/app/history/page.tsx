'use client';
import { ScanHistoryList } from '@/components/copyright-sentry/scan-history-list';
import { useScans } from '@/hooks/use-scans';
import { Skeleton } from '@/components/ui/skeleton';
import { AdBanner } from '@/components/copyright-sentry/ad-banner';
import { Card, CardContent } from '@/components/ui/card';

export default function HistoryPage() {
  const { scans, isInitialized, isPremium } = useScans();

  return (
    <div className="space-y-6">
      {!isPremium && <AdBanner />}
      <Card>
        <CardContent className="p-4 md:p-6">
          {!isInitialized ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScanHistoryList scans={scans} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
