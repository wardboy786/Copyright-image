'use client';

import { useScans } from '@/hooks/use-scans';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

const MAX_FREE_SCANS = 5;

export function DailyLimitIndicator() {
  const { todaysScanCount, isPremium, isInitialized } = useScans();

  if (isPremium || !isInitialized) {
    return null;
  }
  
  if (!isInitialized) {
      return <Skeleton className="h-2 w-full" />;
  }

  const scansRemaining = MAX_FREE_SCANS - todaysScanCount;
  const progressValue = (todaysScanCount / MAX_FREE_SCANS) * 100;

  return (
    <div className="w-full px-6 pb-4 text-xs text-muted-foreground">
        <Progress value={progressValue} className="h-2 mb-2"/>
        <div className="flex justify-between items-center">
            <span>
                Daily Scans: {todaysScanCount} / {MAX_FREE_SCANS}
            </span>
            <Link href="/premium" className="text-primary hover:underline">
                Upgrade
            </Link>
        </div>
    </div>
  );
}
