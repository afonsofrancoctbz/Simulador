

import { getFiscalParameters, type FiscalConfig } from '@/config/fiscal';
import {
    CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
    CONTABILIZEI_FEES_SIMPLES_NACIONAL,
    getCnaeData,
} from './cnae-helpers';
import {
    type CalculationResults,
    type TaxDetails,
    type Annex,
    type ProLaboreForm,
    type PartnerTaxDetails,
    type CnaeData,
    type CnaeItem,
    type Plan,
    type TaxFormValues,
} from './types';
import { formatPercent, findBracket, findFeeBracket } from './utils';


// =================================================================================
// 1. INPUT/OUTPUT STRUCTURES FOR THE PURE CALCULATION MODULE
// =================================================================================

export interface TaxCalculationInput {
  domesticActivities: CnaeItem[];
  exportActivities: CnaeItem[];
  rbt12: number;
  fp12: number;
  proLaboreValues: number[];
  proLaboreDetails: ProLaboreForm[]; // Keep details for INSS/IRRF calculation
  cnaeCodes: string[];
  totalSalaryExpense: number;
  fiscalConfig: FiscalConfig;
  cnaeData: CnaeData[];
  selectedPlan: Plan;
  totalRevenue: number;
}

// =================================================================================
// 2. CORE CALCULATION LOGIC (HELPER FUNCTIONS)
// =================================================================================

/**
 * Calculates partner-specific taxes (INSS and IRRF).
 * This is a pure function that depends only on its inputs.
 */
function _calculatePartnerTaxes(proLabores: ProLaboreForm[], config: FiscalConfig): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
    let totalINSSRetido = 0;
    let totalIRRFRetido = 0;

    const partnerTaxes: PartnerTaxDetails[] = proLabores.map(proLabore => {
        const proLaboreBruto = proLabore.value;
        if (proLaboreBruto <= 0) {
            return { proLaboreBruto: 0, inss: 0, irrf: 0, proLaboreLiquido: 0 };
        }

        const remainingContributionRoom = Math.max(0, config.teto_inss - (proLabore.hasOtherInssContribution ? proLabore.otherContributionSalary || 0 : 0));
        const baseCalculoINSS = Math.min(proLaboreBruto, remainingContributionRoom);
        const inss = baseCalculoINSS * config.aliquota_inss_prolabore;
        
        const baseCalculoIRRF = proLaboreBruto - inss;
        const irrfBracket = findBracket(config.tabela_irrf, baseCalculoIRRF);
        const irrf = Math.max(0, baseCalculoIRRF * irrfBracket.rate - irrfBracket.deduction);

        totalINSSRetido += inss;
        totalIRRFRetido += irrf;

        return {
            proLaboreBruto,
            inss,
            irrf,
            proLaboreLiquido: proLaboreBruto - inss - irrf,
        };
    });

    return { partnerTaxes, totalINSSRetido, totalIRRFRetido };
}

/**
 * Calculates the Contribuição Previdenciária Patronal (CPP).
 */
function _calculateCpp(baseDeCalculo: number, config: FiscalConfig): number {
    return baseDeCalculo * config.aliquotas_cpp_patronal.base;
}


// =================================================================================
// 3. REGIME-SPECIFIC CALCULATION FUNCTIONS
// =================================================================================

/**
 * Calculates the total cost under the Simples Nacional regime.
 * Follows the rules specified in the requirements document.
 */
function _calculateSimplesNacional(input: TaxCalculationInput, proLaboreValuesOverride?: number[]): TaxDetails {
    const { fiscalConfig, cnaeData, selectedPlan, totalSalaryExpense, fp12, rbt12, totalRevenue } = input;
    const proLaboresToUse = proLaboreValuesOverride 
        ? input.proLaboreDetails.map((p, i) => ({ ...p, value: proLaboreValuesOverride[i] || p.value }))
        : input.proLaboreDetails;

    const totalProLaboreBruto = proLaboresToUse.reduce((acc, p) => acc + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;
    
    // Step 1: Determine Effective RBT12 and FP12
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;

    // Step 2: Calculate Fator R
    const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
    
    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    let totalDas = 0;
    let cppFromAnnexIV = 0;
    let totalDasRate = 0;
    const notes: string[] = [];
    const finalAnnexes = new Set<Annex>();
    const hasAnnexVActivity = input.cnaeCodes.some(code => getCnaeData(code)?.requiresFatorR);

    const allActivities = [...input.domesticActivities, ...input.exportActivities];

    for (const activity of allActivities) {
        const cnaeInfo = cnaeData.find(c => c.code === activity.code);
        if (!cnaeInfo || activity.revenue <= 0) continue;

        // Step 3: Determine the Correct Annex
        let effectiveAnnex: Annex = cnaeInfo.annex;
        if (cnaeInfo.requiresFatorR) {
            effectiveAnnex = fatorR >= fiscalConfig.simples_nacional.limite_fator_r ? 'III' : 'V';
        }
        finalAnnexes.add(effectiveAnnex);
        
        // Step 6: Calculate CPP (Patronal Payroll Tax)
        if (effectiveAnnex === 'IV') {
            cppFromAnnexIV = _calculateCpp(monthlyPayroll, fiscalConfig);
            if (!notes.some(n => n.includes('Anexo IV'))) {
                notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
            }
        }

        const annexTable = fiscalConfig.simples_nacional[effectiveAnnex];
        if (!annexTable) continue;
        
        // Step 4: Calculate the Effective Tax Rate
        const bracket = findBracket(annexTable, effectiveRbt12);
        const effectiveRate = effectiveRbt12 > 0 
            ? Math.max(0, (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12)
            : bracket.rate;

        // Step 5: Calculate the DAS
        let dasForActivity = activity.revenue * effectiveRate;
        
        if (input.exportActivities.some(a => a.code === activity.code && a.revenue === activity.revenue)) {
             const effectiveRateForExport = effectiveRbt12 > 0 ? (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12 : bracket.rate;
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
            const exportExemptionFactor = PIS + COFINS + ISS + ICMS + IPI;
            const exportExemptionValue = (activity.revenue * effectiveRateForExport) * exportExemptionFactor;
            dasForActivity -= exportExemptionValue;

            if (input.exportActivities.reduce((a, b) => a + b.revenue, 0) > 0 && !notes.some(n => n.includes('exportação'))) {
                notes.push("Receitas de exportação têm isenção de PIS, COFINS, ISS, IPI e ICMS no Simples Nacional.");
            }
        }
        
        totalDas += dasForActivity;
        totalDasRate += activity.revenue * effectiveRate; // Accumulate for the overall effective rate
    }

    // Step 7: Calculate Total Cost
    const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;

    let annexLabel = `Anexos (${[...finalAnnexes].join(', ')})`;
    if (finalAnnexes.size === 1) {
        const singleAnnex = [...finalAnnexes][0];
        if ((singleAnnex === 'III' && hasAnnexVActivity) || singleAnnex === 'V') {
           annexLabel = fatorR >= fiscalConfig.simples_nacional.limite_fator_r ? 'Anexo III (Com Fator R)' : 'Anexo V (Sem Fator R)';
        } else {
            annexLabel = `Anexo ${singleAnnex}`;
        }
    }
    
    return {
        regime: "Simples Nacional",
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        proLabore: totalProLaboreBruto,
        fatorR: hasAnnexVActivity ? fatorR : undefined,
        annex: annexLabel,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        effectiveDasRate: totalRevenue > 0 ? totalDasRate / totalRevenue : 0,
        contabilizeiFee,
        breakdown: [
            { name: 'DAS', value: totalDas },
            { name: 'CPP', value: cppFromAnnexIV },
            { name: 'INSS s/ Pró-labore', value: totalINSSRetido },
            { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
        ],
        notes,
        partnerTaxes,
    };
}


/**
 * Calculates the total cost under the Lucro Presumido regime.
 * Follows the rules specified in the requirements document.
 */
function calculateLucroPresumido(input: TaxCalculationInput): TaxDetails {
    const { fiscalConfig, cnaeData, totalSalaryExpense, selectedPlan, totalRevenue } = input;
    
    const proLabores = input.proLaboreDetails;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    const domesticRevenue = input.domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = input.exportActivities.reduce((sum, act) => sum + act.revenue, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

    // Step 1 & 2: Calculate Federal and Municipal Taxes
    const pis = domesticRevenue * fiscalConfig.lucro_presumido_rates.PIS;
    const cofins = domesticRevenue * fiscalConfig.lucro_presumido_rates.COFINS;
    const iss = domesticRevenue * fiscalConfig.lucro_presumido_rates.ISS;

    const allActivities = [...input.domesticActivities, ...input.exportActivities];
    
    const presumedProfitBase = allActivities.reduce((sum, activity) => {
        const cnaeInfo = cnaeData.find(c => c.code === activity.code);
        // Use IRPJ rate as it's the most common base, CSLL can sometimes differ.
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
    }, 0);

    const irpj = presumedProfitBase * fiscalConfig.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicional = Math.max(0, (presumedProfitBase - fiscalConfig.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL)) * fiscalConfig.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    
    const csllPresumedProfitBase = allActivities.reduce((sum, activity) => {
        const cnaeInfo = cnaeData.find(c => c.code === activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateCSLL ?? 0.32));
    }, 0);
    const csll = csllPresumedProfitBase * fiscalConfig.lucro_presumido_rates.CSLL;

    // Step 3: Calculate CPP
    const cpp = _calculateCpp(monthlyPayroll, fiscalConfig);

    // Step 4: Calculate Total Cost
    const totalTax = pis + cofins + iss + irpj + irpjAdicional + csll + cpp + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;

    const notes = exportRevenue > 0 ? ["Receitas de exportação de serviços são isentas de PIS, COFINS e ISS."] : [];

    return {
        regime: 'Lucro Presumido',
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        proLabore: totalProLaboreBruto,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee,
        breakdown: [
          { name: 'PIS', value: pis },
          { name: 'COFINS', value: cofins },
          { name: 'ISS', value: iss },
          { name: 'IRPJ', value: irpj + irpjAdicional },
          { name: 'CSLL', value: csll },
          { name: 'CPP', value: cpp },
          { name: 'INSS s/ Pró-labore', value: totalINSSRetido },
          { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
        ],
        notes,
        partnerTaxes,
    };
}


// =================================================================================
// 4. MAIN ORCHESTRATOR FUNCTION
// =================================================================================

export function calculateTaxes(input: TaxCalculationInput): CalculationResults {
  const { fiscalConfig, totalSalaryExpense, proLaboreValues, totalRevenue } = input;
  
  const simplesNacionalBase = _calculateSimplesNacional(input);
  const lucroPresumido = calculateLucroPresumido(input);
  let simplesNacionalOtimizado: TaxDetails | null = null;

  const hasAnnexVActivity = input.cnaeCodes.some(code => getCnaeData(code)?.requiresFatorR);
  const fatorRBase = simplesNacionalBase.fatorR;

  if (hasAnnexVActivity && fatorRBase !== undefined && fatorRBase < fiscalConfig.simples_nacional.limite_fator_r && totalRevenue > 0) {
      const requiredPayrollForFatorR = totalRevenue * fiscalConfig.simples_nacional.limite_fator_r;
      const currentTotalProLabore = proLaboreValues.reduce((a, b) => a + b, 0);
      const requiredTotalProLabore = Math.max(0, requiredPayrollForFatorR - totalSalaryExpense);
      
      const minProLaboreTotal = fiscalConfig.salario_minimo * proLaboreValues.length;

      if (requiredTotalProLabore > currentTotalProLabore) {
          const optimizedTotalProLabore = Math.max(requiredTotalProLabore, minProLaboreTotal);
          const optimizedProLaborePerPartner = optimizedTotalProLabore / proLaboreValues.length;
          const optimizedProLabores = Array(proLaboreValues.length).fill(optimizedProLaborePerPartner);
          
          simplesNacionalOtimizado = _calculateSimplesNacional(input, optimizedProLabores);
          if (simplesNacionalOtimizado) {
              simplesNacionalOtimizado.optimizationNote = `Pró-labore ajustado para aumentar o Fator R e tributar pelo Anexo III, mais vantajoso.`
          }
      }
  }

  // Set display order for the UI
  lucroPresumido.order = 3;
  if (simplesNacionalOtimizado && simplesNacionalOtimizado.totalMonthlyCost < simplesNacionalBase.totalMonthlyCost) {
    simplesNacionalBase.order = 2;
    simplesNacionalOtimizado.order = 1;
  } else {
    simplesNacionalBase.order = 1;
    if(simplesNacionalOtimizado) {
       simplesNacionalOtimizado.order = 2;
    }
  }

  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}

    