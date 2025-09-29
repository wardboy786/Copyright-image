
'use client';
import { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';
import { usePurchase } from '@/context/purchase-context';
import { toast } from './use-toast';
import { logger } from '@/lib/in-app-logger';

// Product and Offer IDs used throughout the app
export const MONTHLY_PLAN_ID = 'photorights_monthly';
export const YEARLY_PLAN_ID = 'photorights_yearly';
export const MONTHLY_OFFER_ID = 'monthly-plan';
export const YEARLY_OFFER_ID = 'yearly-free';


export const useBilling = () => {
  // Get the core state from our central React context
  const {
    isInitialized,
    isLoading: isContextLoading,
    isPremium,
    products,
    error,
  } = usePurchase();

  // Local state to manage the "purchasing..." status of the button
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // This effect ensures that the "isPurchasing" flag is correctly
  // reset after a purchase attempt, regardless of success or failure.
  useEffect(() => {
      // When the context is no longer loading, it means the purchase process has resolved.
      if (!isContextLoading) {
          setIsPurchasing(false);
      }
  }, [isContextLoading]);
  
  // Listen for restore events
  useEffect(() => {
    const handleRestore = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail.success) {
            toast({
                title: 'Purchases Restored',
                description: 'Your previous purchases have been successfully restored.',
            });
        } else {
            toast({
                title: 'Restore Failed',
                description: customEvent.detail.error || 'Could not find any previous purchases.',
                variant: 'destructive',
            });
        }
    };
    window.addEventListener('purchaseRestored', handleRestore);
    return () => {
        window.removeEventListener('purchaseRestored', handleRestore);
    };
  }, []);


  /**
   * Initiates a purchase.
   */
  const purchase = async (productId: string, offerId: string) => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      logger.log(`❌ ${errorMsg}`);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsPurchasing(true); // Set loading state for the UI
    try {
      await purchaseService.order(productId, offerId);
      logger.log('✅ Purchase function completed successfully.');
      // Don't set isPurchasing to false here. Let the useEffect handle it
      // based on the context's loading state.
    } catch (e: any) {
      logger.log('❌ Purchase failed in useBilling hook', e);
      // The specific error is dispatched globally, but we can show a generic toast.
      toast({ title: 'Purchase Failed', description: e.message || 'An unknown error occurred.', variant: 'destructive' });
      setIsPurchasing(false); // Ensure state is reset on any immediate error
    }
  };

  /**
   * Initiates the restore purchases flow.
   */
  const restorePurchases = async () => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      logger.log(`❌ ${errorMsg}`);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    try {
      await purchaseService.restorePurchases();
    } catch (e: any) {
      logger.log('❌ Failed to restore purchases', e);
      toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
    }
  };
  
  /**
   * Manually forces the service to check for updates.
   */
   const forceCheck = async () => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    try {
      await purchaseService.forceCheck();
      toast({ title: 'Sync Started', description: 'Your subscription status is being updated...' });
    } catch (e: any) {
      toast({ title: 'Sync Failed', description: e.message || 'Could not sync status.', variant: 'destructive' });
    }
  };

  // Memoized selectors for convenience
  const getMonthlyPlan = useCallback(() => {
    return products.find(p => p.id === MONTHLY_PLAN_ID);
  }, [products]);

  const getYearlyPlan = useCallback(() => {
    return products.find(p => p.id === YEARLY_PLAN_ID);
  }, [products]);

  return {
    isInitialized,
    isLoading: isContextLoading || isPurchasing,
    isPremium,
    isPurchasing,
    error,
    products,
    purchase,
    restorePurchases,
    forceCheck,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
