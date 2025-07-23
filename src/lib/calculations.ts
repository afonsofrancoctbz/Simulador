

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

// =================================================================================
// 3. REGIME-SPECIFIC CALCULATION FUNCTIONS
// =================================================================================

/**
 * Calculates the total cost under the Simples Nacional regime.
 * Follows the rules specified in the requirements document.
 */
function _calculateSimplesNacional(input: TaxCalculationInput, proLaboreValuesOverride?: number[]): TaxDetails {
    const { fiscalConfig, selectedPlan, totalSalaryExpense, fp12, rbt12, exchangeRate } = input;
    
    const proLaboresToUse = proLaboreValuesOverride 
        ? input.proLaboreDetails.map((p, i) => ({ ...p, value: proLaboreValuesOverride[i] || p.value }))
        : input.proLaboreDetails;

    const totalProLaboreBruto = proLaboresToUse.reduce((acc, p) => acc + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;
    const domesticRevenue = input.domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
    const exportRevenueValue = input.exportActivities.reduce((acc, act) => acc + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueValue;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    // Passo 1: Calcular Bases Anuais e Fator R
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
    const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
    
    // Passo 2: Calcular Alíquota Efetiva e DAS
    let totalDas = 0;
    const finalAnnexes = new Set<Annex>();
    const hasAnnexVActivity = input.cnaeCodes.some(code => getCnaeData(code)?.requiresFatorR);
    let hasAnnexIVActivity = false;
    
    const allActivities = [...input.domesticActivities, ...input.exportActivities];

    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;

        let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        finalAnnexes.add(effectiveAnnex);
        
        if (effectiveAnnex === 'IV') {
            hasAnnexIVActivity = true;
        }

        const isExport = input.exportActivities.some(ex => ex.code === activity.code && ex.revenue > 0);
        const revenueForActivity = isExport ? activity.revenue * exchangeRate : activity.revenue;

        if (revenueForActivity === 0) return;

        const annexTable = fiscalConfig.simples_nacional[effectiveAnnex];
        const bracket = findBracket(annexTable, effectiveRbt12);
        const { rate, deduction, distribution } = bracket;
        
        const effectiveRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * rate) - deduction) / effectiveRbt12 : rate;
        
        let dasForActivity = 0;

        if (isExport) {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = distribution;
            const exportExemptionRatio = PIS + COFINS + (ISS || 0) + (ICMS || 0) + (IPI || 0);
            const exportTaxRate = effectiveRate * (1 - exportExemptionRatio);
            dasForActivity = revenueForActivity * exportTaxRate;
        } else {
            dasForActivity = revenueForActivity * effectiveRate;
        }

        totalDas += dasForActivity;
    });

    // Passo 3: Calcular CPP (Apenas para Anexo IV)
    let cppFromAnnexIV = 0;
    if (hasAnnexIVActivity) {
      cppFromAnnexIV = monthlyPayroll * 0.20;
    }
    
    // Passo 4: Calcular Custo Total
    const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;

    const annexLabel = [...finalAnnexes].sort().map(a => `Anexo ${a}`).join(', ') || "N/A";
    
    const breakdown = [
        { name: 'DAS', value: totalDas },
        { name: 'CPP (INSS Patronal)', value: cppFromAnnexIV },
        { name: 'INSS s/ Pró-labore', value: totalINSSRetido || 0 },
        { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido || 0 },
    ].filter(item => item.value > 0.001);

    const finalResult: TaxDetails = {
        regime: "Simples Nacional",
        annex: annexLabel,
        totalTax: totalTax || 0,
        totalMonthlyCost: totalMonthlyCost || 0,
        totalRevenue,
        proLabore: totalProLaboreBruto,
        fatorR: hasAnnexVActivity ? fatorR : undefined,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        effectiveDasRate: totalRevenue > 0 ? totalDas / totalRevenue : 0,
        contabilizeiFee,
        breakdown,
        notes: [],
        partnerTaxes,
    };
    
    if (proLaboreValuesOverride) {
        finalResult.regime = "Simples Nacional (Otimizado)";
        finalResult.optimizationNote = `Pró-labore ajustado para aumentar o Fator R e tributar pelo Anexo III, mais vantajoso.`;
    }

    return finalResult;
}


/**
 * Calculates the total cost under the Lucro Presumido regime.
 * Follows the rules specified in the requirements document.
 */
function calculateLucroPresumido(input: TaxCalculationInput): TaxDetails {
    const { fiscalConfig, totalSalaryExpense, selectedPlan, exchangeRate } = input;
    
    const proLabores = input.proLaboreDetails;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    
    const domesticRevenue = input.domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = input.exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    
    // Passo 1: Calcular Base de Impostos e Encargos
    const totalRevenue = domesticRevenue + exportRevenue;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

    // Passo 2: Calcular Impostos sobre Faturamento
    const pis = domesticRevenue * fiscalConfig.lucro_presumido_rates.PIS;
    const cofins = domesticRevenue * fiscalConfig.lucro_presumido_rates.COFINS;
    const iss = domesticRevenue * fiscalConfig.lucro_presumido_rates.ISS;

    const presumedProfitBaseIRPJ = totalRevenue * 0.32;
    const irpj = presumedProfitBaseIRPJ * fiscalConfig.lucro_presumido_rates.IRPJ_BASE + Math.max(0, (presumedProfitBaseIRPJ - fiscalConfig.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL)) * fiscalConfig.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    
    const presumedProfitBaseCSLL = totalRevenue * 0.32;
    const csll = presumedProfitBaseCSLL * fiscalConfig.lucro_presumido_rates.CSLL;

    // Passo 3: Calcular Encargos sobre Folha
    const cpp = monthlyPayroll > 0 ? monthlyPayroll * 0.20 : 0;

    // Passo 4: Calcular Custo Total
    const totalTax = pis + cofins + iss + irpj + csll + cpp + totalINSSRetido + totalIRRFRetido;
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
          { name: 'IRPJ', value: irpj },
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
  
  const lucroPresumido = calculateLucroPresumido(input);
  const simplesNacionalBase = _calculateSimplesNacional(input);
  let simplesNacionalOtimizado: TaxDetails | null = null;
  
  const hasAnnexVActivity = cnaeCodes.some(code => getCnaeData(code)?.requiresFatorR);
  const totalRevenue = input.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + input.exportActivities.reduce((acc, act) => acc + (act.revenue * input.exchangeRate), 0);
  
  if (hasAnnexVActivity && simplesNacionalBase.fatorR !== undefined && simplesNacionalBase.fatorR < fiscalConfig.simples_nacional.limite_fator_r && totalRevenue > 0) {
      const requiredPayrollForFatorR = totalRevenue * fiscalConfig.simples_nacional.limite_fator_r;
      const currentTotalPayroll = totalSalaryExpense + proLaboreDetails.reduce((sum, p) => sum + p.value, 0);
      
      const additionalPayrollNeeded = Math.max(0, requiredPayrollForFatorR - currentTotalPayroll);
      
      if (additionalPayrollNeeded > 0) {
          const currentTotalProLabore = proLaboreDetails.reduce((sum, p) => sum + p.value, 0);
          const optimizedTotalProLabore = currentTotalProLabore + additionalPayrollNeeded;
          
          const optimizedProLaborePerPartner = optimizedTotalProLabore / proLaboreDetails.length;
          const optimizedProLabores = Array(proLaboreDetails.length).fill(optimizedProLaborePerPartner);
          
          simplesNacionalOtimizado = _calculateSimplesNacional(input, optimizedProLabores);
      }
  }

  const finalScenarios: (TaxDetails | null)[] = [lucroPresumido, simplesNacionalBase, simplesNacionalOtimizado];
  const finalValidScenarios = finalScenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || s.proLabore > 0));

  finalValidScenarios.sort((a, b) => {
    if (a.totalMonthlyCost === b.totalMonthlyCost) {
        const orderMap: Record<string, number> = {
            'Simples Nacional (Otimizado)': 1,
            'Simples Nacional': 2,
            'Lucro Presumido': 3,
        };
        return (orderMap[a.regime] || 99) - (orderMap[b.regime] || 99);
    }
    return a.totalMonthlyCost - b.totalMonthlyCost;
  });

  finalValidScenarios.forEach((s, index) => {
    s.order = index + 1;
  });

  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}
