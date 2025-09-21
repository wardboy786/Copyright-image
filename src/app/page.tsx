'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { useScans } from '@/hooks/use-scans';
import { AdBanner } from '@/components/copyright-sentry/ad-banner';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const { isPremium } = useScans();

  const handleScanComplete = (scan: ScanResult) => {
    setLatestScan(scan);
  };

  const handleScanAnother = () => {
    setLatestScan(null);
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
            {!isPremium && <AdBanner className="mt-8" />}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">Scan Result</h2>
            <ScanResults scan={latestScan} onScanAnother={handleScanAnother} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
