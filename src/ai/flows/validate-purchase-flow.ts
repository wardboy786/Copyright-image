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
      // The GoogleAuth library automatically finds the credentials from the 
      // GOOGLE_APPLICATION_CREDENTIALS environment variable.
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

      // Check if the purchase is valid
      // 0: Yet to be acknowledged, 1: Acknowledged
      const isAcknowledged = res.data.acknowledgementState === 0 || res.data.acknowledgementState === 1;
      // For subscriptions, paymentState 1 means the subscription is active. 
      // 0 might mean pending, 2 might mean in grace period. We'll consider 1 as valid.
      const isActive = res.data.paymentState === 1; 
      const isNotExpired = (res.data.expiryTimeMillis ? parseInt(res.data.expiryTimeMillis) : 0) > Date.now();

      if (isAcknowledged && isActive && isNotExpired) {
        return { isValid: true };
      } else {
        let error = 'Purchase is not valid. ';
        if (!isAcknowledged) error += 'Not acknowledged. ';
        if (!isActive) error += 'Not active. ';
        if (!isNotExpired) error += 'Expired. ';
        return { isValid: false, error };
      }
    } catch (e: any) {
      console.error("Error validating purchase:", e.message);
      // Provide a more specific error for API issues
      if (e.code && e.code >= 400 && e.code < 500) {
          return { isValid: false, error: `Google API Error: ${e.message} (Code: ${e.code}). Please check your service account permissions and the provided purchase details.` };
      }
      return { isValid: false, error: e.message || 'An unknown error occurred during validation.' };
    }
  }
);
