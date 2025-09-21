/**
 * @fileOverview Summarizes the scan results of an image, highlighting key copyright concerns and providing an overview of the overall risk level.
 *
 * - summarizeScanResults - A function that takes scan results as input and returns a summary of copyright concerns and overall risk level.
 * - SummarizeScanResultsInput - The input type for the summarizeScanresults function.
 * - SummarizeScanResultsOutput - The return type for the summarizeScanresults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeScanResultsInputSchema = z.object({
  scanResults: z.string().describe('The JSON string of scan results containing detected elements, confidence levels, and safety scores.'),
});
export type SummarizeScanResultsInput = z.infer<typeof SummarizeScanResultsInputSchema>;

const SummarizeScanResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the copyright concerns and overall risk level of the image based on the scan results.'),
});
export type SummarizeScanResultsOutput = z.infer<typeof SummarizeScanResultsOutputSchema>;

export async function summarizeScanResults(input: SummarizeScanResultsInput): Promise<SummarizeScanResultsOutput> {
  return summarizeScanResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeScanResultsPrompt',
  input: {schema: SummarizeScanResultsInputSchema},
  output: {schema: SummarizeScanResultsOutputSchema},
  prompt: `You are an AI assistant designed to summarize image scan results for copyright concerns.

  Given the scan results below, identify the key copyright concerns and provide an overview of the overall risk level associated with the image. Be concise and clear.

  Scan Results: {{{scanResults}}}
  `,
});

const summarizeScanResultsFlow = ai.defineFlow(
  {
    name: 'summarizeScanResultsFlow',
    inputSchema: SummarizeScanResultsInputSchema,
    outputSchema: SummarizeScanResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
