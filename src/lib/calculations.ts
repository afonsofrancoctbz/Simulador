
import type { FiscalConfig } from "@/config/fiscal";
import { getFiscalParameters } from "@/config/fiscal";
import {
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
  getCnaeData,
} from "./cnae-helpers";
import type {
  CalculationResults,
  TaxDetails,
  Annex,
  ProLaboreForm,
  PartnerTaxDetails,
  TaxFormValues,
  Plan,
  FeeBracket,
} from "./types";
import {
  findFeeBracket,
  formatCurrencyBRL,
  formatPercent,
  safeFindBracket,
} from "./utils";

const DEFAULT_SIMULATION_PLAN: Plan = "expertsEssencial";

interface ResolvedFee {
  fee: number;
  planName: Plan;
  isDefault: boolean;
}

export function resolveSelectedPlan(
  plans: Record<string, number> | undefined,
  selectedPlan: Plan | undefined | null
): ResolvedFee {
  if (!plans || typeof plans !== 'object' || Object.keys(plans).length === 0) {
    console.warn("[AUDIT] Fee resolution failed: Invalid or empty fee bracket provided. Using fallback.", { plans, selectedPlan });
    return { fee: 0, planName: 'expertsEssencial', isDefault: true };
  }

  let planToUse: Plan = DEFAULT_SIMULATION_PLAN;
  let isDefault = true;

  if (selectedPlan && plans[selectedPlan] !== undefined) {
    planToUse = selectedPlan;
    isDefault = false;
  } else if (plans[DEFAULT_SIMULATION_PLAN] !== undefined) {
    planToUse = DEFAULT_SIMULATION_PLAN;
  } else {
    const firstAvailablePlan = Object.keys(plans)[0] as Plan | undefined;
    if (firstAvailablePlan) {
      planToUse = firstAvailablePlan;
    } else {
      console.warn(`[FeeResolver] Critical: Could not resolve any fee, defaulting to 0.`, { selectedPlan, plans });
      return { fee: 0, planName: DEFAULT_SIMULATION_PLAN, isDefault: true };
    }
  }

  const fee = plans[planToUse];

  if (fee === undefined) {
    console.warn(`[FeeResolver] Logic error: plan '${planToUse}' selected but fee is undefined. Falling back to 0.`, { selectedPlan, plans });
    return { fee: 0, planName: planToUse, isDefault: true };
  }

  return { fee, planName: planToUse, isDefault };
}


function _calculateCpp(monthlyPayroll: number, config: FiscalConfig): number {
  const cppRate = config.aliquotas_cpp_patronal?.base ?? 0;
  if (cppRate === 0) {
    console.warn("[WARN] CPP Rate is 0. CPP calculation will be skipped.");
  }
  return monthlyPayroll * cppRate;
}

function _calculatePartnerTaxes(
  proLabores: ProLaboreForm[],
  config: FiscalConfig
): {
  partnerTaxes: PartnerTaxDetails[];
  totalINSSRetido: number;
  totalIRRFRetido: number;
} {
  const partnerTaxes: PartnerTaxDetails[] = [];
  let totalINSSRetido = 0;
  let totalIRRFRetido = 0;

  const inssTable = config?.tabela_inss_clt_progressiva;
  const irrfTable = config?.reforma_tributaria?.tabela_irrf?.length
    ? config.reforma_tributaria.tabela_irrf
    : config?.tabela_irrf;

  if (!Array.isArray(inssTable) || inssTable.length === 0) {
    throw new Error('Tabela de INSS inválida ou ausente no FiscalConfig — impossível calcular pró-labore.');
  }
  if (!Array.isArray(irrfTable) || irrfTable.length === 0) {
    throw new Error('Tabela de IRRF inválida ou ausente no FiscalConfig — impossível calcular pró-labore.');
  }

  for (const proLabore of proLabores) {
    const value = proLabore.value || 0;
    if (value <= 0) continue;

    let inssValue = 0;
    if (proLabore.hasOtherInssContribution) {
        const otherContribution = proLabore.otherContributionSalary || 0;
        const remainingForTeto = Math.max(0, config.teto_inss - otherContribution);
        const inssBase = Math.min(value, remainingForTeto);
        if (inssBase > 0) {
            inssValue = inssBase * config.aliquota_inss_prolabore;
        }
    } else {
        const inssBase = Math.min(value, config.teto_inss);
        inssValue = inssBase * config.aliquota_inss_prolabore;
    }
    
    inssValue = Math.min(inssValue, config.teto_inss * config.aliquota_inss_prolabore);

    const irrfBase = value - inssValue - (config.deducao_simplificada_irrf ?? 0);
    let irrfValue = 0;

    const irrfBracket = safeFindBracket(irrfBase, irrfTable, { who: '_calculatePartnerTaxes.IRRF', year: config.ano_vigencia });
    if (irrfBracket && irrfBracket.rate > 0) {
      irrfValue = irrfBase * irrfBracket.rate - irrfBracket.deduction;
    }


    const netValue = value - inssValue - irrfValue;
    totalINSSRetido += inssValue;
    totalIRRFRetido += irrfValue;

    partnerTaxes.push({
      proLaboreBruto: value,
      inss: inssValue,
      irrf: irrfValue,
      proLaboreLiquido: netValue,
    });
  }

  return { partnerTaxes, totalINSSRetido, totalIRRFRetido };
}

export function calculateSimplesNacional(
  values: TaxFormValues,
  config: FiscalConfig,
  fatorR: number,
  targetAnnex: Annex | null,
  optimizationNote?: string
): TaxDetails {
  const {
    selectedCnaes = [],
    rbt12 = 0,
    totalSalaryExpense = 0,
    proLabores = [],
  } = values;

  const totalProLaboreValue = proLabores.reduce((s, p) => s + (p.value || 0), 0);
  const monthlyPayroll = totalSalaryExpense + totalProLaboreValue;

  const domesticRevenue =
    values.domesticActivities?.reduce((s, a) => s + (a.revenue || 0), 0) ?? 0;
  const exportRevenue =
    values.exportActivities?.reduce((s, a) => s + (a.revenue || 0), 0) ?? 0;
  const totalRevenue = domesticRevenue + exportRevenue;
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } =
    _calculatePartnerTaxes(proLabores, config);

  let totalDas = 0;
  const dasBreakdown: { name: string; value: number }[] = [];
  let cppFromAnnexIV = 0;
  let hasAnnexIVActivity = false;
  let finalAnnex: Annex = "I"; // Default, will be overwritten

  const allActivities = [
    ...(values.domesticActivities?.map(a => ({ ...a, isExport: false })) ?? []),
    ...(values.exportActivities?.map(a => ({ ...a, isExport: true })) ?? []),
  ];

  if (allActivities.length === 0 && totalProLaboreValue === 0) {
     throw new Error("Cannot calculate Simples Nacional without activities or pro-labore.");
  }
  
  allActivities.forEach(activity => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) throw new Error(`CNAE data not found for ${activity.code}`);

    let effectiveAnnex: Annex;
    if (targetAnnex) {
      effectiveAnnex = targetAnnex;
    } else if (cnaeInfo.requiresFatorR) {
      effectiveAnnex =
        fatorR >= (config.simples_nacional.limite_fator_r ?? 0.28)
          ? "III"
          : "V";
    } else {
      effectiveAnnex = cnaeInfo.annex as Annex;
    }
    finalAnnex = effectiveAnnex; // Store the last calculated annex

    if (effectiveAnnex === "IV") hasAnnexIVActivity = true;

    const annexTable = config.simples_nacional[effectiveAnnex];
    const bracket = safeFindBracket(effectiveRbt12, annexTable, {
      who: 'calculateSimplesNacional',
      year: 2025,
      annex: effectiveAnnex,
    });
    if (!bracket) throw new Error(`Simples Nacional bracket not found for RBT12 ${effectiveRbt12} in Anexo ${effectiveAnnex}`);
    
    const { rate, deduction, distribution } = bracket;
    const effectiveRate =
      effectiveRbt12 > 0
        ? (effectiveRbt12 * rate - deduction) / effectiveRbt12
        : rate;

    let dasForActivity = (activity.revenue || 0) * effectiveRate;

    if (activity.isExport && distribution) {
      const exportExemptionRate =
        (distribution.PIS ?? 0) +
        (distribution.COFINS ?? 0) +
        (distribution.IPI ?? 0) +
        (distribution.ICMS ?? 0) +
        (distribution.ISS ?? 0);
      dasForActivity -= dasForActivity * exportExemptionRate;
    }

    totalDas += dasForActivity;
  });

  if (hasAnnexIVActivity) {
    cppFromAnnexIV = _calculateCpp(monthlyPayroll, config);
  }

  const totalTax = totalDas + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
  
  const safeTotalRevenue =
    Number.isFinite(totalRevenue) && totalRevenue >= 0 ? totalRevenue : 0;
  
  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, safeTotalRevenue);
  
  const {
    fee: contabilizeiFee,
    planName,
    isDefault,
  } = resolveSelectedPlan(feeBracket?.plans, values.selectedPlan);

  const totalMonthlyCost = totalTax + Number(contabilizeiFee || 0);

  const regimeName = optimizationNote
    ? "Simples Nacional (Otimizado)"
    : "Simples Nacional";

  const notes = [];
  if (isDefault) {
    notes.push(
      `Para consistência da simulação, a mensalidade foi calculada com base no plano padrão '${planName}'.`
    );
  }
  if (optimizationNote) {
    notes.push(optimizationNote);
  }

  return {
    regime: regimeName,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: totalProLaboreValue,
    fatorR,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    effectiveDasRate: totalRevenue > 0 ? totalDas / totalRevenue : 0,
    contabilizeiFee,
    breakdown: [
      { name: "DAS", value: totalDas },
      { name: "INSS Retido (Pró-labore)", value: totalINSSRetido },
      { name: "IRRF Retido (Pró-labore)", value: totalIRRFRetido },
      ...(cppFromAnnexIV > 0
        ? [{ name: "CPP (Anexo IV)", value: cppFromAnnexIV }]
        : []),
    ].filter(i => (i?.value ?? 0) > 0.001),
    notes,
    annex: finalAnnex,
    partnerTaxes,
    optimizationNote: optimizationNote || null,
  };
}

export function calculateLucroPresumido(
  values: TaxFormValues,
  config: FiscalConfig
): TaxDetails {
  const {
    totalSalaryExpense = 0,
    proLabores = [],
    issRate = 5,
  } = values;

  const totalProLaboreValue = proLabores.reduce((s, p) => s + (p.value || 0), 0);
  const monthlyPayroll = totalSalaryExpense + totalProLaboreValue;

  const domesticRevenue =
    values.domesticActivities?.reduce((s, a) => s + (a.revenue || 0), 0) ?? 0;
  const exportRevenue =
    values.exportActivities?.reduce((s, a) => s + (a.revenue || 0), 0) ?? 0;
  const totalRevenue = domesticRevenue + exportRevenue;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } =
    _calculatePartnerTaxes(proLabores, config);
  const inssPatronal = _calculateCpp(monthlyPayroll, config);

  let presumedProfitBaseIRPJ = 0;
  let presumedProfitBaseCSLL = 0;

  values.domesticActivities?.forEach(activity => {
      const cnaeInfo = getCnaeData(activity.code);
      if (!cnaeInfo) throw new Error(`CNAE data not found for ${activity.code}`);
      
      const revenue = activity.revenue || 0;
      presumedProfitBaseIRPJ += revenue * (cnaeInfo.presumedProfitRateIRPJ ?? 0.32);
      presumedProfitBaseCSLL += revenue * (cnaeInfo.presumedProfitRateCSLL ?? 0.32);
  });
  
  const irpjRate = config.lucro_presumido_rates.IRPJ_BASE;
  const irpjAdicionalRate = config.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
  const irpjIsencaoLimite = config.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL;

  const irpjValue = presumedProfitBaseIRPJ * irpjRate;
  const irpjAdicional = Math.max(0, presumedProfitBaseIRPJ - irpjIsencaoLimite) * irpjAdicionalRate;
  
  const csllRate = config.lucro_presumido_rates.CSLL;
  const csllValue = presumedProfitBaseCSLL * csllRate;
  
  const pisRate = config.lucro_presumido_rates.PIS;
  const pisValue = domesticRevenue * pisRate;
  
  const cofinsRate = config.lucro_presumido_rates.COFINS;
  const cofinsValue = domesticRevenue * cofinsRate;
  
  const issValue = domesticRevenue * (issRate / 100);

  const totalTax =
    irpjValue +
    irpjAdicional +
    csllValue +
    pisValue +
    cofinsValue +
    issValue +
    inssPatronal +
    totalINSSRetido +
    totalIRRFRetido;
  
  const safeTotalRevenue =
    Number.isFinite(totalRevenue) && totalRevenue >= 0 ? totalRevenue : 0;
  
  const feeBracket = findFeeBracket(
    CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
    safeTotalRevenue
  );

  const {
    fee: contabilizeiFee,
    planName,
    isDefault,
  } = resolveSelectedPlan(feeBracket?.plans, values.selectedPlan);

  const totalMonthlyCost = totalTax + Number(contabilizeiFee || 0);
  
  const notes = [];
  if (isDefault) {
    notes.push(
      `Para consistência da simulação, a mensalidade foi calculada com base no plano padrão '${planName}'.`
    );
  }

  return {
    regime: "Lucro Presumido",
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: totalProLaboreValue,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    contabilizeiFee,
    breakdown: [
      { name: "PIS", value: pisValue },
      { name: "COFINS", value: cofinsValue },
      { name: "ISS", value: issValue },
      { name: "IRPJ", value: irpjValue + irpjAdicional },
      { name: "CSLL", value: csllValue },
      { name: "CPP (INSS Patronal)", value: inssPatronal },
      { name: "INSS Retido (Pró-labore)", value: totalINSSRetido },
      { name: "IRRF Retido (Pró-labore)", value: totalIRRFRetido },
    ].filter(i => (i?.value ?? 0) > 0.001),
    notes,
    partnerTaxes,
    fatorR: 0,
    effectiveDasRate: 0,
    annex: "N/A",
    optimizationNote: "",
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const config = getFiscalParameters(2025);

  const {
    rbt12 = 0,
    fp12 = 0,
    selectedCnaes = [],
    proLabores = [],
    totalSalaryExpense = 0,
  } = values;

  const domesticRevenue = values.domesticActivities?.reduce((s, a) => s + (a.revenue || 0), 0) ?? 0;
  const exportRevenue = values.exportActivities?.reduce((s, a) => s + (a.revenue || 0), 0) ?? 0;
  const totalRevenue = domesticRevenue + exportRevenue;

  const totalProLaboreValue = proLabores.reduce((s, p) => s + (p.value || 0), 0);
  const totalPayroll = totalSalaryExpense + totalProLaboreValue;

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : totalPayroll * 12;
  const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;

  const hasAnnexVActivity = selectedCnaes.some(
    c => getCnaeData(c.code)?.requiresFatorR
  );

  const simplesNacionalBase = calculateSimplesNacional(
    values,
    config,
    fatorR,
    null
  );
  const lucroPresumido = calculateLucroPresumido(values, config);

  let simplesNacionalOtimizado: TaxDetails | null = null;
  const limiteFatorR = config.simples_nacional?.limite_fator_r ?? 0.28;

  if (hasAnnexVActivity && fatorR < limiteFatorR && totalRevenue > 0) {
    const requiredAnnualPayroll = effectiveRbt12 * limiteFatorR;
    const additionalAnnualPayrollNeeded = Math.max(
      0,
      requiredAnnualPayroll - effectiveFp12
    );

    if (additionalAnnualPayrollNeeded > 0) {
      const proLaboresOtimizado: ProLaboreForm[] = JSON.parse(
        JSON.stringify(proLabores)
      );
      const additionalMonthlyProLabore = additionalAnnualPayrollNeeded / 12;

      if (proLaboresOtimizado.length > 0) {
        proLaboresOtimizado[0].value += additionalMonthlyProLabore;
      } else {
        proLaboresOtimizado.push({
          value: additionalMonthlyProLabore,
          hasOtherInssContribution: false,
          otherContributionSalary: 0,
        });
      }

      const valuesOtimizado = { ...values, proLabores: proLaboresOtimizado };
      const fatorROtimizado =
        (effectiveFp12 + additionalAnnualPayrollNeeded) / effectiveRbt12;
      const newTotalProLabore = proLaboresOtimizado.reduce((s,p) => s + p.value, 0);

      const note = `Pró-labore ajustado para ${formatCurrencyBRL(newTotalProLabore)} para atingir Fator R de ${formatPercent(fatorROtimizado)} e se enquadrar no Anexo III.`;
      
      simplesNacionalOtimizado = calculateSimplesNacional(
        valuesOtimizado,
        config,
        fatorROtimizado,
        "III",
        note
      );
    }
  }

  return {
    simplesNacionalOtimizado: simplesNacionalOtimizado,
    simplesNacionalBase: simplesNacionalBase,
    lucroPresumido: lucroPresumido,
  };
}
