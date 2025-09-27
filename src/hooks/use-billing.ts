'use client';
import { useState, useEffect, useCallback } from 'react';
import { purchaseService, type Product } from '@/services/purchaseService';
import { usePurchase } from '@/context/purchase-context';
import { toast } from './use-toast';

export const MONTHLY_PLAN_ID = 'photorights_monthly';
export const YEARLY_PLAN_ID = 'photorights_yearly';

export const useBilling = () => {
  const {
    isInitialized,
    isLoading,
    isPremium,
    products,
    error,
    store,
  } = usePurchase();

  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchase = async (offer: any) => {
    if (!isInitialized || !store) {
      const errorMsg = 'Billing service is not initialized.';
      console.error(errorMsg);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsPurchasing(true);
    try {
      await purchaseService.order(offer);
    } catch (e: any) {
      // The error is handled by the listener in the context, but we catch here too
      console.error('Purchase failed in hook', e);
      // The user cancellation error for this plugin is code 6
      if (e?.code !== 6) {
        toast({ title: 'Purchase Failed', description: e.message || 'An error occurred during purchase.', variant: 'destructive' });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    if (!isInitialized || !store) {
      const errorMsg = 'Billing service is not initialized.';
      console.error(errorMsg);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    try {
      await purchaseService.restorePurchases();
      toast({ title: 'Restore Complete', description: 'Your purchases have been restored.' });
    } catch (e: any) {
      console.error('Failed to restore purchases', e);
      toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
    }
  };

  const getMonthlyPlan = useCallback(() => {
    return products.find(p => p.id === MONTHLY_PLAN_ID);
  }, [products]);

  const getYearlyPlan = useCallback(() => {
    return products.find(p => p.id === YEARLY_PLAN_ID);
  }, [products]);

  return {
    isInitialized,
    isLoading,
    isPremium,
    isPurchasing,
    error,
    products,
    purchase,
    restorePurchases,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
