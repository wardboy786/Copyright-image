import { type AnalyzeImageForCopyrightInput, type AnalyzeImageForCopyrightOutput } from "@/ai/flows/analyze-image-for-copyright";

export type OverallAssessment = 'Safe to use' | 'Moderate' | 'Copyright Detected';

export interface ScanResult {
  id: string;
  timestamp: string;
  image: string; // data URI of the uploaded image
  analysis: AnalyzeImageForCopyrightOutput;
}

export type { AnalyzeImageForCopyrightInput, AnalyzeImageForCopyrightOutput };
