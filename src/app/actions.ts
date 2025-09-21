'use server';

import { analyzeImageForCopyright } from '@/ai/flows/analyze-image-for-copyright';

export async function analyzeImageAction(photoDataUri: string) {
  try {
    const result = await analyzeImageForCopyright({ photoDataUri });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in analyzeImageAction:', error);
    return { success: false, error: 'Failed to analyze image.' };
  }
}
