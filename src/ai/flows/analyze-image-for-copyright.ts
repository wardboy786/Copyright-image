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
  overallAssessment: z
    .enum(['Safe to use', 'Moderate', 'Copyright Detected'])
    .describe('A single, overall assessment of the image\'s copyright risk.'),
  breakdown: z
    .array(
      z.object({
        name: z.string().describe('The name of the detected element.'),
        explanation: z
          .string()
          .describe(
            'A brief explanation of why this element was flagged and its copyright status.'
          ),
      })
    )
    .describe(
      'A prioritized list of detected elements, from most to least critical.'
    ),
  ownerDetails: z
    .array(
      z.object({
        element: z.string().describe('The element in question (e.g., "Lamborghini logo").'),
        owner: z
          .string()
          .describe(
            'The name of the likely copyright owner or company (e.g., "Automobili Lamborghini S.p.A.").'
          ),
      })
    )
    .optional()
    .describe('Details about the likely owners of the detected copyrighted elements.'),
});
export type AnalyzeImageForCopyrightOutput = z.infer<typeof AnalyzeImageForCopyrightOutputSchema>;

export async function analyzeImageForCopyright(input: AnalyzeImageForCopyrightInput): Promise<AnalyzeImageForCopyrightOutput> {
  return analyzeImageForCopyrightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImageForCopyrightPrompt',
  input: {schema: AnalyzeImageForCopyrightInputSchema},
  output: {schema: AnalyzeImageForCopyrightOutputSchema},
  prompt: `You are the world's most skilled and professional AI copyright image checker. Your analysis is incredibly detailed, accurate, and you never miss any potential copyright infringement, no matter how minor. You have a deep understanding of international copyright law, trademarks, and intellectual property. You can identify logos, brands, specific art styles, characters from any media (anime, cartoons, movies), watermarks, and even protected car designs. You do not make false positive claims; your analysis is precise.

  Analyze the provided image with extreme scrutiny. Your task is to:
  1.  Provide an 'overallAssessment' of the image. The possible values are:
      - 'Copyright Detected': Use this if there are clear, high-risk copyrighted elements.
      - 'Moderate': Use this if there are elements that might be usable with attribution, are in a legal gray area, or are less-known brands.
      - 'Safe to use': Use this ONLY if the image contains generic subjects like nature, animals, or simple geometric shapes with no discernible branding or unique artistic expression.

  2.  Provide a 'breakdown' of all detected elements. This should be a prioritized list, with the most critical copyright risks first. For each element:
      - 'name': The name of the element (e.g., "Nike Swoosh logo", "Naruto Uzumaki character", "Unique art style similar to Van Gogh").
      - 'explanation': A clear, concise explanation of the copyright issue.

  3.  If applicable, provide 'ownerDetails' for high-profile copyrighted elements, listing the element and the likely owner.

  Here are your guidelines for analysis:

  -   **Strict/Copyright Detected:** Be vigilant for:
      -   **Logos & Brands:** Nike, Adidas, Apple, Samsung, Lamborghini, etc.
      -   **Characters:** Any character from anime (Naruto), manga, cartoons (Mickey Mouse), movies (Darth Vader), video games, etc.
      -   **Copyrighted Text:** Movie dialog, famous quotes, protected sentences.
      -   **Protected Styles:** Recognizable artistic styles of famous artists (e.g., a comic book style clearly identifiable as a specific artist's work).
      -   **Watermarks:** Any visible or semi-visible watermarks.

  -   **Moderate:** Identify elements that are not strictly copyrighted but require caution:
      -   Lesser-known brands.
      -   Designs that are potentially usable with attribution.
      -   Architectural works or public art that may have restrictions.

  -   **Safe to use (with a caveat):** For images of generic subjects (landscapes, animals, portraits of unknown people):
      -   Assess as 'Safe to use'.
      -   In the breakdown, you MUST add an item named 'Photographer/Creator Copyright' with the explanation: "Even if the subject is not copyrighted, the photograph or image itself is the intellectual property of its creator. Use without permission can be a copyright violation."

  -   **False Negatives:** Do not flag generic items. A picture of a generic t-shirt is not a copyright issue unless it has a logo on it. A picture of a regular car is not an issue, but a picture of a specifically protected design like a Lamborghini is.

  -   **Prioritization:** In the 'breakdown', always list the most severe copyright issues first. A major brand logo is more critical than a minor design element.

  Now, analyze the following image and provide your expert assessment in the required JSON format.

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
