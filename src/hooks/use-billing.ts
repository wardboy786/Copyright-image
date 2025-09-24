'use client';
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { CdvPurchase, Product, ProductType, Offer, Store, VerificationResult, Transaction } from 'capacitor-in-app-billing';

export const MONTHLY_PLAN_ID = 'monthly_premium';
export const YEARLY_PLAN_ID = 'yearly_premium';

export const useBilling = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = useCallback(async () => {
    try {
        const transactions = await CdvPurchase.store.ownedPurchases();
        const hasMonthly = transactions.some(t => t.products.some(p => p.id === MONTHLY_PLAN_ID) && t.isActive);
        const hasYearly = transactions.some(t => t.products.some(p => p.id === YEARLY_PLAN_ID) && t!.isActive);
        
        const premiumStatus = hasMonthly || hasYearly;
        setIsPremium(premiumStatus);
        return premiumStatus;
    } catch (error) {
        console.error('Failed to check for owned purchases', error);
        setIsPremium(false);
        return false;
    }
  }, []);

  const initializeBilling = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Billing not initialized: Not a native platform.');
      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    try {
      await CdvPurchase.store.initialize([
        {
          type: ProductType.PAID_SUBSCRIPTION,
          id: MONTHLY_PLAN_ID,
          platform: Store.GOOGLE_PLAY,
        },
        {
          type: ProductType.PAID_SUBSCRIPTION,
          id: YEARLY_PLAN_ID,
          platform: Store.GOOGLE_PLAY,
        },
      ]);

      const fetchedProducts = await CdvPurchase.store.getProducts([MONTHLY_PLAN_ID, YEARLY_PLAN_ID]);
      setProducts(fetchedProducts);

      CdvPurchase.store.when().verified((receipt) => {
        receipt.finish();
      }).unverified((receipt) => {
        console.warn('Purchase unverified');
        receipt.finish();
      }).productUpdated(() => {
        checkPremiumStatus();
      }).approved(async (transaction: Transaction) => {
        const isVerified = await transaction.verify();
        if (isVerified) {
          transaction.finish();
          await checkPremiumStatus();
        }
      });
      
      await checkPremiumStatus();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize billing', error);
    } finally {
        setIsLoading(false);
    }
  }, [checkPremiumStatus]);

  useEffect(() => {
    initializeBilling();
  }, [initializeBilling]);

  const purchase = async (offer: Offer) => {
    try {
      await CdvPurchase.store.order(offer);
    } catch (error) {
      console.error('Purchase failed', error);
      throw error;
    }
  };

  const restorePurchases = async () => {
    try {
      await CdvPurchase.store.restorePurchases();
      await checkPremiumStatus();
    } catch (error) {
      console.error('Failed to restore purchases', error);
      throw error;
    }
  };

  return {
    isInitialized,
    isLoading,
    isPremium,
    products,
    purchase,
    restorePurchases,
    getMonthlyPlan: () => products.find(p => p.id === MONTHLY_PLAN_ID),
    getYearlyPlan: () => products.find(p => p.id === YEARLY_PLAN_ID),
  };
};
