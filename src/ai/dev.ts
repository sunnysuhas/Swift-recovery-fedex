import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-case-history.ts';
import '@/ai/flows/generate-case-action-plan.ts';
import '@/ai/flows/explain-case-priority.ts';
import '@/ai/flows/calculate-case-priority.ts';
import '@/ai/flows/predict-recovery-probability.ts';
import '@/ai/flows/classify-risk.ts';
import '@/ai/flows/recommend-recovery-strategy.ts';
import '@/ai/flows/generate-executive-report.ts';
import '@/ai/flows/analyze-csv-data.ts';
import '@/ai/flows/run-case-intelligence.ts';