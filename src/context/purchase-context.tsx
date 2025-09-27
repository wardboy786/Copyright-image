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
        const storeInstance = await purchaseService.initializeStore(
          (products, isPremium) => {
            if (isMounted) onStoreUpdate(products, isPremium);
          },
          (error) => {
            if (isMounted) onStoreError(error);
          }
        );
        
        if (isMounted) {
            console.log('Purchase service initialized successfully.');
            setState(prevState => ({
              ...prevState,
              store: storeInstance,
              isInitialized: true,
              isLoading: false,
              isPremium: storeInstance.owned('photorights_monthly') || storeInstance.owned('photorights_yearly'),
              products: storeInstance.products.map((p: any) => ({ ...p, offers: p.offers || [] })),
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
