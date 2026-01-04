'use server';

/**
 * @fileOverview Explains the priority of a debt collection case.
 *
 * - explainCasePriority - A function that explains the case priority.
 * - ExplainCasePriorityInput - The input type for the explainCasePriority function.
 * - ExplainCasePriorityOutput - The return type for the explainCasePriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCasePriorityInputSchema = z.object({
  debtAmount: z.number().describe('The amount of debt in the case.'),
  aging: z.number().describe('The number of days the debt is overdue.'),
  historicalDcaPerformance: z.number().describe('The historical performance of the DCA as a percentage.'),
});
export type ExplainCasePriorityInput = z.infer<typeof ExplainCasePriorityInputSchema>;

const ExplainCasePriorityOutputSchema = z.object({
  explanation: z.string().describe('The explanation of why the case has the given priority score.'),
});
export type ExplainCasePriorityOutput = z.infer<typeof ExplainCasePriorityOutputSchema>;

export async function explainCasePriority(input: ExplainCasePriorityInput): Promise<ExplainCasePriorityOutput> {
  return explainCasePriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCasePriorityPrompt',
  input: {schema: ExplainCasePriorityInputSchema},
  output: {schema: ExplainCasePriorityOutputSchema},
  prompt: `You are an expert financial analyst explaining debt collection case priorities.

  Given the following information about a debt collection case, explain why it has the priority that it does.

  Debt Amount: {{{debtAmount}}}
  Aging: {{{aging}}}
  Historical DCA Performance: {{{historicalDcaPerformance}}}

  Provide a concise explanation of the factors contributing to the case's priority score.`, 
});

const explainCasePriorityFlow = ai.defineFlow(
  {
    name: 'explainCasePriorityFlow',
    inputSchema: ExplainCasePriorityInputSchema,
    outputSchema: ExplainCasePriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
