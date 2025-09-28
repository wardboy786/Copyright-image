import { type AnalyzeImageForCopyrightOutput as GenkitAnalyzeImageForCopyrightOutput } from "@/ai/flows/analyze-image-for-copyright";

export type OverallAssessment = 'Safe to use' | 'Moderate' | 'Copyright Detected';

// Extend the Genkit output type to ensure it includes the optional box property
export interface AnalysisBreakdownItem {
    name: string;
    explanation: string;
    box?: number[];
}

export interface AnalyzeImageForCopyrightOutput extends Omit<GenkitAnalyzeImageForCopyrightOutput, 'breakdown'> {
    breakdown: AnalysisBreakdownItem[];
}

export interface ScanResult {
  id: string;
  timestamp: string;
  image: string; // data URI of the uploaded image
  analysis: AnalyzeImageForCopyrightOutput;
}

// Types for Purchase Validation
export interface ValidatePurchaseInput {
  packageName: string;
  productId: string;
  purchaseToken: string;
}

export interface ValidatePurchaseOutput {
  isValid: boolean;
  error?: string;
}


// Types for In-App Purchases
export type Offer = {
  id: string;
  price: {
    amount: number;
    formatted: string;
  };
  // Add other properties as needed from the plugin
};

export type Product = {
  id: string;
  title: string;
  description: string;
  offers: Offer[];
};
