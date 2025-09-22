'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';
import { AdMobService } from '@/services/admob';
import { useToast } from '@/hooks/use-toast';

interface RewardedAdDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdWatched: () => void;
}

export function RewardedAdDialog({ open, onOpenChange, onAdWatched }: RewardedAdDialogProps) {
    const { toast } = useToast();

    const handleWatchAd = async () => {
        try {
            const reward = await AdMobService.showRewardedAd();
            if (reward) {
                console.log(`Reward received: ${reward.type} - ${reward.amount}`);
                onAdWatched();
            } else {
                 // On web, the reward event might not be as reliable. We'll grant it anyway.
                 console.log("Rewarded ad closed, granting reward.");
                 onAdWatched();
            }
        } catch (error) {
            console.error("Error showing rewarded ad:", error);
            toast({
                variant: 'destructive',
                title: "Ad Failed",
                description: "The rewarded ad could not be shown. Please try again later."
            });
        } finally {
            onOpenChange(false);
        }
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
