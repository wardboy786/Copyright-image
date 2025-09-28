
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';
import { SplashScreen } from '@/components/layout/splash-screen';
import { logger } from '@/lib/in-app-logger';

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

    const initialize = async () => {
      try {
        // The subscription handles the initial state and all subsequent updates.
        const unsubscribe = purchaseService.subscribe((newState) => {
          if (isMounted) {
            logger.log('React Context: Received state update from service subscription.', newState);
            setState(prevState => ({
              ...prevState,
              isPremium: newState.isPremium,
              products: newState.products,
              isLoading: false, // No longer loading once we have state
            }));
          }
        });
        
        // Now, initialize the service. This will trigger the first state emission.
        await purchaseService.initialize();
        logger.log('React Context: Purchase service initialization requested.');

        if (isMounted) {
          setState(prevState => ({ ...prevState, isInitialized: true }));
        }

        return unsubscribe;

      } catch (e: any) {
        logger.log('❌ React Context: Failed to initialize purchase provider', e);
        if (isMounted) {
            setState(prevState => ({
              ...prevState,
              error: e.message || 'Initialization failed.',
              isLoading: false,
              isInitialized: true, // Mark as initialized even on error
            }));
        }
        // Return a no-op unsubscribe function
        return () => {};
      }
    };

    let unsubscribePromise = initialize();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, []);

  // Show splash screen while the store is initializing for the first time
  if (!state.isInitialized) {
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
