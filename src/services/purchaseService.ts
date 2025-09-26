// services/purchaseService.ts

import {
  MONTHLY_PLAN_ID,
  YEARLY_PLAN_ID,
  type Transaction,
} from '@/hooks/use-billing';
import { validatePurchaseAction } from '@/app/actions/purchase-actions';

// Define locally to avoid module resolution issues
type Product = import('@/hooks/use-billing').Product;

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
    // Access the store via the window object to avoid build-time imports
    return (window as any).CdvPurchase.store;
  }

  private get CdvPurchase() {
    return (window as any).CdvPurchase;
  }

  isAvailable(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      (window as any).CdvPurchase &&
      (window as any).CdvPurchase.store
    );
  }

  async initialize(onProductUpdated: () => void): Promise<void> {
    if (!this.isAvailable()) return;

    const { ProductType, Platform } = this.CdvPurchase;

    this.store.register([
      {
        type: ProductType.PAID_SUBSCRIPTION,
        id: MONTHLY_PLAN_ID,
        platform: Platform.GOOGLE_PLAY,
      },
      {
        type: ProductType.PAID_SUBSCRIPTION,
        id: YEARLY_PLAN_ID,
        platform: Platform.GOOGLE_PLAY,
      },
    ]);

    // Setup listeners
    this.store.when().productUpdated(onProductUpdated);
    
    // Server-side validation flow
    this.store.when().approved(async (transaction: any) => {
      try {
        const purchaseToken = transaction.nativePurchase.purchaseToken;
        const productId = transaction.products[0].id;

        const validationResult = await validatePurchaseAction({
          packageName: 'com.photorights.ai',
          productId,
          purchaseToken,
        });

        if (validationResult.isValid) {
          transaction.finish();
          console.log('Purchase validated and finished successfully.');
        } else {
          // Handle invalid purchase, maybe log it or alert the user
          console.error('Purchase validation failed:', validationResult.error);
        }
      } catch (e) {
        console.error('An error occurred during transaction verification:', e);
      } finally {
        onProductUpdated(); // Refresh status after any transaction attempt
      }
    });

    // Fallback for older systems or if server-side validation fails
    this.store.when().verified((receipt: any) => receipt.finish());
    this.store.when().unverified((receipt: any) => receipt.finish());
    
    // Initialize the store AFTER registering products and listeners
    this.store.initialize();
  }

  async getProducts(ids: string[]): Promise<Product[]> {
    if (!this.isAvailable()) return [];
    return this.store.get(ids);
  }

  async isPremium(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const transactions: Transaction[] = await this.store.ownedPurchases();
    const hasMonthly = transactions.some(
      (t) =>
        t.products.some((p) => p.id === MONTHLY_PLAN_ID) && t.isActive
    );
    const hasYearly = transactions.some(
      (t) =>
        t.products.some((p) => p.id === YEARLY_PLAN_ID) && t.isActive
    );
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
  isAvailable(): boolean {
    return false;
  }

  async initialize(): Promise<void> {
    console.log('Mock purchase service: initialize');
  }

  async getProducts(): Promise<Product[]> {
    console.log('Mock purchase service: getProducts');
    return [];
  }

  async isPremium(): Promise<boolean> {
    return false;
  }

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
