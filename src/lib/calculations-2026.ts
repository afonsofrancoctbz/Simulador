// src/lib/calculations-2026.ts
import { getFiscalParametersPostReform } from "@/config/fiscal";
import {
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
  getCnaeData,
} from "./cnae-helpers";
import {
  type CalculationResults2026,
  type TaxFormValues,
  type TaxDetails2026,
  type TaxDetails,
  type ProLaboreForm,
  type PartnerTaxDetails,
} from "./types";
import {
  findFeeBracket,
  safeFindBracket,
  formatCurrencyBRL,
  formatPercent,
} from "./utils";
import { getIvaReductionByCnae } from "./cnae-reductions-2026";
import { resolveSelectedPlan } from "./calculations";

// ======================================================================================
// SECTION: TYPES & CONSTANTS
// ======================================================================================

type Annex = "I" | "II" | "III" | "IV" | "V";
const VALID_ANNEXES = ["I", "II", "III", "IV", "V"];

interface IvaCalculationResult {
  debit: number;
  credit: number;
  payable: number;
}

// ======================================================================================
// SECTION: SHARED HELPERS
// ======================================================================================

function isValidAnnex(a: unknown): a is Annex {
  return typeof a === "string" && VALID_ANNEXES.includes(a);
}

function normalizeAnnex(annex?: string | null): Annex {
  return isValidAnnex(annex) ? annex : "III";
}

function calculateCpp(monthlyPayroll: number, fiscalConfig: any): number {
  const cppRate = fiscalConfig.aliquotas_cpp_patronal?.base ?? 0;
  return monthlyPayroll * cppRate;
}

/**
 * Helper para formatar o nome do imposto com a alíquota
 * Ex: PIS -> PIS - 0,65%
 * Se manualRate for fornecido, usa ele. Caso contrário, calcula value/base.
 */
function formatTaxLabel(name: string, value: number, base: number, manualRate?: number): string {
    if (value <= 0 || base <= 0) return name;
    
    const rate = manualRate !== undefined ? manualRate : (value / base);
    
    // Formata para porcentagem (ex: 0.048 -> 4,80%)
    return `${name} - ${formatPercent(rate)}`;
}

/**
 * Calculates standard Contribution Fee based on Revenue and Regime Tables
 */
function resolveContabilizeiFee(
  totalRevenue: number,
  selectedPlan: string | undefined,
  feeTable: any[]
) {
  const safeRevenue = Math.max(0, totalRevenue);
  const feeBracket = findFeeBracket(feeTable, safeRevenue);
  return resolveSelectedPlan(feeBracket?.plans, selectedPlan);
}

/**
 * Calculates INSS and IRRF for partners
 */
function calculatePartnerTaxes(
  proLabores: ProLaboreForm[],
  fiscalConfig: any
): { partnerTaxes: PartnerTaxDetails[]; totalINSSRetido: number; totalIRRFRetido: number } {
  const partnerTaxes: PartnerTaxDetails[] = [];
  let totalINSSRetido = 0;
  let totalIRRFRetido = 0;

  const inssTable = fiscalConfig?.tabela_inss_clt_progressiva;
  const irrfTable = fiscalConfig?.reforma_tributaria?.tabela_irrf;

  if (!inssTable || !irrfTable) {
    throw new Error("Tabelas de impostos (INSS/IRRF) não encontradas na configuração fiscal.");
  }
  
  // 2026 Reform Constants
  const SIMPLIFIED_DISCOUNT_VALUE = 607.20;
  const REDUCTION_LIMIT_LOW = 5000.00;
  const REDUCTION_LIMIT_HIGH = 7350.00;
  const REDUCTION_BASE = 978.62;
  const REDUCTION_FACTOR = 0.133145;


  for (const proLabore of proLabores) {
    const grossIncome = proLabore.value || 0;
    if (grossIncome <= 0) continue;

    // 1. Calculate INSS
    let inssValue = 0;
    if (proLabore.hasOtherInssContribution) {
      const otherContribution = proLabore.otherContributionSalary || 0;
      const remainingSpace = Math.max(0, fiscalConfig.teto_inss - otherContribution);
      const inssBase = Math.min(grossIncome, remainingSpace);
      if (inssBase > 0) {
          inssValue = inssBase * fiscalConfig.aliquota_inss_prolabore;
      }
    } else {
        const inssBase = Math.min(grossIncome, fiscalConfig.teto_inss);
        inssValue = inssBase * fiscalConfig.aliquota_inss_prolabore;
    }
    const maxContribution = fiscalConfig.teto_inss * fiscalConfig.aliquota_inss_prolabore;
    inssValue = Math.min(inssValue, maxContribution);

    // Step A: Determine the Best Deduction
    const effectiveDeduction = Math.max(inssValue, SIMPLIFIED_DISCOUNT_VALUE);

    // Step B: Calculate the Tax Base
    const irrfBase = grossIncome - effectiveDeduction;
    
    // Step C: Calculate Standard Tax ("Full" Tax)
    let standardTax = 0;
    if (irrfBase > 0) {
      const irrfBracket = safeFindBracket(irrfBase, irrfTable, { 
        who: 'PartnerTaxes.Standard', 
        year: fiscalConfig.ano_vigencia 
      });
      if (irrfBracket && irrfBracket.rate > 0) {
        standardTax = (irrfBase * irrfBracket.rate) - irrfBracket.deduction;
      }
    }
    standardTax = Math.max(0, standardTax);

    // Step D: Calculate the Law 15.270 Reduction ("Redutor")
    let reductionValue = 0;
    if (grossIncome <= REDUCTION_LIMIT_LOW) {
      reductionValue = standardTax;
    } else if (grossIncome > REDUCTION_LIMIT_LOW && grossIncome <= REDUCTION_LIMIT_HIGH) {
      const calculatedReduction = REDUCTION_BASE - (REDUCTION_FACTOR * grossIncome);
      reductionValue = Math.max(0, calculatedReduction);
    } else { // grossIncome > REDUCTION_LIMIT_HIGH
      reductionValue = 0;
    }

    // Step E: Final Result
    const finalIrrfValue = Math.max(0, standardTax - reductionValue);

    totalINSSRetido += inssValue;
    totalIRRFRetido += finalIrrfValue;

    partnerTaxes.push({
      proLaboreBruto: grossIncome,
      inss: inssValue,
      irrf: finalIrrfValue,
      proLaboreLiquido: grossIncome - inssValue - finalIrrfValue,
    });
  }

  return { partnerTaxes, totalINSSRetido, totalIRRFRetido };
}

/**
 * Helper to calculate IBS/CBS credits and debits
 */
function calculateIvaLiability(
  activities: any[],
  creditExpenses: number,
  stdRate: number,
  taxType: 'IBS' | 'CBS'
): IvaCalculationResult {
  let debit = 0;
  
  // Calculate Debits
  activities.forEach((act) => {
    const reductionData = getIvaReductionByCnae(act.code, act.nbsCode);
    const reductionPercent = taxType === 'CBS' 
      ? (reductionData?.reducaoCBS ?? 0) 
      : (reductionData?.reducaoIBS ?? 0);
    
    const effectiveRate = stdRate * (1 - (reductionPercent / 100));
    debit += (act.revenue || 0) * effectiveRate;
  });

  // Calculate Credits (using the first activity's reduction profile as a baseline heuristic 
  // if mixed activities exist, or 0 reduction if strict).
  let credit = 0;
  if (creditExpenses > 0 && activities.length > 0) {
    const firstAct = activities[0];
    const reductionData = getIvaReductionByCnae(firstAct.code, firstAct.nbsCode);
    const reductionPercent = taxType === 'CBS' 
      ? (reductionData?.reducaoCBS ?? 0) 
      : (reductionData?.reducaoIBS ?? 0);
    
    const effectiveCreditRate = stdRate * (1 - (reductionPercent / 100));
    credit = creditExpenses * effectiveCreditRate;
  }

  return {
    debit,
    credit,
    payable: Math.max(0, debit - credit)
  };
}

// ======================================================================================
// SECTION: LUCRO PRESUMIDO ENGINE
// ======================================================================================

function calculateLucroPresumido2026(values: TaxFormValues, isCurrentRules: boolean): TaxDetails2026 | null {
  const { 
    year = 2026, domesticActivities = [], exportActivities = [], 
    exchangeRate = 1, totalSalaryExpense = 0, proLabores = [], 
    selectedPlan, creditGeneratingExpenses = 0, issRate = 5 
  } = values;

  const fiscalConfig = getFiscalParametersPostReform(year);

  // 1. Revenue Aggregation
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + (act?.revenue || 0), 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act?.revenue || 0) * exchangeRate, 0);
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + (p?.value || 0), 0);

  if (totalRevenue === 0 && totalProLaboreBruto === 0) return null;

  // 2. Payroll Taxes
  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = calculatePartnerTaxes(proLabores, fiscalConfig);
  const inssPatronal = calculateCpp(monthlyPayroll, fiscalConfig);

  // 3. IRPJ & CSLL (Corporate Income Tax)
  // Combine all activities, converting export revenue to BRL
  const allActivities = [
    ...domesticActivities,
    ...exportActivities.map(a => ({ ...a, revenue: (a.revenue || 0) * exchangeRate }))
  ];

  let baseIRPJ = 0;
  let baseCSLL = 0;

  allActivities.forEach(act => {
    const cnaeInfo = getCnaeData(act.code);
    const rateIRPJ = cnaeInfo?.presumedProfitRateIRPJ ?? 0.32;
    const rateCSLL = cnaeInfo?.presumedProfitRateCSLL ?? 0.32;
    const rev = act.revenue || 0;
    baseIRPJ += rev * rateIRPJ;
    baseCSLL += rev * rateCSLL;
  });

  const rates = fiscalConfig.lucro_presumido_rates;
  const irpjNormal = baseIRPJ * (rates.IRPJ_BASE ?? 0.15);
  const irpjAdicional = Math.max(0, baseIRPJ - (rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL || 20000)) * (rates.IRPJ_ADICIONAL_BASE ?? 0.10);
  const irpjTotal = irpjNormal + irpjAdicional;
  const csllTotal = baseCSLL * (rates.CSLL ?? 0.09);

  // 4. Consumption Taxes (The complex part: Current Rules vs Transition)
  const breakdown: any[] = [];
  let consumptionTaxes = 0;

  if (isCurrentRules) {
    const pis = domesticRevenue * (rates.PIS ?? 0);
    const cofins = domesticRevenue * (rates.COFINS ?? 0);
    const iss = domesticRevenue * ((issRate ?? 5) / 100);
    
    consumptionTaxes = pis + cofins + iss;
    breakdown.push(
      { name: formatTaxLabel("PIS", pis, domesticRevenue, rates.PIS), value: pis, rate: rates.PIS },
      { name: formatTaxLabel("COFINS", cofins, domesticRevenue, rates.COFINS), value: cofins, rate: rates.COFINS },
      { name: formatTaxLabel("ISS", iss, domesticRevenue, (issRate ?? 5) / 100), value: iss, rate: (issRate ?? 5) / 100 }
    );
  } else {
    // Transition Rules (2026+)
    const trans = fiscalConfig.reforma_tributaria;
    
    // Legacy Taxes with multipliers (usually shrinking over time)
    const pisTrans = domesticRevenue * (rates.PIS ?? 0) * (trans?.pis_cofins_multiplier ?? 1);
    const cofinsTrans = domesticRevenue * (rates.COFINS ?? 0) * (trans?.pis_cofins_multiplier ?? 1);
    const issTrans = domesticRevenue * ((issRate ?? 5) / 100) * (trans?.iss_icms_multiplier ?? 1);
    
    const legacyTotal = pisTrans + cofinsTrans + issTrans;

    // Alíquotas efetivas de transição para exibição
    const pisRateTrans = (rates.PIS ?? 0) * (trans?.pis_cofins_multiplier ?? 1);
    const cofinsRateTrans = (rates.COFINS ?? 0) * (trans?.pis_cofins_multiplier ?? 1);
    const issRateTrans = ((issRate ?? 5) / 100) * (trans?.iss_icms_multiplier ?? 1);

    breakdown.push(
      { name: formatTaxLabel("PIS (Transição)", pisTrans, domesticRevenue, pisRateTrans), value: pisTrans },
      { name: formatTaxLabel("COFINS (Transição)", cofinsTrans, domesticRevenue, cofinsRateTrans), value: cofinsTrans },
      { name: formatTaxLabel("ISS (Transição)", issTrans, domesticRevenue, issRateTrans), value: issTrans }
    );

    // New Taxes (IBS/CBS)
    const cbsCalc = calculateIvaLiability(domesticActivities, creditGeneratingExpenses, trans?.cbs_aliquota_padrao ?? 0, 'CBS');
    const ibsCalc = calculateIvaLiability(domesticActivities, creditGeneratingExpenses, trans?.ibs_aliquota_padrao ?? 0, 'IBS');

    if (year === 2026) {
      // In 2026, IBS/CBS are "test" taxes (deductible/compensable), usually not added to final burden in same way
      // *Logic adjustment*: The reform specs say 2026 is merely for system testing (0.9% CBS, 0.1% IBS), 
      // deductible from PIS/COFINS. For simplicity here, we assume they are "extra" but labeled as test.
      breakdown.push(
        { name: formatTaxLabel("CBS (Teste/Compensável)", cbsCalc.payable, domesticRevenue), value: cbsCalc.payable },
        { name: formatTaxLabel("IBS (Teste/Compensável)", ibsCalc.payable, domesticRevenue), value: ibsCalc.payable }
      );
      consumptionTaxes = legacyTotal; // Keeping conservative for 2026
    } else {
      breakdown.push(
        { name: formatTaxLabel("CBS (Líquida)", cbsCalc.payable, domesticRevenue), value: cbsCalc.payable },
        { name: formatTaxLabel("IBS (Líquido)", ibsCalc.payable, domesticRevenue), value: ibsCalc.payable }
      );
      consumptionTaxes = legacyTotal + cbsCalc.payable + ibsCalc.payable;
    }
  }

  // 5. Final Assembly
  const totalTax = irpjTotal + csllTotal + consumptionTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
  const { fee: contabilizeiFee, planName, isDefault } = resolveContabilizeiFee(totalRevenue, selectedPlan, CONTABILIZEI_FEES_LUCRO_PRESUMIDO);
  const totalMonthlyCost = totalTax + Number(contabilizeiFee ?? 0);

  // Calcula alíquota efetiva do IRPJ e CSLL sobre o faturamento total para exibição
  const effectiveIrpjRate = totalRevenue > 0 ? irpjTotal / totalRevenue : 0;
  const effectiveCsllRate = totalRevenue > 0 ? csllTotal / totalRevenue : 0;

  return {
    regime: isCurrentRules ? "Lucro Presumido (Regras Atuais)" : "Lucro Presumido",
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    domesticRevenue,
    exportRevenue: exportRevenueBRL,
    proLabore: totalProLaboreBruto,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    contabilizeiFee,
    breakdown: [
      { name: formatTaxLabel("IRPJ", irpjTotal, totalRevenue, effectiveIrpjRate), value: irpjTotal, rate: rates.IRPJ_BASE },
      { name: formatTaxLabel("CSLL", csllTotal, totalRevenue, effectiveCsllRate), value: csllTotal, rate: rates.CSLL },
      { name: formatTaxLabel("CPP (INSS Patronal)", inssPatronal, monthlyPayroll), value: inssPatronal },
      { name: formatTaxLabel("INSS s/ Pró-labore", totalINSSRetido, totalProLaboreBruto), value: totalINSSRetido },
      { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
      ...breakdown,
    ].filter(i => i.value > 0.001),
    notes: isDefault ? [`Plano '${planName}' usado para cálculo.`] : [],
    partnerTaxes,
    fatorR: 0,
    effectiveDasRate: 0,
    annex: "N/A",
    optimizationNote: "",
    // @ts-expect-error - Custom property for sorting
    order: isCurrentRules ? 5 : 4,
  };
}

// ======================================================================================
// SECTION: SIMPLES NACIONAL ENGINE
// ======================================================================================

function _calculateSimples2026(
  values: TaxFormValues,
  isHybrid: boolean,
  fatorREffective: number,
  proLaboreOverride?: ProLaboreForm[]
): TaxDetails2026 | null {
  if (!values.year || values.year < 2026) throw new Error("Ano inválido Simples Nacional 2026+");

  const fiscalConfig = getFiscalParametersPostReform(values.year);
  const { 
    domesticActivities = [], exportActivities = [], exchangeRate = 1, 
    totalSalaryExpense = 0, proLabores = [], b2bRevenuePercentage = 100, 
    rbt12, selectedPlan, creditGeneratingExpenses = 0 
  } = values;

  const activeProLabores = proLaboreOverride ?? proLabores;
  const totalProLaboreBruto = activeProLabores.reduce((s, p) => s + (p?.value || 0), 0);
  
  const domesticRev = domesticActivities.reduce((s, a) => s + (a?.revenue || 0), 0);
  const exportRev = exportActivities.reduce((s, a) => s + ((a?.revenue || 0) * (values.exchangeRate || 1)), 0);
  const totalRev = domesticRev + exportRev;

  if (totalRev === 0 && totalProLaboreBruto === 0) return null;

  // 1. Partner Taxes
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = calculatePartnerTaxes(activeProLabores, fiscalConfig);
  const totalPayroll = totalSalaryExpense + totalProLaboreBruto;

  // 2. DAS Calculation Variables
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRev * 12;
  let totalDas = 0;
  let cppAnnexIV = 0;
  let finalAnnex: Annex = "I"; // Default, will be overwritten
  
  // Combine activities for processing
  const processableActivities = [
    ...domesticActivities.map(a => ({ ...a, isExport: false, revenue: a.revenue || 0 })),
    ...exportActivities.map(a => ({ ...a, isExport: true, revenue: (a.revenue || 0) * (values.exchangeRate || 1)}))
  ];

  // 3. Process Activities for DAS
  processableActivities.forEach(activity => {
    if (activity.revenue <= 0) return;

    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return;

    // Determine Annex
    let currentAnnex: Annex = normalizeAnnex(cnaeInfo.annex);
    if (cnaeInfo.requiresFatorR) {
      const threshold = fiscalConfig.simples_nacional?.limite_fator_r ?? 0.28;
      currentAnnex = fatorREffective >= threshold ? "III" : "V";
    }
    finalAnnex = currentAnnex;

    const annexTable = fiscalConfig.simples_nacional?.[currentAnnex];
    const bracket = safeFindBracket(effectiveRbt12, annexTable, { who: 'SimplesCalc', year: values.year });

    if (bracket) {
      const nominalRate = bracket.rate;
      const deduction = bracket.deduction;
      
      let effectiveDasRate = effectiveRbt12 > 0 
        ? ((effectiveRbt12 * nominalRate) - deduction) / effectiveRbt12 
        : nominalRate;

      // START OF FIX 1: Correct DAS Reduction
      const dist = bracket.distribution || {};
      const newIvaShare = (dist.CBS || 0) + (dist.IBS || 0);
      const allConsumptionShare = (dist.PIS || 0) + (dist.COFINS || 0) + (dist.ISS || 0) + (dist.ICMS || 0) + (dist.IPI || 0) + newIvaShare;

      if (activity.isExport) {
        // Export is immune to ALL consumption taxes inside DAS
        effectiveDasRate *= (1 - allConsumptionShare);
      } else if (isHybrid && values.year >= 2027) {
        // Hybrid Regime (2027+):
        // We REMOVE the new IVA (CBS/IBS) from the DAS because it is paid outside.
        // We KEEP the legacy taxes (ISS/ICMS) inside the DAS (they fade out via the table distribution, not here).
        effectiveDasRate *= (1 - newIvaShare);
      }
      // END OF FIX 1

      totalDas += activity.revenue * effectiveDasRate;
    }

    if (currentAnnex === "IV") {
      cppAnnexIV = calculateCpp(totalPayroll, fiscalConfig);
    }
  });

  // 4. Hybrid IVA Calculation (Paying IBS/CBS outside DAS)
  let ivaTaxes = 0;
  if (isHybrid && values.year >= 2027) {
    const reformParams = fiscalConfig.reforma_tributaria;
    
    // AUDITORIA DE CÓDIGO: Lógica Simplificada
    // Removemos os 'ifs' manuais de ano. Agora usamos as taxas que já vêm 
    // calculadas corretamente do 'fiscalConfig' (baseado na TRANSITION_TABLE).
    
    // CBS (Federal)
    // Em 2027/28 virá 8.4%. De 2029 em diante virá 8.5%.
    const cbsCalc = calculateIvaLiability(
        domesticActivities, 
        creditGeneratingExpenses, 
        reformParams.cbs_aliquota_padrao, 
        'CBS'
    );
    
    // IBS (Subnacional)
    // Em 2027/28 virá 0.1%. Em 2029 virá 1.85%. Em 2033 virá 18.5%.
    const ibsCalc = calculateIvaLiability(
        domesticActivities, 
        creditGeneratingExpenses, 
        reformParams.ibs_aliquota_padrao, 
        'IBS'
    );
    
    ivaTaxes = cbsCalc.payable + ibsCalc.payable;
  }

  // 5. Costs & Fees
  const totalTax = totalDas + ivaTaxes + cppAnnexIV + totalINSSRetido + totalIRRFRetido;
  const { fee: contabilizeiFee, planName, isDefault } = resolveContabilizeiFee(totalRev, selectedPlan, CONTABILIZEI_FEES_SIMPLES_NACIONAL);
  const totalMonthlyCost = totalTax + Number(contabilizeiFee ?? 0);

  // 6. Labeling
  const baseLabel = proLaboreOverride ? 'Otimizado' : (isHybrid ? 'Híbrido' : 'Tradicional');
  let regimeName = '';
  if (baseLabel === 'Otimizado') {
    regimeName = isHybrid 
      ? 'Simples Nacional (Fator R Otimizado) Híbrido' 
      : 'Simples Nacional (Fator R Otimizado)';
  } else {
    regimeName = `Simples Nacional ${baseLabel} (Anexo ${finalAnnex})`;
  }

  const effectiveDasRateTotal = totalRev > 0 ? totalDas / totalRev : 0;

  return {
    regime: regimeName as any,
    annex: finalAnnex,
    totalTax,
    totalMonthlyCost,
    totalRevenue: totalRev,
    domesticRevenue: domesticRev,
    exportRevenue: exportRev,
    proLabore: totalProLaboreBruto,
    fatorR: fatorREffective,
    effectiveRate: totalRev > 0 ? totalMonthlyCost / totalRev : 0,
    effectiveDasRate: effectiveDasRateTotal,
    contabilizeiFee,
    breakdown: [
      { name: formatTaxLabel("DAS (Simples Nacional)", totalDas, totalRev, effectiveDasRateTotal), value: totalDas },
      { name: formatTaxLabel("IVA Externo (IBS/CBS)", ivaTaxes, totalRev), value: ivaTaxes },
      { name: formatTaxLabel("CPP (Anexo IV)", cppAnnexIV, totalPayroll), value: cppAnnexIV },
      { name: formatTaxLabel("INSS Pró-labore", totalINSSRetido, totalProLaboreBruto), value: totalINSSRetido },
      { name: "IRRF Pró-labore", value: totalIRRFRetido },
    ].filter(x => x.value > 0.001),
    notes: isDefault ? [`Plano '${planName}' usado.`] : [],
    partnerTaxes,
    optimizationNote: proLaboreOverride 
      ? `Para garantir a tributação reduzida do Anexo III (Fator R), ajustamos estrategicamente seu Pró-labore para ${formatCurrencyBRL(totalProLaboreBruto)}. Isso gera economia no imposto total.` 
      : ""
  };
}

// ======================================================================================
// SECTION: ORCHESTRATOR
// ======================================================================================

function findOptimizedProLabore(
  values: TaxFormValues,
  currentFatorR: number,
  effectiveRbt12: number,
  effectiveFp12: number,
  fiscalConfig: any
): { proLabores: ProLaboreForm[]; factor: number } | null {
  const limiteFatorR = fiscalConfig.simples_nacional?.limite_fator_r ?? 0.28;
  
  if (currentFatorR >= limiteFatorR) return null; // Already optimized or not needed

  // Calculate deficit
  const targetAnnualPayroll = effectiveRbt12 * limiteFatorR;
  const missingAnnual = Math.max(0, targetAnnualPayroll - effectiveFp12);

  if (missingAnnual <= 0) return null;

  const missingMonthly = missingAnnual / 12;
  const newProLabores: ProLaboreForm[] = JSON.parse(JSON.stringify(values.proLabores || []));

  // NOVA LÓGICA: Distribuição Igualitária do Aumento
  if (newProLabores.length > 0) {
    const increasePerPartner = missingMonthly / newProLabores.length;
    
    newProLabores.forEach(partner => {
        partner.value += increasePerPartner;
    });
  } else {
    newProLabores.push({
      value: missingMonthly,
      hasOtherInssContribution: false,
      otherContributionSalary: 0
    });
  }

  const newFactor = (effectiveFp12 + missingAnnual) / effectiveRbt12;
  return { proLabores: newProLabores, factor: newFactor };
}

export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const { year, rbt12 = 0, fp12 = 0, selectedCnaes = [], proLabores = [], totalSalaryExpense = 0 } = values;

  if (!year || year < 2026) throw new Error("Ano inválido para engine 2026.");

  // 1. Preliminaries
  const config = getFiscalParametersPostReform(year);
  const domesticRev = values.domesticActivities?.reduce((s, a) => s + (a?.revenue || 0), 0) ?? 0;
  const exportRev = values.exportActivities?.reduce((s, a) => s + ((a?.revenue || 0) * (values.exchangeRate || 1)), 0) ?? 0;
  const totalRev = domesticRev + exportRev;
  
  const totalPL = proLabores.reduce((s, p) => s + (p?.value || 0), 0);
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRev * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : (totalSalaryExpense + totalPL) * 12;
  const currentFatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;

  // 2. Standard Calculations
  const lpFuture = calculateLucroPresumido2026(values, false);
  
  let simplesTrad: TaxDetails2026 | null = null;
  let simplesHyb: TaxDetails2026 | null = null;
  let simplesOpt: TaxDetails2026 | null = null;
  let simplesOptHyb: TaxDetails2026 | null = null;

  const hasFatorRActivity = selectedCnaes.some(c => getCnaeData(c.code)?.requiresFatorR);

  if (selectedCnaes.length > 0) {
    // A. Traditional Simples (Base Calculation)
    simplesTrad = _calculateSimples2026(values, false, currentFatorR);

    // B. Hybrid Simples (Only for 2027 and beyond)
    if (year >= 2027) {
      simplesHyb = _calculateSimples2026(values, true, currentFatorR);
    }
    
    // C. Optimized Scenarios (Only if a Fator R activity is present and optimization is possible)
    if (hasFatorRActivity) {
      const optimization = findOptimizedProLabore(values, currentFatorR, effectiveRbt12, effectiveFp12, config);
      
      if (optimization) {
        const valuesOpt = { ...values, proLabores: optimization.proLabores };
        // Optimized Traditional
        simplesOpt = _calculateSimples2026(valuesOpt, false, optimization.factor, optimization.proLabores);
        // Optimized Hybrid (2027+)
        if (year >= 2027) {
          simplesOptHyb = _calculateSimples2026(valuesOpt, true, optimization.factor, optimization.proLabores);
        }
      }
    }
  }


  // 3. Normalization & Ordering
  const normalize = (res: TaxDetails2026 | null, order: number) => {
    if (!res) return null;
    return {
      ...res,
      order,
      fatorR: res.fatorR ?? 0,
      effectiveDasRate: res.effectiveDasRate ?? 0,
      annex: res.annex ?? "N/A",
      optimizationNote: res.optimizationNote ?? "",
      notes: res.notes ?? [],
      breakdown: res.breakdown ?? [],
      partnerTaxes: res.partnerTaxes ?? [],
    };
  };

  return {
    lucroPresumido: normalize(lpFuture, 4),
    simplesNacionalTradicional: normalize(simplesTrad, 2),
    simplesNacionalHibrido: normalize(simplesHyb, 3),
    simplesNacionalOtimizado: normalize(simplesOpt, 1),
    simplesNacionalOtimizadoHibrido: normalize(simplesOptHyb, 1.5),
  };
}
