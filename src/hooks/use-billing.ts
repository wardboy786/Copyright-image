'use client';
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { purchaseService } from '@/services/purchaseService';

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


export const MONTHLY_PLAN_ID = 'photorights_monthly';
export const YEARLY_PLAN_ID = 'photorights_yearly';

export const useBilling = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = useCallback(async () => {
    if (!purchaseService.isAvailable()) {
      setIsPremium(false);
      return false;
    }
    try {
        const premiumStatus = await purchaseService.isPremium();
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
      setIsLoading(true);
      if (!purchaseService.isAvailable()) {
        console.log('Billing not initialized: Not a native platform.');
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      try {
        const onProductUpdated = () => {
          checkPremiumStatus();
        };
        
        await purchaseService.initialize(onProductUpdated);
        
        const fetchedProducts = await purchaseService.getProducts([MONTHLY_PLAN_ID, YEARLY_PLAN_ID]);
        setProducts(fetchedProducts as Product[]);
        
        await checkPremiumStatus();
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
    if (!purchaseService.isAvailable()) {
      throw new Error('Purchases can only be made on a mobile device.');
    }
    try {
      await purchaseService.order(offer as any);
      await checkPremiumStatus();
    } catch (error) {
      console.error('Purchase failed', error);
      await checkPremiumStatus();
      throw error;
    }
  };

  const restorePurchases = async () => {
    if (!purchaseService.isAvailable()) {
      throw new Error('Purchases can only be restored on a mobile device.');
    }
    try {
      await purchaseService.restorePurchases();
      await checkPremiumStatus();
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
