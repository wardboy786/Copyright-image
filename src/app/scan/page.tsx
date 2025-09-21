'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '@/hooks/use-app-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


export default function ScanPage() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null | undefined>(undefined);
  const { getScanById, isInitialized } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const scanId = searchParams.get('id');

  useEffect(() => {
    if (isInitialized) {
      if (scanId) {
        const foundScan = getScanById(scanId);
        setCurrentScan(foundScan);
      } else {
        setCurrentScan(null);
      }
    }
  }, [scanId, getScanById, isInitialized]);


  const handleScanComplete = (scan: ScanResult) => {
    // Navigate to the same page with the new scan's ID as a query param
    router.push(`/scan?id=${scan.id}`, { scroll: false });
  };

  const handleScanAnother = () => {
    // Navigate back to the uploader by removing query params
    router.push('/scan', { scroll: false });
  };

  // Loading state while waiting for initialization or scan data
  if (!isInitialized || currentScan === undefined) {
     return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  // Scan not found error
  if (scanId && currentScan === null) {
     return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Scan not found. It may have been deleted.</AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {!scanId || !currentScan ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ImageUploader onScanComplete={handleScanComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-6 text-center lg:text-left">Scan Result</h1>
            <ScanResults scan={currentScan} onScanAnother={handleScanAnother} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
