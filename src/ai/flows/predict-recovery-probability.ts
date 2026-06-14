'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictRecoveryProbabilityInputSchema = z.object({
  debtAmount: z.number().describe('The amount of debt in the case.'),
  aging: z.number().describe('The number of days the debt is overdue.'),
  paymentBehavior: z.string().describe("Description of the debtor's payment behavior."),
});

export type PredictRecoveryProbabilityInput = z.infer<typeof PredictRecoveryProbabilityInputSchema>;

const PredictRecoveryProbabilityOutputSchema = z.object({
  recoveryProbability: z.number().describe('The predicted probability of recovery as a percentage (0-100).'),
  confidenceScore: z.number().describe('Confidence level of this prediction (0-100).'),
  keyFactors: z.array(z.string()).describe('List of key factors influencing this prediction.'),
  explanation: z.string().describe('A concise explanation detailing why this probability was predicted.'),
});

export type PredictRecoveryProbabilityOutput = z.infer<typeof PredictRecoveryProbabilityOutputSchema>;

export async function predictRecoveryProbability(input: PredictRecoveryProbabilityInput): Promise<PredictRecoveryProbabilityOutput> {
  return predictRecoveryProbabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictRecoveryProbabilityPrompt',
  input: { schema: PredictRecoveryProbabilityInputSchema },
  output: { schema: PredictRecoveryProbabilityOutputSchema },
  prompt: `You are an expert AI risk analyst specializing in commercial debt collection.
  Analyze the following debt case and predict the probability of successful recovery.
  
  Consider these guidelines:
  - Higher amounts generally have more friction but higher focus. Very large amounts without structured collateral are harder.
  - Older debts (aging) have exponentially declining recovery probability. 
    - <30 days: very high (80-95%)
    - 30-90 days: moderate (60-80%)
    - 91-180 days: low-moderate (40-60%)
    - >180 days: low (10-30%)
  - Payment behavior is critical:
    - Active responsiveness, disputes, broken promises, or complete radio silence significantly shift probability.
  
  Case Data:
  - Amount: {{{debtAmount}}} USD
  - Aging: {{{aging}}} days overdue
  - Payment Behavior: {{{paymentBehavior}}}
  
  Predict the Recovery Probability (0-100), confidence score, identify key factors (both positive and negative), and write a clear, concise explanation.`,
});

export const predictRecoveryProbabilityFlow = ai.defineFlow(
  {
    name: 'predictRecoveryProbabilityFlow',
    inputSchema: PredictRecoveryProbabilityInputSchema,
    outputSchema: PredictRecoveryProbabilityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
