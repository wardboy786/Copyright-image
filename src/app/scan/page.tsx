'use client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScanPageClient } from './scan-page-client';


function ScanPageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<ScanPageFallback />}>
      <ScanPageClient />
    </Suspense>
  );
}
