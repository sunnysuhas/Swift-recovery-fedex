'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeCsvDataInputSchema = z.object({
  fileName: z.string().describe('The name of the uploaded CSV file.'),
  rowCount: z.number().describe('The total number of rows found in the CSV.'),
  previewRows: z.string().describe('JSON-serialized array of the first few rows (preview).'),
  dataType: z.enum(['cases', 'dcas']).describe('The expected data type of the CSV file.'),
});

export type AnalyzeCsvDataInput = z.infer<typeof AnalyzeCsvDataInputSchema>;

const AnalyzeCsvDataOutputSchema = z.object({
  dataQualityScore: z.number().describe('Calculated data quality score from 0 to 100.'),
  missingFields: z.array(z.string()).describe('Identified missing fields or headers.'),
  invalidFormats: z.array(z.string()).describe('Formatting issues, invalid data types, or out of bounds numbers.'),
  duplicateDetection: z.array(z.string()).describe('Identified duplicated rows or potential duplicates.'),
  assignmentSuggestions: z.array(z.string()).describe('Recommended collection agency assignments based on case attributes.'),
  summary: z.string().describe('Data summary analysis (Markdown formatted).'),
});

export type AnalyzeCsvDataOutput = z.infer<typeof AnalyzeCsvDataOutputSchema>;

export async function analyzeCsvData(input: AnalyzeCsvDataInput): Promise<AnalyzeCsvDataOutput> {
  return analyzeCsvDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCsvDataPrompt',
  input: { schema: AnalyzeCsvDataInputSchema },
  output: { schema: AnalyzeCsvDataOutputSchema },
  prompt: `You are an expert data quality and collections auditor. Analyze the following CSV upload profile and preview data.
  
  CSV Metadata:
  - File Name: {{{fileName}}}
  - Row Count: {{{rowCount}}} rows
  - Data Type: {{{dataType}}}
  - Preview Rows (JSON): {{{previewRows}}}
  
  Examine the structure, column headers, duplicate rows, missing values, and formatting parameters.
  
  Formulate:
  1. A data quality score between 0 (corrupt) and 100 (perfect compliance).
  2. List of missing fields or recommended headers.
  3. List of formatting errors (e.g. non-numeric characters in amounts, negative values, missing symbols).
  4. List of duplicated records or rows with identical debtor account IDs or names.
  5. List of recommended DCA assignments (e.g. "Cases above $5,000 should go to Apex Financial due to high performance score").
  6. A Markdown formatted operational summary.`,
});

export const analyzeCsvDataFlow = ai.defineFlow(
  {
    name: 'analyzeCsvDataFlow',
    inputSchema: AnalyzeCsvDataInputSchema,
    outputSchema: AnalyzeCsvDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
