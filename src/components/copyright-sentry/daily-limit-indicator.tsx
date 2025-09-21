'use client';

import { useScans } from '@/hooks/use-scans';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

const MAX_FREE_SCANS = 5;

export function DailyLimitIndicator() {
  const { todaysScanCount, isPremium, isInitialized } = useScans();

  if (isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premium Account</CardTitle>
          <CardDescription>You have unlimited scans.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-primary font-semibold">Thank you for being a premium member!</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const scansRemaining = MAX_FREE_SCANS - todaysScanCount;
  const progressValue = (todaysScanCount / MAX_FREE_SCANS) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Scan Limit</CardTitle>
        <CardDescription>
          You have <span className="font-bold text-primary">{scansRemaining > 0 ? scansRemaining : 0}</span> of {MAX_FREE_SCANS} free scans remaining today.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressValue} />
        <Button asChild className="w-full">
          <Link href="/premium">Upgrade for Unlimited Scans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
