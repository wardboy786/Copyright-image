
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
        const { ProductType, Platform, LogLevel } = window.CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;
        logger.log('🔧 SVC: Verbosity set.');
        
        this.store.error((err: unknown) => {
            const error = err as any;
            const userCancelled = error.code === window.CdvPurchase.ErrorCode.USER_CANCELLED;
            if (userCancelled) {
              logger.log('✅ SVC: User cancelled purchase flow. This is not an error.');
              return; // Do not treat user cancellation as a critical error
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
      return {
          products: this.getProducts(),
          isPremium: this.isOwned('photorights_monthly') || this.isOwned('photorights_yearly'),
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
  
    this.store.when().productUpdated(() => this.forceUpdateAndNotify());
    this.store.when().receiptUpdated(() => this.forceUpdateAndNotify());

    this.store.when().approved((transaction: any) => {
      logger.log('✅ SVC: Transaction approved, verifying...', transaction);
      transaction.verify();
    });

    this.store.when().verified((receipt: any) => {
      logger.log('✅ SVC: Receipt verified, finishing transaction...', receipt);
      receipt.finish();
    });

    this.store.when().finished(() => {
        logger.log('🏁 SVC: Transaction finished. Forcing final state update.');
        setTimeout(() => this.forceUpdateAndNotify(), 500); // Delay to allow store to settle
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
    logger.log('맵핑된 제품 (Mapped Products):', mappedProducts);
    return mappedProducts;
  }

  public isOwned(productId: string): boolean {
    const product = this.store?.get(productId);
    if (product?.owned) {
        return true;
    }
    return false;
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

    const offer = product.getOffer(offerId);
    if (!offer) {
        logger.log(`❌ SVC.order: Offer with ID '${offerId}' not found for product '${productId}'.`);
        throw new Error(`Offer with ID '${offerId}' not found for product '${productId}'.`);
    }

    logger.log('✅ SVC.order: Product and offer found. Placing order...');
    await offer.order();
  }

    public async restorePurchases(): Promise<void> {
        try {
            logger.log('🔄 Starting restore purchases...');
            await this.initialize();
            
            if (!this.store || !this.isInitialized) {
                throw new Error('Store not initialized or ready. Please try again in a moment.');
            }

            await this.store.update();
            
            setTimeout(() => {
                this.notifyListeners();
                logger.log('✅ Restore complete, state updated');
                window.dispatchEvent(new CustomEvent('purchaseRestored', {
                    detail: { success: true }
                }));
            }, 1000);
            
        } catch (error: any) {
            const errorMessage = "Could not connect to the app store to restore purchases. Please check your connection.";
            logger.log('❌ Restore failed:', error);
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

    