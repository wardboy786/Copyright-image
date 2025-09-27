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

class PurchaseService {
  private static instance: PurchaseService;
  private store: any;
  private isInitializing = false;
  private isInitialized = false;
  private initPromise: Promise<any> | null = null;
  
  private onUpdate: ((products: Product[], isPremium: boolean) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  // Private constructor to enforce singleton pattern
  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  public initialize(
    onUpdate: (products: Product[], isPremium: boolean) => void,
    onError: (error: string) => void
  ): Promise<any> {
    this.onUpdate = onUpdate;
    this.onError = onError;

    if (this.isInitialized) {
      console.log('PurchaseService: Already initialized.');
      return Promise.resolve(this.store);
    }

    if (this.isInitializing && this.initPromise) {
      console.log('PurchaseService: Initialization in progress, returning existing promise.');
      return this.initPromise;
    }

    console.log('PurchaseService: Starting initialization.');
    this.isInitializing = true;
    this.initPromise = this.performInitialization();
    
    return this.initPromise;
  }
  
  private async performInitialization(): Promise<any> {
     try {
        await new Promise<void>((resolve) => {
            if (Capacitor.isNativePlatform()) {
                document.addEventListener('deviceready', () => resolve(), { once: true });
            } else {
                resolve();
            }
        });

        if (!Capacitor.isNativePlatform() || typeof window.CdvPurchase === 'undefined') {
          const errorMsg = 'In-app purchases are only available on a mobile device.';
          this.onError?.(errorMsg);
          throw new Error(errorMsg);
        }

        this.store = window.CdvPurchase.store;
        const { ProductType, Platform, LogLevel } = window.CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;
        
        this.store.error((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
             if (!errorMessage.includes('REGISTERING THE SAME CALLBACK TWICE')) {
                  console.error('Store Error:', errorMessage);
                  this.onError?.(`A store error occurred: ${errorMessage}`);
              } else {
                  console.warn('Store warning: Attempted to register a callback twice. This is handled gracefully.');
              }
        });

        this.store.register([
          { id: MONTHLY_PLAN_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
          { id: YEARLY_PLAN_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        ]);
        
        this.setupListeners();

        this.store.validator = async (request: any, callback: (result: any) => void) => {
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
                callback({ ok: validationResult.isValid, data: validationResult });
            } catch (error: any) {
                callback({ ok: false, message: error.message || 'Unknown validation error' });
            }
        };

        await this.store.initialize();
        this.isInitialized = true;
        this.isInitializing = false;
        console.log("PurchaseService: Initialization complete.");
        return this.store;

     } catch (error: any) {
        console.error('PurchaseService: Initialization failed.', error);
        this.isInitializing = false;
        this.initPromise = null;
        this.onError?.(error.message || 'An unknown initialization error occurred.');
        throw error;
     }
  }
  
  private setupListeners(): void {
    if (!this.store) return;
    
    const refreshState = () => {
        if (!this.store) return;
        const products = this.store.products.map((p: any) => ({ ...p, offers: p.offers || [] }));
        const isPremium = this.store.owned(MONTHLY_PLAN_ID) || this.store.owned(YEARLY_PLAN_ID);
        this.onUpdate?.(products, isPremium);
    };

    // Register each event listener separately to avoid chaining issues.
    this.store.when().productUpdated(refreshState);
    this.store.when().approved((transaction: any) => transaction.verify());
    this.store.when().verified((receipt: any) => receipt.finish());
    this.store.when().finished(refreshState);
  }
  
  public getProducts(): Product[] {
    if (!this.store) return [];
    return this.store.products.map((p: any) => ({...p, offers: p.offers || [] }));
  }

  public isOwned(productId: string): boolean {
    return this.store?.owned(productId) ?? false;
  }

  public async order(offer: any): Promise<void> {
    if (!this.store) throw new Error('Store not initialized');
    await this.store.order(offer);
  }

  public async restorePurchases(): Promise<void> {
    if (!this.store) throw new Error('Store not initialized');
    await this.store.restorePurchases();
  }
}

export const purchaseService = PurchaseService.getInstance();
