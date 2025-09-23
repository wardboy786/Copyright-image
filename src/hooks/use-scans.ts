'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ScanResult, type AnalyzeImageForCopyrightOutput } from '@/lib/types';
import { isToday } from 'date-fns';

export const MAX_FREE_SCANS = 5;
const SCANS_STORAGE_KEY = 'imagerights-ai-scans';
const PREMIUM_STORAGE_KEY = 'imagerights-ai-premium';
const EXTRA_SCANS_KEY = 'imagerights-ai-extra-scans';


export interface UseScansReturn {
  scans: ScanResult[];
  addScan: (imageData: string, analysisResult: AnalyzeImageForCopyrightOutput) => ScanResult;
  getScanById: (id: string) => ScanResult | undefined;
  todaysScanCount: number;
  isLimitReached: boolean;
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
  isInitialized: boolean;
  clearHistory: () => void;
  deleteScans: (ids: string[]) => void;
  scansToday: ScanResult[];
  grantExtraScan: () => void;
}

export function useScans(): UseScansReturn {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(true); // Default to premium
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [extraScans, setExtraScans] = useState<number>(0);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let storedScans: ScanResult[] = [];
    let storedPremium = true;
    let storedExtraScans = 0;

    try {
      const scansItem = localStorage.getItem(SCANS_STORAGE_KEY);
      if (scansItem) storedScans = JSON.parse(scansItem);
      
      const premiumItem = localStorage.getItem(PREMIUM_STORAGE_KEY);
       if (premiumItem !== null) storedPremium = JSON.parse(premiumItem);

      const extraScansItem = localStorage.getItem(EXTRA_SCANS_KEY);
      if (extraScansItem) {
          const parsedExtra = JSON.parse(extraScansItem);
          // Reset extra scans if the date is not today
          if (isToday(new Date(parsedExtra.date))) {
              storedExtraScans = parsedExtra.count;
          } else {
              localStorage.removeItem(EXTRA_SCANS_KEY);
          }
      }

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      // Clear corrupted data
      localStorage.removeItem(SCANS_STORAGE_KEY);
      localStorage.removeItem(PREMIUM_STORAGE_KEY);
      localStorage.removeItem(EXTRA_SCANS_KEY);
    }
    
    setScans(storedScans);
    setIsPremium(storedPremium);
    setExtraScans(storedExtraScans);
    setIsInitialized(true);
  }, []);

  const saveScans = useCallback((newScans: ScanResult[]) => {
    setScans(newScans);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(newScans));
    }
  }, []);
  
  const setPremiumStatus = useCallback((status: boolean) => {
    setIsPremium(status);
     if (typeof window !== 'undefined') {
      localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(status));
    }
  }, []);

  const grantExtraScan = useCallback(() => {
    setExtraScans(prev => {
        const newCount = prev + 1;
        if(typeof window !== 'undefined') {
            localStorage.setItem(EXTRA_SCANS_KEY, JSON.stringify({ count: newCount, date: new Date().toISOString()}));
        }
        return newCount;
    });
  }, []);

  const addScan = useCallback((imageData: string, analysisResult: AnalyzeImageForCopyrightOutput): ScanResult => {
    const newScan: ScanResult = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      image: imageData,
      analysis: analysisResult,
    };
    const updatedScans = [newScan, ...scans];
    saveScans(updatedScans);
    return newScan;
  }, [scans, saveScans]);

  const getScanById = useCallback((id: string): ScanResult | undefined => {
    return scans.find(scan => scan.id === id);
  }, [scans]);

  const scansToday = useMemo(() => {
    if (!isInitialized) return [];
    return scans.filter(scan => isToday(new Date(scan.timestamp)));
  }, [scans, isInitialized]);

  const todaysScanCount = scansToday.length;
  
  const isLimitReached = useMemo(() => {
    if (!isInitialized || isPremium) return false;
    // User has scans left if their daily count is less than the max OR they have extra scans from ads
    return todaysScanCount >= (MAX_FREE_SCANS + extraScans);
  }, [isPremium, todaysScanCount, isInitialized, extraScans]);

  const clearHistory = useCallback(() => {
    saveScans([]);
  }, [saveScans]);
  
  const deleteScans = useCallback((ids: string[]) => {
    const idsToDelete = new Set(ids);
    const updatedScans = scans.filter(scan => !idsToDelete.has(scan.id));
    saveScans(updatedScans);
  }, [scans, saveScans]);

  return { 
    scans, 
    addScan, 
    getScanById, 
    todaysScanCount: todaysScanCount - extraScans, // Display count relative to the base free scans
    isLimitReached, 
    isPremium, 
    setPremiumStatus,
    isInitialized,
    clearHistory,
    deleteScans,
    scansToday,
    grantExtraScan,
  };
}