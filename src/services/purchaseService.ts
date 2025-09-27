'use client';

// This is the safest way to declare the plugin types for TypeScript
declare global {
  interface Window {
    CdvPurchase: any;
  }
}

import {
  MONTHLY_PLAN_ID,
  YEARLY_PLAN_ID,
} from '@/hooks/use-billing';
import { Capacitor } from '@capacitor/core';

export type Product = {
  id: string;
  title: string;
  description: string;
  offers: any[];
};

// Add a flag to prevent re-initialization
let isInitialized = false;

class PurchaseService {
  public async initializeStore(
    onUpdate: (products: Product[], isPremium: boolean) => void,
    onError: (error: string) => void
  ): Promise<any> {
    
    // 1. Wait for the device to be ready.
    await new Promise<void>((resolve) => {
        if (Capacitor.isNativePlatform()) {
            document.addEventListener('deviceready', () => resolve());
        } else {
            resolve(); // Instantly resolve for web
        }
    });

    // 2. Check if the plugin is available.
    if (!Capacitor.isNativePlatform() || typeof window.CdvPurchase === 'undefined') {
      const errorMsg = 'In-app purchases are only available on a mobile device.';
      onError(errorMsg);
      throw new Error(errorMsg);
    }
    
    // --- SINGLETON GUARD ---
    // If the store is already initialized, return it immediately.
    if (isInitialized) {
        console.log("PurchaseService: Already initialized, skipping setup.");
        return window.CdvPurchase.store;
    }

    const store = window.CdvPurchase.store;
    const { ProductType, Platform, LogLevel } = window.CdvPurchase;

    // 3. Set up logging and error handling first.
    store.verbosity = LogLevel.DEBUG;
    store.error((err: unknown) => {
      console.error('Store Error:', JSON.stringify(err));
      // The plugin can sometimes throw an error for registering a callback twice.
      // We check for that specific string to prevent showing a confusing error to the user.
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      if (errorMessage.includes('REGISTERING THE SAME CALLBACK TWICE')) {
          console.warn('Store warning: Attempted to register a callback twice. This is handled gracefully.');
          return; // Suppress this specific error from going to the UI.
      }
      onError(`A store error occurred: ${errorMessage}`);
    });

    // 4. Register products.
    store.register([
      { id: MONTHLY_PLAN_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
      { id: YEARLY_PLAN_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
    ]);

    // 5. Set up the validator.
    store.validator = async (request: any, callback: (result: any) => void) => {
      try {
        const response = await fetch(`/api/validate-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageName: 'com.photorights.ai',
            productId: request.products[0].id,
            purchaseToken: request.transaction.purchaseToken,
          }),
        });

        const validationResult = await response.json();
        
        if (validationResult.isValid) {
          callback({ ok: true, data: validationResult });
        } else {
          callback({ ok: false, message: validationResult.error || 'Validation failed' });
        }
      } catch (error: any) {
        console.error('An error occurred during transaction verification:', error);
        callback({ ok: false, message: error.message || 'Unknown validation error' });
      }
    };

    // 6. Set up listeners for the purchase flow using the correct API.
    const refreshState = () => {
        const products = store.products.map((p: any) => ({ ...p, offers: p.offers || [] }));
        const isPremium = store.owned(MONTHLY_PLAN_ID) || store.owned(YEARLY_PLAN_ID);
        onUpdate(products, isPremium);
    };

    store.when('product').updated(refreshState);
    store.when('subscription').updated(refreshState);

    store.when('transaction')
      .approved((transaction: any) => {
        transaction.verify();
      })
      .verified((receipt: any) => {
        receipt.finish();
      })
      .finished(refreshState)
      .cancelled(refreshState);

    // 7. Finally, initialize the store.
    await store.initialize();
    
    // Set the flag to true after successful initialization
    isInitialized = true;
    console.log("PurchaseService: Initialization complete.");

    return store;
  }

  public async order(store: any, offer: any): Promise<void> {
    if (!store) throw new Error('Store not initialized');
    await store.order(offer);
  }

  public async restorePurchases(store: any): Promise<void> {
    if (!store) throw new Error('Store not initialized');
    await store.restorePurchases();
  }
}

export const purchaseService = new PurchaseService();