'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateCasePriorityInputSchema = z.object({
    debtAmount: z.number().describe('The amount of debt in the case.'),
    aging: z.number().describe('The number of days the debt is overdue.'),
    paymentBehavior: z.string().describe('Description of the debtor\'s payment behavior.'),
});
export type CalculateCasePriorityInput = z.infer<typeof CalculateCasePriorityInputSchema>;

const CalculateCasePriorityOutputSchema = z.object({
    priorityScore: z.number().describe('A priority score between 0 and 100.'),
    reasoning: z.string().describe('Brief reasoning for the score.'),
});
export type CalculateCasePriorityOutput = z.infer<typeof CalculateCasePriorityOutputSchema>;

export async function calculateCasePriority(input: CalculateCasePriorityInput): Promise<CalculateCasePriorityOutput> {
    return calculateCasePriorityFlow(input);
}

const prompt = ai.definePrompt({
    name: 'calculateCasePriorityPrompt',
    input: { schema: CalculateCasePriorityInputSchema },
    output: { schema: CalculateCasePriorityOutputSchema },
    prompt: `You are an expert AI collection manager. Calculate a priority score (0-100) for this debt case.
  Higher score means higher priority for collection.
  
  Consider:
  - Higher amounts are higher priority.
  - Older debts (aging) might be harder to collect (lower priority?) OR higher urgency? Rule: 30-90 days is High Priority zone. >120 days is lower probability.
  - Poor payment behavior increases urgency but might decrease probability.
  
  Case Details:
  - Amount: {{{debtAmount}}}
  - Aging: {{{aging}}} days
  - Behavior: {{{paymentBehavior}}}

  Return the Score and Reasoning.`,
});

const calculateCasePriorityFlow = ai.defineFlow(
    {
        name: 'calculateCasePriorityFlow',
        inputSchema: CalculateCasePriorityInputSchema,
        outputSchema: CalculateCasePriorityOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
