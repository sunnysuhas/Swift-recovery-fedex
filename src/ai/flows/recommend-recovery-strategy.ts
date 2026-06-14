'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendRecoveryStrategyInputSchema = z.object({
  debtAmount: z.number().describe('The amount of debt in the case.'),
  aging: z.number().describe('The number of days the debt is overdue.'),
  paymentBehavior: z.string().describe("Description of the debtor's payment behavior."),
  caseHistory: z.string().describe('Chronological history of communications and actions.'),
});

export type RecommendRecoveryStrategyInput = z.infer<typeof RecommendRecoveryStrategyInputSchema>;

const RecommendRecoveryStrategyOutputSchema = z.object({
  strategyName: z.string().describe('Title of the recommended recovery strategy.'),
  recommendedChannel: z.enum(['Email', 'Phone', 'Letter', 'Legal', 'DCA']).describe('Primary recommended channel of engagement.'),
  actionSteps: z.array(z.string()).describe('Step-by-step actionable plan for recovery.'),
  expectedTimeline: z.string().describe('Expected time to recovery under this strategy.'),
  suggestedDiscount: z.number().describe('Suggested discount percentage to offer for settlement (0 to 50).'),
  escalationPath: z.string().describe('Next steps if this strategy fails within the expected timeline.'),
});

export type RecommendRecoveryStrategyOutput = z.infer<typeof RecommendRecoveryStrategyOutputSchema>;

export async function recommendRecoveryStrategy(input: RecommendRecoveryStrategyInput): Promise<RecommendRecoveryStrategyOutput> {
  return recommendRecoveryStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendRecoveryStrategyPrompt',
  input: { schema: RecommendRecoveryStrategyInputSchema },
  output: { schema: RecommendRecoveryStrategyOutputSchema },
  prompt: `You are a professional debt negotiation and recovery director. Reconstruct the recovery path for this account.
  Based on the amount, aging, payment behavior, and history of actions, formulate a recovery strategy.
  
  Case Data:
  - Amount: {{{debtAmount}}} USD
  - Aging: {{{aging}}} days overdue
  - Payment Behavior: {{{paymentBehavior}}}
  - Case History: {{{caseHistory}}}
  
  Formulate:
  1. A clear strategy name (e.g., "Graduated Settlement Offer", "Aggressive DCA Assignment", "Soft Reminders & Payment Plan").
  2. The primary channel: 'Email' | 'Phone' | 'Letter' | 'Legal' | 'DCA'.
  3. Action steps: 3-5 concrete sequential tasks.
  4. Expected timeline (e.g., "14 days", "30 days", "Immediate legal referral").
  5. Suggested settlement discount percentage (0 to 50) if negotiating a write-down.
  6. An escalation path (what to do next if they do not respond).`,
});

export const recommendRecoveryStrategyFlow = ai.defineFlow(
  {
    name: 'recommendRecoveryStrategyFlow',
    inputSchema: RecommendRecoveryStrategyInputSchema,
    outputSchema: RecommendRecoveryStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
