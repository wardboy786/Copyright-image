
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';

interface PurchaseContextState {
  isInitialized: boolean;
  isLoading: boolean;
  isPremium: boolean;
  products: Product[];
  error: string | null;
}

const PurchaseContext = createContext<PurchaseContextState | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PurchaseContextState>({
    isInitialized: false,
    isLoading: true,
    isPremium: false,
    products: [],
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const handlePurchaseError = (event: Event) => {
        if (isMounted) {
            const customEvent = event as CustomEvent;
            setState(prevState => ({ ...prevState, error: customEvent.detail.error, isLoading: false }));
        }
    };

    const initialize = async () => {
      try {
        window.addEventListener('purchaseError', handlePurchaseError);

        const unsubscribe = purchaseService.subscribe((newState) => {
          if (isMounted) {
            setState(prevState => ({
              ...prevState,
              isPremium: newState.isPremium,
              products: newState.products,
              isLoading: false, 
              isInitialized: true, // Mark as initialized on first state update
            }));
          }
        });
        
        await purchaseService.initialize();

        return unsubscribe;

      } catch (e: any) {
        if (isMounted) {
            setState(prevState => ({
              ...prevState,
              error: e.message || 'Initialization failed.',
              isLoading: false,
              isInitialized: true,
            }));
        }
        return () => {};
      }
    };

    let unsubscribePromise = initialize();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsubscribe => unsubscribe());
      window.removeEventListener('purchaseError', handlePurchaseError);
    };
  }, []);

  return (
    <PurchaseContext.Provider value={state}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};
