
import { analyzeImageForCopyright } from '@/ai/flows/analyze-image-for-copyright';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await analyzeImageForCopyright(input);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to analyze image: ${errorMessage}` }, { status: 500 });
  }
}
