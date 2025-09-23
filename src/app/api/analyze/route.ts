/**
 * @fileOverview Next.js App Router API Route for AI Image Analysis.
 * This route handler replaces the Vercel Serverless Function.
 */
import { NextResponse } from 'next/server';
import { analyzeImageForCopyright, AnalyzeImageForCopyrightInput, AnalyzeImageForCopyrightOutput } from '@/ai/flows/analyze-image-for-copyright';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// This function handles preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  try {
    const input = await req.json() as AnalyzeImageForCopyrightInput;

    if (!input.photoDataUri) {
      return new NextResponse(JSON.stringify({ error: 'Missing photoDataUri in request body' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const result = await analyzeImageForCopyright(input);
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
