'use server';

/**
 * @fileOverview Summarizes the history of a debt collection case.
 *
 * - summarizeCaseHistory - A function that summarizes the case history.
 * - SummarizeCaseHistoryInput - The input type for the summarizeCaseHistory function.
 * - SummarizeCaseHistoryOutput - The return type for the summarizeCaseHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCaseHistoryInputSchema = z.object({
  caseHistory: z
    .string()
    .describe(
      'The history of communications and payment attempts for a specific debt collection case.'
    ),
});
export type SummarizeCaseHistoryInput = z.infer<typeof SummarizeCaseHistoryInputSchema>;

const SummarizeCaseHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the debt collection case history.'),
});
export type SummarizeCaseHistoryOutput = z.infer<typeof SummarizeCaseHistoryOutputSchema>;

export async function summarizeCaseHistory(
  input: SummarizeCaseHistoryInput
): Promise<SummarizeCaseHistoryOutput> {
  return summarizeCaseHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCaseHistoryPrompt',
  input: {schema: SummarizeCaseHistoryInputSchema},
  output: {schema: SummarizeCaseHistoryOutputSchema},
  prompt: `You are a debt collection expert. Please summarize the following case history:

Case History:
{{caseHistory}}`,
});

const summarizeCaseHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeCaseHistoryFlow',
    inputSchema: SummarizeCaseHistoryInputSchema,
    outputSchema: SummarizeCaseHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
