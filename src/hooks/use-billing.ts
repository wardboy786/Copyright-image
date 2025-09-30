
'use client';
import { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product, type Offer } from '@/lib/types';
import { usePurchase } from '@/context/purchase-context';
import { toast } from './use-toast';

export const MONTHLY_PLAN_ID = 'photorights_monthly';
export const YEARLY_PLAN_ID = 'photorights_yearly';
export const MONTHLY_OFFER_ID = 'monthly-plan';
export const YEARLY_OFFER_ID = 'yearly-free';


export const useBilling = () => {
  const {
    isInitialized,
    isLoading: isContextLoading,
    isPremium,
    products,
    error,
  } = usePurchase();

  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
      if (!isContextLoading) {
          setIsLoading(false);
      }
  }, [isContextLoading]);
  
  useEffect(() => {
    const handleRestore = (event: Event) => {
        setIsLoading(false);
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


  const purchase = async (productId: string, offerId: string) => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const transaction = await purchaseService.order(productId, offerId);
       if (transaction) {
         // Purchase successful and verified by service
       } else {
        // This case is now for user cancellations, which are handled silently by the service.
        // We show a gentle toast here for feedback.
        toast({
            title: 'Purchase Canceled',
            description: 'The purchase process was not completed.',
        });
       }
      setIsLoading(false);
    } catch (e: any) {
      if (!e.message?.includes('USER_CANCELLED')) {
         toast({ title: 'Purchase Failed', description: e.message, variant: 'destructive' });
      }
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not ready. Please try again in a moment.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      toast({ title: 'Restoring Purchases...', description: 'Checking for your previous subscriptions.' });
      await purchaseService.restorePurchases();
    } catch (e: any) {
      toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
      setIsLoading(false);
    }
  };
  
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

  const clearError = () => {
    purchaseService.clearError();
  }

  const getMonthlyPlan = useCallback(() => {
    return products.find(p => p.id === MONTHLY_PLAN_ID);
  }, [products]);

  const getYearlyPlan = useCallback(() => {
    return products.find(p => p.id === YEARLY_PLAN_ID);
  }, [products]);

  return {
    isInitialized,
    isLoading: isContextLoading || isLoading,
    isPremium,
    isPurchasing: isLoading,
    error,
    products,
    purchase,
    restorePurchases,
    forceCheck,
    clearError,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
