

import { getFiscalParameters, type FiscalConfig } from '@/config/fiscal';
import {
    CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
    CONTABILIZEI_FEES_SIMPLES_NACIONAL,
    getCnaeData,
} from './cnae-helpers';
import {
    type CalculationResults,
    type TaxFormValues,
    type TaxDetails,
    type Annex,
    type ProLaboreForm,
    type PartnerTaxDetails,
} from './types';
import { formatPercent, findBracket, findFeeBracket } from './utils';


// =================================================================================
// FUNÇÕES UTILITÁRIAS (HELPER FUNCTIONS)
// =================================================================================

/**
 * Centralized function to calculate partner-specific taxes (INSS and IRRF).
 */
export function _calculatePartnerTaxes(proLabores: ProLaboreForm[], config: FiscalConfig): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
    let totalINSSRetido = 0;
    let totalIRRFRetido = 0;

    const partnerTaxes: PartnerTaxDetails[] = proLabores.map(proLabore => {
        const proLaboreBruto = proLabore.value;
        if (proLaboreBruto <= 0) {
            return { proLaboreBruto: 0, inss: 0, irrf: 0, proLaboreLiquido: 0 };
        }

        // Correctly handles INSS ceiling and other contributions
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
 * Centralized function to calculate the Contribuição Previdenciária Patronal (CPP).
 */
export function _calculateCpp(baseDeCalculo: number, config: FiscalConfig): number {
    return baseDeCalculo * config.aliquotas_cpp_patronal.base;
}


// =================================================================================
// CÁLCULO DO SIMPLES NACIONAL (COM CORREÇÃO)
// =================================================================================

function _calculateSimplesNacional(values: TaxFormValues): TaxDetails {
    const { domesticActivities, exportActivities, exchangeRate, proLabores, rbt12, selectedPlan, selectedCnaes, fp12, totalSalaryExpense } = values;
    const config = getFiscalParameters(2025) as FiscalConfig;

    const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + p.value, 0);
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenue;
    
    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, config);

    // Use RBT12 if provided, otherwise project annual revenue from current month's total.
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;

    const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
    
    const hasAnnexVActivity = selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);
    const useAnnexIIIForV = hasAnnexVActivity && fatorR >= config.simples_nacional.limite_fator_r;

    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];

    let totalDas = 0;
    let cppFromAnnexIV = 0;
    const notes: string[] = [];
    const finalAnnexes = new Set<Annex>();
    let hasAnnexIVActivity = false;

    // Combine all activities for a single processing loop
    const allActivities = [
        ...domesticActivities.map(a => ({ ...a, type: 'domestic' as const })),
        ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }))
    ];
    
    // Fallback for when there is no revenue but CNAEs are selected
    if (totalRevenue === 0 && allActivities.length === 0 && selectedCnaes.length > 0) {
        allActivities.push({ code: selectedCnaes[0], revenue: 0, type: 'domestic'});
    }

    // Process each activity to calculate its contribution to DAS
    for (const activity of allActivities) {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) continue;

        let effectiveAnnex: Annex = cnaeInfo.annex;
        if (cnaeInfo.requiresFatorR) {
            effectiveAnnex = fatorR >= config.simples_nacional.limite_fator_r ? 'III' : 'V';
        }
        finalAnnexes.add(effectiveAnnex);
        
        if (effectiveAnnex === 'IV') {
            hasAnnexIVActivity = true;
        }

        const annexTable = config.simples_nacional[effectiveAnnex];
        if (!annexTable) continue;
        
        const bracket = findBracket(annexTable, effectiveRbt12);
        
        // Calculate the effective tax rate based on the RBT12
        const effectiveRate = effectiveRbt12 > 0 
            ? Math.max(0, (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12)
            : bracket.rate;

        // Calculate the full DAS for the activity's revenue
        let dasForActivity = activity.revenue * effectiveRate;
        
        // If the activity is an export, calculate and apply the tax exemption
        if (activity.type === 'export' && dasForActivity > 0) {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
            // The exemption factor is the sum of tax shares that don't apply to exports
            const exportExemptionFactor = PIS + COFINS + ISS + ICMS + IPI;
            const exportExemptionValue = dasForActivity * exportExemptionFactor;
            dasForActivity -= exportExemptionValue;

            if (exportRevenue > 0 && !notes.some(n => n.includes('exportação'))) {
                notes.push("Receitas de exportação têm isenção de PIS, COFINS, ISS, IPI e ICMS no Simples Nacional.");
            }
        }
        
        totalDas += dasForActivity;
    }

    if (hasAnnexIVActivity) {
        cppFromAnnexIV = _calculateCpp(monthlyPayroll, config);
        if (!notes.some(n => n.includes('Anexo IV'))) {
            notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(config.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
        }
    }

    const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;
    
    let annexLabel: string;
    if (useAnnexIIIForV) {
      annexLabel = 'Anexo III (Com Fator R)';
    } else if (finalAnnexes.size === 1 && hasAnnexVActivity) {
      annexLabel = 'Anexo V (Sem Fator R)';
    } else if (finalAnnexes.size === 0 && hasAnnexVActivity) {
        annexLabel = 'Anexo V (Sem Fator R)';
    } else {
      annexLabel = [...finalAnnexes].length === 1 ? `Anexo ${[...finalAnnexes][0]}` : `Anexos (${[...finalAnnexes].join(', ')})`;
    }

    const breakdown = [
        { name: 'DAS', value: totalDas },
        { name: 'CPP (INSS Patronal)', value: cppFromAnnexIV },
        { name: `INSS s/ Pró-labore (${formatPercent(config.aliquota_inss_prolabore)})`, value: totalINSSRetido },
        { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
    ];

    return {
        regime: "Simples Nacional", totalTax, totalMonthlyCost, totalRevenue,
        proLabore: totalProLaboreBruto, fatorR: hasAnnexVActivity ? fatorR : undefined,
        annex: annexLabel, effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        effectiveDasRate: totalRevenue > 0 ? totalDas / totalRevenue : 0,
        contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001),
        notes, partnerTaxes,
    };
}


// =================================================================================
// CÁLCULO DO LUCRO PRESUMIDO
// =================================================================================

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan, selectedCnaes } = values;
    const config = getFiscalParameters(2025) as FiscalConfig;

    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, config);
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

    const cpp = _calculateCpp(monthlyPayroll, config);

    const notes: string[] = [];
    if (exportRevenueBRL > 0) notes.push("Receitas de exportação de serviços são isentas de PIS, COFINS e ISS.");

    const pis = domesticRevenue * config.lucro_presumido_rates.PIS;
    const cofins = domesticRevenue * config.lucro_presumido_rates.COFINS;
    const iss = domesticRevenue * config.lucro_presumido_rates.ISS;

    const allActivities = [
        ...domesticActivities, 
        ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))
    ];
    
    if (totalRevenue === 0 && allActivities.length === 0 && selectedCnaes.length > 0) {
        allActivities.push({ code: selectedCnaes[0], revenue: 0, type: 'domestic'});
    }

    const irpjPresumedProfitBase = allActivities.reduce((sum, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
    }, 0);

    const csllPresumedProfitBase = allActivities.reduce((sum, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateCSLL ?? 0.32));
    }, 0);

    const irpj = irpjPresumedProfitBase * config.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicional = Math.max(0, (irpjPresumedProfitBase - config.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL)) * config.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;

    const csll = csllPresumedProfitBase * config.lucro_presumido_rates.CSLL;

    const companyRevenueTaxes = irpj + irpjAdicional + csll + pis + cofins + iss;
    const totalTax = companyRevenueTaxes + cpp + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;

    const breakdown = [
      { name: 'IRPJ', value: irpj + irpjAdicional },
      { name: 'CSLL', value: csll },
      { name: `PIS (${formatPercent(config.lucro_presumido_rates.PIS)})`, value: pis },
      { name: `COFINS (${formatPercent(config.lucro_presumido_rates.COFINS)})`, value: cofins },
      { name: `ISS (${formatPercent(config.lucro_presumido_rates.ISS)})`, value: iss },
      { name: 'CPP (INSS Patronal)', value: cpp },
      { name: `INSS s/ Pró-labore (${formatPercent(config.aliquota_inss_prolabore)})`, value: totalINSSRetido },
      { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
    ];

    return {
      regime: 'Lucro Presumido',
      totalTax, totalMonthlyCost, totalRevenue, proLabore: totalProLaboreBruto,
      effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
      contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001),
      notes, partnerTaxes,
    };
}


// =================================================================================
// FUNÇÃO PRINCIPAL (ORQUESTRADOR)
// =================================================================================

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const config = getFiscalParameters(2025) as FiscalConfig;
  const lucroPresumido = calculateLucroPresumido(values);
  const simplesNacionalBase = _calculateSimplesNacional(values);

  let simplesNacionalOtimizado: TaxDetails | null = null;
  const hasAnnexVActivity = values.selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);
  const fatorRBase = simplesNacionalBase.fatorR;

  if (hasAnnexVActivity && fatorRBase !== undefined && fatorRBase < config.simples_nacional.limite_fator_r) {
      const totalRevenue = simplesNacionalBase.totalRevenue;
      if (totalRevenue > 0) {
          const requiredPayrollForFatorR = totalRevenue * config.simples_nacional.limite_fator_r;
          let requiredTotalProLabore = requiredPayrollForFatorR - values.totalSalaryExpense;

          const minProLaboreTotal = config.salario_minimo * values.numberOfPartners;
          if (requiredTotalProLabore < minProLaboreTotal) {
            requiredTotalProLabore = minProLaboreTotal;
          }

          if (requiredTotalProLabore > simplesNacionalBase.proLabore) {
              const optimizedProLaborePerPartner = requiredTotalProLabore / values.numberOfPartners;
              const optimizedProLabores = values.proLabores.map(p => ({ ...p, value: optimizedProLaborePerPartner }));
              const optimizedValues: TaxFormValues = { ...values, proLabores: optimizedProLabores };
              
              simplesNacionalOtimizado = _calculateSimplesNacional(optimizedValues);
              if (simplesNacionalOtimizado) {
                  simplesNacionalOtimizado.regime = "Simples Nacional";
                  simplesNacionalOtimizado.annex = "Anexo III (Com Fator R)";
                  simplesNacionalOtimizado.optimizationNote = `Pró-labore ajustado para aumentar o Fator R.`
              }
          }
      }
  }

  // Set display order for the UI
  lucroPresumido.order = 3;
  if (simplesNacionalOtimizado) {
    simplesNacionalBase.order = 2;
    simplesNacionalOtimizado.order = 1;
  } else {
    simplesNacionalBase.order = 1;
  }

  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}
// Export for use in 2026 calculations to avoid duplication
export { };

    
    