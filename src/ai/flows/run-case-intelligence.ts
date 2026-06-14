'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RunCaseIntelligenceInputSchema = z.object({
  debtAmount: z.number().describe('The amount of debt in the case.'),
  aging: z.number().describe('The number of days the debt is overdue.'),
  paymentBehavior: z.string().describe("Description of the debtor's payment behavior."),
  caseHistory: z.string().describe('Chronological history of communications and actions.'),
  dcaNameList: z.string().describe('List of available debt collection agencies and their stats.'),
});

export type RunCaseIntelligenceInput = z.infer<typeof RunCaseIntelligenceInputSchema>;

const RunCaseIntelligenceOutputSchema = z.object({
  recoveryProbability: z.number().describe('The predicted probability of recovery as a percentage (0-100).'),
  riskClassification: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The classified risk tier of the debtor.'),
  suggestedCommunicationStrategy: z.string().describe('Recommended tone and frequency of communications.'),
  recommendedDCA: z.string().describe('The exact name of the DCA recommended for assignment.'),
  escalationRecommendation: z.string().describe('Specific actions to take if communication fails.'),
  expectedRecoveryAmount: z.number().describe('Expected return amount calculated based on probability and balance.'),
  timelineForecast: z.string().describe('Predicted timeline to recovery (e.g. "Within 14 days", "30-60 days", "Unrecoverable").'),
  actionSteps: z.array(z.string()).describe('Step-by-step sequential tasks to execute.'),
  suggestedDiscount: z.number().describe('Suggested negotiation write-down or settlement percentage (0 to 50).'),
  confidenceScore: z.number().describe('AI confidence rating of this audit (0-100).'),
  keyFactors: z.array(z.string()).describe('Primary factors (positive or negative) driving this assessment.'),
});

export type RunCaseIntelligenceOutput = z.infer<typeof RunCaseIntelligenceOutputSchema>;

export async function runCaseIntelligence(input: RunCaseIntelligenceInput): Promise<RunCaseIntelligenceOutput> {
  return runCaseIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runCaseIntelligencePrompt',
  input: { schema: RunCaseIntelligenceInputSchema },
  output: { schema: RunCaseIntelligenceOutputSchema },
  prompt: `You are the principal AI advisor at RecoveryOS. Perform a rigorous, multi-factor intelligence audit on this outstanding receivable.
  
  Case Parameters:
  - Total Balance: {{{debtAmount}}} USD
  - Overdue Days (Aging): {{{aging}}} days
  - Debtor Payment Behavior: {{{paymentBehavior}}}
  - Communications Logs (History): {{{caseHistory}}}
  - Available Partner DCAs: {{{dcaNameList}}}
  
  Guidelines:
  1. Determine recovery probability (0-100).
  2. Classify risk tier ('Low' | 'Medium' | 'High' | 'Critical') based on aging and responsiveness.
  3. Formulate expected recovery amount (model probability * balance, adjusted for aging friction).
  4. Select the best DCA matching the balance size and history from the available DCA list.
  5. Detail a custom communication strategy (e.g., "Direct phone contact during business hours with warning language").
  6. Provide sequential action steps.
  7. Formulate escalation guidelines and expected collection timelines.
  8. Suggest a settlement discount (0-50).
  9. Add key factors driving the model decision.
  
  Return the structured details matching the output schema.`,
});

export const runCaseIntelligenceFlow = ai.defineFlow(
  {
    name: 'runCaseIntelligenceFlow',
    inputSchema: RunCaseIntelligenceInputSchema,
    outputSchema: RunCaseIntelligenceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
