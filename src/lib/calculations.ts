

import type { FiscalConfig } from '@/config/fiscal';
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
    type TaxFormValues
} from './types';
import { findBracket, findFeeBracket, formatPercent } from './utils';
import { getFiscalParameters } from '../config/fiscal';

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

        // SÓCIOS (PARTNERS) SEMPRE USAM A ALÍQUOTA FIXA DE 11%
        const remainingContributionRoom = Math.max(0, config.teto_inss - (proLabore.hasOtherInssContribution ? proLabore.otherContributionSalary || 0 : 0));
        const baseCalculoINSS = Math.min(proLaboreBruto, remainingContributionRoom);
        const inss = baseCalculoINSS * config.aliquota_inss_prolabore;
        
        totalINSSRetido += inss;
        
        // "Smart Selection" for IRRF (O Duelo)
        const baseCalculoIRRF_Legal = proLaboreBruto - inss;
        const irrfBracketLegal = findBracket(config.tabela_irrf, baseCalculoIRRF_Legal);
        const irrfLegal = Math.max(0, baseCalculoIRRF_Legal * irrfBracketLegal.rate - irrfBracketLegal.deduction);

        const baseCalculoIRRF_Simplificado = proLaboreBruto; // Para o simplificado, a base é a bruta
        const irrfBracketSimplificado = findBracket(config.tabela_irrf, baseCalculoIRRF_Simplificado - config.deducao_simplificada_irrf);
        const irrfSimplificado = Math.max(0, (baseCalculoIRRF_Simplificado - config.deducao_simplificada_irrf) * irrfBracketSimplificado.rate - irrfBracketSimplificado.deduction);
          
        const irrf = Math.min(irrfLegal, irrfSimplificado);
        
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
 * Calculates the CPP (INSS Patronal) for Lucro Presumido or Simples Nacional Anexo IV.
 * @param monthlyPayroll The total monthly payroll (salaries + pro-labore).
 * @param config The fiscal configuration.
 * @returns The calculated CPP value.
 */
export function _calculateCpp(monthlyPayroll: number, config: FiscalConfig): number {
    if (monthlyPayroll <= 0) {
        return 0;
    }
    // Para Lucro Presumido e Anexo IV, a alíquota é 20% sobre a folha.
    return monthlyPayroll * config.aliquotas_cpp_patronal.total;
}


// =================================================================================
// 3. REGIME-SPECIFIC CALCULATION FUNCTIONS
// =================================================================================

/**
 * Calculates the total cost under the Lucro Presumido regime.
 * Follows the rules specified in the requirements document.
 */
function calculateLucroPresumido(values: TaxFormValues, config: FiscalConfig): TaxDetails {
    const { totalSalaryExpense, selectedPlan, exchangeRate, proLabores, domesticActivities = [], exportActivities = [] } = values;

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;

    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, config);
    
    // Grupo 1: Impostos s/ Faturamento (Mensais)
    const pis = domesticRevenue * config.lucro_presumido_rates.PIS;
    const cofins = domesticRevenue * config.lucro_presumido_rates.COFINS;
    const issValue = values.issRate ?? config.lucro_presumido_rates.ISS;
    const iss = domesticRevenue * issValue;

    // Grupo 2: Impostos s/ Lucro Presumido (Trimestrais, provisionado mensalmente)
    let presumedProfitBase = 0;
    const allActivities = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))];
    allActivities.forEach(activity => {
      const cnaeInfo = getCnaeData(activity.code);
      const presuncao = cnaeInfo?.presumedProfitRateIRPJ ?? 0.32;
      presumedProfitBase += activity.revenue * presuncao;
    });

    const irpjAdicional = Math.max(0, (presumedProfitBase - config.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL)) * config.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    const irpj = presumedProfitBase * config.lucro_presumido_rates.IRPJ_BASE + irpjAdicional;
    const csll = presumedProfitBase * config.lucro_presumido_rates.CSLL;

    // Grupo 3: Encargos sobre a Folha
    const cpp = _calculateCpp(monthlyPayroll, config);

    // Custo Total
    const totalTax = pis + cofins + iss + irpj + csll + cpp + totalINSSRetido + totalIRRFRetido;
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];
    const totalMonthlyCost = totalTax + contabilizeiFee;
    
    return {
        regime: 'Lucro Presumido',
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        domesticRevenue,
        exportRevenue: exportRevenueBRL,
        proLabore: totalProLaboreBruto,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        contabilizeiFee,
        breakdown: [
          { name: 'PIS', value: pis },
          { name: 'COFINS', value: cofins },
          { name: `ISS (${(issValue * 100).toFixed(2).replace('.',',')}%)`, value: iss },
          { name: 'IRPJ', value: irpj },
          { name: 'CSLL', value: csll },
          { name: 'CPP (INSS Patronal)', value: cpp },
          { name: 'INSS s/ Pró-labore', value: totalINSSRetido },
          { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
        ].filter(item => item.value > 0.001),
        notes:[],
        partnerTaxes,
    };
}


/**
 * Calculates the total cost under the Simples Nacional regime.
 * Follows the rules specified in the requirements document.
 */
function _calculateSimplesNacional(values: TaxFormValues, config: FiscalConfig, proLaboreOverride?: ProLaboreForm[]): TaxDetails {
    const { selectedPlan, totalSalaryExpense, fp12, rbt12, exchangeRate, domesticActivities = [], exportActivities = [] } = values;
    
    const proLaboresToUse = proLaboreOverride || values.proLabores;

    const domesticRevenue = domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
    const exportRevenueValue = exportActivities.reduce((acc, act) => acc + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueValue;
    
    const totalProLaboreBruto = proLaboresToUse.reduce((acc, p) => acc + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    // Passo 1: Calcular Bases Anuais e Fator R
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    
    const annualPayroll = proLaboreOverride 
      ? (totalSalaryExpense + proLaboresToUse.reduce((sum, p) => sum + p.value, 0)) * 12 
      : (fp12 > 0 ? fp12 : monthlyPayroll * 12);
      
    const fatorR = effectiveRbt12 > 0 ? annualPayroll / effectiveRbt12 : 0;
    
    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, config);

    // Passo 2: Calcular Alíquota Efetiva e DAS
    let totalDas = 0;
    let hasAnnexIVActivity = false;
    const finalAnnexes = new Set<Annex>();

    const allActivities = [...domesticActivities.map(a => ({...a, isExport: false})), ...exportActivities.map(a => ({...a, isExport: true, revenue: a.revenue * exchangeRate}))];

    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;

        const revenueForActivity = activity.revenue;

        if (revenueForActivity === 0) return;

        // Determinar Anexo
        let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= config.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        finalAnnexes.add(effectiveAnnex);
        if (effectiveAnnex === 'IV') {
            hasAnnexIVActivity = true;
        }

        // Encontrar faixa e calcular alíquota efetiva
        const annexTable = config.simples_nacional[effectiveAnnex];
        const bracket = findBracket(annexTable, effectiveRbt12);
        const { rate, deduction, distribution } = bracket;
        
        const effectiveRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * rate) - deduction) / effectiveRbt12 : rate;
        
        // Calcular DAS para a atividade
        let dasDaAtividade = revenueForActivity * effectiveRate;
        
        // Aplicar isenção de exportação
        if (activity.isExport) {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = distribution;
            const exportExemptionRatio = PIS + COFINS + (ISS || 0) + (ICMS || 0) + (IPI || 0);
            dasDaAtividade *= (1 - exportExemptionRatio);
        }
        
        totalDas += dasDaAtividade;
    });

    // Passo 3: Calcular CPP (Apenas para Anexo IV)
    let cppFromAnnexIV = 0;
    if (hasAnnexIVActivity) {
        cppFromAnnexIV = _calculateCpp(monthlyPayroll, config);
    }
    
    // Passo 4: Calcular Custo Total
    const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    const totalMonthlyCost = totalTax + contabilizeiFee;

    const annexLabel = [...finalAnnexes].sort().map(a => `Anexo ${a}`).join(', ');
    
    const breakdown = [
        { name: `DAS (${formatPercent(totalRevenue > 0 ? totalDas / totalRevenue : 0)})`, value: totalDas },
        { name: 'CPP (INSS Patronal)', value: cppFromAnnexIV },
        { name: 'INSS s/ Pró-labore', value: totalINSSRetido || 0 },
        { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido || 0 },
    ].filter(item => item.value > 0.001);

    const finalResult: TaxDetails = {
        regime: "Simples Nacional",
        annex: annexLabel,
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        domesticRevenue,
        exportRevenue: exportRevenueValue,
        proLabore: totalProLaboreBruto,
        fatorR: [...finalAnnexes].includes('III') || [...finalAnnexes].includes('V') ? fatorR : undefined,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        effectiveDasRate: totalRevenue > 0 ? totalDas / totalRevenue : 0,
        contabilizeiFee,
        breakdown,
        notes: [],
        partnerTaxes,
    };
    
    if (proLaboreOverride) {
        finalResult.regime = "Simples Nacional (Otimizado)";
        finalResult.optimizationNote = `Para buscar o Anexo III, o pró-labore total foi ajustado para ${totalProLaboreBruto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}.`;
    }

    return finalResult;
}


// =================================================================================
// 4. MAIN ORCHESTRATOR FUNCTION
// =================================================================================

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const config = getFiscalParameters(values.year as 2025 | 2026 || 2025);
  
  const totalRevenue = (values.domesticActivities || []).reduce((acc, act) => acc + act.revenue, 0) + (values.exportActivities || []).reduce((acc, act) => acc + (act.revenue * (values.exchangeRate || 1)), 0);
  
  const lucroPresumido = calculateLucroPresumido(values, config);
  const simplesNacionalBase = _calculateSimplesNacional(values, config);
  let simplesNacionalOtimizado: TaxDetails | null = null;
  
  const hasAnnexVActivity = values.selectedCnaes.some(item => getCnaeData(item.code)?.requiresFatorR);
  
  // Condição para otimização do Fator R
  if (hasAnnexVActivity && simplesNacionalBase.fatorR !== undefined && simplesNacionalBase.fatorR < config.simples_nacional.limite_fator_r && totalRevenue > 0) {
      
      const proLaboresCopy: ProLaboreForm[] = JSON.parse(JSON.stringify(values.proLabores));
      const totalProLaboreOriginal = proLaboresCopy.reduce((acc, p) => acc + p.value, 0);

      const requiredAnnualPayroll = (values.rbt12 > 0 ? values.rbt12 : totalRevenue * 12) * config.simples_nacional.limite_fator_r;
      const currentAnnualPayroll = (values.fp12 > 0 ? values.fp12 : (values.totalSalaryExpense + totalProLaboreOriginal) * 12);
      const additionalAnnualPayrollNeeded = requiredAnnualPayroll - currentAnnualPayroll;

      if (additionalAnnualPayrollNeeded > 0) {
          const additionalMonthlyProLaboreNeeded = additionalAnnualPayrollNeeded / 12;
          
          let minProLaboreValue = Infinity;
          let minProLaborePartnersCount = 0;
          
          proLaboresCopy.forEach(p => {
            if (p.value < minProLaboreValue) {
                minProLaboreValue = p.value;
                minProLaborePartnersCount = 1;
            } else if (p.value === minProLaboreValue) {
                minProLaborePartnersCount++;
            }
          });
          
          const valueToAddPerPartner = additionalMonthlyProLaboreNeeded / minProLaborePartnersCount;
          
          proLaboresCopy.forEach(p => {
              if (p.value === minProLaboreValue) {
                  p.value += valueToAddPerPartner;
              }
          });
          
          simplesNacionalOtimizado = _calculateSimplesNacional(values, config, proLaboresCopy);
      }
  } else if (hasAnnexVActivity && simplesNacionalBase.fatorR !== undefined && simplesNacionalBase.fatorR >= config.simples_nacional.limite_fator_r) {
    simplesNacionalOtimizado = {...simplesNacionalBase, regime: "Simples Nacional (Otimizado)", optimizationNote: `Sua empresa já atinge o Fator R de ${formatPercent(simplesNacionalBase.fatorR)} e se beneficia do Anexo III.`};
  }


  return {
    simplesNacionalBase: { ...simplesNacionalBase, order: simplesNacionalOtimizado ? 2: 1 },
    simplesNacionalOtimizado: simplesNacionalOtimizado ? { ...simplesNacionalOtimizado, order: 1 } : null,
    lucroPresumido: { ...lucroPresumido, order: 3 },
  };
}

    

    