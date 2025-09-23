'use client';
import { useState, useEffect } from 'react';
import { ScanHistoryList } from '@/components/copyright-sentry/scan-history-list';
import { useAppContext } from '@/hooks/use-app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, X, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ScanResult } from '@/lib/types';

export default function HistoryPage() {
  const { scans: allScans = [], isInitialized, deleteScans } = useAppContext();
  const [displayedScans, setDisplayedScans] = useState<ScanResult[]>([]);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [isSelectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    // Delay rendering the list to prevent UI freezing on initial load
    if (isInitialized) {
      const timer = setTimeout(() => {
        setDisplayedScans(allScans);
      }, 50); // Small delay to allow navigation to complete
      return () => clearTimeout(timer);
    }
  }, [allScans, isInitialized]);


  const toggleSelection = (scanId: string) => {
    setSelection((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(scanId)) {
        newSelection.delete(scanId);
      } else {
        newSelection.add(scanId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selection.size === displayedScans.length) {
      setSelection(new Set());
    } else {
      setSelection(new Set(displayedScans.map((s) => s.id)));
    }
  };

  const handleDelete = () => {
    deleteScans(Array.from(selection));
    setSelection(new Set());
    setSelectionMode(false);
  };

  const cancelSelectionMode = () => {
    setSelection(new Set());
    setSelectionMode(false);
  };

  const startSelectionMode = (scanId: string) => {
    setSelectionMode(true);
    toggleSelection(scanId);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm -mx-4 -mt-4 px-4 py-2 border-b"
          >
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={cancelSelectionMode} size="icon">
                <X className="h-5 w-5" />
              </Button>
              <span className="font-semibold">{selection.size} selected</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleSelectAll} size="icon">
                  <CheckCheck className="h-5 w-5" />
                </Button>
                <Button variant="destructive" onClick={handleDelete} size="icon" disabled={selection.size === 0}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="p-4 md:p-6">
          {!isInitialized || displayedScans.length !== allScans.length ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScanHistoryList
              scans={displayedScans}
              selection={selection}
              isSelectionMode={isSelectionMode}
              onToggleSelection={toggleSelection}
              onStartSelectionMode={startSelectionMode}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
