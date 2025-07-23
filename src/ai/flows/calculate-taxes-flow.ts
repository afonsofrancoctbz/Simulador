
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
    
    // Transform form data to match the expected structure for calculations
    const domesticActivities: { code: string; revenue: number }[] = [];
    const exportActivities: { code: string; revenue: number }[] = [];

    const cnaesByAnnex: Record<string, string[]> = {};
    formValues.selectedCnaes.forEach(code => {
        const cnae = getCnaeData(code);
        if (cnae) {
            const annex = cnae.annex;
            if (!cnaesByAnnex[annex]) cnaesByAnnex[annex] = [];
            cnaesByAnnex[annex].push(code);
        }
    });

    for (const key in formValues.revenues) {
        const [type, annex] = key.split('_') as ['domestic' | 'export', Annex];
        const revenue = formValues.revenues[key] || 0;
        const cnaesInAnnex = cnaesByAnnex[annex];

        if (revenue > 0 && cnaesInAnnex && cnaesInAnnex.length > 0) {
            const revenuePerCnae = revenue / cnaesInAnnex.length;
            const targetArray = type === 'domestic' ? domesticActivities : exportActivities;
            cnaesInAnnex.forEach(code => {
                targetArray.push({ code, revenue: revenuePerCnae });
            });
        }
    }

    const calculationInput = {
        ...formValues,
        domesticActivities,
        exportActivities,
    };
    
    // Here we call the new, pure calculation logic.
    const results = calculateTaxes(calculationInput, fiscalConfig);
    return results;
  }
);
