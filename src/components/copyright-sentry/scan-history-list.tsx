'use client';
import { type ScanResult } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileQuestion, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ScanHistoryListProps {
  scans: ScanResult[];
}

export function ScanHistoryList({ scans }: ScanHistoryListProps) {
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
        <li key={scan.id}>
          <Link href={`/scan/${scan.id}`} className="block">
            <Card className="p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <Image
                  src={scan.image}
                  alt="Scan thumbnail"
                  width={48}
                  height={48}
                  className="rounded-md object-cover w-12 h-12 bg-card-foreground/5"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">
                    {scan.analysis.breakdown.length > 0 ? `${scan.analysis.breakdown.length} element(s) found` : 'No elements found'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
