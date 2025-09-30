

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
    const error = 'Missing required validation fields.';
    return NextResponse.json({ isValid: false, error }, { status: 400 });
  }

  // Robust authentication using explicit credentials from environment variables.
  // This is the most reliable method for serverless environments like Vercel.
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID; // Added for cross-project authentication


  if (!clientEmail || !privateKey || !projectId) {
      const error = 'Server authentication is not configured. Missing GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_PROJECT_ID.';
      return NextResponse.json({ isValid: false, error }, { status: 500 });
  }
      
  const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      // The keyId and projectId are not strictly required if the service account is in the same project,
      // but explicitly providing them adds robustness, especially for cross-project scenarios.
      projectId: projectId, 
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  try {
    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });

    await auth.authorize();

    // Verify the subscription with Google Play
    const res = await androidPublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });


    // Check if the subscription is valid and active
    const isAcknowledged = res.data.acknowledgementState === 1;
    const isActive = res.data.paymentState === 1 || res.data.paymentState === 2; // 1 = Payment received, 2 = Free trial
    const isNotExpired = (res.data.expiryTimeMillis ? parseInt(res.data.expiryTimeMillis) : 0) > Date.now();


    if (isActive && isNotExpired) {
        // If not yet acknowledged, acknowledge it now.
        if (!isAcknowledged) {
            await androidPublisher.purchases.subscriptions.acknowledge({
                packageName: packageName,
                subscriptionId: productId,
                token: purchaseToken,
            });
        }
        return NextResponse.json({ isValid: true, data: res.data });
    } else {
      let error = 'Purchase is not valid. ';
      if (!isActive) error += 'Not active. ';
      if (!isNotExpired) error += 'Expired. ';
      return NextResponse.json({ isValid: false, error: error.trim() });
    }
  } catch (e: any) {
    // Google API errors often have a code property and an errors array
    if (e.code && e.code >= 400 && e.code < 500) {
      const errorMessage = e.errors?.[0]?.message || e.message;
      const finalError = `Google API Error: ${errorMessage} (Code: ${e.code}).`;
      return NextResponse.json({ isValid: false, error: finalError }, { status: e.code });
    }
    const finalError = e.message || 'An unknown server error occurred during validation.';
    return NextResponse.json({ isValid: false, error: finalError }, { status: 500 });
  }
}
