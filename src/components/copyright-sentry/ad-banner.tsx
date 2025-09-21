'use client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-context';
import { useEffect } from 'react';
import { AdMobService } from '@/services/admob';

export function AdBanner({ className }: { className?: string }) {
  const { isPremium } = useAppContext();

  useEffect(() => {
    if (!isPremium) {
      AdMobService.getInstance().showBanner().catch(err => {
        console.error("Error showing banner:", err);
      });
    } else {
      AdMobService.getInstance().hideBanner().catch(err => {
        console.error("Error hiding banner:", err);
      });
    }
    
    // Cleanup on component unmount
    return () => {
      AdMobService.getInstance().hideBanner().catch(err => {
          console.error("Error hiding banner on cleanup:", err);
      });
    };
  }, [isPremium]);
  
  if (isPremium) {
      return null;
  }

  // This component is now only a placeholder for the space the ad will occupy.
  // The native plugin will display the ad over the app content.
  return (
    <div className={cn("h-[50px] bg-transparent flex items-center justify-center", className)}>
        <p className="text-xs text-muted-foreground/50">Ad Placeholder</p>
    </div>
  );
}
