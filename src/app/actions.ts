'use client';
import { type AnalyzeImageForCopyrightInput, type AnalyzeImageForCopyrightOutput } from '@/lib/types';

// Use the public environment variable for the API URL, defaulting to /api for local dev
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function analyzeImageAction(input: AnalyzeImageForCopyrightInput): Promise<{ success: true, data: AnalyzeImageForCopyrightOutput } | { success: false, error: string }> {
  try {
    // Construct the full URL for the API endpoint
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
