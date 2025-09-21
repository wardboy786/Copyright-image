import { type AnalyzeImageForCopyrightInput as GenkitAnalyzeImageForCopyrightInput, type AnalyzeImageForCopyrightOutput as GenkitAnalyzeImageForCopyrightOutput } from "@/ai/flows/analyze-image-for-copyright";

export type OverallAssessment = 'Safe to use' | 'Moderate' | 'Copyright Detected';

// Extend the Genkit output type to ensure it includes the optional box property
export interface AnalysisBreakdownItem extends GenkitAnalyzeImageForCopyrightOutput['breakdown'][0] {
    box?: number[];
}

export interface AnalyzeImageForCopyrightOutput extends GenkitAnalyzeImageForCopyrightOutput {
    breakdown: AnalysisBreakdownItem[];
}

export type AnalyzeImageForCopyrightInput = GenkitAnalyzeImageForCopyrightInput;


export interface ScanResult {
  id: string;
  timestamp: string;
  image: string; // data URI of the uploaded image
  analysis: AnalyzeImageForCopyrightOutput;
}

    