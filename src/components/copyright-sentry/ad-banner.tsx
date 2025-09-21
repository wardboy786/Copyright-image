import { Card } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-context';

// --- AdMob Configuration ---
// LIVE Ad Unit ID: ca-app-pub-8270549953677995/1980800386
//
// IMPORTANT: For development, always use AdMob's official test ad units.
// Using live ads during development is against AdMob policy.
// Test Ad Unit ID (Banner): ca-app-pub-3940256099942544/6300978111

const AD_UNIT_ID = 'ca-app-pub-8270549953677995/1980800386'; // Your live Ad Unit ID
const TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111'; // Official test ID

// --- Developer Instructions ---
// To see test ads, you would typically configure the AdMob plugin
// to use test mode. In a real Capacitor AdMob plugin, this might look like:
//
// import { AdMob } from '@capacitor-community/admob';
//
// async function showBanner() {
//   await AdMob.initialize({
//     requestTrackingAuthorization: true,
//     testingDevices: [], // Add your test device IDs here
//     isTesting: true, // This is the key for test mode
//   });
//
//   const options = {
//     adId: TEST_AD_UNIT_ID, // Use the test ID during development
//     adSize: 'BANNER',
//     position: 'BOTTOM_CENTER',
//     margin: 0,
//   };
//
//   await AdMob.showBanner(options);
// }
//
// This component remains a visual placeholder until the native
// Capacitor AdMob plugin is fully integrated.

export function AdBanner({ className }: { className?: string }) {
  const { isPremium } = useAppContext();
  
  if (isPremium) {
      return null;
  }

  return (
    <Card className={cn("bg-muted/50 rounded-none", className)}>
      <div className="p-2 flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground/70">Advertisement Placeholder</p>
        </div>
      </div>
    </Card>
  );
}
