'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing tax optimization advice based on user input data.
 *
 * - getTaxOptimizationAdvice - A function that triggers the tax optimization advice flow.
 * - TaxOptimizationInput - The input type for the getTaxOptimizationAdvice function.
 * - TaxOptimizationOutput - The return type for the getTaxOptimizationAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaxOptimizationInputSchema = z.object({
  activities: z
    .string()
    .describe(
      'A summary of all business activities (CNAEs) and their revenues.'
    ),
  totalDomesticRevenue: z
    .number()
    .describe('Total monthly revenue from domestic sales.'),
  totalExportRevenue: z
    .number()
    .describe('Total monthly revenue from export sales.'),
  totalSalaryExpense: z.number().describe('Total monthly salary expense.'),
  proLaborePartners: z
    .number()
    .describe('Monthly pro-labore amount for partners.'),
  numberOfPartners: z.number().describe('The number of partners in the business.'),
  municipalISSRate: z.number().describe('The municipal ISS rate.'),
  simplesNacionalTaxBurden: z
    .number()
    .describe('The tax burden under Simples Nacional.'),
  lucroPresumidoTaxBurden: z
    .number()
    .describe('The tax burden under Lucro Presumido.'),
});
export type TaxOptimizationInput = z.infer<typeof TaxOptimizationInputSchema>;

const TaxOptimizationOutputSchema = z.object({
  advice: z
    .string()
    .describe(
      'Context-aware advice on tax optimization based on the input data.'
    ),
});
export type TaxOptimizationOutput = z.infer<typeof TaxOptimizationOutputSchema>;

export async function getTaxOptimizationAdvice(
  input: TaxOptimizationInput
): Promise<TaxOptimizationOutput> {
  return taxOptimizationAdviceFlow(input);
}

const taxOptimizationAdvicePrompt = ai.definePrompt({
  name: 'taxOptimizationAdvicePrompt',
  input: {schema: TaxOptimizationInputSchema},
  output: {schema: TaxOptimizationOutputSchema},
  prompt: `You are a tax advisor specializing in Simples Nacional and Lucro Presumido tax regimes in Brazil.

  Based on the following financial data, provide advice to the business owner on how to optimize their tax liability. Consider factors such as revenue mix (domestic vs. export), partner pro-labore, and the most suitable tax regime.

  Activities: {{activities}}
  Total Monthly Revenue (Domestic): {{totalDomesticRevenue}}
  Total Monthly Revenue (Export): {{totalExportRevenue}}
  Total Salary Expense: {{totalSalaryExpense}}
  Pro-labore for Partners: {{proLaborePartners}}
  Number of Partners: {{numberOfPartners}}
  Municipal ISS Rate: {{municipalISSRate}}
  Tax Burden (Simples Nacional): {{simplesNacionalTaxBurden}}
  Tax Burden (Lucro Presumido): {{lucroPresumidoTaxBurden}}

  Provide specific and actionable recommendations to reduce the overall tax burden. Focus on strategies within the legal and ethical boundaries, such as adjusting pro-labore to optimize for "Fator R" if applicable.
  The advice should be concise and no more than 3-4 sentences.`,
});

const taxOptimizationAdviceFlow = ai.defineFlow(
  {
    name: 'taxOptimizationAdviceFlow',
    inputSchema: TaxOptimizationInputSchema,
    outputSchema: TaxOptimizationOutputSchema,
  },
  async input => {
    const {output} = await taxOptimizationAdvicePrompt(input);
    return output!;
  }
);
