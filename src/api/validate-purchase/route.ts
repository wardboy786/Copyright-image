

/**
 * @fileOverview Next.js API Route for server-side validation of Google Play purchases.
 * This follows the official Google Play Developer API guidelines.
 */

import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { type ValidatePurchaseInput } from '@/lib/types';
import { logger } from '@/lib/in-app-logger';

export async function POST(req: Request) {
  logger.log('🚀 VALIDATION: API route hit.');
  const { packageName, productId, purchaseToken } = (await req.json()) as ValidatePurchaseInput;
  logger.log('🚀 VALIDATION: Received request data', { packageName, productId, purchaseToken: purchaseToken ? '...' : 'null' });


  if (!packageName || !productId || !purchaseToken) {
    const error = 'Missing required validation fields.';
    logger.log(`❌ VALIDATION: ${error}`);
    return NextResponse.json({ isValid: false, error }, { status: 400 });
  }

  // Robust authentication using explicit credentials from environment variables.
  // This is the most reliable method for serverless environments like Vercel.
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID; // Added for cross-project authentication

  logger.log('🚀 VALIDATION: Reading environment variables...');
  logger.log(`🚀 VALIDATION: GOOGLE_CLIENT_EMAIL is ${clientEmail ? 'set' : 'NOT SET'}`);
  logger.log(`🚀 VALIDATION: GOOGLE_PRIVATE_KEY is ${privateKey ? 'set' : 'NOT SET'}`);
  logger.log(`🚀 VALIDATION: GOOGLE_PROJECT_ID is ${projectId ? 'set' : 'NOT SET'}`);


  if (!clientEmail || !privateKey || !projectId) {
      const error = 'Server authentication is not configured. Missing GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_PROJECT_ID.';
      logger.log(`❌ VALIDATION: ${error}`);
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

    logger.log('🚀 VALIDATION: Authorizing with Google...');
    await auth.authorize();
    logger.log('✅ VALIDATION: Authorization successful.');

    // Verify the subscription with Google Play
    logger.log('🚀 VALIDATION: Calling Google Play API to verify subscription...');
    const res = await androidPublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });
    logger.log('✅ VALIDATION: Google Play API response received.', res.data);


    // Check if the subscription is valid and active
    const isAcknowledged = res.data.acknowledgementState === 1;
    const isActive = res.data.paymentState === 1 || res.data.paymentState === 2; // 1 = Payment received, 2 = Free trial
    const isNotExpired = (res.data.expiryTimeMillis ? parseInt(res.data.expiryTimeMillis) : 0) > Date.now();

    logger.log('🚀 VALIDATION: Purchase status check', { isActive, isNotExpired, isAcknowledged });

    if (isActive && isNotExpired) {
        // If not yet acknowledged, acknowledge it now.
        if (!isAcknowledged) {
            logger.log('🚀 VALIDATION: Purchase not acknowledged, acknowledging now...');
            await androidPublisher.purchases.subscriptions.acknowledge({
                packageName: packageName,
                subscriptionId: productId,
                token: purchaseToken,
            });
             logger.log(`✅ VALIDATION: Subscription ${productId} acknowledged successfully.`);
        }
        logger.log('🎉 VALIDATION: Purchase is valid.');
        return NextResponse.json({ isValid: true, data: res.data });
    } else {
      let error = 'Purchase is not valid. ';
      if (!isActive) error += 'Not active. ';
      if (!isNotExpired) error += 'Expired. ';
      logger.log(`❌ VALIDATION: ${error.trim()}`);
      return NextResponse.json({ isValid: false, error: error.trim() });
    }
  } catch (e: any) {
    logger.log('❌❌❌ VALIDATION: CRITICAL ERROR caught in API route.');
    logger.log('❌ Error Message:', e.message);
    logger.log('❌ Error Code:', e.code);
    logger.log('❌ Error Stack:', e.stack);
    logger.log('❌ Full Error Object:', JSON.stringify(e));

    // Google API errors often have a code property and an errors array
    if (e.code && e.code >= 400 && e.code < 500) {
      const errorMessage = e.errors?.[0]?.message || e.message;
      const finalError = `Google API Error: ${errorMessage} (Code: ${e.code}).`;
      logger.log(`❌ VALIDATION: Responding with: ${finalError}`);
      return NextResponse.json({ isValid: false, error: finalError }, { status: e.code });
    }
    const finalError = e.message || 'An unknown server error occurred during validation.';
    logger.log(`❌ VALIDATION: Responding with: ${finalError}`);
    return NextResponse.json({ isValid: false, error: finalError }, { status: 500 });
  }
}
