'use client';

import { createContext, useContext } from 'react';
import { type UseScansReturn as UseScansReturnBase } from '@/hooks/use-scans';
import { type useBilling } from './use-billing';

// We remove the `billing` property from the base scans return type,
// as it's now handled by a separate context.
export interface UseScansReturn extends Omit<UseScansReturnBase, 'billing'> {}

export const AppContext = createContext<UseScansReturn | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
