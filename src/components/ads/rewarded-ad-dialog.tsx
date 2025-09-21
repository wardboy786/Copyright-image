'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';

interface RewardedAdDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdWatched: () => void;
}

export function RewardedAdDialog({ open, onOpenChange, onAdWatched }: RewardedAdDialogProps) {
    
    const handleWatchAd = () => {
        // In a real app, you would trigger the AdMob SDK here.
        // The SDK's callback would then call onAdWatched().
        // For this placeholder, we'll call it directly.
        console.log("Simulating rewarded ad watch. Granting reward.");
        onAdWatched();
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Get an Extra Scan</DialogTitle>
                    <DialogDescription>
                        Watch a short video ad to earn one more free scan.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center h-32 bg-secondary rounded-md my-4">
                    <Film className="w-16 h-16 text-muted-foreground" />
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={handleWatchAd} className="w-full">
                        Watch Ad and Scan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
