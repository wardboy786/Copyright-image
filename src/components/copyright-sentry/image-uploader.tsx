'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useScans } from '@/hooks/use-scans';
import { type ScanResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileWarning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

interface ImageUploaderProps {
  onScanComplete: (scan: ScanResult) => void;
}

export function ImageUploader({ onScanComplete }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addScan, isLimitReached, isInitialized, isPremium } = useScans();

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
    [addScan, onScanComplete, toast, isLimitReached]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/gif': [], 'image/svg+xml': [] },
    multiple: false,
    disabled: isLoading || isLimitReached,
  });

  return (
    <Card className="relative overflow-hidden">
      <Image
        src="https://picsum.photos/seed/1/1200/800"
        alt="Abstract background"
        fill
        className="object-cover opacity-10"
        data-ai-hint="abstract technology"
      />
      <CardContent className={cn('relative z-10 p-6 flex items-center justify-center min-h-[300px]', (isLoading || isLimitReached) && 'pointer-events-none')}>
        <div
          {...getRootProps()}
          className={cn(
            'w-full h-full border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center p-8 text-center cursor-pointer',
            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
            (isLoading || isLimitReached) && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-semibold text-lg">Analyzing Image...</p>
              <p className="text-muted-foreground">This may take a few moments.</p>
            </>
          ) : isLimitReached ? (
            <>
               <FileWarning className="w-12 h-12 text-destructive mb-4" />
              <p className="font-semibold text-lg">Daily Limit Reached</p>
              <p className="text-muted-foreground">
                {!isPremium ? 'Upgrade to Premium for unlimited scans.' : ''}
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-primary mb-4" />
              <p className="font-semibold text-lg">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
              </p>
              <p className="text-muted-foreground">or</p>
              <Button variant="outline" className="mt-4" disabled={isLoading || isLimitReached}>
                Select Image
              </Button>
               <p className="text-xs text-muted-foreground mt-4">Supports: PNG, JPG, GIF, SVG</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
