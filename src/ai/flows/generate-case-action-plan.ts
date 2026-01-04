'use server';

/**
 * @fileOverview Generates a tailored action plan for a high-priority debt collection case.
 *
 * - generateCaseActionPlan - A function that generates an action plan for a debt collection case.
 * - GenerateCaseActionPlanInput - The input type for the generateCaseActionPlan function.
 * - GenerateCaseActionPlanOutput - The return type for the generateCaseActionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaseActionPlanInputSchema = z.object({
  debtAmount: z.number().describe('The amount of debt owed.'),
  aging: z.number().describe('The number of days the debt is overdue.'),
  customerPaymentBehavior: z.string().describe('A description of the customer payment behavior.'),
  historicalDCAperformance: z.string().describe('A description of the historical performance of the DCA.'),
});
export type GenerateCaseActionPlanInput = z.infer<typeof GenerateCaseActionPlanInputSchema>;

const GenerateCaseActionPlanOutputSchema = z.object({
  actionPlan: z.string().describe('A tailored action plan for the debt collection case, including recommended communication strategies and escalation steps.'),
});
export type GenerateCaseActionPlanOutput = z.infer<typeof GenerateCaseActionPlanOutputSchema>;

export async function generateCaseActionPlan(input: GenerateCaseActionPlanInput): Promise<GenerateCaseActionPlanOutput> {
  return generateCaseActionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaseActionPlanPrompt',
  input: {schema: GenerateCaseActionPlanInputSchema},
  output: {schema: GenerateCaseActionPlanOutputSchema},
  prompt: `You are an expert debt collection strategist. Based on the following information, generate a tailored action plan for this high-priority debt collection case, including recommended communication strategies and escalation steps.

Debt Amount: {{{debtAmount}}}
Aging: {{{aging}}} days
Customer Payment Behavior: {{{customerPaymentBehavior}}}
Historical DCA Performance: {{{historicalDCAperformance}}}

Action Plan:`,
});

const generateCaseActionPlanFlow = ai.defineFlow(
  {
    name: 'generateCaseActionPlanFlow',
    inputSchema: GenerateCaseActionPlanInputSchema,
    outputSchema: GenerateCaseActionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
