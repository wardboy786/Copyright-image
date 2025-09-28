'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';
import { SplashScreen } from '@/components/layout/splash-screen';

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

    const handleStateUpdate = (event: Event) => {
      const { products, isPremium } = (event as CustomEvent).detail;
      console.log('React Context: Received purchaseStateUpdated event', { products, isPremium });
      if (isMounted) {
        setState(prevState => ({
          ...prevState,
          products,
          isPremium,
          isLoading: false, // Stop loading on first successful update
        }));
      }
    };
    
    const handleError = (event: Event) => {
        const { error } = (event as CustomEvent).detail;
        console.error('React Context: Received purchaseError event', { error });
        if (isMounted) {
            setState(prevState => ({
                ...prevState,
                error,
                isLoading: false,
            }));
        }
    };

    window.addEventListener('purchaseStateUpdated', handleStateUpdate);
    window.addEventListener('purchaseError', handleError);

    const initialize = async () => {
      try {
        await purchaseService.initialize();
        console.log('React Context: Purchase service initialization requested.');
        if (isMounted) {
            // Set initialized to true here. The isLoading flag will be handled by the event listener.
            setState(prevState => ({ ...prevState, isInitialized: true }));
        }
      } catch (e: any) {
        console.error('React Context: Failed to initialize purchase provider', e);
        if (isMounted) {
            setState(prevState => ({
              ...prevState,
              error: e.message || 'Initialization failed.',
              isLoading: false,
              isInitialized: true,
            }));
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      window.removeEventListener('purchaseStateUpdated', handleStateUpdate);
      window.removeEventListener('purchaseError', handleError);
    };
  }, []);

  // Show splash screen while the store is initializing for the first time
  if (state.isLoading) {
    return <SplashScreen onAnimationComplete={() => {}} />;
  }

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
