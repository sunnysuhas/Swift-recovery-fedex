'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClassifyRiskInputSchema = z.object({
  debtAmount: z.number().describe('The amount of debt in the case.'),
  aging: z.number().describe('The number of days the debt is overdue.'),
  paymentBehavior: z.string().describe("Description of the debtor's payment behavior."),
});

export type ClassifyRiskInput = z.infer<typeof ClassifyRiskInputSchema>;

const ClassifyRiskOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The classified risk tier of the case.'),
  riskScore: z.number().describe('Calculated risk score from 0 (safest) to 100 (most risky).'),
  primaryDrivers: z.array(z.string()).describe('Primary reasons or drivers contributing to this risk level.'),
  mitigationSteps: z.array(z.string()).describe('Immediate recommended actions to mitigate or resolve the risks.'),
});

export type ClassifyRiskOutput = z.infer<typeof ClassifyRiskOutputSchema>;

export async function classifyRisk(input: ClassifyRiskInput): Promise<ClassifyRiskOutput> {
  return classifyRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyRiskPrompt',
  input: { schema: ClassifyRiskInputSchema },
  output: { schema: ClassifyRiskOutputSchema },
  prompt: `You are an expert enterprise credit controller. Classify the financial and collection risk of this outstanding case.
  
  Guidelines for risk tiers:
  - Critical: Outstanding debt > $10,000 and aging > 120 days, or complete refusal to pay.
  - High: Aging > 90 days, or history of broken payment agreements.
  - Medium: Aging 30-90 days, or slow/delayed responses.
  - Low: Aging < 30 days, positive engagement.
  
  Case Details:
  - Amount: {{{debtAmount}}} USD
  - Aging: {{{aging}}} days overdue
  - Debtor Behavior: {{{paymentBehavior}}}
  
  Classify the risk level ('Low', 'Medium', 'High', 'Critical'), provide a 0-100 risk score, identify 2-3 primary drivers of risk, and lay out 2-3 immediate, actionable mitigation steps.`,
});

export const classifyRiskFlow = ai.defineFlow(
  {
    name: 'classifyRiskFlow',
    inputSchema: ClassifyRiskInputSchema,
    outputSchema: ClassifyRiskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
