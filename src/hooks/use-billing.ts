
'use client';
import { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { type Product } from '@/lib/types';
import { usePurchase } from '@/context/purchase-context';
import { toast } from './use-toast';
import { logger } from '@/lib/in-app-logger';

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

  const [isPurchasing, setIsPurchasing] = useState(false);
  
  useEffect(() => {
      if (!isContextLoading) {
          setIsPurchasing(false);
      }
  }, [isContextLoading]);


  const purchase = async (productId: string, offerId: string) => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      logger.log(`❌ ${errorMsg}`);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    setIsPurchasing(true);
    try {
      await purchaseService.order(productId, offerId);
      logger.log('✅ Purchase function completed successfully.');
    } catch (e: any) {
      logger.log('❌ Purchase failed in useBilling hook', e);
      // The specific error is now dispatched globally, but we can show a generic toast here.
      toast({ title: 'Purchase Failed', description: e.message || 'An unknown error occurred.', variant: 'destructive' });
      setIsPurchasing(false); // Ensure state is reset on error
    }
  };

  const restorePurchases = async () => {
    if (!isInitialized) {
      const errorMsg = 'Billing service is not initialized.';
      logger.log(`❌ ${errorMsg}`);
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      return;
    }
    try {
      await purchaseService.restorePurchases();
      toast({ title: 'Restore Initialized', description: 'Checking for your previous purchases...' });
    } catch (e: any) {
      logger.log('❌ Failed to restore purchases', e);
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
      toast({ title: 'Sync Started', description: 'Your subscription status is being updated...' });
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
