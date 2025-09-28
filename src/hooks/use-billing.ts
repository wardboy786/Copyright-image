'use client';
import { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';
import { usePurchase } from '@/context/purchase-context';
import { toast } from './use-toast';

export const MONTHLY_PLAN_ID = 'photorights_monthly';
export const YEARLY_PLAN_ID = 'photorights_yearly';
export const MONTHLY_OFFER_ID = 'monthly-plan';
export const YEARLY_OFFER_ID = 'yearly-free';


export const useBilling = () => {
  const {
    isInitialized,
    isLoading,
    isPremium,
    products,
    error,
  } = usePurchase();

  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchase = async (productId: string, offerId: string) => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      console.error(errorMsg);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsPurchasing(true);
    try {
      await purchaseService.order(productId, offerId);
      // Success is now handled by event listeners in the context
    } catch (e: any) {
      console.error('Purchase failed in hook', e);
      toast({ title: 'Purchase Failed', description: e.message || 'An error occurred during purchase.', variant: 'destructive' });
    } finally {
      // It's safer to have the event listener set this to false
      // but as a fallback, we'll do it here.
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    if (!isInitialized) {
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
