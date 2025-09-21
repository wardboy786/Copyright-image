export type SafetyScore = 'Safe to use' | 'Moderate' | 'Do not use';

export interface DetectedElement {
  name: string;
  type: string;
  safetyScore: SafetyScore;
  confidence: number;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  image: string; // data URI of the uploaded image
  elements: DetectedElement[];
}
