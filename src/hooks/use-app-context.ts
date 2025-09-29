'use client';

import { createContext, useContext } from 'react';
import { type UseScansReturn as UseScansReturnBase } from '@/hooks/use-scans';

// We no longer need to Omit the billing property as it was already removed.
// This interface can just extend the base type directly.
export interface UseScansReturn extends UseScansReturnBase {}

export const AppContext = createContext<UseScansReturn | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
