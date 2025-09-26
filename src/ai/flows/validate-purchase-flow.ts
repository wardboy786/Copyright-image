/**
 * @fileOverview A Genkit flow for server-side validation of Google Play purchases.
 *
 * - validatePurchase - Verifies a purchase with the Google Play Developer API.
 * - ValidatePurchaseInput - The input type for the validatePurchase function.
 * - ValidatePurchaseOutput - The return type for the validatePurchase function.
 */

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const ValidatePurchaseInputSchema = z.object({
  packageName: z.string().describe('The package name of the application (e.g., "com.photorights.ai").'),
  productId: z.string().describe('The ID of the in-app product (e.g., "photorights_monthly").'),
  purchaseToken: z.string().describe('The token provided to the user"s device after a purchase.'),
});
export type ValidatePurchaseInput = z.infer<typeof ValidatePurchaseInputSchema>;

const ValidatePurchaseOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the purchase is valid and active.'),
  error: z.string().optional().describe('An error message if validation failed.'),
});
export type ValidatePurchaseOutput = z.infer<typeof ValidatePurchaseOutputSchema>;


export async function validatePurchase(input: ValidatePurchaseInput): Promise<ValidatePurchaseOutput> {
  return validatePurchaseFlow(input);
}


const validatePurchaseFlow = ai.defineFlow(
  {
    name: 'validatePurchaseFlow',
    inputSchema: ValidatePurchaseInputSchema,
    outputSchema: ValidatePurchaseOutputSchema,
  },
  async ({ packageName, productId, purchaseToken }) => {
    try {
      const credentialsString = process.env.PLAY_CONSOLE_CREDENTIALS;
      if (!credentialsString) {
        throw new Error('PLAY_CONSOLE_CREDENTIALS environment variable is not set.');
      }
      
      const credentials = JSON.parse(credentialsString);

      const auth = new GoogleAuth({
        credentials,
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

      // Check if the purchase is valid
      // 0: Yet to be acknowledged, 1: Acknowledged
      const isAcknowledged = res.data.acknowledgementState === 0 || res.data.acknowledgementState === 1;
      // 0: Active, 1: Canceled, 2: In grace period, 3: On hold
      const isActive = res.data.paymentState === 1;
      const isNotExpired = (res.data.expiryTimeMillis || 0) > Date.now();

      if (isAcknowledged && isActive && isNotExpired) {
        return { isValid: true };
      } else {
        return { isValid: false, error: 'Purchase is not active, acknowledged, or has expired.' };
      }
    } catch (e: any) {
      console.error("Error validating purchase:", e.message);
      return { isValid: false, error: e.message || 'An unknown error occurred during validation.' };
    }
  }
);
