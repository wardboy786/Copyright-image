'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppContext } from '@/hooks/use-app-context';
import { type ScanResult } from '@/lib/types';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ScanDetailPage() {
  const params = useParams();
  const { getScanById, isInitialized } = useAppContext();
  const [scan, setScan] = useState<ScanResult | null | undefined>(undefined);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (isInitialized && id) {
      const foundScan = getScanById(id);
      setScan(foundScan);
    }
  }, [id, getScanById, isInitialized]);

  if (!isInitialized || scan === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (scan === null) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Scan not found. It may have been deleted.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold">Scan Result</h2>
      <ScanResults scan={scan} />
    </div>
  );
}
