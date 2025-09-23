/**
 * @fileOverview Next.js App Router API Route for AI Image Analysis.
 * This route handler replaces the Vercel Serverless Function.
 */
import { NextResponse } from 'next/server';
import { analyzeImageForCopyright } from '@/ai/flows/analyze-image-for-copyright';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// This function handles preflight requests for CORS.
// It's required for the browser to allow the 'POST' request from a different origin.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isAiGenerated = formData.get('isAiGenerated') === 'true';
    const isUserCreated = formData.get('isUserCreated') === 'true';

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'Missing file in request body' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await analyzeImageForCopyright({ 
        image: buffer, 
        mimeType: file.type,
        isAiGenerated,
        isUserCreated
    });
    return new NextResponse(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });

  } catch (error) {
    console.error('Error in analyze API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: `Failed to analyze image: ${errorMessage}` }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
