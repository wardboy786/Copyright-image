
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


export function ScanPageClient() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null | undefined>(undefined);
  const { getScanById, isInitialized } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const scanId = searchParams.get('id');

  useEffect(() => {
    // This effect synchronizes the component's state with the URL.
    // It runs when the scanId from the URL changes or when the app is first initialized.
    if (isInitialized) {
      if (scanId) {
        // If there's a scan ID in the URL, find the corresponding scan.
        const foundScan = getScanById(scanId);
        // Only update state if the scan found is different from the one currently displayed.
        // This prevents re-rendering the results if the user is already viewing them.
        if (foundScan && foundScan.id !== currentScan?.id) {
          setCurrentScan(foundScan);
        } else if (!foundScan) {
          // If the scan from the URL is not found (e.g., deleted), show an error state.
          setCurrentScan(null);
        }
      } else if (currentScan) {
        // If there is no scanId in the URL but there is a scan in the state,
        // it means the user has navigated away or clicked 'Scan Another'.
        // We set the state to null to show the uploader. This handles the back button case.
        setCurrentScan(null);
      } else if (currentScan === undefined) {
        // On initial load without a scan ID, set to null to show the uploader.
        setCurrentScan(null);
      }
    }
  }, [scanId, getScanById, isInitialized, currentScan]);


  const handleScanComplete = (scan: ScanResult) => {
    setCurrentScan(scan);
    // After a scan is complete, update the URL to reflect the new scan's ID.
    // This allows for sharing and bookmarking of results.
    router.push(`/scan?id=${scan.id}`, { scroll: false });
  };

  const handleScanAnother = () => {
    // When the user wants to scan another image, first set the state to null.
    // This immediately triggers the UI to switch to the ImageUploader component.
    setCurrentScan(null);
    // Then, update the URL to the base '/scan' path. This happens after the state change,
    // preventing a race condition where the useEffect might re-show the results.
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
  
  // Scan not found error when coming from a direct URL link
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
        {!currentScan ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ImageUploader onScanComplete={handleScanComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-6 text-center lg:text-left">Scan Result</h1>
            <ScanResults scan={currentScan} onScanAnother={handleScanAnother} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
