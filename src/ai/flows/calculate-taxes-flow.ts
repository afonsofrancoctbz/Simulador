

'use server';

/**
 * @fileOverview A Genkit flow for performing tax calculations on the server-side.
 *
 * - calculateTaxesOnServer - A function that triggers the tax calculation flow.
 */

import {ai} from '@/ai/genkit';
import { calculateTaxes } from '@/lib/calculations';
import { CNAE_DATA_RAW } from '@/lib/cnaes-raw';
import { getFiscalParameters } from '@/config/fiscal';
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
    
    const fiscalConfig = getFiscalParameters(2025);
    
    // Here we call the new, pure calculation logic.
    const results = calculateTaxes(formValues, fiscalConfig);
    return results;
  }
);
