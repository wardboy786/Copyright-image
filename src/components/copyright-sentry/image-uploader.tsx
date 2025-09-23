'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/hooks/use-app-context';
import { type ScanResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2, Info, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { DailyLimitIndicator } from './daily-limit-indicator';
import Link from 'next/link';

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isUserCreated, setIsUserCreated] = useState(false);
  
  const { toast } = useToast();
  const { addScan, isLimitReached, isPremium } = useAppContext();

  const handleScan = async () => {
    if (!imageFile || !imagePreview) return;

    if (isLimitReached) {
      toast({
          title: 'Daily Limit Reached',
          description: 'Upgrade to Premium for unlimited scans.',
          variant: 'destructive',
        });
      return;
    }

    setIsLoading(true);
    const result = await analyzeImageAction(imageFile, isAiGenerated, isUserCreated);
    
    if (result.success) {
      const newScan = addScan(imagePreview, result.data);
      toast({
        title: 'Scan Complete!',
        description: 'Your image has been successfully analyzed.',
      });
      onScanComplete(newScan);
    } else {
      toast({
        title: 'Scan Failed',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };
  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (isLimitReached) {
        toast({
          title: 'Daily Limit Reached',
          description: 'Please upgrade to premium for unlimited scans.',
          variant: 'destructive'
        })
        return;
      }
      
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        setImagePreview(dataUri);
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
      setImagePreview(null);
      setImageFile(null);
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
                    isDragActive ? 'bg-primary/10 border-primary' : 'border-border/50 hover:bg-muted/50 hover:border-muted-foreground/20'
                    )}
                >
                    <input {...getInputProps()} />

                    <AnimatePresence>
                    {!imagePreview ? (
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
                            <Image src={imagePreview} alt="Image preview" fill className="object-contain" />
                         </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                 {imagePreview && (
                    <Button variant="destructive" size="icon" className="absolute top-6 right-6 z-10 rounded-full" onClick={reset}>
                        <X className="h-4 w-4"/>
                    </Button>
                 )}
            </CardContent>
        </Card>
        
        {isLimitReached && !isPremium && (
            <Card className="shadow-lg shadow-primary/10 bg-muted/30">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">Daily Limit Reached</h3>
                        <p className="text-muted-foreground text-sm mt-1">Upgrade to Premium for unlimited scans.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button asChild className="w-full sm:w-auto bg-primary/90 hover:bg-primary">
                            <Link href="/premium">
                                Upgrade Now
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}


        {!isLimitReached && (
            <>
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
                <div className="flex justify-center">
                    <Button size="lg" onClick={handleScan} disabled={!imageFile || isLoading} className="w-full max-w-sm rounded-full">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Start Scan
                    </Button>
                </div>
            </>
        )}
        <div className="pt-4">
            <DailyLimitIndicator/>
        </div>
    </div>
  );
}