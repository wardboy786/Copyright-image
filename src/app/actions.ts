'use client';
import { type AnalyzeImageForCopyrightOutput } from '@/lib/types';

// The API base must be an absolute URL to work in the Capacitor WebView.
const API_BASE = 'https://copyright-image.vercel.app/api';

/**
 * @deprecated This action is deprecated and will be removed. Use the `startScan` method from `useAppContext` instead.
 */
export async function analyzeImageAction(file: File, isAiGenerated: boolean, isUserCreated: boolean): Promise<{ success: true, data: AnalyzeImageForCopyrightOutput } | { success: false, error: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isAiGenerated', String(isAiGenerated));
    formData.append('isUserCreated', String(isUserCreated));

    // Use the absolute URL for the fetch request
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
        // IMPORTANT: Do NOT manually set the 'Content-Type' header when using FormData.
        // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
    });

    if (!response.ok) {
        let errorData;
        try {
          // Try to parse a JSON error response from the server
          errorData = await response.json();
        } catch (e) {
          // If the response isn't JSON, use the status text
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
        }
        // Use the specific error from the server if available
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error('Error in analyzeImageAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to analyze image: ${errorMessage}` };
  }
}
