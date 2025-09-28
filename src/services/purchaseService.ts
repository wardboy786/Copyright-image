'use client';

// This is the safest way to declare the plugin types for TypeScript
declare global {
  interface Window {
    CdvPurchase: any;
  }
}

import { Capacitor } from '@capacitor/core';
import { type Product } from '@/lib/types';

class PurchaseService {
  private static instance: PurchaseService;
  private store: any;
  private isInitializing = false;
  private isInitialized = false;
  private initPromise: Promise<any> | null = null;

  // Private constructor to enforce singleton pattern
  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  public initialize(): Promise<any> {
    if (this.isInitialized) {
      console.log('✅ PurchaseService: Already initialized.');
      this.dispatchState();
      return Promise.resolve(this.store);
    }

    if (this.isInitializing && this.initPromise) {
      console.log('⏳ PurchaseService: Initialization in progress, returning existing promise.');
      return this.initPromise;
    }

    console.log('🚀 PurchaseService: Starting initialization.');
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
          console.error(`❌ ${errorMsg}`);
          window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: errorMsg }}));
          this.isInitializing = false;
          throw new Error(errorMsg);
        }
        console.log('🔌 PurchaseService: Plugin is available.');


        this.store = window.CdvPurchase.store;
        const { ProductType, Platform, LogLevel } = window.CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;
        console.log('🔧 PurchaseService: Verbosity set to DEBUG.');
        
        this.store.error((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            console.error('❌ Store Error:', errorMessage);
            window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: `Store Error: ${errorMessage}` }}));
        });

        this.store.register([
          { id: 'photorights_monthly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
          { id: 'photorights_yearly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        ]);
        console.log('📦 PurchaseService: Products registered.');

        this.setupListeners();
        
        this.store.validator = async (request: any, callback: (result: any) => void) => {
            console.log('🔒 PurchaseService: Starting server-side validation...');
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
                console.log('✅ PurchaseService: Server validation result:', validationResult);
                callback({ ok: validationResult.isValid, data: validationResult });
            } catch (error: any) {
                 console.error('❌ PurchaseService: Server validation failed.', error);
                callback({ ok: false, message: error.message || 'Unknown validation error' });
            }
        };
        console.log('🔒 PurchaseService: Validator configured.');


        await this.store.initialize();
        this.isInitialized = true;
        this.isInitializing = false;
        console.log("🎉 PurchaseService: Initialization complete.");
        this.dispatchState(); // Dispatch initial state
        return this.store;

     } catch (error: any) {
        console.error('❌ PurchaseService: Initialization failed.', error);
        this.isInitializing = false;
        this.initPromise = null;
        window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: error.message || 'An unknown initialization error occurred.' }}));
        throw error;
     }
  }
  
  private dispatchState = () => {
    console.log('🔄 PurchaseService: Dispatching state update...');
    if (!this.store) return;
    const products = this.getProducts();
    const isPremium = this.isOwned('photorights_monthly') || this.isOwned('photorights_yearly');
    window.dispatchEvent(new CustomEvent('purchaseStateUpdated', {
      detail: { products, isPremium }
    }));
  };
  
  private setupListeners(): void {
    if (!this.store) return;
    console.log('👂 PurchaseService: Setting up event listeners...');
  
    this.store.when().productUpdated(this.dispatchState);
    this.store.when().receiptUpdated(this.dispatchState);
    this.store.when().approved((transaction: any) => {
      console.log('✅ APPROVED: Transaction approved, starting verification...', transaction);
      transaction.verify();
    });
    this.store.when().verified((receipt: any) => {
      console.log('✅ VERIFIED: Receipt verified, finishing transaction...', receipt);
      receipt.finish();
    });
    this.store.when().finished((transaction: any) => {
      console.log('✅ FINISHED: Transaction finished.', transaction);
      this.dispatchState();
    });
    
    console.log('✅ PurchaseService: Event listeners ready.');
  }
  
  public getProducts(): Product[] {
    if (!this.store || !this.store.products) {
        console.warn('⚠️ PurchaseService.getProducts: Store or products not available.');
        return [];
    }
    const products = this.store.products.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      offers: p.offers || [], // CRITICAL: Ensure offers are always included
    }));
    console.log('📦 PurchaseService.getProducts: Returning products', products.map((p: Product) => ({id: p.id, offersCount: p.offers.length, offers: p.offers})));
    return products;
  }

  public isOwned(productId: string): boolean {
    const owned = this.store?.owned(productId) ?? false;
    console.log(`🔍 PurchaseService.isOwned: Checking ownership for ${productId}: ${owned}`);
    return owned;
  }

  public async order(productId: string, offerId: string): Promise<void> {
    if (!this.store) throw new Error('Store not initialized');
    console.log(`🛒 PurchaseService.order: Attempting to order product '${productId}' with offer '${offerId}'...`);
    
    const product = this.store.get(productId);
    if (!product) {
        throw new Error(`Product with ID '${productId}' not found.`);
    }

    const offer = product.getOffer(offerId);
    if (!offer) {
        throw new Error(`Offer with ID '${offerId}' not found for product '${productId}'.`);
    }

    await this.store.order(offer);
  }

  public async restorePurchases(): Promise<void> {
    if (!this.store) throw new Error('Store not initialized');
    console.log('🔄 PurchaseService.restorePurchases: Restoring purchases...');
    await this.store.restorePurchases();
  }
}

export const purchaseService = PurchaseService.getInstance();
