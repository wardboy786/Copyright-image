'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ScanResult, type AnalyzeImageForCopyrightOutput } from '@/lib/types';
import { format } from 'date-fns';

const MAX_FREE_SCANS = 5;
const SCANS_STORAGE_KEY = 'copyright-sentry-scans';
const PREMIUM_STORAGE_KEY = 'copyright-sentry-premium';

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
}

export function useScans(): UseScansReturn {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(true); // Default to premium
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedScans = localStorage.getItem(SCANS_STORAGE_KEY);
        if (storedScans) {
          setScans(JSON.parse(storedScans));
        }
        // We check if a value is explicitly saved in localStorage, otherwise we keep the default.
        const storedPremium = localStorage.getItem(PREMIUM_STORAGE_KEY);
        if (storedPremium !== null) {
          setIsPremium(JSON.parse(storedPremium));
        }
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
      } finally {
        setIsInitialized(true);
      }
    }
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

  const todaysScanCount = useMemo(() => {
    if (!isInitialized) return 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    return scans.filter(scan => format(new Date(scan.timestamp), 'yyyy-MM-dd') === today).length;
  }, [scans, isInitialized]);

  const isLimitReached = useMemo(() => {
    if (!isInitialized) return false;
    return !isPremium && todaysScanCount >= MAX_FREE_SCANS;
  }, [isPremium, todaysScanCount, isInitialized]);

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
    todaysScanCount, 
    isLimitReached, 
    isPremium, 
    setPremiumStatus,
    isInitialized,
    clearHistory,
    deleteScans
  };
}
