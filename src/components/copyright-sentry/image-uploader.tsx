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
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

const MAX_FREE_SCANS = 5;

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4 text-center p-8"
    >
      <Loader2 className="w-12 h-12 animate-spin text-accent" />
      <p className="font-semibold text-xl text-foreground mt-4">Analyzing Your Image</p>
      <p className="text-muted-foreground">This may take a few moments. We're checking for copyright details...</p>
    </motion.div>
  );
}

export function ImageUploader({ onScanComplete }: { onScanComplete: (scan: ScanResult) => void; }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addScan, isLimitReached, isPremium, todaysScanCount, isInitialized } = useScans();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isLimitReached) {
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
              title: 'Scan Complete!',
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
    [addScan, onScanComplete, toast, isLimitReached]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/gif': [], 'image/svg+xml': [] },
    multiple: false,
    disabled: isLoading || isLimitReached,
  });

  const progressValue = (todaysScanCount / MAX_FREE_SCANS) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl shadow-primary/5">
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Loader key="loader" />
          ) : (
            <motion.div key="uploader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                {...getRootProps()}
                className={cn(
                  'w-full rounded-t-lg transition-colors flex flex-col items-center justify-center p-8 sm:p-12 text-center cursor-pointer min-h-[300px] border-4 border-dashed border-border/50',
                  isDragActive ? 'bg-primary/10 border-accent/50' : 'hover:bg-primary/5',
                  (isLoading || isLimitReached) && 'cursor-not-allowed opacity-60'
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-accent/10 p-4 rounded-full border border-accent/20">
                    <UploadCloud className="w-10 h-10 text-accent" />
                  </div>
                  <p className="font-semibold text-xl md:text-2xl mt-4">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
                  </p>
                  <p className="text-muted-foreground text-sm">or click to select a file</p>
                  <p className="text-xs text-muted-foreground/70 mt-4">Supports: PNG, JPG, GIF, SVG</p>
                </div>
              </div>
              {!isPremium && isInitialized && (
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-medium text-muted-foreground">Daily Free Scans</span>
                    <span className="font-bold">{todaysScanCount} / {MAX_FREE_SCANS}</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                  {isLimitReached && (
                     <div className="text-center mt-3">
                        <p className="text-sm text-destructive font-semibold">Daily limit reached.</p>
                         <Button variant="link" asChild className="h-auto p-0 text-sm">
                            <Link href="/premium">Upgrade to Premium</Link>
                         </Button>
                     </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
