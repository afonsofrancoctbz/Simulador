
import { getFiscalParameters, type FiscalConfig } from '@/config/fiscal';
import {
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
} from './constants';
import {
  type CalculationResults,
  type TaxFormValues,
  type TaxDetails,
  type Annex,
  type FeeBracket,
  type ProLaboreForm,
  type PartnerTaxDetails,
} from './types';
import { formatPercent } from './utils';
import { getCnaeData } from './cnae-helpers';

const fiscalConfig2025 = getFiscalParameters(2025) as FiscalConfig;

/**
 * Finds the correct bracket from a given table based on a value.
 * Pure and isolated helper function.
 * @param table The table to search in (e.g., INSS table, Simples Nacional annex table).
 * @param value The value to find the bracket for (e.g., salary, RBT12).
 * @returns The found bracket or the last bracket as a fallback.
 */
function _findBracket<T extends { max: number }>(table: T[], value: number): T {
  // Add a guard clause to prevent crash if table is undefined
  if (!table) {
    // This case should not happen with proper data, but it's a safe fallback.
    // We return a structure that won't crash the next steps.
    return { max: Infinity } as T;
  }
  return table.find(bracket => value <= bracket.max) || table[table.length - 1];
}

/**
 * Finds the correct fee bracket from the Contabilizei fee tables.
 * Pure and isolated helper function.
 * @param table The fee table (Lucro Presumido or Simples Nacional).
 * @param revenue The monthly revenue.
 * @returns The found fee bracket.
 */
function _findFeeBracket(table: FeeBracket[], revenue: number): FeeBracket | undefined {
    return table.find(bracket => revenue >= bracket.min && revenue <= bracket.max);
}

/**
 * Centralized function to calculate partner-specific taxes (INSS and IRRF).
 * This eliminates code duplication between different calculation modules.
 * @param proLabores Array of pro-labore values and contribution status for each partner.
 * @param config The fiscal configuration for the given year.
 * @returns An object containing an array of detailed partner taxes and the total INSS and IRRF withheld.
 */
function _calculatePartnerTaxes(proLabores: ProLaboreForm[], config: FiscalConfig): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
    let totalINSSRetido = 0;
    let totalIRRFRetido = 0;

    const partnerTaxes: PartnerTaxDetails[] = proLabores.map(proLabore => {
        const proLaboreBruto = proLabore.value;
        if (proLaboreBruto <= 0) {
            return { proLaboreBruto: 0, inss: 0, irrf: 0, proLaboreLiquido: 0 };
        }

        // INSS calculation considering other contributions and the ceiling
        const remainingContributionRoom = Math.max(0, config.teto_inss - (proLabore.hasOtherInssContribution ? proLabore.otherContributionSalary || 0 : 0));
        const baseCalculoINSS = Math.min(proLaboreBruto, remainingContributionRoom);
        const inss = baseCalculoINSS * config.aliquota_inss_prolabore;

        // IRRF calculation based on gross pro-labore minus the calculated INSS
        const baseCalculoIRRF = proLaboreBruto - inss;
        const irrfBracket = _findBracket(config.tabela_irrf, baseCalculoIRRF);
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
 * Pure, simple, and reusable.
 * @param baseDeCalculo The total payroll (salaries + pro-labore).
 * @param config The fiscal configuration.
 * @returns The calculated CPP value.
 */
function _calculateCpp(baseDeCalculo: number, config: FiscalConfig): number {
    return baseDeCalculo * config.aliquotas_cpp_patronal.base;
}

/**
 * Calculates all taxes for the Simples Nacional regime.
 * This function orchestrates all sub-calculations for Simples Nacional.
 * @param values The user's form input.
 * @param totalProLaboreBruto The total gross pro-labore for all partners.
 * @param monthlyPayroll The total monthly payroll (salaries + pro-labore).
 * @returns A detailed object with all calculated tax values for the Simples Nacional scenario.
 */
function _calculateSimplesNacional(values: TaxFormValues, totalProLaboreBruto: number, monthlyPayroll: number): TaxDetails {
    const { domesticActivities, exportActivities, exchangeRate, proLabores, rbt12, selectedPlan, selectedCnaes, fp12 } = values;

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = exportActivities.reduce((sum, act) => act.revenue, 0) * exchangeRate;
    const totalRevenue = domesticRevenue + exportRevenue;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);

    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;

    const fatorR = totalRevenue > 0 ? monthlyPayroll / totalRevenue : (effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0);
    const hasAnnexVActivity = selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);
    const useAnnexIIIForV = hasAnnexVActivity && fatorR >= fiscalConfig2025.simples_nacional.limite_fator_r;

    const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];

    let totalDas = 0;
    let cppFromAnnexIV = 0;
    const notes: string[] = [];
    const finalAnnexes = new Set<Annex>();
    let hasAnnexIVActivity = false;

    const allActivities = [
        ...domesticActivities.map(a => ({ ...a, type: 'domestic' as const })),
        ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }))
    ];

    for (const activity of allActivities) {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) continue;

        const effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig2025.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        finalAnnexes.add(effectiveAnnex);
        
        if (effectiveAnnex === 'IV') {
            hasAnnexIVActivity = true;
        }

        const annexTable = fiscalConfig2025.simples_nacional[effectiveAnnex];
        
        if (!annexTable) {
            console.warn(`Tabela do anexo ${effectiveAnnex} não encontrada para o CNAE ${activity.code}. Pulando cálculo para esta atividade.`);
            continue;
        }

        const bracket = _findBracket(annexTable, effectiveRbt12);
        
        const effectiveRate = effectiveRbt12 > 0 
            ? Math.max(0, (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12) 
            : bracket.rate;

        let dasForActivity = 0;
        if (activity.type === 'export') {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
            const exportExemptionFactor = PIS + COFINS + ISS + ICMS + IPI;
            const exportDasRate = effectiveRate * (1 - exportExemptionFactor);
            dasForActivity = activity.revenue * exportDasRate;
            if (exportRevenue > 0 && !notes.some(n => n.includes('exportação'))) {
                notes.push("Receitas de exportação têm isenção de PIS, COFINS, ISS, IPI e ICMS no Simples Nacional.");
            }
        } else {
            dasForActivity = activity.revenue * effectiveRate;
        }
        totalDas += dasForActivity;
    }

    if (hasAnnexIVActivity) {
        cppFromAnnexIV = _calculateCpp(monthlyPayroll, fiscalConfig2025);
        if (!notes.some(n => n.includes('Anexo IV'))) {
            notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
        }
    }

    const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;

    let regimeName = "Simples Nacional";
    let annexLabel = [...finalAnnexes].length === 1 ? `Anexo ${[...finalAnnexes][0]}` : `Anexos (${[...finalAnnexes].join(', ')})`;
    if (useAnnexIIIForV) annexLabel = "Com Fator R";
    if (hasAnnexVActivity && !useAnnexIIIForV) annexLabel = "Sem Fator R";

    const breakdown = [
        { name: `DAS (${formatPercent(totalRevenue > 0 ? totalDas / totalRevenue : 0)})`, value: totalDas },
        { name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)})`, value: cppFromAnnexIV },
        { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
        { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
    ];

    return {
        regime: regimeName, totalTax, totalMonthlyCost, totalRevenue,
        proLabore: totalProLaboreBruto, fatorR: hasAnnexVActivity ? fatorR : undefined,
        annex: annexLabel, effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001),
        notes, partnerTaxes, netProfit: totalRevenue - totalMonthlyCost
    };
}

/**
 * Calculates all taxes for the Lucro Presumido regime.
 * This function orchestrates all sub-calculations for Lucro Presumido.
 * @param values The user's form input.
 * @returns A detailed object with all calculated tax values for the Lucro Presumido scenario.
 */
function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan } = values;

    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
    const totalRevenue = domesticRevenue + exportRevenueBRL;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);
    const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

    const cpp = _calculateCpp(monthlyPayroll, fiscalConfig2025);

    const notes: string[] = [];
    if (exportRevenueBRL > 0) notes.push("Receitas de exportação de serviços são isentas de PIS, COFINS e ISS.");

    const pis = domesticRevenue * fiscalConfig2025.lucro_presumido_rates.PIS;
    const cofins = domesticRevenue * fiscalConfig2025.lucro_presumido_rates.COFINS;
    const iss = domesticRevenue * fiscalConfig2025.lucro_presumido_rates.ISS;

    const allActivities = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))];
    const presumedProfitBase = allActivities.reduce((sum, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
    }, 0);

    const irpjBase = presumedProfitBase;
    const irpj = irpjBase * fiscalConfig2025.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicional = Math.max(0, (irpjBase - (fiscalConfig2025.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL * 1))) * fiscalConfig2025.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;

    const csll = presumedProfitBase * fiscalConfig2025.lucro_presumido_rates.CSLL;

    const companyRevenueTaxes = irpj + irpjAdicional + csll + pis + cofins + iss;
    const totalTax = companyRevenueTaxes + cpp + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + contabilizeiFee;

    const breakdown = [
      { name: `IRPJ (${formatPercent(totalRevenue > 0 ? (irpj + irpjAdicional) / totalRevenue : 0)})`, value: irpj + irpjAdicional },
      { name: `CSLL (${formatPercent(totalRevenue > 0 ? csll / totalRevenue : 0)})`, value: csll },
      { name: `PIS (${formatPercent(totalRevenue > 0 ? pis / totalRevenue : 0)})`, value: pis },
      { name: `COFINS (${formatPercent(totalRevenue > 0 ? cofins / totalRevenue : 0)})`, value: cofins },
      { name: `ISS (${formatPercent(totalRevenue > 0 ? iss / totalRevenue : 0)})`, value: iss },
      { name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)})`, value: cpp },
      { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
      { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
    ];

    return {
      regime: 'Lucro Presumido',
      totalTax, totalMonthlyCost, totalRevenue, proLabore: totalProLaboreBruto,
      effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
      contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001),
      notes, partnerTaxes, netProfit: totalRevenue - totalMonthlyCost,
    };
}

/**
 * Main calculation entry point.
 * This function orchestrates the entire tax calculation process, including comparing different scenarios.
 * @param values The user's form input.
 * @returns An object containing the results for all relevant tax scenarios.
 */
export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const totalProLaboreBruto = values.proLabores.reduce((acc, p) => acc + p.value, 0);
  const monthlyPayroll = values.totalSalaryExpense + totalProLaboreBruto;

  const lucroPresumido = calculateLucroPresumido(values);
  const simplesNacionalBase = _calculateSimplesNacional(values, totalProLaboreBruto, monthlyPayroll);

  let simplesNacionalOtimizado: TaxDetails | null = null;

  const hasAnnexVActivity = values.selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);
  const fatorRBase = simplesNacionalBase.fatorR;

  // Check if optimization is possible and necessary
  if (hasAnnexVActivity && fatorRBase !== undefined && fatorRBase < fiscalConfig2025.simples_nacional.limite_fator_r) {
      const totalRevenue = simplesNacionalBase.totalRevenue;
      if (totalRevenue > 0) {
          const requiredPayrollForFatorR = totalRevenue * fiscalConfig2025.simples_nacional.limite_fator_r;
          let requiredTotalProLabore = requiredPayrollForFatorR - values.totalSalaryExpense;

          const minProLaboreTotal = fiscalConfig2025.salario_minimo * values.numberOfPartners;
          if (requiredTotalProLabore < minProLaboreTotal) {
            requiredTotalProLabore = minProLaboreTotal;
          }

          if (requiredTotalProLabore > totalProLaboreBruto) {
              const optimizedProLaborePerPartner = requiredTotalProLabore / values.numberOfPartners;
              const optimizedProLabores = values.proLabores.map(p => ({ ...p, value: optimizedProLaborePerPartner }));
              const optimizedValues: TaxFormValues = { ...values, proLabores: optimizedProLabores };
              const optimizedMonthlyPayrollFull = values.totalSalaryExpense + requiredTotalProLabore;

              simplesNacionalOtimizado = _calculateSimplesNacional(optimizedValues, requiredTotalProLabore, optimizedMonthlyPayrollFull);
              if (simplesNacionalOtimizado) {
                 simplesNacionalOtimizado.regime = "Simples Nacional Anexo III";
                 simplesNacionalOtimizado.annex = "Com Fator R";
                 simplesNacionalOtimizado.optimizationNote = `Pró-labore ajustado para aumentar o Fator R.`
              }
          }
      }
  }

  lucroPresumido.order = 3;
  if(simplesNacionalOtimizado) {
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
