'use server';

import {
  type ValidatePurchaseInput,
  type ValidatePurchaseOutput,
} from '@/lib/types';

/**
 * A server action to validate a purchase. This acts as a secure bridge
 * between the client-side purchase service and the server-side API route.
 * It calls our internal API, ensuring no server-side libraries are bundled with the client.
 */
export async function validatePurchaseAction(
  input: ValidatePurchaseInput
): Promise<ValidatePurchaseOutput> {
  // The API base must be an absolute URL to work in server-to-server communication.
  // Ensure NEXT_PUBLIC_APP_URL is set in your environment variables.
  const apiBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiBase}/api/validate-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Validation request failed with status ${response.status}`);
    }

    return result as ValidatePurchaseOutput;
    
  } catch (error) {
    console.error('Error in validatePurchaseAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return { isValid: false, error: errorMessage };
  }
}
