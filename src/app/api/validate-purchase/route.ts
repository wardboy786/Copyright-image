/**
 * @fileOverview Next.js API Route for server-side validation of Google Play purchases.
 * This follows the official Google Play Developer API guidelines.
 */

import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { type ValidatePurchaseInput } from '@/lib/types';

export async function POST(req: Request) {
  const { packageName, productId, purchaseToken } = (await req.json()) as ValidatePurchaseInput;

  if (!packageName || !productId || !purchaseToken) {
    return NextResponse.json({ isValid: false, error: 'Missing required validation fields.' }, { status: 400 });
  }

  try {
    // The GoogleAuth library automatically finds credentials from the
    // GOOGLE_APPLICATION_CREDENTIALS environment variable.
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    // Verify the subscription with Google Play
    const res = await androidPublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    // Check if the subscription is valid and active
    const isAcknowledged = res.data.acknowledgementState === 1;
    const isActive = res.data.paymentState === 1; // 1 = Payment received, 2 = Free trial
    const isNotExpired = (res.data.expiryTimeMillis ? parseInt(res.data.expiryTimeMillis) : 0) > Date.now();

    if (isActive && isNotExpired) {
        // If not yet acknowledged, acknowledge it now.
        if (!isAcknowledged) {
            await androidPublisher.purchases.subscriptions.acknowledge({
                packageName: packageName,
                subscriptionId: productId,
                token: purchaseToken,
            });
             console.log(`Subscription ${productId} acknowledged successfully.`);
        }
        return NextResponse.json({ isValid: true, data: res.data });
    } else {
      let error = 'Purchase is not valid. ';
      if (!isActive) error += 'Not active. ';
      if (!isNotExpired) error += 'Expired. ';
      return NextResponse.json({ isValid: false, error: error.trim() });
    }
  } catch (e: any) {
    console.error('Error validating purchase in API route:', e.message);
    // Google API errors often have a code property
    if (e.code && e.code >= 400 && e.code < 500) {
      return NextResponse.json({ isValid: false, error: `Google API Error: ${e.message} (Code: ${e.code}).` }, { status: e.code });
    }
    return NextResponse.json({ isValid: false, error: e.message || 'An unknown server error occurred during validation.' }, { status: 500 });
  }
}
