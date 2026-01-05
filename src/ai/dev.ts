import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-case-history.ts';
import '@/ai/flows/generate-case-action-plan.ts';
import '@/ai/flows/explain-case-priority.ts';
import '@/ai/flows/calculate-case-priority.ts';