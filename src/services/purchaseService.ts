
'use client';
declare global {
  interface Window {
    CdvPurchase: any;
    Capacitor?: any;
  }
}

import { Capacitor } from '@capacitor/core';
import { type Product, type Offer } from '@/lib/types';
import { logger } from '@/lib/in-app-logger';

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
    if (this.isInitialized) {
      this.notifyListeners();
      return Promise.resolve(this.store);
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }
    logger.log('🚀 SVC: Initialize called.');
    this.isInitializing = true;
    this.initPromise = this.performInitialization();
    
    return this.initPromise;
  }

  private async performInitialization(): Promise<any> {
     try {
        await new Promise<void>((resolve) => {
            if (Capacitor.isNativePlatform()) {
                document.addEventListener('deviceready', () => {
                    resolve()
                }, { once: true });
            } else {
                resolve();
            }
        });

        if (!Capacitor.isNativePlatform() || typeof window.CdvPurchase === 'undefined') {
          const errorMsg = 'In-app purchases are only available on a mobile device.';
          this.isInitializing = false;
          window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: errorMsg }}));
          throw new Error(errorMsg);
        }

        this.store = window.CdvPurchase.store;
        const { ProductType, Platform, LogLevel, ErrorCode } = window.CdvPurchase;

        this.store.verbosity = LogLevel.INFO;
        
        this.store.error((err: unknown) => {
            const error = err as any;
            
            // OFFICIAL FIX: User cancelled is a normal flow, not a critical error.
            if (error.code === ErrorCode.USER_CANCELLED) {
              logger.log('SVC Store Info: User cancelled purchase flow. This is not an error.', error);
              return;
            }
            
            logger.log('❌ SVC Store Error:', error.message, error);
            const errorMessage = `An unexpected store error occurred. Please try again later. (Code: ${error.code || 'N/A'})`;
            window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: errorMessage }}));
        });

        this.store.register([
          { id: 'photorights_monthly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
          { id: 'photorights_yearly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        ]);

        this.setupListeners();
        
        this.store.validator = (request: any, callback: (result: any) => void) => {
            callback({ ok: true, data: { isValid: true } });
        };

        await this.store.initialize();
        this.isInitialized = true;
        this.isInitializing = false;
        logger.log('✅ SVC: Initialization complete.');
        this.notifyListeners();
        return this.store;

     } catch (error: any) {
        this.isInitializing = false;
        this.initPromise = null;
        logger.log('❌ SVC: Initialization failed.', error);
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
    await this.store.update();
    this.notifyListeners();
  }

  private setupListeners(): void {
    if (!this.store) return;
  
    this.store.when().productUpdated(() => this.forceUpdateAndNotify());
    this.store.when().receiptUpdated(() => this.forceUpdateAndNotify());

    this.store.when().approved((transaction: any) => {
      transaction.verify();
    });

    this.store.when().verified((receipt: any) => {
      receipt.finish();
    });

    this.store.when().finished(() => {
        setTimeout(() => this.forceUpdateAndNotify(), 500);
    });
  }
  
  public getProducts(): Product[] {
    if (!this.store || !this.store.products) {
        return [];
    }

    const mappedProducts: Product[] = this.store.products.map((p: any): Product => {
        const offers: Offer[] = (p.offers || []).map((o: any): Offer => {
            // Robustly find the first valid pricing phase with a formatted price.
            const pricing = o.pricingPhases?.find((phase: any) => phase.formattedPrice) || o.pricingPhases?.[0];
            
            const formattedPrice = pricing?.formattedPrice || pricing?.price || '';
            const priceAmountMicros = pricing?.priceAmountMicros || 0;
            
            logger.log(`SVC: Parsing offer ${o.id}`, { baseOfferId: o.id, formattedPrice, priceAmountMicros });

            return {
                id: o.id, // CRITICAL: Keep the FULL offer ID
                price: {
                    amount: priceAmountMicros / 1000000,
                    formatted: formattedPrice,
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
      return false;
    }
    const product = this.store.get(productId);
    const owned = !!product?.owned;
    logger.log(`SVC.isOwned(${productId}): Product.owned = ${owned}`);
    return owned;
  }

  public async order(productId: string, offerId: string): Promise<any> {
    await this.initialize();
    if (!this.store) {
      throw new Error('Store not initialized');
    }
    
    logger.log(`🛒 SVC.order: Attempting to order product '${productId}' with offer '${offerId}'...`);
    const product = this.store.get(productId);
    if (!product) {
        logger.log(`❌ SVC.order: Product with ID '${productId}' not found.`);
        throw new Error(`Product with ID '${productId}' not found.`);
    }

    // Use the offer ID exactly as provided by the UI, which should be the full ID
    const offer = product.getOffer(offerId);
    if (!offer) {
        logger.log(`❌ SVC.order: Offer with ID '${offerId}' not found for product '${productId}'.`);
        throw new Error(`Offer with ID '${offerId}' not found for product '${productId}'.`);
    }
    
    logger.log(`✅ SVC.order: Product and offer found. Placing order...`);
    const transaction = await offer.order();
    logger.log(`✅ SVC.order: Order call completed.`);
    return transaction;
  }

    public async restorePurchases(): Promise<void> {
        try {
            await this.initialize();
            
            if (!this.store || !this.isInitialized) {
                throw new Error('Store not initialized or ready. Please try again in a moment.');
            }

            await this.store.update();
            
            setTimeout(() => {
                this.notifyListeners();
                window.dispatchEvent(new CustomEvent('purchaseRestored', {
                    detail: { success: true }
                }));
            }, 1000);
            
        } catch (error: any) {
            const errorMessage = "Could not connect to the app store to restore purchases. Please check your connection.";
            window.dispatchEvent(new CustomEvent('purchaseRestored', {
                detail: { success: false, error: errorMessage }
            }));
            throw error;
        }
    }

  public async forceCheck(): Promise<void> {
    await this.initialize();
    if (!this.store) {
      throw new Error('Store not initialized');
    }
    await this.forceUpdateAndNotify();
  }
}

export const purchaseService = PurchaseService.getInstance();
