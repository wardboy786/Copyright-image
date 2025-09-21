import { Card } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-context';

export function AdBanner({ className }: { className?: string }) {
  const { isPremium } = useAppContext();
  
  if (isPremium) {
      return null;
  }

  return (
    <Card className={cn("bg-muted/50 rounded-none", className)}>
      <div className="p-2 flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground/70">Advertisement</p>
        </div>
      </div>
    </Card>
  );
}
