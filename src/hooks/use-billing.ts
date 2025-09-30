
'use client';
import { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';
import { usePurchase } from '@/context/purchase-context';
import { toast } from './use-toast';

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

  // Local state to manage the "purchasing..." or "restoring..." status of buttons
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
      // If the context is no longer loading, our local loading state should also reset.
      if (!isContextLoading) {
          setIsLoading(false);
      }
  }, [isContextLoading]);
  
  // Listen for restore events to show toasts
  useEffect(() => {
    const handleRestore = (event: Event) => {
        setIsLoading(false); // Stop loading indicator on restore completion
        const customEvent = event as CustomEvent;
        if (customEvent.detail.success) {
            toast({
                title: 'Purchases Restored',
                description: 'Your premium status has been updated.',
            });
        } else {
            toast({
                title: 'Restore Failed',
                description: customEvent.detail.error || 'Could not find any previous purchases to restore.',
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
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsLoading(true); // Set loading state for the UI
    try {
      const transaction = await purchaseService.order(productId, offerId);
       if (!transaction) {
        toast({
            title: 'Purchase Canceled',
            description: 'The purchase process was not completed.',
        });
      }
      setIsLoading(false);
    } catch (e: any) {
      // The service now handles dispatching the error event, so we just stop loading.
      setIsLoading(false);
    }
  };

  /**
   * Initiates the restore purchases flow.
   */
  const restorePurchases = async () => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not ready. Please try again in a moment.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsLoading(true); // Set loading for UI feedback
    try {
      toast({ title: 'Restoring Purchases...', description: 'Checking for your previous subscriptions.' });
      await purchaseService.restorePurchases();
    } catch (e: any) {
      toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
      setIsLoading(false); // Reset loading on error
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
    setIsLoading(true);
    try {
      await purchaseService.forceCheck();
      toast({ title: 'Sync Started', description: 'Your subscription status is being updated...' });
    } catch (e: any) {
      toast({ title: 'Sync Failed', description: e.message || 'Could not sync status.', variant: 'destructive' });
      setIsLoading(false);
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
    isLoading: isContextLoading || isLoading, // Combine context loading with local loading
    isPremium,
    isPurchasing: isLoading, // A more specific name for purchase button
    error,
    products,
    purchase,
    restorePurchases,
    forceCheck,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
