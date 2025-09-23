/**
 * @fileOverview Next.js App Router API Route for AI Image Analysis.
 * This route handler is the standard, modern way to create API endpoints in Next.js.
 */
import { NextResponse } from 'next/server';
import { analyzeImageForCopyright } from '@/ai/flows/analyze-image-for-copyright';

// These headers are crucial for allowing the mobile app (running on a different origin)
// to communicate with this API endpoint.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * This function handles the pre-flight "OPTIONS" request that browsers and WebViews
 * send to check for CORS permissions before sending the actual POST request.
 * Responding to this correctly is critical for the mobile app to work.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // No Content
    headers: CORS_HEADERS,
  });
}

/**
 * This function handles the main POST request which contains the image data.
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
        headers: CORS_HEADERS, // Include CORS headers on error responses too
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
      headers: CORS_HEADERS // Include CORS headers on the success response
    });

  } catch (error) {
    console.error('Error in analyze API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: `Failed to analyze image: ${errorMessage}` }), {
      status: 500,
      headers: CORS_HEADERS, // Include CORS headers on server error responses
    });
  }
}
