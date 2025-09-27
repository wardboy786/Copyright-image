'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { purchaseService, type Product } from '@/services/purchaseService';
import { SplashScreen } from '@/components/layout/splash-screen';

interface PurchaseContextState {
  isInitialized: boolean;
  isLoading: boolean;
  isPremium: boolean;
  products: Product[];
  error: string | null;
  store: any | null; // The CdvPurchase.Store instance
}

const PurchaseContext = createContext<PurchaseContextState | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PurchaseContextState>({
    isInitialized: false,
    isLoading: true,
    isPremium: false,
    products: [],
    error: null,
    store: null,
  });

  const onStoreUpdate = useCallback((products: Product[], isPremium: boolean) => {
    console.log('PurchaseContext: Store updated', { products, isPremium });
    setState(prevState => ({
      ...prevState,
      products,
      isPremium,
      isLoading: false, // Stop loading once we have an update
    }));
  }, []);

  const onStoreError = useCallback((error: string) => {
    console.error('PurchaseContext: Store error', error);
    setState(prevState => ({
      ...prevState,
      error,
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // The service now handles its own singleton logic.
        // We just need to initialize it and set up our React-level listeners.
        const storeInstance = await purchaseService.initialize(onStoreUpdate, onStoreError);
        
        if (isMounted) {
            console.log('Purchase service initialized successfully.');
            const initialProducts = purchaseService.getProducts();
            const initialPremiumStatus = purchaseService.isOwned('photorights_monthly') || purchaseService.isOwned('photorights_yearly');

            setState(prevState => ({
              ...prevState,
              store: storeInstance,
              isInitialized: true,
              isLoading: false,
              products: initialProducts,
              isPremium: initialPremiumStatus,
            }));
        }
      } catch (e: any) {
        console.error('Failed to initialize purchase provider', e);
        if (isMounted) {
            setState(prevState => ({
              ...prevState,
              error: e.message || 'Initialization failed.',
              isLoading: false,
              isInitialized: true, // Mark as initialized even on failure to stop loading
            }));
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      // The service manages its own cleanup, so we don't need to call it here.
    };
  }, [onStoreUpdate, onStoreError]);

  // Show splash screen while the store is initializing
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
