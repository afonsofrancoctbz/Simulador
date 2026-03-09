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

function formatTaxLabel(name: string, value: number, base: number, manualRate?: number): string {
    if (value <= 0 || base <= 0) return name;
    const rate = manualRate !== undefined ? manualRate : (value / base);
    return `${name} - ${formatPercent(rate)}`;
}

function resolveContabilizeiFee(
  totalRevenue: number,
  selectedPlan: string | undefined,
  feeTable: any[]
) {
  const safeRevenue = Math.max(0, totalRevenue);
  const feeBracket = findFeeBracket(feeTable, safeRevenue);
  return resolveSelectedPlan(feeBracket?.plans, selectedPlan);
}

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
  
  const SIMPLIFIED_DISCOUNT_VALUE = 607.20;
  const REDUCTION_LIMIT_LOW = 5000.00;
  const REDUCTION_LIMIT_HIGH = 7350.00;
  const REDUCTION_BASE = 978.62;
  const REDUCTION_FACTOR = 0.133145;

  for (const proLabore of proLabores) {
    const grossIncome = proLabore.value || 0;
    if (grossIncome <= 0) continue;

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

    const effectiveDeduction = Math.max(inssValue, SIMPLIFIED_DISCOUNT_VALUE);
    const irrfBase = grossIncome - effectiveDeduction;
    
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

    let reductionValue = 0;
    if (grossIncome <= REDUCTION_LIMIT_LOW) {
      reductionValue = standardTax;
    } else if (grossIncome > REDUCTION_LIMIT_LOW && grossIncome <= REDUCTION_LIMIT_HIGH) {
      const calculatedReduction = REDUCTION_BASE - (REDUCTION_FACTOR * grossIncome);
      reductionValue = Math.max(0, calculatedReduction);
    } else {
      reductionValue = 0;
    }

    let finalIrrfValue = Math.max(0, standardTax - reductionValue);
    if (finalIrrfValue < 10) finalIrrfValue = 0;

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

function calculateIvaLiability(
  activities: any[],
  creditExpenses: number,
  stdRate: number,
  taxType: 'IBS' | 'CBS'
): IvaCalculationResult {
  let debit = 0;
  activities.forEach((act) => {
    const reductionData = getIvaReductionByCnae(act.code, act.nbsCode);
    const reductionPercent = taxType === 'CBS' 
      ? (reductionData?.reducaoCBS ?? 0) 
      : (reductionData?.reducaoIBS ?? 0);
    const effectiveRate = stdRate * (1 - (reductionPercent / 100));
    debit += (act.revenue || 0) * effectiveRate;
  });

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

  return { debit, credit, payable: Math.max(0, debit - credit) };
}

function calculateLucroPresumido2026(values: TaxFormValues, isCurrentRules: boolean): TaxDetails2026 | null {
  const { 
    year = 2026, domesticActivities = [], exportActivities = [], 
    exchangeRate = 1, totalSalaryExpense = 0, proLabores = [], 
    selectedPlan, creditGeneratingExpenses = 0, issRate = 5 
  } = values;

  const fiscalConfig = getFiscalParametersPostReform(year);
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + (act?.revenue || 0), 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act?.revenue || 0) * exchangeRate, 0);
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + (p?.value || 0), 0);

  if (totalRevenue === 0 && totalProLaboreBruto === 0) return null;

  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = calculatePartnerTaxes(proLabores, fiscalConfig);
  const inssPatronal = calculateCpp(monthlyPayroll, fiscalConfig);

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

  const LIMIT_MAJORATION_MENSAL = 1250000 / 3; 
  const validationNotes: string[] = [];

  if (totalRevenue > LIMIT_MAJORATION_MENSAL) {
    const excessRevenue = totalRevenue - LIMIT_MAJORATION_MENSAL;
    const avgPresumptionIRPJ = totalRevenue > 0 ? baseIRPJ / totalRevenue : 0;
    const avgPresumptionCSLL = totalRevenue > 0 ? baseCSLL / totalRevenue : 0;
    baseIRPJ += excessRevenue * avgPresumptionIRPJ * 0.10;
    baseCSLL += excessRevenue * avgPresumptionCSLL * 0.10;
    validationNotes.push("Faturamento superior a R$ 416.666,66/mês. Tributação calculada com adequações da LC 224/2025.");
  }

  const rates = fiscalConfig.lucro_presumido_rates;
  const irpjNormal = baseIRPJ * (rates.IRPJ_BASE ?? 0.15);
  const irpjAdicional = Math.max(0, baseIRPJ - (rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL || 20000)) * (rates.IRPJ_ADICIONAL_BASE ?? 0.10);
  const irpjTotal = irpjNormal + irpjAdicional;
  const csllTotal = baseCSLL * (rates.CSLL ?? 0.09);

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
    const trans = fiscalConfig.reforma_tributaria;
    const pisTrans = domesticRevenue * (rates.PIS ?? 0) * (trans?.pis_cofins_multiplier ?? 1);
    const cofinsTrans = domesticRevenue * (rates.COFINS ?? 0) * (trans?.pis_cofins_multiplier ?? 1);
    const issTrans = domesticRevenue * ((issRate ?? 5) / 100) * (trans?.iss_icms_multiplier ?? 1);
    const legacyTotal = pisTrans + cofinsTrans + issTrans;

    breakdown.push(
      { name: formatTaxLabel("PIS (Transição)", pisTrans, domesticRevenue), value: pisTrans },
      { name: formatTaxLabel("COFINS (Transição)", cofinsTrans, domesticRevenue), value: cofinsTrans },
      { name: formatTaxLabel("ISS (Transição)", issTrans, domesticRevenue), value: issTrans }
    );

    const cbsCalc = calculateIvaLiability(domesticActivities, creditGeneratingExpenses, trans?.cbs_aliquota_padrao ?? 0, 'CBS');
    const ibsCalc = calculateIvaLiability(domesticActivities, creditGeneratingExpenses, trans?.ibs_aliquota_padrao ?? 0, 'IBS');

    if (year === 2026) {
      breakdown.push(
        { name: formatTaxLabel("CBS (Teste)", cbsCalc.payable, domesticRevenue), value: cbsCalc.payable },
        { name: formatTaxLabel("IBS (Teste)", ibsCalc.payable, domesticRevenue), value: ibsCalc.payable }
      );
      consumptionTaxes = legacyTotal;
    } else {
      breakdown.push(
        { name: formatTaxLabel("CBS (Líquida)", cbsCalc.payable, domesticRevenue), value: cbsCalc.payable },
        { name: formatTaxLabel("IBS (Líquido)", ibsCalc.payable, domesticRevenue), value: ibsCalc.payable }
      );
      consumptionTaxes = legacyTotal + cbsCalc.payable + ibsCalc.payable;
    }
  }

  const totalTax = irpjTotal + csllTotal + consumptionTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
  const { fee: contabilizeiFee, planName, isDefault } = resolveContabilizeiFee(totalRevenue, selectedPlan, CONTABILIZEI_FEES_LUCRO_PRESUMIDO);
  const totalMonthlyCost = totalTax + Number(contabilizeiFee ?? 0);

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
      { name: formatTaxLabel("IRPJ", irpjTotal, totalRevenue), value: irpjTotal },
      { name: formatTaxLabel("CSLL", csllTotal, totalRevenue), value: csllTotal },
      { name: "CPP (INSS Patronal)", value: inssPatronal },
      { name: "INSS s/ Pró-labore", value: totalINSSRetido },
      { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
      ...breakdown,
    ].filter(i => i.value > 0.001),
    notes: isDefault ? [`Plano '${planName}' usado.`, ...validationNotes] : validationNotes,
    partnerTaxes,
    fatorR: 0,
    effectiveDasRate: 0,
    annex: "N/A",
    optimizationNote: "",
    order: isCurrentRules ? 5 : 4,
  };
}

function _calculateSimples2026(
  values: TaxFormValues,
  isHybrid: boolean,
  fatorREffective: number,
  proLaboreOverride?: ProLaboreForm[]
): TaxDetails2026 | null {
  const fiscalConfig = getFiscalParametersPostReform(values.year!);
  const { 
    domesticActivities = [], exportActivities = [], 
    totalSalaryExpense = 0, proLabores = [], 
    rbt12, selectedPlan, creditGeneratingExpenses = 0 
  } = values;

  const activeProLabores = proLaboreOverride ?? proLabores;
  const totalProLaboreBruto = activeProLabores.reduce((s, p) => s + (p?.value || 0), 0);
  const domesticRev = domesticActivities.reduce((s, a) => s + (a?.revenue || 0), 0);
  const exportRev = exportActivities.reduce((s, a) => s + ((a?.revenue || 0) * (values.exchangeRate || 1)), 0);
  const totalRev = domesticRev + exportRev;

  if (totalRev === 0 && totalProLaboreBruto === 0) return null;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = calculatePartnerTaxes(activeProLabores, fiscalConfig);
  const totalPayroll = totalSalaryExpense + totalProLaboreBruto;
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRev * 12;
  
  let totalDas = 0;
  let cppAnnexIV = 0;
  let finalAnnex: Annex = "I";
  
  const processableActivities = [
    ...domesticActivities.map(a => ({ ...a, isExport: false, revenue: a.revenue || 0 })),
    ...exportActivities.map(a => ({ ...a, isExport: true, revenue: (a.revenue || 0) * (values.exchangeRate || 1)}))
  ];

  processableActivities.forEach(activity => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return;

    let currentAnnex: Annex = normalizeAnnex(cnaeInfo.annex);
    if (cnaeInfo.requiresFatorR) {
      currentAnnex = fatorREffective >= 0.28 ? "III" : "V";
    }
    finalAnnex = currentAnnex;

    const annexTable = fiscalConfig.simples_nacional[currentAnnex];
    const bracket = safeFindBracket(effectiveRbt12, annexTable, { who: 'SimplesCalc', year: values.year });

    if (bracket) {
      let effectiveDasRate = effectiveRbt12 > 0 
        ? ((effectiveRbt12 * bracket.rate) - bracket.deduction) / effectiveRbt12 
        : bracket.rate;

      const dist = bracket.distribution || {};
      const newIvaShare = (dist.CBS || 0) + (dist.IBS || 0);
      const allConsumptionShare = (dist.PIS || 0) + (dist.COFINS || 0) + (dist.ISS || 0) + (dist.ICMS || 0) + (dist.IPI || 0) + newIvaShare;

      if (activity.isExport) {
        effectiveDasRate *= (1 - allConsumptionShare);
      } else if (isHybrid && values.year! >= 2027) {
        effectiveDasRate *= (1 - newIvaShare);
      }
      totalDas += activity.revenue * effectiveDasRate;
    }
    if (currentAnnex === "IV") cppAnnexIV = calculateCpp(totalPayroll, fiscalConfig);
  });

  let ivaTaxes = 0;
  if (isHybrid && values.year! >= 2027) {
    const trans = fiscalConfig.reforma_tributaria;
    const cbsCalc = calculateIvaLiability(domesticActivities, creditGeneratingExpenses, trans.cbs_aliquota_padrao, 'CBS');
    const ibsCalc = calculateIvaLiability(domesticActivities, creditGeneratingExpenses, trans.ibs_aliquota_padrao, 'IBS');
    ivaTaxes = cbsCalc.payable + ibsCalc.payable;
  }

  const totalTax = totalDas + ivaTaxes + cppAnnexIV + totalINSSRetido + totalIRRFRetido;
  const { fee: contabilizeiFee, planName, isDefault } = resolveContabilizeiFee(totalRev, selectedPlan, CONTABILIZEI_FEES_SIMPLES_NACIONAL);
  const totalMonthlyCost = totalTax + Number(contabilizeiFee ?? 0);

  const baseLabel = proLaboreOverride ? 'Otimizado' : (isHybrid ? 'Híbrido' : 'Tradicional');
  const regimeName = proLaboreOverride 
    ? (isHybrid ? 'Simples Nacional (Fator R Otimizado) Híbrido' : 'Simples Nacional (Fator R Otimizado)')
    : `Simples Nacional ${baseLabel} (Anexo ${finalAnnex})`;

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
    effectiveDasRate: totalRev > 0 ? totalDas / totalRev : 0,
    contabilizeiFee,
    breakdown: [
      { name: formatTaxLabel("DAS", totalDas, totalRev), value: totalDas },
      { name: formatTaxLabel("IVA Externo", ivaTaxes, totalRev), value: ivaTaxes },
      { name: "CPP (Anexo IV)", value: cppAnnexIV },
      { name: "INSS s/ Pró-labore", value: totalINSSRetido },
      { name: "IRRF Pró-labore", value: totalIRRFRetido },
    ].filter(x => x.value > 0.001),
    notes: isDefault ? [`Plano '${planName}' usado.`] : [],
    partnerTaxes,
    optimizationNote: proLaboreOverride ? `Pró-labore ajustado para ${formatCurrencyBRL(totalProLaboreBruto)} para atingir o Fator R.` : ""
  };
}

function findOptimizedProLabore(
  values: TaxFormValues,
  currentFatorR: number,
  effectiveRbt12: number,
  effectiveFp12: number,
  fiscalConfig: any
): { proLabores: ProLaboreForm[]; factor: number } | null {
  if (currentFatorR >= 0.28) return null;
  const missingAnnual = Math.max(0, (effectiveRbt12 * 0.28) - effectiveFp12);
  if (missingAnnual <= 0) return null;

  const missingMonthly = missingAnnual / 12;
  const newProLabores: ProLaboreForm[] = JSON.parse(JSON.stringify(values.proLabores || []));

  if (newProLabores.length > 0) {
    const increasePerPartner = missingMonthly / newProLabores.length;
    newProLabores.forEach(partner => {
        partner.value = Number((partner.value + increasePerPartner).toFixed(2));
    });
  } else {
    newProLabores.push({ value: Number(missingMonthly.toFixed(2)), hasOtherInssContribution: false });
  }

  return { proLabores: newProLabores, factor: 0.28 };
}

export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const { year, rbt12 = 0, fp12 = 0, proLabores = [], totalSalaryExpense = 0 } = values;
  const config = getFiscalParametersPostReform(year!);
  
  const domesticRev = values.domesticActivities?.reduce((s, a) => s + (a?.revenue || 0), 0) ?? 0;
  const exportRev = values.exportActivities?.reduce((s, a) => s + ((a?.revenue || 0) * (values.exchangeRate || 1)), 0) ?? 0;
  const totalRev = domesticRev + exportRev;
  
  const totalPL = proLabores.reduce((s, p) => s + (p?.value || 0), 0);
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRev * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : (totalSalaryExpense + totalPL) * 12;
  const currentFatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;

  const lpFuture = calculateLucroPresumido2026(values, false);
  const hasFatorRActivity = values.selectedCnaes.some(c => getCnaeData(c.code)?.requiresFatorR);

  let simplesTrad = _calculateSimples2026(values, false, currentFatorR);
  let simplesHyb = year! >= 2027 ? _calculateSimples2026(values, true, currentFatorR) : null;
  
  let simplesOpt = null;
  let simplesOptHyb = null;

  if (hasFatorRActivity) {
    const opt = findOptimizedProLabore(values, currentFatorR, effectiveRbt12, effectiveFp12, config);
    if (opt) {
      const valuesOpt = { ...values, proLabores: opt.proLabores };
      simplesOpt = _calculateSimples2026(valuesOpt, false, opt.factor, opt.proLabores);
      if (year! >= 2027) simplesOptHyb = _calculateSimples2026(valuesOpt, true, opt.factor, opt.proLabores);
    }
  }

  const normalize = (res: any, order: number) => res ? { ...res, order } : null;

  return {
    lucroPresumido: normalize(lpFuture, 4),
    simplesNacionalTradicional: normalize(simplesTrad, 2),
    simplesNacionalHibrido: normalize(simplesHyb, 3),
    simplesNacionalOtimizado: normalize(simplesOpt, 1),
    simplesNacionalOtimizadoHibrido: normalize(simplesOptHyb, 1.5),
  };
}
