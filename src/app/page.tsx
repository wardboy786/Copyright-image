'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/copyright-sentry/image-uploader';
import { ScanResults } from '@/components/copyright-sentry/scan-results';
import { type ScanResult } from '@/lib/types';
import { AdBanner } from '@/components/copyright-sentry/ad-banner';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app-context';

export default function Home() {
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const { isPremium } = useAppContext();

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
            <div className="text-center mb-8 pt-4">
              <div className="flex justify-center items-center mb-4">
                <ShieldCheck className="w-16 h-16 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tighter">ImageRights AI</h1>
              <p className="text-muted-foreground text-lg mt-2 max-w-md mx-auto">
                Your AI-powered guardian against image copyright infringement.
              </p>
            </div>
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
