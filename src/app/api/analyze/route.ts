/**
 * @fileOverview Next.js App Router API Route for AI Image Analysis.
 * This route handler is the standard, modern way to create API endpoints in Next.js.
 */
import { NextResponse } from 'next/server';
import { analyzeImageForCopyright } from '@/ai/flows/analyze-image-for-copyright';

// Increase the timeout for this specific function. Large image uploads and AI analysis can take time.
export const maxDuration = 60; // 60 seconds

/**
 * This function handles the main POST request which contains the image data.
 * CORS is handled globally in `next.config.js`.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isAiGenerated = formData.get('isAiGenerated') === 'true';
    const isUserCreated = formData.get('isUserCreated') === 'true';

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'Missing file in request body' }), {
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call the AI flow with the image buffer and context
    const result = await analyzeImageForCopyright({ 
        image: buffer, 
        mimeType: file.type,
        isAiGenerated,
        isUserCreated
    });

    // Return the successful analysis result
    return new NextResponse(JSON.stringify(result), { 
      status: 200, 
    });

  } catch (error) {
    console.error('Error in analyze API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: `Failed to analyze image: ${errorMessage}` }), {
      status: 500,
    });
  }
}
