'use server';

/**
 * @fileOverview A Genkit flow for performing tax calculations on the server-side.
 *
 * - calculateTaxesOnServer - A function that triggers the tax calculation flow.
 */

import {ai} from '@/ai/genkit';
import { calculateTaxes } from '@/lib/calculations';
import { CNAE_DATA_RAW } from '@/lib/cnaes-raw';
import type { CalculationResults, TaxFormValues } from '@/lib/types';
import { CalculationResultsSchema, TaxFormValuesSchema } from '@/lib/types';
import { getCnaeData } from '@/lib/cnae-helpers';
import type { Annex } from '@/lib/types';

export async function calculateTaxesOnServer(input: TaxFormValues): Promise<CalculationResults> {
  return calculateTaxesFlow(input);
}

const calculateTaxesFlow = ai.defineFlow(
  {
    name: 'calculateTaxesFlow',
    inputSchema: TaxFormValuesSchema,
    outputSchema: CalculationResultsSchema,
  },
  async (formValues) => {
    
    // A lógica de obter parametros fiscais agora é interna do calculateTaxes
    // ou não é mais necessária como injeção externa.
    
    const results = calculateTaxes(formValues);
    return results;
  }
);