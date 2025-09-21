'use server';

/**
 * @fileOverview An AI agent for assigning safety scores to detected elements in an image.
 *
 * - assignSafetyScore - A function that takes image analysis data and assigns safety scores to each element.
 * - AssignSafetyScoreInput - The input type for the assignSafetyScore function.
 * - AssignSafetyScoreOutput - The return type for the assignSafetyScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectedElementSchema = z.object({
  elementName: z.string().describe('The name or description of the detected element.'),
  confidence: z.number().describe('The confidence level of the detection (0-1).'),
});

const AssignSafetyScoreInputSchema = z.object({
  detectedElements: z.array(DetectedElementSchema).describe('An array of detected elements in the image.'),
});
export type AssignSafetyScoreInput = z.infer<typeof AssignSafetyScoreInputSchema>;

const SafetyScoreSchema = z.enum(['Safe', 'Moderate', 'DoNotUse']).describe('The safety score for the element.');

const AssignSafetyScoreOutputSchema = z.object({
  scoredElements: z.array(
    z.object({
      elementName: z.string().describe('The name or description of the detected element.'),
      safetyScore: SafetyScoreSchema,
      reason: z.string().describe('The reason for the assigned safety score.'),
    })
  ).describe('An array of detected elements with assigned safety scores and reasons.'),
});

export type AssignSafetyScoreOutput = z.infer<typeof AssignSafetyScoreOutputSchema>;

export async function assignSafetyScore(input: AssignSafetyScoreInput): Promise<AssignSafetyScoreOutput> {
  return assignSafetyScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assignSafetyScorePrompt',
  input: {schema: AssignSafetyScoreInputSchema},
  output: {schema: AssignSafetyScoreOutputSchema},
  prompt: `You are an AI assistant specializing in copyright analysis.

You are provided with a list of detected elements in an image. Your task is to assign a safety score to each element based on its potential copyright risk.

Safety Score Options:
- Safe: The element is highly unlikely to be copyrighted or trademarked.
- Moderate: The element may have some copyright or trademark concerns, use with caution.
- DoNotUse: The element is highly likely to be copyrighted or trademarked, avoid using it.

For each element, provide a safety score and a brief reason for the assigned score.

Detected Elements:
{{#each detectedElements}}
- Element Name: {{this.elementName}}, Confidence: {{this.confidence}}
{{/each}}`,
});

const assignSafetyScoreFlow = ai.defineFlow(
  {
    name: 'assignSafetyScoreFlow',
    inputSchema: AssignSafetyScoreInputSchema,
    outputSchema: AssignSafetyScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
