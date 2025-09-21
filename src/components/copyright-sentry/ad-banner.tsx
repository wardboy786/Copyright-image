import { Card } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export function AdBanner() {
  return (
    <Card className="bg-muted/50">
      <div className="p-4 flex items-center justify-center gap-4">
        <Megaphone className="w-6 h-6 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Advertisement</p>
          <p className="text-xs text-muted-foreground/70">Upgrade to Premium to remove ads.</p>
        </div>
      </div>
    </Card>
  );
}
