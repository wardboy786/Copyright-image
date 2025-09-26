import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-scan-results.ts';
import '@/ai/flows/assign-safety-score.ts';
import '@/ai/flows/analyze-image-for-copyright.ts';
import '@/ai/flows/validate-purchase-flow.ts';
