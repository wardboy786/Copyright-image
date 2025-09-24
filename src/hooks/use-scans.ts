'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ScanResult, type AnalyzeImageForCopyrightOutput } from '@/lib/types';
import { isToday } from 'date-fns';

export const MAX_FREE_SCANS = 5;
const INTERSTITIAL_AD_INTERVAL = 3;
const SCANS_STORAGE_KEY = 'imagerights-ai-scans';
const PREMIUM_STORAGE_KEY = 'imagerights-ai-premium';
const EXTRA_SCANS_KEY = 'imagerights-ai-extra-scans';
const INTERSTITIAL_COUNTER_KEY = 'imagerights-ai-interstitial-counter';


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
  shouldShowInterstitial: () => boolean;
  interstitialAdClosed: () => void;
}

export function useScans(): UseScansReturn {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(true); // Default to premium
  const [extraScans, setExtraScans] = useState<{ count: number; date: string } | null>(null);
  const [interstitialCounter, setInterstitialCounter] = useState(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let storedScans: ScanResult[] = [];
    let storedPremium = true;
    let storedExtraScans: { count: number; date: string } | null = null;
    let storedInterstitialCounter = 0;

    try {
      const scansItem = localStorage.getItem(SCANS_STORAGE_KEY);
      if (scansItem) storedScans = JSON.parse(scansItem);
      
      const premiumItem = localStorage.getItem(PREMIUM_STORAGE_KEY);
       if (premiumItem !== null) storedPremium = JSON.parse(premiumItem);

      const extraScansItem = localStorage.getItem(EXTRA_SCANS_KEY);
      if (extraScansItem) storedExtraScans = JSON.parse(extraScansItem);
      
      const interstitialCounterItem = localStorage.getItem(INTERSTITIAL_COUNTER_KEY);
      if (interstitialCounterItem) storedInterstitialCounter = JSON.parse(interstitialCounterItem);


    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      // Clear corrupted data
      localStorage.removeItem(SCANS_STORAGE_KEY);
      localStorage.removeItem(PREMIUM_STORAGE_KEY);
      localStorage.removeItem(EXTRA_SCANS_KEY);
      localStorage.removeItem(INTERSTITIAL_COUNTER_KEY);
    }
    
    setScans(storedScans);
    setIsPremium(storedPremium);
    setInterstitialCounter(storedInterstitialCounter);
    
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

    if (!isPremium) {
        const newCount = interstitialCounter + 1;
        setInterstitialCounter(newCount);
        localStorage.setItem(INTERSTITIAL_COUNTER_KEY, JSON.stringify(newCount));
    }

    return newScan;
  }, [scans, saveScans, isPremium, interstitialCounter]);

  const getScanById = useCallback((id: string): ScanResult | undefined => {
    return scans.find(scan => scan.id === id);
  }, [scans]);

  const scansToday = useMemo(() => {
    if (!isInitialized) return [];
    return scans.filter(scan => isToday(new Date(scan.timestamp)));
  }, [scans, isInitialized]);

  const todaysScanCount = scansToday.length;

  const totalAllowedScans = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let extra = 0;
    if (extraScans && extraScans.date === todayStr) {
      extra = extraScans.count;
    }
    return MAX_FREE_SCANS + extra;
  }, [extraScans]);
  
  const isLimitReached = useMemo(() => {
    if (!isInitialized || isPremium) return false;
    return todaysScanCount >= totalAllowedScans;
  }, [isPremium, todaysScanCount, isInitialized, totalAllowedScans]);

  const clearHistory = useCallback(() => {
    saveScans([]);
  }, [saveScans]);
  
  const deleteScans = useCallback((ids: string[]) => {
    const idsToDelete = new Set(ids);
    const updatedScans = scans.filter(scan => !idsToDelete.has(scan.id));
    saveScans(updatedScans);
  }, [scans, saveScans]);
  
  const grantExtraScan = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newExtraScans = {
      count: (extraScans?.date === todayStr ? extraScans.count : 0) + 1,
      date: todayStr,
    };
    setExtraScans(newExtraScans);
    localStorage.setItem(EXTRA_SCANS_KEY, JSON.stringify(newExtraScans));
  }, [extraScans]);

  const shouldShowInterstitial = useCallback(() => {
    if (isPremium) return false;
    return interstitialCounter >= INTERSTITIAL_AD_INTERVAL;
  }, [isPremium, interstitialCounter]);

  const interstitialAdClosed = useCallback(() => {
    setInterstitialCounter(0);
    localStorage.setItem(INTERSTITIAL_COUNTER_KEY, JSON.stringify(0));
  }, []);


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
    shouldShowInterstitial,
    interstitialAdClosed,
  };
}
