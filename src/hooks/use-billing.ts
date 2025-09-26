'use client';
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { purchaseService, type Product } from '@/services/purchaseService';

export const MONTHLY_PLAN_ID = 'photorights_monthly';
export const YEARLY_PLAN_ID = 'photorights_yearly';

interface BillingState {
  products: Product[];
  isPremium: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const useBilling = () => {
  const [state, setState] = useState<BillingState>({
    products: [],
    isPremium: false,
    isLoading: true,
    isPurchasing: false,
    error: null,
    isInitialized: false,
  });

  const checkPremiumStatus = useCallback(async () => {
    if (!purchaseService.isAvailable()) {
      setState(prev => ({ ...prev, isPremium: false }));
      return;
    }
    try {
      const premiumStatus = await purchaseService.isPremium();
      setState(prev => ({ ...prev, isPremium: premiumStatus }));
    } catch (error: any) {
      console.error('Failed to check premium status', error);
      setState(prev => ({ ...prev, isPremium: false, error: error.message || 'Could not check premium status.' }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeBilling = async () => {
      if (!Capacitor.isNativePlatform()) {
        console.log('Billing not initialized: Not a native platform.');
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false, isInitialized: true, error: 'In-app purchases are only available on mobile devices.' }));
        }
        return;
      }
      
      try {
        const onProductUpdated = () => {
            if (!mounted) return;
            console.log('Product update triggered. Refreshing state.');
            const products = purchaseService.getProductsSync();
            const isPremium = purchaseService.isPremiumSync();
            
            setState(prev => ({ 
                ...prev, 
                products, 
                isPremium,
                isPurchasing: false,
            }));
        };

        const onInitError = (error: any) => {
            if (!mounted) return;
            console.error('Initialization error from service:', error);
            setState(prev => ({...prev, isLoading: false, error: error.message || 'Failed to initialize billing service.'}));
        }

        await purchaseService.initialize(onProductUpdated, onInitError);

        if (mounted) {
           const initialProducts = purchaseService.getProductsSync();
           const initialPremium = purchaseService.isPremiumSync();
           setState(prev => ({
               ...prev,
               products: initialProducts,
               isPremium: initialPremium,
               isLoading: false,
               isInitialized: true,
           }));
        }

      } catch (error: any) {
        console.error('Failed to initialize billing hook', error);
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false, error: error.message || 'An unknown error occurred during initialization.' }));
        }
      }
    };

    initializeBilling();

    return () => {
      mounted = false;
    };
  }, []);

  const purchase = async (offer: any) => {
    if (!state.isInitialized || !purchaseService.isAvailable()) {
      const errorMsg = 'Billing service is not initialized.';
      console.error(errorMsg);
      setState(prev => ({...prev, error: errorMsg}));
      return;
    }
    setState(prev => ({ ...prev, isPurchasing: true, error: null }));
    try {
      await purchaseService.order(offer);
    } catch (error: any) {
      console.error('Purchase failed', error);
      setState(prev => ({ ...prev, isPurchasing: false, error: error.message || 'An unknown error occurred during purchase.' }));
      // Let the caller handle re-throwing if needed
      throw error;
    }
  };

  const restorePurchases = async () => {
    if (!state.isInitialized || !purchaseService.isAvailable()) {
       const errorMsg = 'Billing service is not initialized.';
       console.error(errorMsg);
       setState(prev => ({...prev, error: errorMsg}));
       return;
    }
    setState(prev => ({...prev, isLoading: true, error: null}));
    try {
      await purchaseService.restorePurchases();
      // The onProductUpdated listener will handle the state update
    } catch (error: any) {
      console.error('Failed to restore purchases', error);
      setState(prev => ({ ...prev, error: error.message || 'Could not restore purchases.' }));
    } finally {
        // Give a moment for listeners to fire
        setTimeout(() => setState(prev => ({...prev, isLoading: false})), 1000);
    }
  };

  const getMonthlyPlan = useCallback(() => {
    return state.products.find(p => p.id === MONTHLY_PLAN_ID);
  }, [state.products]);

  const getYearlyPlan = useCallback(() => {
      return state.products.find(p => p.id === YEARLY_PLAN_ID);
  }, [state.products]);

  return {
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    isPremium: state.isPremium,
    isPurchasing: state.isPurchasing,
    error: state.error,
    products: state.products,
    purchase,
    restorePurchases,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
