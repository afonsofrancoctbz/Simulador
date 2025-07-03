
'use server';

/**
 * @fileOverview A Genkit flow for performing tax calculations for the 2026 tax reform scenario.
 *
 * - calculateTaxes2026OnServer - A function that triggers the tax calculation flow for 2026.
 */

import {ai} from '@/ai/genkit';
import { calculateTaxes2026 } from '@/lib/calculations-2026';
import { CalculationResults2026Schema, type TaxFormValues, TaxFormValuesSchema, type CalculationResults2026 } from '@/lib/types';


export async function calculateTaxes2026OnServer(input: TaxFormValues): Promise<CalculationResults2026> {
  return calculateTaxes2026Flow(input);
}


const calculateTaxes2026Flow = ai.defineFlow(
  {
    name: 'calculateTaxes2026Flow',
    inputSchema: TaxFormValuesSchema,
    outputSchema: CalculationResults2026Schema,
  },
  async (input) => {
    // Here we call the 2026 calculation logic.
    const results = calculateTaxes2026(input);
    return results;
  }
);
