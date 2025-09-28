
'use client';
import { logger } from '@/lib/in-app-logger';

// This is the safest way to declare the plugin types for TypeScript
declare global {
  interface Window {
    CdvPurchase: any;
    Capacitor?: any;
  }
}

import { Capacitor } from '@capacitor/core';
import { type Product, type Offer } from '@/lib/types';

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
    logger.log('🚀 SVC: Initialize called.');
    if (this.isInitialized) {
      logger.log('✅ SVC: Already initialized.');
      this.dispatchState();
      return Promise.resolve(this.store);
    }

    if (this.isInitializing && this.initPromise) {
      logger.log('⏳ SVC: Initialization in progress, returning existing promise.');
      return this.initPromise;
    }

    logger.log('🚀 SVC: Starting initialization.');
    this.isInitializing = true;
    this.initPromise = this.performInitialization();
    
    return this.initPromise;
  }

  private async performInitialization(): Promise<any> {
     try {
        await new Promise<void>((resolve) => {
            logger.log('SVC: Waiting for deviceready...');
            if (Capacitor.isNativePlatform()) {
                document.addEventListener('deviceready', () => {
                    logger.log('📱 SVC: Device is ready.');
                    resolve()
                }, { once: true });
            } else {
                logger.log('🖥️ SVC: Not native, resolving immediately.');
                resolve();
            }
        });

        if (!Capacitor.isNativePlatform() || typeof window.CdvPurchase === 'undefined') {
          const errorMsg = 'In-app purchases are only available on a mobile device.';
          logger.log(`❌ SVC: ${errorMsg}`);
          window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: errorMsg }}));
          this.isInitializing = false;
          throw new Error(errorMsg);
        }
        logger.log('🔌 SVC: Plugin is available.');


        this.store = window.CdvPurchase.store;
        const { ProductType, Platform, LogLevel } = window.CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;
        logger.log('🔧 SVC: Verbosity set to DEBUG.');
        
        this.store.error((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            logger.log('❌ SVC Store Error:', errorMessage);
            window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: `Store Error: ${errorMessage}` }}));
        });

        this.store.register([
          { id: 'photorights_monthly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
          { id: 'photorights_yearly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        ]);
        logger.log('📦 SVC: Products registered.', ['photorights_monthly', 'photorights_yearly']);

        this.setupListeners();
        
        // COMPLETELY DISABLE VALIDATOR FOR DIAGNOSTIC PURPOSES
        logger.log('⚠️ SVC: Server-side validation is DISABLED. Auto-approving all transactions.');
        this.store.validator = (request: any, callback: (result: any) => void) => {
            logger.log('🔒 SVC: Bypassing validation. Auto-approving.');
            callback({
                ok: true,
                data: {
                    // This mimics a successful validation structure
                    isValid: true
                }
            });
        };
        logger.log('⚠️ SVC: Validator configured to auto-approve.');


        await this.store.initialize();
        this.isInitialized = true;
        this.isInitializing = false;
        logger.log("🎉 SVC: Initialization complete.");
        this.dispatchState(); // Dispatch initial state
        return this.store;

     } catch (error: any) {
        logger.log('❌ SVC: Initialization failed.', error);
        this.isInitializing = false;
        this.initPromise = null;
        window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: error.message || 'An unknown initialization error occurred.' }}));
        throw error;
     }
  }
  
  public dispatchState = () => {
    logger.log('🔄 SVC: Dispatching state update...');
    if (!this.store) {
      logger.log('❌ SVC: Cannot dispatch state, store is null.');
      return;
    }
    const products = this.getProducts();
    const isPremium = this.isOwned('photorights_monthly') || this.isOwned('photorights_yearly');
    logger.log('📬 SVC: Firing purchaseStateUpdated event.', { numProducts: products.length, isPremium });
    window.dispatchEvent(new CustomEvent('purchaseStateUpdated', {
      detail: { products, isPremium }
    }));
  };
  
  private setupListeners(): void {
    if (!this.store) return;
    logger.log('👂 SVC: Setting up event listeners...');
  
    this.store.when().productUpdated(this.dispatchState);
    this.store.when().receiptUpdated(this.dispatchState);
    this.store.when().approved((transaction: any) => {
      logger.log('✅ SVC APPROVED: Transaction approved, verifying...', { id: transaction.id });
      transaction.verify();
    });
    this.store.when().verified((receipt: any) => {
      logger.log('✅ SVC VERIFIED: Receipt verified, finishing...', { id: receipt.id });
      window.dispatchEvent(new CustomEvent('purchaseVerified'));
      receipt.finish();
    });
    this.store.when().finished((transaction: any) => {
      logger.log('✅ SVC FINISHED: Transaction finished.', { id: transaction.id });
      this.dispatchState();
    });
    
    logger.log('✅ SVC: Event listeners ready.');
  }
  
  public getProducts(): Product[] {
    if (!this.store || !this.store.products) {
        logger.log('⚠️ SVC.getProducts: Store or products not available.');
        return [];
    }

    const mappedProducts: Product[] = this.store.products.map((p: any): Product => {
        const offers: Offer[] = (p.offers || []).map((o: any): Offer => {
            const firstPhase = o.pricingPhases && o.pricingPhases.length > 0 ? o.pricingPhases[0] : {};
            return {
                id: o.id,
                price: {
                    amount: firstPhase.priceAmountMicros ? firstPhase.priceAmountMicros / 1000000 : 0,
                    formatted: firstPhase.formattedPrice || '',
                },
            };
        });
      
        return {
            id: p.id,
            title: p.title,
            description: p.description,
            offers: offers,
        };
    });

    logger.log('📦 SVC.getProducts: Returning products', mappedProducts);
    return mappedProducts;
  }


  public isOwned(productId: string): boolean {
    const owned = this.store?.owned(productId) ?? false;
    logger.log(`🔍 SVC.isOwned: Checking ownership for ${productId}: ${owned}`);
    return owned;
  }

  public async order(productId: string, offerId: string): Promise<void> {
    if (!this.store) {
      logger.log('❌ SVC.order: Store not initialized');
      throw new Error('Store not initialized');
    }
    logger.log(`🛒 SVC.order: Attempting to order product '${productId}' with offer '${offerId}'...`);
    
    const product = this.store.get(productId);
    if (!product) {
        logger.log(`❌ SVC.order: Product with ID '${productId}' not found.`);
        throw new Error(`Product with ID '${productId}' not found.`);
    }

    const offer = product.getOffer(offerId);
    if (!offer) {
        logger.log(`❌ SVC.order: Offer with ID '${offerId}' not found for product '${productId}'.`);
        throw new Error(`Offer with ID '${offerId}' not found for product '${productId}'.`);
    }

    logger.log('✅ SVC.order: Product and offer found. Placing order...');
    await this.store.order(offer);
  }

  public async restorePurchases(): Promise<void> {
    if (!this.store) {
      logger.log('❌ SVC.restore: Store not initialized');
      throw new Error('Store not initialized');
    }
    logger.log('🔄 SVC.restorePurchases: Restoring purchases...');
    await this.store.restore();
  }
}

export const purchaseService = PurchaseService.getInstance();
