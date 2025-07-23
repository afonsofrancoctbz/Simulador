

import type { FiscalConfig } from './fiscal';
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
    type CnaeItem,
    type Plan,
} from './types';
import { findBracket, findFeeBracket } from './utils';

// =================================================================================
// 1. INPUT/OUTPUT STRUCTURES FOR THE PURE CALCULATION MODULE
// =================================================================================

export interface TaxCalculationInput {
  domesticActivities: CnaeItem[];
  exportActivities: CnaeItem[];
  rbt12: number;
  fp12: number;
  proLaboreDetails: ProLaboreForm[];
  cnaeCodes: string[];
  totalSalaryExpense: number;
  fiscalConfig: FiscalConfig;
  cnaeData: ReturnType<typeof getCnaeData>[];
  selectedPlan: Plan;
  exchangeRate: number;
}

// =================================================================================
// 2. CORE CALCULATION LOGIC (HELPER FUNCTIONS)
// =================================================================================

/**
 * Calculates partner-specific taxes (INSS and IRRF).
 * This is a pure function that depends only on its inputs.
 */
export function _calculatePartnerTaxes(proLabores: ProLaboreForm[], config: FiscalConfig): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
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
export function _calculateCpp(baseDeCalculo: number, config: FiscalConfig): number {
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
    const { fiscalConfig, selectedPlan, totalSalaryExpense, fp12, rbt12, cnaeCodes, exchangeRate } = input;
    
    const proLaboresToUse = proLaboreValuesOverride 
        ? input.proLaboreDetails.map((p, i) => ({ ...p, value: proLaboreValuesOverride[i] || p.value }))
        : input.proLaboreDetails;

    const totalProLaboreBruto = proLaboresToUse.reduce((acc, p) => acc + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;
    const domesticRevenue = input.domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
    const exportRevenueBRL = input.exportActivities.reduce((acc, act) => acc + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;

    // Sanity check: if there's no revenue and no past revenue, return a zeroed-out result.
    if (totalRevenue === 0 && effectiveRbt12 === 0) {
        return {
            regime: "Simples Nacional",
            annex: "N/A",
            totalTax: totalINSSRetido + totalIRRFRetido,
            totalMonthlyCost: totalINSSRetido + totalIRRFRetido + contabilizeiFee,
            totalRevenue: 0,
            proLabore: totalProLaboreBruto,
            fatorR: undefined,
            effectiveDasRate: 0,
            contabilizeiFee: contabilizeiFee,
            partnerTaxes,
            breakdown: [
                { name: 'INSS s/ Pró-labore', value: totalINSSRetido },
                { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
            ].filter(i => i.value > 0),
            notes: [],
        };
    }

    const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
    const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
    
    let totalDas = 0;
    let cppFromAnnexIV = 0;
    const notes: string[] = [];
    const finalAnnexes = new Set<Annex>();
    const hasAnnexVActivity = cnaeCodes.some(code => getCnaeData(code)?.requiresFatorR);

    // Group revenues by their effective annex
    const revenueByAnnex: Record<Annex, { domestic: number; export: number }> = {
        'I': { domestic: 0, export: 0 },
        'II': { domestic: 0, export: 0 },
        'III': { domestic: 0, export: 0 },
        'IV': { domestic: 0, export: 0 },
        'V': { domestic: 0, export: 0 },
    };

    input.domesticActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;
        const effectiveAnnex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        revenueByAnnex[effectiveAnnex].domestic += activity.revenue;
    });

    input.exportActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;
        const effectiveAnnex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        revenueByAnnex[effectiveAnnex].export += (activity.revenue * exchangeRate);
    });

    // Calculate DAS for each annex group
    for (const annexStr in revenueByAnnex) {
        const annex = annexStr as Annex;
        const { domestic, export: exportRevenueForAnnex } = revenueByAnnex[annex];
        const annexRevenue = domestic + exportRevenueForAnnex;

        if (annexRevenue === 0) continue;

        finalAnnexes.add(annex);

        const annexTable = fiscalConfig.simples_nacional[annex];
        const bracket = findBracket(annexTable, effectiveRbt12);
        
        if (!bracket) {
            console.error(`Could not find tax bracket for RBT12 ${effectiveRbt12} in annex ${annex}`);
            continue;
        }

        const effectiveRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * bracket.rate) - bracket.deduction) / effectiveRbt12 : bracket.rate;
        
        const dasDomestic = domestic * effectiveRate;
        
        let dasExport = 0;
        if (exportRevenueForAnnex > 0) {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0 } = bracket.distribution;
            const isServiceAnnex = ['III', 'IV', 'V'].includes(annex);
            
            // For services (Annex III, IV, V), ISS is exempt. For Commerce (I), ICMS is exempt.
            const exportExemptionFactor = isServiceAnnex ? (PIS + COFINS + ISS) : (PIS + COFINS + ICMS);
            const reducedRateForExport = effectiveRate * (1 - exportExemptionFactor);
            dasExport = exportRevenueForAnnex * reducedRateForExport;
            
            if (!notes.some(n => n.includes('exportação'))) {
                notes.push("Receitas de exportação têm isenção de PIS, COFINS e ISS/ICMS no Simples Nacional.");
            }
        }
        
        totalDas += dasDomestic + dasExport;

        if (annex === 'IV') {
            cppFromAnnexIV = _calculateCpp(monthlyPayroll, fiscalConfig);
            if (!notes.some(n => n.includes('Anexo IV'))) {
                notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal) sobre a folha, fora do DAS.`);
            }
        }
    }
    
    const totalTax = (totalDas || 0) + (cppFromAnnexIV || 0) + (totalINSSRetido || 0) + (totalIRRFRetido || 0);
    const totalMonthlyCost = totalTax + contabilizeiFee;

    const annexLabel = [...finalAnnexes].sort().map(a => `Anexo ${a}`).join(', ') || "N/A";
    
    const effectiveDasRate = totalRevenue > 0 ? (totalDas || 0) / totalRevenue : 0;
    
    const finalResult: TaxDetails = {
        regime: "Simples Nacional",
        annex: annexLabel,
        totalTax: totalTax || 0,
        totalMonthlyCost: totalMonthlyCost || 0,
        totalRevenue,
        proLabore: totalProLaboreBruto,
        fatorR: hasAnnexVActivity ? fatorR : undefined,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        effectiveDasRate: effectiveDasRate,
        contabilizeiFee,
        breakdown: [
            { name: 'DAS', value: totalDas || 0 },
            { name: 'CPP (INSS Patronal)', value: cppFromAnnexIV || 0 },
            { name: 'INSS s/ Pró-labore', value: totalINSSRetido || 0 },
            { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido || 0 },
        ].filter(item => item.value > 0.001),
        notes,
        partnerTaxes,
    };

    if (proLaboreValuesOverride) {
        finalResult.optimizationNote = `Pró-labore ajustado para aumentar o Fator R e tributar pelo Anexo III, mais vantajoso.`;
    }

    return finalResult;
}


/**
 * Calculates the total cost under the Lucro Presumido regime.
 * Follows the rules specified in the requirements document.
 */
function _calculateLucroPresumido(input: TaxCalculationInput): TaxDetails {
    const { fiscalConfig, cnaeData, totalSalaryExpense, selectedPlan, exchangeRate } = input;
    
    const proLabores = input.proLaboreDetails;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    
    const domesticRevenue = input.domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = input.exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenue;
    
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

    const pis = domesticRevenue * fiscalConfig.lucro_presumido_rates.PIS;
    const cofins = domesticRevenue * fiscalConfig.lucro_presumido_rates.COFINS;
    const iss = domesticRevenue * fiscalConfig.lucro_presumido_rates.ISS;

    const allActivities = [...input.domesticActivities, ...input.exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))];
    const presumedProfitBaseIRPJ = allActivities.reduce((sum, activity) => {
        const cnaeInfo = cnaeData.find(c => c?.code === activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
    }, 0);

    const irpj = presumedProfitBaseIRPJ * fiscalConfig.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicional = Math.max(0, (presumedProfitBaseIRPJ - fiscalConfig.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL)) * fiscalConfig.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    
    const presumedProfitBaseCSLL = allActivities.reduce((sum, activity) => {
        const cnaeInfo = cnaeData.find(c => c?.code === activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateCSLL ?? 0.32));
    }, 0);
    const csll = presumedProfitBaseCSLL * fiscalConfig.lucro_presumido_rates.CSLL;

    const cpp = _calculateCpp(monthlyPayroll, fiscalConfig);

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
          { name: 'CPP (INSS Patronal)', value: cpp },
          { name: 'INSS s/ Pró-labore', value: totalINSSRetido },
          { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
        ].filter(item => item.value > 0.001),
        notes,
        partnerTaxes,
    };
}


// =================================================================================
// 4. MAIN ORCHESTRATOR FUNCTION
// =================================================================================

export function calculateTaxes(input: TaxCalculationInput): CalculationResults {
  const { fiscalConfig, totalSalaryExpense, proLaboreDetails, cnaeCodes } = input;
  
  const lucroPresumido = _calculateLucroPresumido(input);
  const simplesNacionalBase = _calculateSimplesNacional(input);
  let simplesNacionalOtimizado: TaxDetails | null = null;
  
  const hasAnnexVActivity = cnaeCodes.some(code => getCnaeData(code)?.requiresFatorR);
  const totalRevenue = input.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + input.exportActivities.reduce((acc, act) => acc + (act.revenue * input.exchangeRate), 0);
  
  if (hasAnnexVActivity && simplesNacionalBase.fatorR !== undefined && simplesNacionalBase.fatorR < fiscalConfig.simples_nacional.limite_fator_r && totalRevenue > 0) {
      const requiredPayrollForFatorR = totalRevenue * fiscalConfig.simples_nacional.limite_fator_r;
      const currentTotalPayroll = totalSalaryExpense + proLaboreDetails.reduce((sum, p) => sum + p.value, 0);
      
      if (requiredPayrollForFatorR > currentTotalPayroll) {
          const additionalPayrollNeeded = requiredPayrollForFatorR - currentTotalPayroll;
          const currentTotalProLabore = proLaboreDetails.reduce((sum, p) => sum + p.value, 0);
          const optimizedTotalProLabore = currentTotalProLabore + additionalPayrollNeeded;
          
          const optimizedProLaborePerPartner = optimizedTotalProLabore / proLaboreDetails.length;
          const optimizedProLabores = Array(proLaboreDetails.length).fill(optimizedProLaborePerPartner);
          
          const tempSimplesOtimizado = _calculateSimplesNacional(input, optimizedProLabores);
          
          if (tempSimplesOtimizado.totalMonthlyCost < simplesNacionalBase.totalMonthlyCost) {
              simplesNacionalOtimizado = tempSimplesOtimizado;
          }
      }
  }

  // Set display order for the UI
  const scenarios: (TaxDetails | null)[] = [lucroPresumido, simplesNacionalBase, simplesNacionalOtimizado];
  const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null);
  
  validScenarios.sort((a, b) => {
    if (a.totalMonthlyCost === b.totalMonthlyCost) {
        // If costs are equal, prefer Simples Otimizado > Simples Base > Lucro Presumido
        const orderMap: Record<string, number> = {
            'Simples Nacional (Otimizado)': 1,
            'Simples Nacional': 2,
            'Lucro Presumido': 3,
        };
        return (orderMap[a.regime] || 99) - (orderMap[b.regime] || 99);
    }
    return a.totalMonthlyCost - b.totalMonthlyCost;
  });

  validScenarios.forEach((s, index) => {
    s.order = index + 1;
  });

  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}
      
