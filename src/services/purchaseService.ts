
'use client';
import { logger } from '@/lib/in-app-logger';

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

  private constructor() {}

  public static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.isInitialized) {
      listener(this.getCurrentState());
    }
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
          this.isInitializing = false;
          window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: errorMsg }}));
          throw new Error(errorMsg);
        }
        logger.log('🔌 SVC: Plugin is available.');

        this.store = window.CdvPurchase.store;
        const { ProductType, Platform, LogLevel, ErrorCode } = window.CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;
        logger.log('🔧 SVC: Verbosity set.');
        
        this.store.error((err: unknown) => {
            const error = err as any;
            // User cancelled is a normal flow, not a critical error.
            if (error.code === ErrorCode.USER_CANCELLED) {
              logger.log('✅ SVC: User cancelled purchase flow. This is not an error.');
              return;
            }
            const errorMessage = `An unexpected store error occurred. Please try again later. (Code: ${error.code || 'N/A'})`;
            logger.log('❌ SVC Store Error:', error.message, err);
            window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: errorMessage }}));
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
        this.notifyListeners();
        return this.store;

     } catch (error: any) {
        logger.log('❌ SVC: Initialization failed.', error);
        this.isInitializing = false;
        this.initPromise = null;
        const userFacingError = 'Could not connect to the app store. Please check your connection and try again.';
        window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: userFacingError }}));
        throw error;
     }
  }

  public getCurrentState(): State {
      const isPremium = this.isOwned('photorights_monthly') || this.isOwned('photorights_yearly');
      logger.log(`SVC: getCurrentState called. isPremium: ${isPremium}`);
      return {
          products: this.getProducts(),
          isPremium: isPremium,
      };
  }

  private async forceUpdateAndNotify() {
    if (!this.store) return;
    logger.log('🔄 SVC: Forcing store update...');
    await this.store.update();
    logger.log('✅ SVC: Store update successful. Notifying listeners.');
    this.notifyListeners();
  }

  private setupListeners(): void {
    if (!this.store) return;
    logger.log('👂 SVC: Setting up event listeners...');
  
    // Add listeners to automatically update state when products or receipts change.
    this.store.when().productUpdated(() => this.forceUpdateAndNotify());
    this.store.when().receiptUpdated(() => this.forceUpdateAndNotify());

    // When a purchase is approved, we must verify it.
    this.store.when().approved((transaction: any) => {
      logger.log('✅ SVC: Transaction approved, verifying...', transaction);
      transaction.verify();
    });

    // When a receipt is verified, we must finish the transaction.
    this.store.when().verified((receipt: any) => {
      logger.log('✅ SVC: Receipt verified, finishing transaction...', receipt);
      receipt.finish();
    });

    // When a transaction is finished, force a final state update to ensure UI consistency.
    this.store.when().finished(() => {
        logger.log('🏁 SVC: Transaction finished. Forcing final state update.');
        setTimeout(() => this.forceUpdateAndNotify(), 500);
    });
    
    logger.log('✅ SVC: Event listeners ready.');
  }
  
  public getProducts(): Product[] {
    if (!this.store || !this.store.products) {
        logger.log('⚠️ SVC.getProducts: Store or products not available.');
        return [];
    }

    const mappedProducts: Product[] = this.store.products.map((p: any): Product => {
        logger.log(`SVC: Mapping product: ${p.id}`, JSON.stringify(p, null, 2));

        const offers: Offer[] = (p.offers || []).map((o: any): Offer => {
            const firstPhase = o.pricingPhases && o.pricingPhases.length > 0 ? o.pricingPhases[0] : {};
            logger.log(`SVC:   - Mapping offer: ${o.id}`, JSON.stringify(o, null, 2));
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
    logger.log('📦 SVC.getProducts: Mapped products complete.', mappedProducts);
    return mappedProducts;
  }

  public isOwned(productId: string): boolean {
    if (!this.store) {
      logger.log(`SVC.isOwned(${productId}): Store not ready.`);
      return false;
    }
    const product = this.store.get(productId);
    const owned = !!product?.owned;
    logger.log(`SVC.isOwned(${productId}): Product.owned = ${owned}`);
    return owned;
  }

  public async order(productId: string, offerId: string): Promise<void> {
    await this.initialize();
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

    // This is how to correctly get an offer from a product in cordova-plugin-purchase
    const offer = product.getOffer(offerId);
    if (!offer) {
        logger.log(`❌ SVC.order: Offer with ID '${offerId}' not found for product '${productId}'.`);
        throw new Error(`Offer with ID '${offerId}' not found for product '${productId}'.`);
    }

    logger.log('✅ SVC.order: Product and offer found. Placing order...');
    try {
        await offer.order();
        logger.log('✅ SVC.order: Order call completed.');
    } catch (err) {
        // This is logged here for context but will be handled by the global store.error handler.
        logger.log('❌ SVC.order: offer.order() threw an error.', err);
    }
  }

    public async restorePurchases(): Promise<void> {
        try {
            logger.log('🔄 SVC: Starting restore purchases...');
            await this.initialize();
            
            if (!this.store || !this.isInitialized) {
                throw new Error('Store not initialized or ready. Please try again in a moment.');
            }

            // store.update() is the modern equivalent of store.refresh()
            await this.store.update();
            
            // Allow time for the store update to process and then notify UI
            setTimeout(() => {
                this.notifyListeners();
                logger.log('✅ SVC: Restore complete, state updated');
                window.dispatchEvent(new CustomEvent('purchaseRestored', {
                    detail: { success: true }
                }));
            }, 1000);
            
        } catch (error: any) {
            const errorMessage = "Could not connect to the app store to restore purchases. Please check your connection.";
            logger.log('❌ SVC: Restore failed:', error);
            window.dispatchEvent(new CustomEvent('purchaseRestored', {
                detail: { success: false, error: errorMessage }
            }));
            throw error;
        }
    }

  public async forceCheck(): Promise<void> {
    await this.initialize();
    if (!this.store) {
      logger.log('❌ SVC.forceCheck: Store not initialized');
      throw new Error('Store not initialized');
    }
    logger.log('🔄 SVC.forceCheck: Manually forcing store update...');
    await this.forceUpdateAndNotify();
    logger.log('✅ SVC.forceCheck: Update complete.');
  }
}

export const purchaseService = PurchaseService.getInstance();

    