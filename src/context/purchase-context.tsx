
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

    const handlePurchaseError = (event: Event) => {
        if (isMounted) {
            const customEvent = event as CustomEvent;
            logger.log('❌ React Context: Received purchaseError event', customEvent.detail);
            setState(prevState => ({ ...prevState, error: customEvent.detail.error, isLoading: false }));
        }
    };

    const initialize = async () => {
      try {
        window.addEventListener('purchaseError', handlePurchaseError);
        logger.log('🎧 React Context: purchaseError event listener added.');

        // Subscribe to the service. The callback will update our React state.
        const unsubscribe = purchaseService.subscribe((newState) => {
          if (isMounted) {
            logger.log('React Context: Received state update from service subscription.', newState);
            setState(prevState => ({
              ...prevState,
              isPremium: newState.isPremium,
              products: newState.products,
              isLoading: false, // Loading is done once we get our first state update
            }));
          }
        });
        
        // Start the service initialization
        await purchaseService.initialize();
        logger.log('React Context: Purchase service initialization requested.');

        // The service has started initializing. We can now show the main app.
        // The loading state will be handled by the subscription updates.
        if (isMounted) {
          setState(prevState => ({ ...prevState, isInitialized: true, error: null }));
        }

        // Return the unsubscribe function for cleanup
        return unsubscribe;

      } catch (e: any) {
        logger.log('❌ React Context: Failed to initialize purchase provider', e);
        if (isMounted) {
            // If initialization itself fails, update the state
            setState(prevState => ({
              ...prevState,
              error: e.message || 'Initialization failed.',
              isLoading: false,
              isInitialized: true, // Mark as initialized even on error to show the UI
            }));
        }
        return () => {}; // Return an empty function if init failed
      }
    };

    let unsubscribePromise = initialize();

    // Cleanup function
    return () => {
      isMounted = false;
      // When the component unmounts, call the unsubscribe function
      unsubscribePromise.then(unsubscribe => unsubscribe());
      window.removeEventListener('purchaseError', handlePurchaseError);
      logger.log('🎧 React Context: purchaseError event listener removed.');
    };
  }, []); // Empty dependency array ensures this runs only once

  // Show splash screen only until the context has started its initialization process
  if (!state.isInitialized) {
    return <SplashScreen onAnimationComplete={() => {}} />;
  }

  return (
    <PurchaseContext.Provider value={state}>
      {children}
    </PurchaseContext.Provider>
  );
};

// This is the hook that our UI components will use
export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};
