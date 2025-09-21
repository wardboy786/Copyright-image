'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface RewardedAdDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdWatched: () => void;
}

const AD_WATCH_TIME = 3000; // 3 seconds

export function RewardedAdDialog({ open, onOpenChange, onAdWatched }: RewardedAdDialogProps) {
    const [adState, setAdState] = useState<'watching' | 'watched' | 'closed'>('watching');

    useEffect(() => {
        if (open) {
            setAdState('watching');
            const timer = setTimeout(() => {
                setAdState('watched');
            }, AD_WATCH_TIME);
            
            return () => clearTimeout(timer);
        }
    }, [open]);
    
    const handleClose = () => {
        onOpenChange(false);
        if (adState === 'watched') {
            onAdWatched();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Watch an Ad to Continue</DialogTitle>
                    <DialogDescription>
                        {adState === 'watching' 
                            ? "Please watch this short ad to earn one extra scan."
                            : "Thank you for watching! You've earned a scan."}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center h-48 bg-secondary rounded-md my-4">
                    {adState === 'watching' ? (
                        <div className="text-center text-muted-foreground">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                            <p>Simulating ad playback...</p>
                        </div>
                    ) : (
                        <div className="text-center text-primary">
                             <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                             <p className="font-bold">Reward Granted!</p>
                        </div>
                    )}
                </div>
                <Button onClick={handleClose} disabled={adState === 'watching'}>
                    {adState === 'watching' ? 'Please Wait...' : 'Claim Reward & Scan'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
