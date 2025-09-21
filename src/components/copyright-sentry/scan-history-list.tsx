'use client';
import { type ScanResult } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileQuestion } from 'lucide-react';

interface ScanHistoryListProps {
  scans: ScanResult[];
}

export function ScanHistoryList({ scans }: ScanHistoryListProps) {
  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <FileQuestion className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="font-semibold">No Scan History</p>
        <p className="text-sm text-muted-foreground">Your past scans will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {scans.map((scan) => (
        <li key={scan.id}>
          <Link href={`/scan/${scan.id}`} className="block p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-4">
              <Image
                src={scan.image}
                alt="Scan thumbnail"
                width={48}
                height={48}
                className="rounded-md object-cover w-12 h-12 bg-card"
              />
              <div className="flex-1">
                <p className="font-medium text-sm truncate">
                  {scan.elements.length > 0 ? `${scan.elements.length} element(s) found` : 'No elements found'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
