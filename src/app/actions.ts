'use server';

import { analyzeImageForCopyright, type AnalyzeImageForCopyrightOutput } from '@/ai/flows/analyze-image-for-copyright';

export async function analyzeImageAction(photoDataUri: string): Promise<{ success: true, data: AnalyzeImageForCopyrightOutput } | { success: false, error: string }> {
  try {
    const result = await analyzeImageForCopyright({ photoDataUri });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in analyzeImageAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to analyze image: ${errorMessage}` };
  }
}
