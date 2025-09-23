/**
 * @fileOverview Vercel Serverless Function for AI Image Analysis.
 *
 * This function acts as a public API endpoint that forwards requests
 * to the Genkit 'analyzeImageForCopyrightFlow'. It is deployed separately
 * from the static Next.js application.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeImageForCopyright, AnalyzeImageForCopyrightInput, AnalyzeImageForCopyrightOutput } from '@/ai/flows/analyze-image-for-copyright';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeImageForCopyrightOutput | { error: string }>
) {
  // Allow requests from any origin for the Capacitor app to call this.
  // In production, you might want to restrict this to your app's domain.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const input = req.body as AnalyzeImageForCopyrightInput;

    if (!input.photoDataUri) {
        return res.status(400).json({ error: 'Missing photoDataUri in request body' });
    }

    const result = await analyzeImageForCopyright(input);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in analyze API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ error: `Failed to analyze image: ${errorMessage}` });
  }
}
