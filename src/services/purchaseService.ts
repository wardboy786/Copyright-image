
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

// The shape of the state that our service will manage
type State = {
  products: Product[];
  isPremium: boolean;
};

// The type for a listener function that wants to subscribe to state changes
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

  /**
   * Allows React components (or other parts of the app) to subscribe to state changes.
   * @param listener A function that will be called with the new state.
   * @returns An unsubscribe function.
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // If we're already initialized, give the new subscriber the current state immediately.
    if (this.isInitialized) {
      listener(this.getCurrentState());
    }
    // Return a function to allow the subscriber to unsubscribe
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all subscribed listeners with the latest state.
   */
  private notifyListeners(): void {
    const state = this.getCurrentState();
    logger.log('📢 SVC: Notifying listeners with new state', state);
    this.listeners.forEach(listener => listener(state));
  }


  /**
   * Initializes the in-app purchase plugin.
   * This is safe to call multiple times.
   */
  public initialize(): Promise<any> {
    logger.log('🚀 SVC: Initialize called.');
    if (this.isInitialized) {
      logger.log('✅ SVC: Already initialized.');
      this.notifyListeners(); // Notify with current state in case a new listener subscribed
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
        // Wait for the native platform to be ready
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

        // Check if the plugin is available
        if (!Capacitor.isNativePlatform() || typeof window.CdvPurchase === 'undefined') {
          const errorMsg = 'In-app purchases are only available on a mobile device.';
          logger.log(`❌ SVC: ${errorMsg}`);
          this.isInitializing = false;
          throw new Error(errorMsg);
        }
        logger.log('🔌 SVC: Plugin is available.');

        this.store = window.CdvPurchase.store;
        const { ProductType, Platform, LogLevel } = window.CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;
        logger.log('🔧 SVC: Verbosity set to DEBUG.');
        
        // Central error handler
        this.store.error((err: unknown) => {
            const error = err as any;
            const errorMessage = error.message || JSON.stringify(err);
            logger.log('❌ SVC Store Error:', errorMessage, err);
            // Dispatch a global event that the React context can listen for
            window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: `Store Error: ${errorMessage}` }}));
        });

        // Register the products
        this.store.register([
          { id: 'photorights_monthly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
          { id: 'photorights_yearly', type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        ]);
        logger.log('📦 SVC: Products registered.', ['photorights_monthly', 'photorights_yearly']);

        // Set up the event listeners
        this.setupListeners();
        this.setupAppLifecycleListeners();
        
        this.store.validator = (request: any, callback: (result: any) => void) => {
            logger.log('🔒 SVC: Bypassing internal validation. Auto-approving.');
            callback({ ok: true, data: { isValid: true } });
        };
        logger.log('⚠️ SVC: Validator configured to auto-approve.');

        // Initialize the store
        await this.store.initialize();
        this.isInitialized = true;
        this.isInitializing = false;
        logger.log("🎉 SVC: Initialization complete.");
        this.notifyListeners(); // Notify that initialization is done and send initial state
        return this.store;

     } catch (error: any) {
        logger.log('❌ SVC: Initialization failed.', error);
        this.isInitializing = false;
        this.initPromise = null;
        // Dispatch an error that our context can catch
        window.dispatchEvent(new CustomEvent('purchaseError', { detail: { error: error.message || 'Initialization failed' }}));
        throw error;
     }
  }

  private setupAppLifecycleListeners(): void {
    document.addEventListener('resume', () => {
      logger.log('📱 App resumed, refreshing purchases...');
      setTimeout(() => {
        this.store?.update();
        this.notifyListeners();
      }, 500);
    }, false);
  }
  
  /**
   * Gets the current state of the service.
   */
  public getCurrentState(): State {
      return {
          products: this.getProducts(),
          isPremium: this.isOwned('photorights_monthly') || this.isOwned('photorights_yearly'),
      };
  }

  /**
   * Forces the store to refresh its data from the native platform and notifies listeners.
   */
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
  
    // Listen for any change in products or receipts. This is a catch-all.
    this.store.when().productUpdated(() => this.forceUpdateAndNotify());
    this.store.when().receiptUpdated((receipt: any) => {
        logger.log('🧾 SVC: Receipt updated.', receipt);
        this.forceUpdateAndNotify();
    });

    this.store.when().approved((transaction: any) => {
      logger.log('✅ SVC APPROVED: Transaction approved, verifying...', transaction);
      transaction.verify();
    });

    this.store.when().verified((receipt: any) => {
        logger.log('✅ SVC VERIFIED: Receipt is verified, must finish now.', receipt);

        const receiptExists = this.receipts.some(r => r.id === receipt.id);
        if (!receiptExists) {
            this.receipts.push(receipt);
        }
        
        receipt.finish();
        logger.log('🏁 SVC: Called receipt.finish() to acknowledge the purchase.');
        
        setTimeout(() => {
          this.notifyListeners();
        }, 1000);
    });
    
    this.store.when().finished(() => {
        logger.log('🏁 SVC FINISHED: Transaction finished. Forcing final state update.');
        setTimeout(() => {
          this.forceUpdateAndNotify();
        }, 500);
    });
    
    logger.log('✅ SVC: Event listeners ready.');
  }
  
  /**
   * Maps the plugin's product format to our app's format.
   */
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
    logger.log(`\n🔍 === OWNERSHIP CHECK FOR ${productId} ===`);
    
    if (this.receipts && this.receipts.length > 0) {
        for (const receipt of this.receipts) {
            const transactions = receipt.sourceReceipt?.transactions || [];
            for (const transaction of transactions) {
                const hasProduct = transaction.products?.some((p: any) => p.id === productId);
                const isApproved = transaction.state === 'approved';
                const isRenewing = transaction.nativePurchase?.autoRenewing === true;
                
                logger.log('Transaction check:', {
                    hasProduct,
                    state: transaction.state,
                    autoRenewing: isRenewing,
                    acknowledged: transaction.isAcknowledged
                });
                
                if (hasProduct && isApproved && isRenewing) {
                    logger.log('✅ OWNED - approved subscription found');
                    return true;
                }
            }
        }
    }
  
    // Fallback check on the product object itself
    const product = this.store?.get?.(productId);
    if (product && (product.owned || product.state === 'owned')) {
      logger.log(`✅ OWNED - via product.state check: ${product.state}`);
      return true;
    }

    logger.log('❌ NOT OWNED - no active, approved subscription found');
    return false;
  }

  /**
   * Initiates a purchase flow for a product.
   */
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

  /**
   * Initiates the flow to restore previous purchases.
   */
    public async restorePurchases(): Promise<void> {
        try {
            logger.log('🔄 Starting restore purchases...');
            
            if (!this.store || !this.isInitialized) {
                throw new Error('Store not initialized or ready. Please try again in a moment.');
            }

            // Refresh all products to get the latest state from the store.
            await this.store.update();
            
            // The update call will trigger the listeners automatically.
            // We can dispatch an event to let the UI know the process has completed.
            setTimeout(() => {
                this.notifyListeners();
                logger.log('✅ Restore complete, state updated');
                 // Notify success
                window.dispatchEvent(new CustomEvent('purchaseRestored', {
                    detail: { success: true }
                }));
            }, 1000);
            
        } catch (error: any) {
            logger.log('❌ Restore failed:', error);
             // Notify error
            window.dispatchEvent(new CustomEvent('purchaseRestored', {
                detail: { success: false, error: error.message }
            }));
            throw error;
        }
    }

  /**
   * Manually triggers a state refresh. Useful for "Check Again" buttons.
   */
  public async forceCheck(): Promise<void> {
    if (!this.store) {
      logger.log('❌ SVC.forceCheck: Store not initialized');
      throw new Error('Store not initialized');
    }
    logger.log('🔄 SVC.forceCheck: Manually forcing store update...');
    await this.forceUpdateAndNotify();
    logger.log('✅ SVC.forceCheck: Update complete.');
  }
}

// Export a singleton instance of the service
export const purchaseService = PurchaseService.getInstance();
