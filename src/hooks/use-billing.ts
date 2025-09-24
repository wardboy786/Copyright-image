'use client';
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Re-define types locally to avoid Next.js build errors with non-module packages.
export type Product = {
  id: string;
  title: string;
  description: string;
  offers: Offer[];
  // ... other product properties
};

export type Offer = {
  id: string;
  price: {
      amount: number;
      formatted: string;
  };
  // ... other offer properties
};

export type Transaction = {
  products: { id: string }[];
  isActive: boolean;
  // ... other transaction properties
};

export type CdvPurchase = {
    store: any; // Simplified for this context
};


export const MONTHLY_PLAN_ID = 'monthly_premium';
export const YEARLY_PLAN_ID = 'yearly_premium';

export const useBilling = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = useCallback(async (store: any) => {
    if (!Capacitor.isNativePlatform()) {
      setIsPremium(false);
      return false;
    }
    try {
        const transactions: Transaction[] = await store.ownedPurchases();
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


  useEffect(() => {
    const initializeBilling = async () => {
        if (!Capacitor.isNativePlatform()) {
          console.log('Billing not initialized: Not a native platform.');
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        try {
          const { CdvPurchase, ProductType, Store } = await import('cordova-plugin-purchase');
          const store = CdvPurchase.store;
          
          store.initialize([
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
          
          const fetchedProducts = await store.getProducts([MONTHLY_PLAN_ID, YEARLY_PLAN_ID]);
          setProducts(fetchedProducts);

          store.when().verified((receipt: any) => {
            receipt.finish();
          }).unverified((receipt: any) => {
            console.warn('Purchase unverified');
            receipt.finish();
          }).productUpdated(() => {
            checkPremiumStatus(store);
          }).approved(async (transaction: any) => {
            const isVerified = await transaction.verify();
            if (isVerified) {
              transaction.finish();
              await checkPremiumStatus(store);
            }
          });
          
          await checkPremiumStatus(store);
        } catch (error) {
          console.error('Failed to initialize billing', error);
        } finally {
            setIsInitialized(true);
            setIsLoading(false);
        }
    };
    
    initializeBilling();
  }, [checkPremiumStatus]);

  const purchase = async (offer: Offer) => {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Purchases can only be made on a mobile device.');
    }
    try {
      const { CdvPurchase } = await import('cordova-plugin-purchase');
      await CdvPurchase.store.order(offer);
    } catch (error) {
      console.error('Purchase failed', error);
      throw error;
    }
  };

  const restorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Purchases can only be restored on a mobile device.');
    }
    try {
      const { CdvPurchase } = await import('cordova-plugin-purchase');
      await CdvPurchase.store.restorePurchases();
      await checkPremiumStatus(CdvPurchase.store);
    } catch (error) {
      console.error('Failed to restore purchases', error);
      throw error;
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
    products,
    purchase,
    restorePurchases,
    getMonthlyPlan,
    getYearlyPlan,
  };
};
