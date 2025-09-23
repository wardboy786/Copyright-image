'use client';

import { useAppContext } from '@/hooks/use-app-context';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MAX_FREE_SCANS } from '@/hooks/use-scans';

export function DailyLimitIndicator() {
  const { todaysScanCount, isPremium, isInitialized } = useAppContext();

  if (isPremium) {
    return (
        <Card className="bg-green-500/10 border-dashed border-green-500/30">
            <CardHeader className="p-4 text-center">
                <CardTitle className="text-base text-green-400">Premium Account</CardTitle>
                <CardDescription>You have unlimited scans.</CardDescription>
            </CardHeader>
        </Card>
    );
  }
  
  if (!isInitialized) {
      return (
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
      )
  }

  const progressValue = (todaysScanCount / MAX_FREE_SCANS) * 100;

  return (
    <div className="p-4">
        <Card className="bg-muted/50 border-dashed">
            <CardHeader className="p-4">
                <CardTitle className="text-base">Free Scans Used Today</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-medium text-muted-foreground">Daily Limit</span>
                    <span className="font-bold">{todaysScanCount} / {MAX_FREE_SCANS}</span>
                </div>
                <Progress value={progressValue} className="h-2 mb-4"/>
                <Button size="sm" className="w-full" asChild>
                    <Link href="/premium">
                        Upgrade to Premium
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
