// services/purchaseService.ts
import {
  MONTHLY_PLAN_ID,
  YEARLY_PLAN_ID,
  type Transaction,
} from '@/hooks/use-billing';

// Define locally to avoid module resolution issues
type Product = import('@/hooks/use-billing').Product;

// This defines the structure of the data our validator expects.
// We are re-defining it here because we cannot import from the cordova plugin directly.
interface ValidatorRequest {
  id: string;
  type: 'subscription';
  products: { id: string; }[];
  transaction: {
    type: 'android-playstore';
    purchaseToken: string;
    // ... other native properties
  };
  // ... other request properties
}

interface PurchaseService {
  isAvailable(): boolean;
  initialize(onProductUpdated: () => void): Promise<void>;
  getProducts(ids: string[]): Promise<Product[]>;
  isPremium(): Promise<boolean>;
  order(offer: any): Promise<void>;
  restorePurchases(): Promise<void>;
}

class CordovaPurchaseService implements PurchaseService {
  private get store() {
    return (window as any).CdvPurchase.store;
  }

  private get CdvPurchase() {
    return (window as any).CdvPurchase;
  }

  isAvailable(): boolean {
    return !!(typeof window !== 'undefined' && this.CdvPurchase?.store);
  }

  async initialize(onProductUpdated: () => void): Promise<void> {
    if (!this.isAvailable()) return;

    const { ProductType, Platform, LogLevel } = this.CdvPurchase;

    this.store.verbosity = LogLevel.DEBUG;

    this.store.error((err: unknown) => {
        console.error('Store Error:', JSON.stringify(err));
    });

    this.store.register([
      {
        id: MONTHLY_PLAN_ID,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
      },
      {
        id: YEARLY_PLAN_ID,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
      },
    ]);

    this.store.when().productUpdated(onProductUpdated).approved((transaction: any) => {
        console.log('Transaction approved, verifying...');
        transaction.verify();
    }).verified((receipt: any) => {
        console.log('Receipt verified, finishing transaction.');
        receipt.finish();
        onProductUpdated(); // Refresh premium status
    }).finished(() => {
        console.log('Transaction finished.');
        onProductUpdated();
    });

    // Setup server-side validation
    this.store.validator = async (request: ValidatorRequest, callback: (result: any) => void) => {
      try {
        // The API base must be an absolute URL for the native app to call.
        const apiBase = process.env.NEXT_PUBLIC_APP_URL || 'https://copyright-image.vercel.app/';
        
        const response = await fetch(`${apiBase}/api/validate-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageName: 'com.photorights.ai',
            productId: request.products[0].id,
            purchaseToken: request.transaction.purchaseToken,
          }),
        });

        if (!response.ok) {
            throw new Error(`Validation request failed with status ${response.status}`);
        }

        const validationResult = await response.json();
        
        if (validationResult.isValid) {
          console.log('Server validation successful.');
          callback({ ok: true, data: validationResult });
        } else {
          console.error('Server validation failed:', validationResult.error);
          callback({ ok: false, message: validationResult.error || 'Validation failed' });
        }
      } catch (error) {
        console.error('An error occurred during transaction verification:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        callback({ ok: false, message: errorMessage });
      }
    };
    
    await this.store.initialize();
  }

  async getProducts(ids: string[]): Promise<Product[]> {
    if (!this.isAvailable()) return [];
    // Ensure store is ready before getting products
    await this.store.ready();
    return this.store.get(ids);
  }

  async isPremium(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    await this.store.ready();
    const hasMonthly = this.store.owned(MONTHLY_PLAN_ID);
    const hasYearly = this.store.owned(YEARLY_PLAN_ID);
    return hasMonthly || hasYearly;
  }

  async order(offer: any): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Purchase service not available');
    }
    await this.store.order(offer);
  }

  async restorePurchases(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Purchase service not available');
    }
    await this.store.restorePurchases();
  }
}

class MockPurchaseService implements PurchaseService {
  isAvailable(): boolean { return false; }
  async initialize(): Promise<void> { console.log('Mock purchase service: initialize'); }
  async getProducts(): Promise<Product[]> { console.log('Mock purchase service: getProducts'); return []; }
  async isPremium(): Promise<boolean> { return false; }
  async order(offer: any): Promise<void> {
    console.log('Mock purchase:', offer);
    throw new Error('Purchases are only available on the mobile app.');
  }
  async restorePurchases(): Promise<void> {
    console.log('Mock restore purchases');
    throw new Error('Purchases can only be restored on the mobile app.');
  }
}

export const purchaseService: PurchaseService =
  typeof window !== 'undefined' && (window as any).CdvPurchase
    ? new CordovaPurchaseService()
    : new MockPurchaseService();
