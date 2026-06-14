'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateExecutiveReportInputSchema = z.object({
  totalOutstanding: z.number().describe('Total outstanding value in portfolio.'),
  totalRecovered: z.number().describe('Total recovered value in portfolio.'),
  recoveryRate: z.number().describe('Overall portfolio recovery rate.'),
  activeCases: z.number().describe('Number of active cases in collection.'),
  agingDistribution: z.string().describe('Summary of debt by aging buckets.'),
  dcaPerformance: z.string().describe('Summary of agency performance scores.'),
});

export type GenerateExecutiveReportInput = z.infer<typeof GenerateExecutiveReportInputSchema>;

const GenerateExecutiveReportOutputSchema = z.object({
  reportTitle: z.string().describe('The professional title of the generated report.'),
  executiveSummary: z.string().describe('Markdown formatted C-level executive summary.'),
  trends: z.string().describe('Detailed analysis of monthly recovery rate trends.'),
  risks: z.string().describe('Analysis of write-off risks, aging buckets, and bottlenecks.'),
  recommendations: z.string().describe('Actionable strategic operations recommendations.'),
  pdfFormattedText: z.string().describe('A complete printable report formatted in clean Markdown ready for export.'),
});

export type GenerateExecutiveReportOutput = z.infer<typeof GenerateExecutiveReportOutputSchema>;

export async function generateExecutiveReport(input: GenerateExecutiveReportInput): Promise<GenerateExecutiveReportOutput> {
  return generateExecutiveReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveReportPrompt',
  input: { schema: GenerateExecutiveReportInputSchema },
  output: { schema: GenerateExecutiveReportOutputSchema },
  prompt: `You are the chief debt operations director. Compile a comprehensive, publication-quality executive briefing report based on these portfolio metrics.
  
  Portfolio Metrics:
  - Outstanding Portfolio Value: {{{totalOutstanding}}} USD
  - Recovered Value: {{{totalRecovered}}} USD
  - Global Recovery Rate: {{{recoveryRate}}}%
  - Active Caseload: {{{activeCases}}}
  - Overdue Debt Aging Distribution: {{{agingDistribution}}}
  - Agency Performance Leaderboard: {{{dcaPerformance}}}
  
  Write a high-fidelity report with five clear sections:
  1. A compelling title (e.g. "Q2 Receivables & Agency Recovery Audit").
  2. Executive Summary: High-level overview of collections health, key achievements, and performance indicators.
  3. Trends: Detailed breakdown of month-over-month recovery movements and velocity.
  4. Risks: Critique of aging buckets, stagnating files, write-off exposures, and underperforming partners.
  5. Recommendations: Direct actionable guidelines on routing assignments, settlement discount thresholds, and partner SLA compliance.
  6. PDF Formatted Text: Combine all the sections into a single, cohesive, publication-quality Markdown document complete with structured tables, horizontal rules, and bold headers, ready to be printed or exported.`,
});

export const generateExecutiveReportFlow = ai.defineFlow(
  {
    name: 'generateExecutiveReportFlow',
    inputSchema: GenerateExecutiveReportInputSchema,
    outputSchema: GenerateExecutiveReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
