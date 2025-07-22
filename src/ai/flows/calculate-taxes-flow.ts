
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
import type { TaxCalculationInput } from '@/lib/calculations';

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
    
    // Transform the form data into the pure calculation function input
    const calculationInput: TaxCalculationInput = {
      domesticActivities: formValues.domesticActivities,
      exportActivities: formValues.exportActivities.map(act => ({
        ...act,
        revenue: act.revenue * formValues.exchangeRate, // Convert export revenue to BRL
      })),
      rbt12: formValues.rbt12,
      fp12: formValues.fp12,
      proLaboreDetails: formValues.proLabores,
      cnaeCodes: formValues.selectedCnaes,
      totalSalaryExpense: formValues.totalSalaryExpense,
      fiscalConfig: fiscalConfig,
      cnaeData: CNAE_DATA_RAW,
      selectedPlan: formValues.selectedPlan,
    };
    
    // Here we call the new, pure calculation logic.
    const results = calculateTaxes(calculationInput);
    return results;
  }
);
