// services/purchaseService.ts
import {
  MONTHLY_PLAN_ID,
  YEARLY_PLAN_ID,
} from '@/hooks/use-billing';
import { Capacitor } from '@capacitor/core';

// This is the safest way to declare the plugin types for TypeScript
declare var CdvPurchase: any;

export type Product = {
  id: string;
  title: string;
  description: string;
  offers: any[];
  // ... other product properties
};

interface PurchaseService {
  isAvailable(): boolean;
  initialize(onProductUpdated: () => void, onError: (error: any) => void): Promise<void>;
  getProductsSync(): Product[];
  isPremiumSync(): boolean;
  order(offer: any): Promise<void>;
  restorePurchases(): Promise<void>;
}


class CordovaPurchaseService implements PurchaseService {
  private store: any = null; // CdvPurchase.Store
  private isInitialized = false;

  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && !!window.CdvPurchase;
  }

  private waitForDeviceReady(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!Capacitor.isNativePlatform()) {
            return reject(new Error('Not a native platform'));
        }
        // On Capacitor, 'deviceready' fires very early. 
        // We add a small delay to ensure plugins are fully loaded.
        document.addEventListener('deviceready', () => {
            setTimeout(resolve, 500); 
        });
    });
  }

  async initialize(onProductUpdated: () => void, onError: (error: any) => void): Promise<void> {
    try {
        await this.waitForDeviceReady();

        if (!this.isAvailable()) {
            throw new Error('cordova-plugin-purchase is not available.');
        }

        if (this.isInitialized) {
            return;
        }

        this.store = CdvPurchase.store;
        const { ProductType, Platform, LogLevel } = CdvPurchase;

        this.store.verbosity = LogLevel.DEBUG;

        this.store.error((err: unknown) => {
            console.error('Store Error:', JSON.stringify(err));
            onError(err);
        });

        this.store.register([
          { id: MONTHLY_PLAN_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
          { id: YEARLY_PLAN_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        ]);

        this.store.when().productUpdated(onProductUpdated).approved((transaction: any) => {
            console.log('Transaction approved, verifying...');
            transaction.verify();
        }).verified((receipt: any) => {
            console.log('Receipt verified, finishing transaction.');
            receipt.finish();
        }).finished(() => {
            console.log('Transaction finished.');
            onProductUpdated(); // Final state refresh
        });

        this.store.validator = async (request: any, callback: (result: any) => void) => {
          try {
            const apiBase = process.env.NEXT_PUBLIC_APP_URL || 'https://copyright-image.vercel.app';
            const body = {
                packageName: 'com.photorights.ai',
                productId: request.products[0].id,
                purchaseToken: request.transaction.purchaseToken,
            };

            const response = await fetch(`${apiBase}/api/validate-purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
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
        
        await this.store.initialize();
        this.isInitialized = true;
        console.log("Purchase service initialized successfully.");
    } catch (error) {
        console.error("Fatal error during purchase service initialization:", error);
        onError(error);
    }
  }

  getProductsSync(): Product[] {
    if (!this.isInitialized || !this.store.products) return [];
    return this.store.products;
  }

  isPremiumSync(): boolean {
    if (!this.isInitialized) return false;
    const hasMonthly = this.store.owned(MONTHLY_PLAN_ID);
    const hasYearly = this.store.owned(YEARLY_PLAN_ID);
    return hasMonthly || hasYearly;
  }

  async order(offer: any): Promise<void> {
    if (!this.isInitialized) throw new Error('Store not initialized');
    await this.store.order(offer);
  }

  async restorePurchases(): Promise<void> {
    if (!this.isInitialized) throw new Error('Store not initialized');
    await this.store.restorePurchases();
  }
}

class MockPurchaseService implements PurchaseService {
  isAvailable(): boolean { return false; }
  async initialize(): Promise<void> { console.log('Mock purchase service: initialize'); }
  getProductsSync(): Product[] { return []; }
  isPremiumSync(): boolean { return false; }
  async order(offer: any): Promise<void> {
    console.log('Mock purchase:', offer);
    throw new Error('Purchases are only available on the mobile app.');
  }
  async restorePurchases(): Promise<void> {
    console.log('Mock restore purchases');
  }
}

export const purchaseService: PurchaseService =
  typeof window !== 'undefined' && (window as any).CdvPurchase
    ? new CordovaPurchaseService()
    : new MockPurchaseService();
