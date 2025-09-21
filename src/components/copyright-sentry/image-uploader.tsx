'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useScans } from '@/hooks/use-scans';
import { type ScanResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileWarning, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DailyLimitIndicator } from './daily-limit-indicator';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageUploaderProps {
  onScanComplete: (scan: ScanResult) => void;
}

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4 text-center"
    >
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <p className="font-semibold text-lg text-foreground">Analyzing Image...</p>
      <p className="text-muted-foreground">This may take a few moments.</p>
    </motion.div>
  );
}

export function ImageUploader({ onScanComplete }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addScan, isLimitReached, isPremium } = useScans();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (limitReached) {
        toast({
          title: 'Daily Limit Reached',
          description: 'Upgrade to Premium for unlimited scans.',
          variant: 'destructive',
        });
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const photoDataUri = event.target?.result as string;
        if (photoDataUri) {
          const result = await analyzeImageAction(photoDataUri);
          if (result.success && result.data) {
            const newScan = addScan(photoDataUri, result.data);
            onScanComplete(newScan);
            toast({
              title: 'Scan Complete',
              description: 'Your image has been successfully analyzed.',
            });
          } else {
            toast({
              title: 'Scan Failed',
              description: result.error || 'An unknown error occurred.',
              variant: 'destructive',
            });
          }
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [addScan, onScanComplete, toast, isLimitReached, isPremium]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/gif': [], 'image/svg+xml': [] },
    multiple: false,
    disabled: isLoading || (!isPremium && isLimitReached),
  });
  
  const limitReached = !isPremium && isLimitReached;

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300">
      <CardContent className="relative z-10 p-6 flex items-center justify-center min-h-[350px]">
        <div
          {...getRootProps()}
          className={cn(
            'w-full h-full rounded-lg transition-colors flex flex-col items-center justify-center p-8 text-center cursor-pointer',
            isDragActive && 'bg-primary/10',
            (isLoading || limitReached) && 'cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {isLoading ? (
              <Loader key="loader" />
            ) : limitReached ? (
              <motion.div
                key="limit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <FileWarning className="w-12 h-12 text-destructive mb-4" />
                <p className="font-semibold text-lg">Daily Limit Reached</p>
                <p className="text-muted-foreground">
                  Upgrade to Premium for unlimited scans.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <UploadCloud className="w-12 h-12 text-primary mb-4" />
                <p className="font-semibold text-lg">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
                </p>
                <p className="text-muted-foreground">or</p>
                <Button variant="outline" className="mt-4" disabled={isLoading || limitReached}>
                  Select Image
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Supports: PNG, JPG, GIF, SVG</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      {!isPremium && <DailyLimitIndicator />}
    </Card>
  );
}
