'use client';
import { type AnalyzeImageForCopyrightInput, type AnalyzeImageForCopyrightOutput } from '@/lib/types';

// The API base will always be a relative path.
// On the web, it calls the same domain.
// In Capacitor with a `server.url`, it calls that URL.
const API_BASE = '/api';

export async function analyzeImageAction(input: AnalyzeImageForCopyrightInput): Promise<{ success: true, data: AnalyzeImageForCopyrightOutput } | { success: false, error: string }> {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // The response was not JSON
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
        }
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
