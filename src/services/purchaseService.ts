
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

type State = {
  products: Product[];
  isPremium: boolean;
};

type Listener = (state: State) => void;

class PurchaseService {
  private static instance: PurchaseService;
  private store: any;
  private isInitializing = false;
  private isInitialized = false;
  private initPromise: Promise<any> | null = null;
  public receipts: any[] = [];
  private listeners: Set<Listener> = new Set();


  // Private constructor to enforce singleton pattern
  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately notify the new subscriber with the current state
    listener(this.getCurrentState());
    
    // Return an unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getCurrentState();
    logger.log('📢 SVC: Notifying listeners with new state', state);
    this.listeners.forEach(listener => listener(state));
  }


  public initialize(): Promise<any> {
    logger.log('🚀 SVC: Initialize called.');
    if (this.isInitialized) {
      logger.log('✅ SVC: Already initialized.');
      this.notifyListeners();
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
          // We can't dispatch a window event here, so we will rely on the error being thrown
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
        
        this.store.validator = (request: any, callback: (result: any) => void) => {
            logger.log('🔒 SVC: Bypassing internal validation. Auto-approving.');
            callback({ ok: true, data: { isValid: true } });
        };
        logger.log('⚠️ SVC: Validator configured to auto-approve.');


        await this.store.initialize();
        this.isInitialized = true;
        this.isInitializing = false;
        logger.log("🎉 SVC: Initialization complete.");
        this.receipts = this.store.receipts; // Store receipts initially
        this.notifyListeners(); // Dispatch initial state to any subscribers
        return this.store;

     } catch (error: any) {
        logger.log('❌ SVC: Initialization failed.', error);
        this.isInitializing = false;
        this.initPromise = null;
        throw error;
     }
  }
  
  public getCurrentState(): State {
      return {
          products: this.getProducts(),
          isPremium: this.isOwned('photorights_monthly') || this.isOwned('photorights_yearly'),
      };
  }

  private setupListeners(): void {
    if (!this.store) return;
    logger.log('👂 SVC: Setting up event listeners...');
  
    // When ANYTHING in the store changes, we force an update and re-dispatch state.
    const forceUpdateAndNotify = async () => {
        logger.log('🔄 SVC: Store change detected. Forcing update and notifying listeners.');
        await this.store.update();
        this.receipts = this.store.receipts;
        this.notifyListeners();
    }
    
    this.store.when().productUpdated(forceUpdateAndNotify);
    this.store.when().receiptUpdated(forceUpdateAndNotify);

    // Clean purchase flow: approved -> verified -> finished
    this.store.when().approved((transaction: any) => {
      logger.log('✅ SVC APPROVED: Transaction approved, verifying...', transaction);
      transaction.verify();
    });

    this.store.when().verified((receipt: any) => {
      logger.log('✅ SVC VERIFIED: Receipt verified, finishing...', receipt);
      receipt.finish();
    });
    
    // After a transaction is truly finished, force one more update to be safe.
    this.store.when().finished(async (transaction: any) => {
      logger.log('✅ SVC FINISHED: Transaction finished. Forcing final update.', transaction);
      await forceUpdateAndNotify();
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
    return mappedProducts;
  }

 public isOwned(productId: string): boolean {
    const product = this.store?.get(productId);
    if (!product) return false;

    // The plugin has an internal "owned" state, which is the most reliable check.
    if (product.owned) {
        logger.log(`✅ SVC.isOwned: Fast check TRUE for ${productId}`);
        return true;
    }

    // As a fallback, check transactions manually.
    const hasFinishedTransaction = product.transactions.some((t: any) => t.state === 'finished' && t.nativePurchase?.autoRenewing);
    if (hasFinishedTransaction) {
        logger.log(`✅ SVC.isOwned: Found FINISHED transaction for ${productId}`);
        return true;
    }
    
    logger.log(`❌ SVC.isOwned: No active ownership found for ${productId}.`);
    return false;
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
      logger.log('❌ SVC.restorePurchases: Store not initialized');
      throw new Error('Store not initialized');
    }
    logger.log('🔄 SVC.restorePurchases: Attempting to restore purchases...');
    await this.store.restore();
    logger.log('✅ SVC.restorePurchases: Restore command sent. State will update on receipt/product events.');
  }

  public async forceCheck(): Promise<void> {
    if (!this.store) {
      logger.log('❌ SVC.forceCheck: Store not initialized');
      throw new Error('Store not initialized');
    }
    logger.log('🔄 SVC.forceCheck: Manually forcing store update...');
    await this.store.update();
    this.receipts = this.store.receipts;
    this.notifyListeners();
    logger.log('✅ SVC.forceCheck: Update complete.');
  }
}

export const purchaseService = PurchaseService.getInstance();
