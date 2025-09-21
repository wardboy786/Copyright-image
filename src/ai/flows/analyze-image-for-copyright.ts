'use server';
/**
 * @fileOverview AI-powered copyright analysis flow for images.
 *
 * - analyzeImageForCopyright - Analyzes an image for potential copyright infringements.
 * - AnalyzeImageForCopyrightInput - The input type for the analyzeImageForCopyright function.
 * - AnalyzeImageForCopyrightOutput - The return type for the analyzeImageForCopyright function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageForCopyrightInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze for copyright infringements, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageForCopyrightInput = z.infer<typeof AnalyzeImageForCopyrightInputSchema>;

const AnalyzeImageForCopyrightOutputSchema = z.object({
  elements: z.array(
    z.object({
      name: z.string().describe('The name of the detected element.'),
      type: z.string().describe('The type of the detected element (logo, brand name, character, etc.).'),
      safetyScore: z
        .enum(['Safe to use', 'Moderate', 'Do not use'])
        .describe('The safety score of the detected element.'),
      confidence: z.number().describe('The confidence level of the detection (0-1).'),
    })
  ).describe('The list of detected elements and their safety scores.'),
});
export type AnalyzeImageForCopyrightOutput = z.infer<typeof AnalyzeImageForCopyrightOutputSchema>;

export async function analyzeImageForCopyright(input: AnalyzeImageForCopyrightInput): Promise<AnalyzeImageForCopyrightOutput> {
  return analyzeImageForCopyrightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImageForCopyrightPrompt',
  input: {schema: AnalyzeImageForCopyrightInputSchema},
  output: {schema: AnalyzeImageForCopyrightOutputSchema},
  prompt: `You are an AI copyright analysis expert. Analyze the image provided and identify any potential copyright infringements, including logos, brand names, and copyrighted characters.

    Break down the image into detectable elements and assign a safety score to each element, indicating the risk level:

    - Safe to use
    - Moderate
    - Do not use

    Return a JSON object containing a list of the detected elements, their types, safety scores, and confidence levels.

    Image: {{media url=photoDataUri}}
    `,
});

const analyzeImageForCopyrightFlow = ai.defineFlow(
  {
    name: 'analyzeImageForCopyrightFlow',
    inputSchema: AnalyzeImageForCopyrightInputSchema,
    outputSchema: AnalyzeImageForCopyrightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
