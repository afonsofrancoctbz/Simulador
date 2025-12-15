
// src/lib/calculations-2026.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  type Annex,
  type TaxDetails,
  type ProLaboreForm,
  type PartnerTaxDetails,
  Plan,
} from "./types";
import {
  formatPercent,
  findFeeBracket,
  safeFindBracket,
  formatCurrencyBRL,
} from "./utils";
import { getIvaReductionByCnae } from "./cnae-reductions-2026";
import { CNAE_LC116_RELATIONSHIP } from "./cnae-data-2026";
import { resolveSelectedPlan } from "./calculations";

export {}; // Garante que o arquivo é um módulo

// ======================================================================================
// SECTION: UTILITY & HELPER FUNCTIONS (SELF-CONTAINED)
// ======================================================================================

const VALID_ANNEXES: Annex[] = ["I", "II", "III", "IV", "V"];
const isValidAnnex = (a: unknown): a is Annex => typeof a === "string" && VALID_ANNEXES.includes(a as Annex);
const normalizeAnnex = (annex?: string | Annex | null): Annex => isValidAnnex(annex) ? annex as Annex : "III";

function _calculateCpp(monthlyPayroll: number, fiscalConfig: any): number {
  const cppRate = fiscalConfig.aliquotas_cpp_patronal?.base ?? 0;
  return monthlyPayroll * cppRate;
}

function _calculatePartnerTaxes(
  proLabores: ProLaboreForm[],
  fiscalConfig: any
): { partnerTaxes: PartnerTaxDetails[]; totalINSSRetido: number; totalIRRFRetido: number; } {
    const partnerTaxes: PartnerTaxDetails[] = [];
    let totalINSSRetido = 0;
    let totalIRRFRetido = 0;

    const inssTable = fiscalConfig?.tabela_inss_clt_progressiva;
    const irrfTable = fiscalConfig?.reforma_tributaria?.tabela_irrf?.length
        ? fiscalConfig.reforma_tributaria.tabela_irrf
        : fiscalConfig?.tabela_irrf;

    if (!Array.isArray(inssTable) || inssTable.length === 0) {
        throw new Error('Tabela de INSS inválida ou ausente para cálculo do pró-labore.');
    }
    if (!Array.isArray(irrfTable) || irrfTable.length === 0) {
        throw new Error('Tabela de IRRF inválida ou ausente para cálculo do pró-labore.');
    }


    for (const proLabore of proLabores) {
        const value = proLabore.value || 0;
        if (value <= 0) continue;

        let inssValue = 0;
        if (proLabore.hasOtherInssContribution) {
            const otherContribution = proLabore.otherContributionSalary || 0;
            const remainingForTeto = Math.max(0, fiscalConfig.teto_inss - otherContribution);
            const inssBase = Math.min(value, remainingForTeto);
            if (inssBase > 0) {
                inssValue = inssBase * fiscalConfig.aliquota_inss_prolabore;
            }
        } else {
            const inssBase = Math.min(value, fiscalConfig.teto_inss);
            inssValue = inssBase * fiscalConfig.aliquota_inss_prolabore;
        }
        
        inssValue = Math.min(inssValue, fiscalConfig.teto_inss * fiscalConfig.aliquota_inss_prolabore);

        const irrfBase = value - inssValue - (fiscalConfig.deducao_simplificada_irrf ?? 0);
        let irrfValue = 0;

        const irrfBracket = safeFindBracket(irrfBase, irrfTable, { who: '_calculatePartnerTaxes.IRRF', year: fiscalConfig.ano_vigencia });
        if (irrfBracket && irrfBracket.rate > 0) {
            irrfValue = irrfBase * irrfBracket.rate - irrfBracket.deduction;
        }

        totalINSSRetido += inssValue;
        totalIRRFRetido += irrfValue;

        partnerTaxes.push({
            proLaboreBruto: value,
            inss: inssValue,
            irrf: irrfValue,
            proLaboreLiquido: value - inssValue - irrfValue,
        });
    }

    return { partnerTaxes, totalINSSRetido, totalIRRFRetido };
}

function getIvaReduction(cnaeCode: string, cClassTrib?: string) {
  const cnaeNumeric = typeof cnaeCode === "string" ? cnaeCode.replace(/\D/g, "") : "";
  if (cClassTrib) {
    const specificRel = CNAE_LC116_RELATIONSHIP.find(r => r.cnae === cnaeNumeric && r.cClassTrib === cClassTrib);
    if (specificRel) return getIvaReductionByCnae(cnaeCode, cClassTrib);
  }
  return getIvaReductionByCnae(cnaeCode);
}

function buildSimplesRegimeLabel(
  base: 'Tradicional' | 'Híbrido' | 'Otimizado',
  annex: 'III' | 'V' | 'I' | 'II' | 'IV',
  isHybrid = false
): string {
  if (base === 'Otimizado') {
    return isHybrid
      ? 'Simples Nacional (Fator R Otimizado) Híbrido'
      : 'Simples Nacional (Fator R Otimizado)';
  }

  if (base === 'Híbrido') {
    return `Simples Nacional Híbrido (Anexo ${annex})`;
  }

  return `Simples Nacional Tradicional (Anexo ${annex})`;
}


// ======================================================================================
// SECTION: CALCULATION ENGINES (NO MORE `{}`)
// ======================================================================================

/**
 * FULL IMPLEMENTATION for Lucro Presumido (2026+ rules)
 * Returns a complete TaxDetails2026 object or null if calculation is not possible.
 */
function calculateLucroPresumido2026(values: TaxFormValues, isCurrentRules: boolean): TaxDetails2026 | null {
  const { year = 2026, domesticActivities = [], exportActivities = [], exchangeRate = 1, totalSalaryExpense = 0, proLabores = [], selectedPlan, creditGeneratingExpenses = 0, issRate = 5 } = values;
  const fiscalConfig = getFiscalParametersPostReform(year);

  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + (p?.value || 0), 0);
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + (act?.revenue || 0), 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act?.revenue || 0) * exchangeRate, 0);
  const totalRevenue = domesticRevenue + exportRevenueBRL;

  if (totalRevenue === 0 && totalProLaboreBruto === 0) return null; // Cannot calculate if there is no revenue or payroll

  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
  const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig);

  let presumedProfitBaseIRPJ = 0;
  let presumedProfitBaseCSLL = 0;
  [...domesticActivities, ...exportActivities.map(a => ({ ...a, revenue: (a.revenue || 0) * exchangeRate }))].forEach(activity => {
      const cnaeInfo = getCnaeData(activity.code);
      if (!cnaeInfo) throw new Error(`CNAE data not found for ${activity.code}`);
      const revenue = activity.revenue || 0;
      presumedProfitBaseIRPJ += revenue * (cnaeInfo.presumedProfitRateIRPJ ?? 0.32);
      presumedProfitBaseCSLL += revenue * (cnaeInfo.presumedProfitRateCSLL ?? 0.32);
  });

  const { IRPJ_BASE = 0.15, IRPJ_ADICIONAL_BASE = 0.10, LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL = 20000, CSLL = 0.09, PIS = 0, COFINS = 0 } = fiscalConfig.lucro_presumido_rates;
  const irpjValue = presumedProfitBaseIRPJ * IRPJ_BASE;
  const irpjAdicional = Math.max(0, presumedProfitBaseIRPJ - LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL) * IRPJ_ADICIONAL_BASE;
  const irpjTotal = irpjValue + irpjAdicional;
  const csllValue = presumedProfitBaseCSLL * CSLL;

  const breakdown: any[] = [];
  let consumptionTaxes = 0;
  const configTransition = fiscalConfig.reforma_tributaria;

  if (isCurrentRules) {
    const pisValue = domesticRevenue * PIS;
    const cofinsValue = domesticRevenue * COFINS;
    const issValue = domesticRevenue * ((issRate ?? 5) / 100);
    consumptionTaxes = pisValue + cofinsValue + issValue;
    breakdown.push({ name: "PIS", value: pisValue }, { name: "COFINS", value: cofinsValue }, { name: "ISS", value: issValue });
  } else {
    const { pis_cofins_multiplier = 1, iss_icms_multiplier = 1, cbs_aliquota_padrao = 0, ibs_aliquota_padrao = 0 } = configTransition ?? {};
    const pis = domesticRevenue * PIS * pis_cofins_multiplier;
    const cofins = domesticRevenue * COFINS * pis_cofins_multiplier;
    const iss = domesticRevenue * ((issRate ?? 5) / 100) * iss_icms_multiplier;
    breakdown.push({ name: "PIS (Transição)", value: pis }, { name: "COFINS (Transição)", value: cofins }, { name: "ISS (Transição)", value: iss });
    
    let totalIbsDebit = 0, totalCbsDebit = 0, totalIbsCredit = 0, totalCbsCredit = 0;
    domesticActivities.forEach(activity => {
        const reduction = getIvaReduction(activity.code, activity.cClassTrib);
        totalCbsDebit += (activity.revenue || 0) * (cbs_aliquota_padrao * (1 - ((reduction?.reducaoCBS ?? 0) / 100)));
        totalIbsDebit += (activity.revenue || 0) * (ibs_aliquota_padrao * (1 - ((reduction?.reducaoIBS ?? 0) / 100)));
    });

    if (creditGeneratingExpenses > 0 && domesticActivities.length > 0) {
        const firstActivity = domesticActivities[0];
        const reduction = getIvaReduction(firstActivity.code, firstActivity.cClassTrib);
        totalCbsCredit = creditGeneratingExpenses * (cbs_aliquota_padrao * (1 - ((reduction?.reducaoCBS ?? 0) / 100)));
        totalIbsCredit = creditGeneratingExpenses * (ibs_aliquota_padrao * (1 - ((reduction?.reducaoIBS ?? 0) / 100)));
    }

    const cbsFinal = Math.max(0, totalCbsDebit - totalCbsCredit);
    const ibsFinal = Math.max(0, totalIbsDebit - totalIbsCredit);
    
    const oldTaxesCost = pis + cofins + iss;
    if (year === 2026) {
        breakdown.push({ name: "CBS (Teste/Compensável)", value: cbsFinal }, { name: "IBS (Teste/Compensável)", value: ibsFinal });
        consumptionTaxes = oldTaxesCost;
    } else {
        breakdown.push({ name: "CBS (Líquida)", value: cbsFinal }, { name: "IBS (Líquido)", value: ibsFinal });
        consumptionTaxes = oldTaxesCost + cbsFinal + ibsFinal;
    }
  }

  const totalTax = irpjTotal + csllValue + consumptionTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
  const safeTotalRevenue =
  Number.isFinite(totalRevenue) && totalRevenue >= 0 ? totalRevenue : 0;

  const feeBracket = findFeeBracket(
    CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
    safeTotalRevenue
  );
  const { fee: contabilizeiFee, planName, isDefault } = resolveSelectedPlan(feeBracket?.plans, selectedPlan);
  const totalMonthlyCost = totalTax + Number(contabilizeiFee ?? 0);

  const notes: string[] = isDefault ? [`Para consistência da simulação, a mensalidade foi calculada com base no plano padrão '${planName}'.`] : [];

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
      { name: "IRPJ", value: irpjTotal },
      { name: "CSLL", value: csllValue },
      { name: "CPP (INSS Patronal)", value: inssPatronal },
      { name: "INSS s/ Pró-labore", value: totalINSSRetido },
      { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
      ...breakdown,
      { name: `Mensalidade Contabilizei (Plano: ${planName})`, value: contabilizeiFee },
    ].filter(i => i.value > 0.001),
    notes,
    partnerTaxes,
    // Fields specific to 2026
    fatorR: 0,
    effectiveDasRate: 0,
    annex: "N/A",
    optimizationNote: "",
    order: isCurrentRules ? 5 : 4,
  };
}

/**
 * FULL IMPLEMENTATION for Simples Nacional (2026+ rules)
 * Returns a complete TaxDetails2026 object or null if calculation is not possible.
 */
function _calculateSimples2026(
  values: TaxFormValues,
  isHybrid: boolean,
  fatorREffective: number,
  proLaboreOverride?: ProLaboreForm[]
): TaxDetails2026 | null {
    if (!values || typeof values !== 'object') {
      throw new Error('Dados de entrada inválidos para cálculo do Simples Nacional.');
    }
    const year = values.year ?? 2026;
    if (!year || year < 2026) {
      throw new Error('Ano inválido para cálculo do Simples Nacional.');
    }

    const { domesticActivities = [], exportActivities = [], exchangeRate = 1, totalSalaryExpense = 0, proLabores = [], b2bRevenuePercentage = 100, rbt12, selectedPlan, creditGeneratingExpenses = 0, } = values;

    const fiscalConfig = getFiscalParametersPostReform(year);
    const proLaboresToUse = proLaboreOverride ?? proLabores;
    const totalProLaboreBruto = proLaboresToUse.reduce((s, p) => s + (p?.value || 0), 0);

    const domesticRevenue = domesticActivities.reduce((s, a) => s + (a?.revenue || 0), 0);
    const exportRevenue = exportActivities.reduce((s, a) => s + (a?.revenue || 0) * exchangeRate, 0);
    const totalRevenue = domesticRevenue + exportRevenue;

    if (totalRevenue === 0 && totalProLaboreBruto === 0) return null;

    const totalPayroll = totalSalaryExpense + totalProLaboreBruto;
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    
    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig);
    const safeTotalRevenue = Number.isFinite(totalRevenue) && totalRevenue >= 0 ? totalRevenue : 0;
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, safeTotalRevenue);
    const { fee: contabilizeiFee, planName, isDefault } = resolveSelectedPlan(feeBracket?.plans, selectedPlan);

    let totalDas = 0, cppFromAnnexIV = 0, ivaTaxes = 0;
    let finalAnnex: Annex = "I";
    let hasProcessedActivity = false;

    const allActivities = [...domesticActivities.map(a => ({ ...a, isExport: false })), ...exportActivities.map(a => ({ ...a, revenue: (a.revenue || 0) * exchangeRate, isExport: true }))];
    
    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;
        hasProcessedActivity = true;
        
        let effectiveAnnex: Annex;
        if (cnaeInfo.requiresFatorR) {
          effectiveAnnex = fatorREffective >= (fiscalConfig.simples_nacional?.limite_fator_r ?? 0.28) ? "III" : "V";
        } else {
          effectiveAnnex = normalizeAnnex(cnaeInfo.annex);
        }
        finalAnnex = effectiveAnnex;

        if (!effectiveAnnex || !VALID_ANNEXES.includes(effectiveAnnex)) {
            console.warn('Anexo inválido, pulando cálculo do Simples', { effectiveAnnex, year });
            return;
        }

        const annexTable = fiscalConfig.simples_nacional?.[effectiveAnnex];
        const bracket = safeFindBracket(effectiveRbt12, annexTable, { who: '_calculateSimples2026', year, annex: effectiveAnnex });
        if (!bracket) return;

        const { rate, deduction, distribution } = bracket;
        let effectiveDasRate = effectiveRbt12 > 0 ? (effectiveRbt12 * rate - deduction) / effectiveRbt12 : rate;
        const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0, CBS = 0, IBS = 0 } = distribution ?? {};

        if (activity.isExport) {
            effectiveDasRate *= (1 - (PIS + COFINS + ISS + ICMS + IPI + CBS + IBS));
        } else if (isHybrid && year >= 2027) {
            const consumptionTaxProportionInDas = (CBS + IBS + PIS + COFINS + ISS + ICMS + IPI);
            effectiveDasRate *= (1 - consumptionTaxProportionInDas);
        }

        totalDas += (activity.revenue || 0) * effectiveDasRate;
        if (effectiveAnnex === "IV") cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig);
    });

    if (isHybrid && year >= 2027) {
      const { cbs_aliquota_padrao: baseCbsRate = 0, ibs_aliquota_padrao: baseIbsRate = 0 } = fiscalConfig.reforma_tributaria ?? {};
      
      const b2bPortion = ((b2bRevenuePercentage ?? 100) / 100);
      let totalIbsDebit = 0, totalCbsDebit = 0, totalIbsCredit = 0, totalCbsCredit = 0;

      domesticActivities.forEach(activity => {
        const rev = Number(activity.revenue || 0);
        if (rev <= 0) return;
        
        const reduction = getIvaReduction(activity.code, activity.cClassTrib);
        const reducaoIBS = (reduction?.reducaoIBS ?? 0) / 100;
        const reducaoCBS = (reduction?.reducaoCBS ?? 0) / 100;

        const activityB2BRevenue = rev * b2bPortion;
        totalCbsDebit += activityB2BRevenue * (baseCbsRate * (1 - reducaoCBS));
        totalIbsDebit += activityB2BRevenue * (baseIbsRate * (1 - reducaoIBS));
      });

      if (creditGeneratingExpenses > 0 && domesticActivities.length > 0) {
        const first = domesticActivities[0];
        const reduction = getIvaReduction(first.code, first.cClassTrib);
        const reducaoIBS = (reduction?.reducaoIBS ?? 0) / 100;
        const reducaoCBS = (reduction?.reducaoCBS ?? 0) / 100;

        totalCbsCredit = creditGeneratingExpenses * (baseCbsRate * (1 - reducaoCBS));
        totalIbsCredit = creditGeneratingExpenses * (baseIbsRate * (1 - reducaoIBS));
      }
      
      const finalCbs = Math.max(0, totalCbsDebit - totalCbsCredit);
      const finalIbs = Math.max(0, totalIbsDebit - totalIbsCredit);
      ivaTaxes = finalCbs + finalIbs;
    }

    const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + Number(contabilizeiFee ?? 0);
    const notes: string[] = isDefault ? [`Para consistência da simulação, a mensalidade foi calculada com base no plano padrão '${planName}'.`] : [];
    
    let regimeLabelBase: 'Tradicional' | 'Híbrido' = isHybrid ? 'Híbrido' : 'Tradicional';
    const regimeName = buildSimplesRegimeLabel(regimeLabelBase, finalAnnex, isHybrid);

    const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;
    
    const result: TaxDetails2026 = {
        regime: regimeName as any,
        annex: finalAnnex,
        totalTax, totalMonthlyCost, totalRevenue, domesticRevenue, exportRevenue,
        proLabore: totalProLaboreBruto, fatorR: fatorREffective,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        effectiveDasRate,
        contabilizeiFee,
        breakdown: [
            { name: "DAS (Simples Nacional)", value: totalDas, rate: effectiveDasRate },
            { name: "IVA (IBS/CBS pago por fora)", value: ivaTaxes },
            { name: "CPP (INSS Patronal)", value: cppFromAnnexIV },
            { name: "INSS s/ Pró-labore", value: totalINSSRetido },
            { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
            { name: `Mensalidade Contabilizei (Plano: ${planName})`, value: contabilizeiFee }
        ].filter(item => item.value > 0.001),
        notes,
        partnerTaxes,
        optimizationNote: proLaboreOverride ? `Pró-labore ajustado para ${formatCurrencyBRL(totalProLaboreBruto)} visando Anexo III.` : ""
    };
    return result;
}

// ======================================================================================
// SECTION: ORCHESTRATOR (WITH NORMALIZATION SAFEGUARD)
// ======================================================================================

/**
 * Safeguard normalizer function.
 * Ensures that any empty object or falsy value is converted to null.
 */
function normalize<T>(value: T | null | undefined): T | null {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
    return null;
  }
  return value;
}

export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
    const { year, rbt12 = 0, fp12 = 0, selectedCnaes = [], proLabores = [], totalSalaryExpense = 0 } = values;
    if (!year || year < 2026) throw new Error(`[Orchestrator 2026] Invalid year ${year} provided.`);

    const config = getFiscalParametersPostReform(year);
    const domesticRevenue = values.domesticActivities?.reduce((s, a) => s + (a?.revenue || 0), 0) ?? 0;
    const exportRevenue = values.exportActivities?.reduce((s, a) => s + ((a?.revenue || 0) * (values.exchangeRate || 1)), 0) ?? 0;
    const calculatedTotalRevenue = domesticRevenue + exportRevenue;
    const totalProLaboreValue = proLabores.reduce((s, p) => s + (p?.value || 0), 0);
    const totalPayroll = totalSalaryExpense + totalProLaboreValue;
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : calculatedTotalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : totalPayroll * 12;
    const fatorR_naoOtimizado = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;

    const lucroPresumido = calculateLucroPresumido2026(values, false);
    const lucroPresumidoAtual = calculateLucroPresumido2026(values, true) as TaxDetails | null; // Cast for compatibility
    
    const simplesNacionalTradicional = values.selectedCnaes?.length
      ? _calculateSimples2026(values, false, fatorR_naoOtimizado)
      : null;

    const simplesNacionalHibrido = year >= 2027 && values.selectedCnaes?.length
      ? _calculateSimples2026(values, true, fatorR_naoOtimizado)
      : null;

    let simplesNacionalOtimizado: TaxDetails2026 | null = null;
    let simplesNacionalOtimizadoHibrido: TaxDetails2026 | null = null;

    const hasAnnexVActivity = selectedCnaes.some(c => getCnaeData(c.code)?.requiresFatorR);
    const limiteFatorR = config.simples_nacional?.limite_fator_r ?? 0.28;

    if (hasAnnexVActivity && fatorR_naoOtimizado < limiteFatorR && calculatedTotalRevenue > 0) {
        const requiredAnnualPayroll = effectiveRbt12 * limiteFatorR;
        const additionalAnnualPayrollNeeded = Math.max(0, requiredAnnualPayroll - effectiveFp12);
        if (additionalAnnualPayrollNeeded > 0) {
            const proLaboresOtimizado: ProLaboreForm[] = JSON.parse(JSON.stringify(proLabores));
            const additionalMonthlyProLabore = additionalAnnualPayrollNeeded / 12;
            if (proLaboresOtimizado.length > 0) {
                proLaboresOtimizado[0].value += additionalMonthlyProLabore;
            } else {
                proLaboresOtimizado.push({ value: additionalMonthlyProLabore, hasOtherInssContribution: false, otherContributionSalary: 0 });
            }
            const valuesOtimizado = { ...values, proLabores: proLaboresOtimizado };
            const fatorROtimizado = (effectiveFp12 + additionalAnnualPayrollNeeded) / effectiveRbt12;

            const otimizadoResult = _calculateSimples2026(valuesOtimizado, false, fatorROtimizado, proLaboresOtimizado);
            if (otimizadoResult) {
                simplesNacionalOtimizado = {
                    ...otimizadoResult,
                    regime: buildSimplesRegimeLabel('Otimizado', otimizadoResult.annex as Annex, false) as any,
                    optimizationNote: `Pró-labore ajustado para ${formatCurrencyBRL(proLaboresOtimizado.reduce((sum, p) => sum + p.value, 0))} visando Anexo III.`
                };
            }

            if (year >= 2027) {
                const otimizadoHibridoResult = _calculateSimples2026(valuesOtimizado, true, fatorROtimizado, proLaboresOtimizado);
                if (otimizadoHibridoResult) {
                    simplesNacionalOtimizadoHibrido = {
                        ...otimizadoHibridoResult,
                        regime: buildSimplesRegimeLabel('Otimizado', otimizadoHibridoResult.annex as Annex, true) as any,
                        optimizationNote: `Pró-labore ajustado para ${formatCurrencyBRL(proLaboresOtimizado.reduce((sum, p) => sum + p.value, 0))} visando Anexo III.`
                    };
                }
            }
        }
    }


    const orderMap = {
      'Simples Nacional (Fator R Otimizado)': 1,
      'Simples Nacional Tradicional (Anexo III)': 2,
      'Simples Nacional Tradicional (Anexo V)': 2,
      'Simples Nacional Híbrido (Anexo III)': 3,
      'Simples Nacional Híbrido (Anexo V)': 3,
    };

    const assignOrder = (scenario: TaxDetails2026 | null) => {
        if (!scenario) return null;
        return { ...scenario, order: (orderMap[scenario.regime as keyof typeof orderMap] ?? 99) };
    };

    return {
        lucroPresumido: normalize(lucroPresumido),
        lucroPresumidoAtual: normalize(lucroPresumidoAtual as any),
        simplesNacionalTradicional: normalize(assignOrder(simplesNacionalTradicional)),
        simplesNacionalHibrido: normalize(assignOrder(simplesNacionalHibrido)),
        simplesNacionalOtimizado: normalize(assignOrder(simplesNacionalOtimizado)),
        simplesNacionalOtimizadoHibrido: normalize(assignOrder(simplesNacionalOtimizadoHibrido)),
    };
}

    