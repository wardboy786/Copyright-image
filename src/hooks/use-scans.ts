'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ScanResult, type AnalyzeImageForCopyrightOutput } from '@/lib/types';
import { isToday } from 'date-fns';

export const MAX_FREE_SCANS = 5;
export const MAX_REWARDED_SCANS = 15;
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
  rewardedScansUsed: number;
  isRewardedScansLimitReached: boolean;
  totalAllowedScans: number;
  startScan: (file: File, isAi: boolean, isUser: boolean, preview: string) => Promise<ScanResult | { error: string }>;
}

export function useScans(): UseScansReturn {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(true); // Default to premium
  const [extraScans, setExtraScans] = useState<{ count: number; date: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Load from local storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let storedScans: ScanResult[] = [];
    let storedPremium = true;
    let storedExtraScans: { count: number; date: string } | null = null;

    try {
      const scansItem = localStorage.getItem(SCANS_STORAGE_KEY);
      if (scansItem) storedScans = JSON.parse(scansItem);
      
      const premiumItem = localStorage.getItem(PREMIUM_STORAGE_KEY);
       if (premiumItem !== null) storedPremium = JSON.parse(premiumItem);

      const extraScansItem = localStorage.getItem(EXTRA_SCANS_KEY);
      if (extraScansItem) storedExtraScans = JSON.parse(extraScansItem);


    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      // Clear corrupted data
      localStorage.removeItem(SCANS_STORAGE_KEY);
      localStorage.removeItem(PREMIUM_STORAGE_KEY);
      localStorage.removeItem(EXTRA_SCANS_KEY);
    }
    
    setScans(storedScans);
    setIsPremium(storedPremium);
    
    // Reset extra scans if it's a new day
    if (storedExtraScans && isToday(new Date(storedExtraScans.date))) {
      setExtraScans(storedExtraScans);
    } else {
      localStorage.removeItem(EXTRA_SCANS_KEY);
      setExtraScans(null);
    }

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
    console.log(`Premium status set to: ${status}`);
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
  
  const startScan = useCallback(async (file: File, isAi: boolean, isUser: boolean, preview: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isAiGenerated', String(isAi));
      formData.append('isUserCreated', String(isUser));
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      const newScan = addScan(preview, result);
      return newScan;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { error: `Failed to analyze image: ${errorMessage}` };
    }
  }, [addScan]);


  const getScanById = useCallback((id: string): ScanResult | undefined => {
    return scans.find(scan => scan.id === id);
  }, [scans]);

  const scansToday = useMemo(() => {
    if (!isInitialized) return [];
    return scans.filter(scan => isToday(new Date(scan.timestamp)));
  }, [scans, isInitialized]);

  const todaysScanCount = scansToday.length;

  const rewardedScansUsed = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (extraScans && extraScans.date === todayStr) {
      return extraScans.count;
    }
    return 0;
  }, [extraScans]);

  const totalAllowedScans = useMemo(() => {
    return MAX_FREE_SCANS + rewardedScansUsed;
  }, [rewardedScansUsed]);
  
  const isLimitReached = useMemo(() => {
    if (!isInitialized || isPremium) return false;
    return todaysScanCount >= totalAllowedScans;
  }, [isPremium, todaysScanCount, isInitialized, totalAllowedScans]);

  const isRewardedScansLimitReached = useMemo(() => {
    return rewardedScansUsed >= MAX_REWARDED_SCANS;
  }, [rewardedScansUsed]);

  const clearHistory = useCallback(() => {
    saveScans([]);
  }, [saveScans]);
  
  const deleteScans = useCallback((ids: string[]) => {
    const idsToDelete = new Set(ids);
    const updatedScans = scans.filter(scan => !idsToDelete.has(scan.id));
    saveScans(updatedScans);
  }, [scans, saveScans]);
  
  const grantExtraScan = useCallback(() => {
    if (rewardedScansUsed >= MAX_REWARDED_SCANS) {
      console.log("Cannot grant extra scan, daily limit for rewarded scans reached.");
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const newExtraScans = {
      count: rewardedScansUsed + 1,
      date: todayStr,
    };
    setExtraScans(newExtraScans);
    localStorage.setItem(EXTRA_SCANS_KEY, JSON.stringify(newExtraScans));
  }, [rewardedScansUsed]);

  return { 
    scans, 
    addScan, 
    getScanById, 
    todaysScanCount: todaysScanCount,
    isLimitReached, 
    isPremium, 
    setPremiumStatus,
    isInitialized,
    clearHistory,
    deleteScans,
    scansToday,
    grantExtraScan,
    rewardedScansUsed,
    isRewardedScansLimitReached,
    totalAllowedScans,
    startScan,
  };
}
