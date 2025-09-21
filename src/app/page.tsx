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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tighter">Copyright Sentry</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Your AI-powered guardian against image copyright infringement.
              </p>
            </div>
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
            <h1 className="text-3xl font-bold tracking-tight mb-6 text-center lg:text-left">Scan Result</h1>
            <ScanResults scan={latestScan} onScanAnother={handleScanAnother} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
