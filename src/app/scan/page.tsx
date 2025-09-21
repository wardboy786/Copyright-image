'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '@/hooks/use-app-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';


export default function ScanPage() {
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const { getScanById, isInitialized } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const scanId = searchParams.get('id');

  useEffect(() => {
    if (scanId && isInitialized) {
      const foundScan = getScanById(scanId);
      if (foundScan) {
        setLatestScan(foundScan);
      }
    }
  }, [scanId, getScanById, isInitialized]);


  const handleScanComplete = (scan: ScanResult) => {
    setLatestScan(scan);
    router.push(`/scan?id=${scan.id}`, { scroll: false });
  };

  const handleScanAnother = () => {
    setLatestScan(null);
    router.push('/scan', { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {!latestScan ? (
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
            <ScanResults scan={latestScan} onScanAnother={handleScanAnother} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
