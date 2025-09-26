'use server';

import {
  validatePurchase,
  type ValidatePurchaseInput,
  type ValidatePurchaseOutput,
} from '@/ai/flows/validate-purchase-flow';

/**
 * A server action to validate a purchase. This acts as a secure bridge
 * between the client-side purchase service and the server-side Genkit flow.
 */
export async function validatePurchaseAction(
  input: ValidatePurchaseInput
): Promise<ValidatePurchaseOutput> {
  return await validatePurchase(input);
}
