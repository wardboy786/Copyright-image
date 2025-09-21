'use client';
import { type ScanResult } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileQuestion } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useLongPress } from '@/hooks/use-long-press';

interface ScanHistoryListProps {
  scans: ScanResult[];
  selection: Set<string>;
  isSelectionMode: boolean;
  onToggleSelection: (scanId: string) => void;
  onStartSelectionMode: (scanId: string) => void;
}

export function ScanHistoryList({
  scans,
  selection,
  isSelectionMode,
  onToggleSelection,
  onStartSelectionMode,
}: ScanHistoryListProps) {
  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <FileQuestion className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold">No Scan History</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your past image scans will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {scans.map((scan) => (
        <ScanHistoryItem
          key={scan.id}
          scan={scan}
          isSelected={selection.has(scan.id)}
          isSelectionMode={isSelectionMode}
          onToggleSelection={onToggleSelection}
          onStartSelectionMode={onStartSelectionMode}
        />
      ))}
    </ul>
  );
}

interface ScanHistoryItemProps {
  scan: ScanResult;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (scanId: string) => void;
  onStartSelectionMode: (scanId: string) => void;
}

function ScanHistoryItem({
  scan,
  isSelected,
  isSelectionMode,
  onToggleSelection,
  onStartSelectionMode
}: ScanHistoryItemProps) {
  const breakdown = scan.analysis?.breakdown || [];
  const longPressEvents = useLongPress(() => {
    if (!isSelectionMode) {
      onStartSelectionMode(scan.id);
    }
  }, 500);

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelection(scan.id);
    }
  };
  
  const content = (
    <div
      {...longPressEvents}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-4 w-full p-3 transition-colors",
        isSelected ? "bg-primary/20" : "hover:bg-muted/50"
      )}
    >
      {isSelectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(scan.id)}
          className="h-5 w-5"
          aria-label="Select scan"
        />
      )}
      <Image
        src={scan.image}
        alt="Scan thumbnail"
        width={48}
        height={48}
        className="rounded-md object-cover w-12 h-12 bg-card-foreground/5"
        loading="lazy"
      />
      <div className="flex-1">
        <p className="font-medium text-sm truncate">
          {breakdown.length > 0 ? `${breakdown.length} element(s) found` : 'No elements found'}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  return (
    <li>
      <Card className="overflow-hidden">
        {isSelectionMode ? (
          <div className="cursor-pointer">
            {content}
          </div>
        ) : (
          <Link href={`/scan/${scan.id}`} className="block">
            {content}
          </Link>
        )}
      </Card>
    </li>
  );
}
