'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/hooks/use-app-context';
import { type ScanResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Info, Film, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RewardedAdDialog } from '@/components/copyright-sentry/rewarded-ad-dialog';
import Image from 'next/image';

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 text-center p-8 bg-background/80 backdrop-blur-sm"
    >
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="font-semibold text-xl text-foreground mt-4">Analyzing Your Image</p>
      <p className="text-muted-foreground">This may take a few moments...</p>
    </motion.div>
  );
}

export function ImageUploader({ onScanComplete }: { onScanComplete: (scan: ScanResult) => void; }) {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  
  const { toast } = useToast();
  const { addScan, isLimitReached } = useAppContext();

  const handleScan = async (isFreeScan: boolean = false) => {
    if (!image) return;

    if (isLimitReached && !isFreeScan) {
      toast({
          title: 'Daily Limit Reached',
          description: 'Watch an ad to get one more scan.',
          variant: 'destructive',
        });
      return;
    }

    setIsLoading(true);
    const result = await analyzeImageAction({
      photoDataUri: image,
      isAiGenerated,
      isUserCreated
    });
    
    if (result.success) {
      const newScan = addScan(image, result.data);
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
    setIsLoading(false);
  };

  const handleRewardedAdComplete = () => {
    // A scan is initiated, and we consider this the "free" one.
    handleScan(true);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (isLimitReached) {
        toast({
          title: 'Daily Limit Reached',
          description: 'Watch an ad for one more scan.',
          variant: 'destructive'
        })
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const photoDataUri = event.target?.result as string;
        setImage(photoDataUri);
      };
      reader.readAsDataURL(file);
    },
    [isLimitReached, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/gif': [], 'image/svg+xml': [] },
    multiple: false,
    disabled: isLoading,
  });
  
  const reset = () => {
      setImage(null);
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card className="shadow-xl shadow-primary/10 relative overflow-hidden">
            <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
            <CardContent className={cn("p-4 sm:p-6", isLoading && 'blur-sm')}>
                <div
                    {...getRootProps()}
                    className={cn(
                    'w-full rounded-lg transition-colors flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[250px] border-4 border-dashed relative overflow-hidden',
                    isDragActive ? 'bg-primary/10 border-primary' : 'border-border/50 hover:bg-muted/50 hover:border-muted-foreground/20',
                    isLimitReached && !image && 'cursor-not-allowed opacity-60'
                    )}
                >
                    <input {...getInputProps()} />

                    <AnimatePresence>
                    {!image ? (
                        <motion.div
                            key="placeholder"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="bg-primary/10 p-4 rounded-full border-8 border-background">
                                <UploadCloud className="w-10 h-10 text-primary" />
                            </div>
                            <p className="font-semibold text-xl md:text-2xl mt-4">
                                {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
                            </p>
                            <p className="text-muted-foreground text-sm">or click to select a file</p>
                            <p className="text-xs text-muted-foreground/70 mt-4">Supports: PNG, JPG, GIF, SVG</p>
                        </motion.div>
                    ) : (
                         <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Image src={image} alt="Image preview" fill className="object-contain" />
                         </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                 {image && (
                    <Button variant="destructive" size="icon" className="absolute top-6 right-6 z-10 rounded-full" onClick={reset}>
                        <X className="h-4 w-4"/>
                    </Button>
                 )}
            </CardContent>
        </Card>

        <Card className="shadow-lg shadow-primary/10">
            <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="ai-generated" className="font-semibold">Is this image AI-generated?</Label>
                </div>
                <Switch
                    id="ai-generated"
                    checked={isAiGenerated}
                    onCheckedChange={setIsAiGenerated}
                />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="user-created" className="font-semibold">Did you create this image?</Label>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Info className="w-4 h-4"/>Includes generating it with AI prompts.</p>
                </div>
                <Switch
                    id="user-created"
                    checked={isUserCreated}
                    onCheckedChange={setIsUserCreated}
                />
                </div>
            </CardContent>
        </Card>

        {isLimitReached ? (
            <div className="flex justify-center">
                <Button size="lg" onClick={() => setShowRewardedAd(true)} disabled={!image} className="w-full max-w-sm rounded-full">
                    <Film className="mr-2 h-4 w-4" />
                    Watch Ad to Scan
                </Button>
            </div>
        ) : (
            <div className="flex justify-center">
                <Button size="lg" onClick={() => handleScan()} disabled={!image || isLoading} className="w-full max-w-sm rounded-full">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Start Scan
                </Button>
            </div>
        )}

      <RewardedAdDialog 
        open={showRewardedAd}
        onOpenChange={setShowRewardedAd}
        onAdWatched={handleRewardedAdComplete}
      />
    </div>
  );
}
