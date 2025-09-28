
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
  
  // This effect will reset isPurchasing when the premium status changes
  useEffect(() => {
      if (isPremium) {
          setIsPurchasing(false);
      }
  }, [isPremium]);


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
      // Success is now handled by the service subscription in the context
    } catch (e: any) {
      console.error('Purchase failed in hook', e);
      toast({ title: 'Purchase Failed', description: e.message || 'An error occurred during purchase.', variant: 'destructive' });
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
      toast({ title: 'Restore Initialized', description: 'Checking for your previous purchases...' });
    } catch (e: any) {
      console.error('Failed to restore purchases', e);
      toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
    }
  };
  
   const forceCheck = async () => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    try {
      await purchaseService.forceCheck();
      toast({ title: 'Sync Complete', description: 'Your subscription status has been updated.' });
    } catch (e: any) {
      toast({ title: 'Sync Failed', description: e.message || 'Could not sync status.', variant: 'destructive' });
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
    forceCheck,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
