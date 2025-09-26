/**
 * @fileOverview Next.js API Route for server-side validation of Google Play purchases.
 */

import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { type ValidatePurchaseInput } from '@/lib/types';

export async function POST(req: Request) {
  const { packageName, productId, purchaseToken } = (await req.json()) as ValidatePurchaseInput;

  if (!packageName || !productId || !purchaseToken) {
    return NextResponse.json({ isValid: false, error: 'Missing required validation fields.' }, { status: 400 });
  }

  try {
    // The GoogleAuth library automatically finds credentials from the
    // GOOGLE_APPLICATION_CREDENTIALS environment variable (pointing to key.json).
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    const res = await androidPublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    const isAcknowledged = res.data.acknowledgementState === 0 || res.data.acknowledgementState === 1;
    const isActive = res.data.paymentState === 1;
    const isNotExpired = (res.data.expiryTimeMillis ? parseInt(res.data.expiryTimeMillis) : 0) > Date.now();

    if (isAcknowledged && isActive && isNotExpired) {
      return NextResponse.json({ isValid: true });
    } else {
      let error = 'Purchase is not valid. ';
      if (!isAcknowledged) error += 'Not acknowledged. ';
      if (!isActive) error += 'Not active. ';
      if (!isNotExpired) error += 'Expired. ';
      return NextResponse.json({ isValid: false, error });
    }
  } catch (e: any) {
    console.error('Error validating purchase in API route:', e.message);
    if (e.code && e.code >= 400 && e.code < 500) {
      return NextResponse.json({ isValid: false, error: `Google API Error: ${e.message} (Code: ${e.code}). Please check your service account permissions and the provided purchase details.` }, { status: e.code });
    }
    return NextResponse.json({ isValid: false, error: e.message || 'An unknown error occurred during validation.' }, { status: 500 });
  }
}
