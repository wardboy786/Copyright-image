'use client';

import { createContext, useContext } from 'react';
import { type UseScansReturn } from '@/hooks/use-scans';

export const AppContext = createContext<UseScansReturn | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
