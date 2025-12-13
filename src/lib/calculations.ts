
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
import { findBracket, findFeeBracket, formatPercent, safeFindBracket, formatCurrencyBRL } from './utils';
import { getFiscalParameters } from '../config/fiscal';

function resolveSelectedPlan(
  plans: Record<string, number> | undefined,
  selectedPlan: string | undefined
): number {
  if (!plans || typeof plans !== 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[FeeResolver] Plans object is invalid. Falling back to 0.');
    }
    return 0;
  }

  if (selectedPlan && plans[selectedPlan] !== undefined) {
    return plans[selectedPlan];
  }

  if (plans['expertsEssencial'] !== undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[FeeResolver] selectedPlan '${selectedPlan}' not found. Falling back to 'expertsEssencial'.`);
    }
    return plans['expertsEssencial'];
  }

  const firstAvailablePlan = Object.values(plans)[0];
  if (typeof firstAvailablePlan === 'number') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[FeeResolver] 'expertsEssencial' not found. Falling back to first available plan.`);
    }
    return firstAvailablePlan;
  }
  
  if (process.env.NODE_ENV === 'development') {
      console.error(`[FeeResolver] No valid plan could be resolved. Fee is 0.`);
  }
  return 0;
}


// =================================================================================
// 2. CORE CALCULATION LOGIC
// =================================================================================

export function _calculatePartnerTaxes(proLabores: ProLaboreForm[], config: FiscalConfig): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
    
    // Validação / fallback das tabelas usadas
    const inssTable = config?.tabela_inss_clt_progressiva;
    const irrfTable = config?.reforma_tributaria?.tabela_irrf?.length
        ? config.reforma_tributaria.tabela_irrf
        : config?.tabela_irrf;

    if (!Array.isArray(inssTable) || inssTable.length === 0) {
        throw new Error('Tabela de INSS inválida/ausente no FiscalConfig — impossível calcular pró-labore.');
    }
    if (!Array.isArray(irrfTable) || irrfTable.length === 0) {
        throw new Error('Tabela de IRRF inválida/ausente no FiscalConfig — impossível calcular pró-labore.');
    }

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
        
        totalINSSRetido += inss;
        
        const baseCalculoIRRF = proLaboreBruto - inss;

        const irrfBracket = safeFindBracket(baseCalculoIRRF, irrfTable, { who: '_calculatePartnerTaxes.IRRF', year: config.ano_vigencia });
        
        const irrf = irrfBracket ? Math.max(0, baseCalculoIRRF * irrfBracket.rate - irrfBracket.deduction) : 0;
        
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

export function _calculateCpp(monthlyPayroll: number, config: FiscalConfig): number {
    if (monthlyPayroll <= 0) return 0;
    return monthlyPayroll * config.aliquotas_cpp_patronal.base;
}

// =================================================================================
// 3. REGIME-SPECIFIC CALCULATION FUNCTIONS
// =================================================================================

function calculateLucroPresumido(values: TaxFormValues, config: FiscalConfig): TaxDetails {
    const { totalSalaryExpense, selectedPlan, exchangeRate = 1, proLabores, domesticActivities = [], exportActivities = [] } = values;

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;

    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, config);
    
    const pisRate = config.lucro_presumido_rates.PIS;
    const pis = domesticRevenue * pisRate;

    const cofinsRate = config.lucro_presumido_rates.COFINS;
    const cofins = domesticRevenue * cofinsRate;
    
    const issRateAsDecimal = (values.issRate ?? 5) / 100;
    const iss = domesticRevenue * issRateAsDecimal;

    let presumedProfitBase = 0;
    const allActivities = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))];
    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        const presuncao = cnaeInfo?.presumedProfitRateIRPJ ?? 0.32;
        presumedProfitBase += activity.revenue * presuncao;
    });

    const irpjRate = config.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicionalRate = config.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    const irpjAdicional = Math.max(0, (presumedProfitBase - config.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL)) * irpjAdicionalRate;
    const irpj = presumedProfitBase * irpjRate + irpjAdicional;
    
    const csllRate = config.lucro_presumido_rates.CSLL;
    const csll = presumedProfitBase * csllRate;

    const cppRate = config.aliquotas_cpp_patronal.base;
    const cpp = _calculateCpp(monthlyPayroll, config);

    const totalTax = pis + cofins + iss + irpj + csll + cpp + totalINSSRetido + totalIRRFRetido;
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = resolveSelectedPlan(feeBracket?.plans, values.selectedPlan);
    const totalMonthlyCost = totalTax + Number(contabilizeiFee || 0);
    
    return {
        regime: 'Lucro Presumido',
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        domesticRevenue,
        exportRevenue: exportRevenueBRL,
        proLabore: totalProLaboreBruto,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        contabilizeiFee: contabilizeiFee ?? 0,
        breakdown: [
          { name: `PIS`, value: pis, rate: pisRate },
          { name: `COFINS`, value: cofins, rate: cofinsRate },
          { name: `ISS`, value: iss, rate: issRateAsDecimal },
          { name: 'IRPJ', value: irpj, rate: irpjRate },
          { name: 'CSLL', value: csll, rate: csllRate },
          { name: 'CPP', value: cpp, rate: cppRate },
          { name: 'INSS s/ Pró-labore', value: totalINSSRetido, rate: config.aliquota_inss_prolabore },
          { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
        ].filter(item => item.value > 0.001),
        notes:[],
        partnerTaxes,
    };
}

function _calculateSimplesNacional(values: TaxFormValues, config: FiscalConfig, proLaboreOverride?: ProLaboreForm[]): TaxDetails {
    const { selectedPlan, totalSalaryExpense, fp12, rbt12, exchangeRate = 1, domesticActivities = [], exportActivities = [] } = values;
    
    const proLaboresToUse = proLaboreOverride || values.proLabores;

    const domesticRevenue = domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
    const exportRevenueValue = exportActivities.reduce((acc, act) => acc + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueValue;
    
    const totalProLaboreBruto = proLaboresToUse.reduce((acc, p) => acc + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    // BASE DE CÁLCULO (RBT12)
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    
    // SEMPRE usar a folha projetada quando estiver otimizando
    const annualPayroll = proLaboreOverride 
    ? monthlyPayroll * 12
    : (fp12 > 0 ? fp12 : monthlyPayroll * 12);
    const fatorR = effectiveRbt12 > 0 ? annualPayroll / effectiveRbt12 : 0;
    
    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = (proLaboresToUse && proLaboresToUse.length > 0)
        ? _calculatePartnerTaxes(proLaboresToUse, config) 
        : { partnerTaxes: [{ proLaboreBruto: 0, inss: 0, irrf: 0, proLaboreLiquido: 0 }], totalINSSRetido: 0, totalIRRFRetido: 0 };


    let totalDas = 0;
    let hasAnnexIVActivity = false;
    const finalAnnexes = new Set<Annex>();

    const allActivities = [...domesticActivities.map(a => ({...a, isExport: false})), ...exportActivities.map(a => ({...a, isExport: true, revenue: a.revenue * exchangeRate}))];

    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;

        const revenueForActivity = activity.revenue;
        if (revenueForActivity === 0) return;

        let effectiveAnnex: Annex;
        if (cnaeInfo.requiresFatorR) {
            effectiveAnnex = (fatorR >= config.simples_nacional.limite_fator_r) ? 'III' : 'V';
        } else {
            effectiveAnnex = cnaeInfo.annex;
        }
        finalAnnexes.add(effectiveAnnex);
        if (effectiveAnnex === 'IV') hasAnnexIVActivity = true;

        const annexTable = config.simples_nacional[effectiveAnnex];
        const bracket = findBracket(effectiveRbt12, annexTable);
        const { rate, deduction, distribution } = bracket;
        
        const effectiveRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * rate) - deduction) / effectiveRbt12 : rate;
        
        let dasDaAtividade = revenueForActivity * effectiveRate;
        
        if (activity.isExport) {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = distribution;
            const exportExemptionRatio = PIS + COFINS + (ISS || 0) + (ICMS || 0) + (IPI || 0);
            dasDaAtividade *= (1 - exportExemptionRatio);
        }
        
        totalDas += dasDaAtividade;
    });

    let cppFromAnnexIV = 0;
    const cppRate = config.aliquotas_cpp_patronal.base;
    if (hasAnnexIVActivity) {
        cppFromAnnexIV = _calculateCpp(monthlyPayroll, config);
    }
    
    const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = resolveSelectedPlan(feeBracket?.plans, values.selectedPlan);
    const totalMonthlyCost = totalTax + Number(contabilizeiFee || 0);

    const annexLabel = [...finalAnnexes].sort().map(a => `Anexo ${a}`).join(', ');
    const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;
    
    const breakdown = [
        { name: 'DAS', value: totalDas, rate: effectiveDasRate },
        { name: 'CPP', value: cppFromAnnexIV, rate: cppRate },
        { name: 'INSS s/ Pró-labore', value: totalINSSRetido || 0, rate: config.aliquota_inss_prolabore },
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
        effectiveDasRate: effectiveDasRate,
        contabilizeiFee: contabilizeiFee ?? 0,
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

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const config = getFiscalParameters(values.year as 2025 | 2026 || 2025);
  
  const totalRevenue = (values.domesticActivities || []).reduce((acc, act) => acc + act.revenue, 0) + (values.exportActivities || []).reduce((acc, act) => acc + (act.revenue * (values.exchangeRate || 1)), 0);
  
  const lucroPresumido = calculateLucroPresumido(values, config);
  const simplesNacionalBase = _calculateSimplesNacional(values, config);
  let simplesNacionalOtimizado: TaxDetails | null = null;
  
  const hasAnnexVActivity = values.selectedCnaes.some(item => getCnaeData(item.code)?.requiresFatorR);
  
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

          if (minProLaborePartnersCount > 0) {
            const valueToAddPerPartner = additionalMonthlyProLaboreNeeded / minProLaborePartnersCount;
            
            proLaboresCopy.forEach(p => {
                if (p.value === minProLaboreValue) {
                    p.value += valueToAddPerPartner;
                }
            });
          }
          
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
