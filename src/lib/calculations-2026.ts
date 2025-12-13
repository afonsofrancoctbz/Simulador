// src/lib/calculations-2026.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFiscalParametersPostReform } from '@/config/fiscal';
import {
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
} from './cnae-helpers';
import {
  type CalculationResults2026,
  type TaxFormValues,
  type TaxDetails2026,
  type Annex,
  type TaxDetails,
  type ProLaboreForm,
} from './types';
import { formatPercent, findFeeBracket, safeFindBracket, formatCurrencyBRL } from './utils';
import { getCnaeData } from './cnae-helpers';
import { _calculatePartnerTaxes, _calculateCpp } from './calculations';
import { getIvaReductionByCnae } from './cnae-reductions-2026';
import { CNAE_LC116_RELATIONSHIP } from './cnae-data-2026';

const VALID_ANNEXES: Annex[] = ['I', 'II', 'III', 'IV', 'V'];

function isValidAnnex(a: unknown): a is Annex {
  return typeof a === 'string' && VALID_ANNEXES.includes(a as Annex);
}

function normalizeAnnex(annex?: string | Annex | null): Annex {
  if (isValidAnnex(annex)) return annex as Annex;
  return 'III';
}

function resolveSelectedPlan(
  plans: Record<string, number> | undefined,
  selectedPlan: string | undefined
): number {
  if (!plans || typeof plans !== 'object') return 0;

  if (selectedPlan && plans[selectedPlan] !== undefined) {
    return plans[selectedPlan];
  }

  if (plans['expertsEssencial'] !== undefined) {
    return plans['expertsEssencial'];
  }

  const firstAvailablePlan = Object.values(plans)[0];
  return typeof firstAvailablePlan === 'number' ? firstAvailablePlan : 0;
}

function buildSimplesRegimeLabel(
  base: 'Tradicional' | 'Híbrido' | 'Otimizado',
  annex: 'III' | 'V',
  isHybrid = false
): TaxDetails2026['regime'] {
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


/**
 * Garantir que a tabela de faixas está presente e é utilizável.
 * Lança erro com mensagem clara caso contrário.
 */
function ensureAnnexTable<T extends { max: number }>(annexTable: T[] | undefined, annex: Annex, year: number) {
  if (!Array.isArray(annexTable) || annexTable.length === 0) {
    // Mensagem detalhada para debugging em ambiente de produção/studio
    console.error('Erro de configuração Simples 2026', {
      annex,
      fiscalConfig: getFiscalParametersPostReform(year).simples_nacional,
    });
    throw new Error(`Tabela do Simples Nacional indisponível para o Anexo ${annex} no ano ${year}`);
  }
}

/* ---------------------------
   IVA (IBS/CBS) reductions
   --------------------------- */

/**
 * Obtém redução de IVA - usa associação por CNAE e cClassTrib
 * Usa helper centralizado getIvaReductionByCnae que já existe no repositório.
 */
function getIvaReduction(cnaeCode: string, cClassTrib?: string) {
  // Faz busca por número do CNAE quando necessário
  const cnaeNumeric = typeof cnaeCode === 'string' ? cnaeCode.replace(/\D/g, '') : '';
  if (cClassTrib) {
    const specificRel = CNAE_LC116_RELATIONSHIP.find(r => r.cnae === cnaeNumeric && r.cClassTrib === cClassTrib);
    if (specificRel) {
      return getIvaReductionByCnae(cnaeCode, cClassTrib);
    }
  }
  // fallback: busca por cnae sem cClassTrib
  return getIvaReductionByCnae(cnaeCode);
}

/* ---------------------------
   LUCRO PRESUMIDO
   --------------------------- */

/**
 * calculateLucroPresumido
 * Mantém compatibilidade com a versão original e adiciona validações.
 */
function calculateLucroPresumido(values: TaxFormValues, isCurrentRules: boolean): TaxDetails | TaxDetails2026 {
  const year = values.year || 2026;
  const fiscalConfig = getFiscalParametersPostReform(year);

  const {
    domesticActivities = [],
    exportActivities = [],
    exchangeRate = 1,
    totalSalaryExpense = 0,
    proLabores = [],
    selectedPlan = 'expertsEssencial',
    creditGeneratingExpenses = 0,
    issRate = undefined,
  } = values;

  // Soma pró-labore bruto
  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + (p?.value || 0), 0);

  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + (act?.revenue || 0), 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + ((act?.revenue || 0) * (exchangeRate || 1)), 0);
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  const monthlyPayroll = (totalSalaryExpense || 0) + totalProLaboreBruto;

  // Parceiros / retenções
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
  const cppRate = fiscalConfig.aliquotas_cpp_patronal?.base ?? 0;
  const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig);

  // Base presumida considerando taxas por CNAE quando disponível
  const presumedProfitBase = [...domesticActivities, ...exportActivities.map(a => ({ ...a, revenue: (a?.revenue || 0) * (exchangeRate || 1) }))].reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    const presumedRate = cnaeInfo?.presumedProfitRateIRPJ ?? 0.32;
    return sum + ((activity.revenue || 0) * presumedRate);
  }, 0);

  // IRPJ e adicional
  const irpjRate = fiscalConfig.lucro_presumido_rates?.IRPJ_BASE ?? 0.15;
  const irpjAdicionalRate = fiscalConfig.lucro_presumido_rates?.IRPJ_ADICIONAL_BASE ?? 0.10;
  const irpjIsencaoLimite = fiscalConfig.lucro_presumido_rates?.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL ?? 20000;

  const irpjBase = presumedProfitBase * irpjRate;
  const irpjAdicional = Math.max(0, presumedProfitBase - irpjIsencaoLimite) * irpjAdicionalRate;
  const irpjTotal = irpjBase + irpjAdicional;

  const csllRate = fiscalConfig.lucro_presumido_rates?.CSLL ?? 0.09;
  const csll = presumedProfitBase * csllRate;

  // Consumo (PIS/COFINS/ISS) - tratamento pré e pós reforma
  let consumptionTaxes = 0;
  const breakdown: Array<any> = [
    { name: 'IRPJ', value: irpjTotal, rate: irpjRate },
    { name: 'CSLL', value: csll, rate: csllRate },
    { name: 'CPP (INSS Patronal)', value: inssPatronal, rate: cppRate },
    { name: 'INSS s/ Pró-labore', value: totalINSSRetido, rate: fiscalConfig.aliquota_inss_prolabore },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
  ];

  const configTransition = 'reforma_tributaria' in fiscalConfig ? fiscalConfig.reforma_tributaria : null;

  if (isCurrentRules || !configTransition) {
    // pré-reforma: cumulativos
    const pisRate = fiscalConfig.lucro_presumido_rates?.PIS ?? 0;
    const cofinsRate = fiscalConfig.lucro_presumido_rates?.COFINS ?? 0;
    const issRateAsDecimal = (issRate ?? 5) / 100;

    const pis = domesticRevenue * pisRate;
    const cofins = domesticRevenue * cofinsRate;
    const iss = domesticRevenue * issRateAsDecimal;

    consumptionTaxes = pis + cofins + iss;

    if (pis > 0) breakdown.push({ name: 'PIS', value: pis, rate: pisRate });
    if (cofins > 0) breakdown.push({ name: 'COFINS', value: cofins, rate: cofinsRate });
    if (iss > 0) breakdown.push({ name: 'ISS', value: iss, rate: issRateAsDecimal });

  } else {
    // pós-reforma: transição com CBS/IBS (reduções por CNAE)
    const pisRate = fiscalConfig.lucro_presumido_rates?.PIS ?? 0;
    const cofinsRate = fiscalConfig.lucro_presumido_rates?.COFINS ?? 0;
    const issRateAsDecimal = (issRate ?? 5) / 100;

    const pis = domesticRevenue * pisRate * configTransition.pis_cofins_multiplier;
    const cofins = domesticRevenue * cofinsRate * configTransition.pis_cofins_multiplier;
    const iss = domesticRevenue * issRateAsDecimal * configTransition.iss_icms_multiplier;

    if (pis > 0) breakdown.push({ name: 'PIS', value: pis, rate: pisRate * configTransition.pis_cofins_multiplier });
    if (cofins > 0) breakdown.push({ name: 'COFINS', value: cofins, rate: cofinsRate * configTransition.pis_cofins_multiplier });
    if (iss > 0) breakdown.push({ name: 'ISS', value: iss, rate: issRateAsDecimal * configTransition.iss_icms_multiplier });

    const oldTaxesCost = pis + cofins + iss;

    const baseCbsRate = configTransition.cbs_aliquota_padrao ?? 0;
    const baseIbsRate = configTransition.ibs_aliquota_padrao ?? 0;

    let totalIbsDebit = 0;
    let totalCbsDebit = 0;
    let totalCbsCredit = 0;
    let totalIbsCredit = 0;

    domesticActivities.forEach(activity => {
      if (!activity) return;
      const reduction = getIvaReduction(activity.code, activity.cClassTrib);
      const reducaoIBSDecimal = (reduction.reducaoIBS ?? 0) / 100;
      const reducaoCBSDecimal = (reduction.reducaoCBS ?? 0) / 100;

      totalCbsDebit += (activity.revenue || 0) * (baseCbsRate * (1 - reducaoCBSDecimal));
      totalIbsDebit += (activity.revenue || 0) * (baseIbsRate * (1 - reducaoIBSDecimal));
    });

    if (creditGeneratingExpenses > 0 && domesticActivities.length > 0) {
      const firstActivity = domesticActivities[0];
      const reduction = getIvaReduction(firstActivity.code, firstActivity.cClassTrib);
      const reducaoIBSDecimal = (reduction.reducaoIBS ?? 0) / 100;
      const reducaoCBSDecimal = (reduction.reducaoCBS ?? 0) / 100;
      totalCbsCredit = creditGeneratingExpenses * (baseCbsRate * (1 - reducaoCBSDecimal));
      totalIbsCredit = creditGeneratingExpenses * (baseIbsRate * (1 - reducaoIBSDecimal));
    }

    const cbsFinal = Math.max(0, totalCbsDebit - totalCbsCredit);
    const ibsFinal = Math.max(0, totalIbsDebit - totalIbsCredit);

    if (year === 2026) {
      // Ano de teste - valores informativos e compensáveis
      if (cbsFinal > 0) breakdown.push({ name: 'CBS (Teste/Compensável)', value: cbsFinal, rate: baseCbsRate });
      if (ibsFinal > 0) breakdown.push({ name: 'IBS (Teste/Compensável)', value: ibsFinal, rate: baseIbsRate });
      consumptionTaxes = oldTaxesCost;
    } else {
      consumptionTaxes = oldTaxesCost + cbsFinal + ibsFinal;
      if (cbsFinal > 0) breakdown.push({ name: 'CBS (Líquida)', value: cbsFinal, rate: baseCbsRate });
      if (ibsFinal > 0) breakdown.push({ name: 'IBS (Líquido)', value: ibsFinal, rate: baseIbsRate });
    }
  }

  const companyRevenueTaxes = irpjTotal + csll + consumptionTaxes;
  const totalTax = companyRevenueTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;

  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
  const fee = resolveSelectedPlan(feeBracket?.plans, values.selectedPlan);
  const totalMonthlyCost = totalTax + Number(fee || 0);

  const regimeName: TaxDetails['regime'] | TaxDetails2026['regime'] = isCurrentRules ? 'Lucro Presumido (Regras Atuais)' : 'Lucro Presumido';

  const result: TaxDetails | TaxDetails2026 = {
    regime: regimeName as any,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    domesticRevenue,
    exportRevenue: exportRevenueBRL,
    proLabore: totalProLaboreBruto,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    contabilizeiFee: fee ?? 0,
    breakdown: breakdown.filter(i => (i?.value ?? 0) > 0.001),
    notes: [],
    partnerTaxes,
  };

  return result;
}

/* ---------------------------
   SIMPLES NACIONAL 2026+
   --------------------------- */

function _calculateSimples2026(
  values: TaxFormValues,
  isHybrid: boolean,
  fatorREffective: number,
  proLaboreOverride?: ProLaboreForm[]
): TaxDetails2026 | null {
  if (!values || typeof values !== 'object') {
    throw new Error('Dados de entrada inválidos para cálculo do Simples Nacional.');
  }

  const year = values.year || 2026;

  if (!year || year < 2026) {
    throw new Error(`Ano inválido (${year}) para cálculo do Simples Nacional pós-reforma.`);
  }

  const fiscalConfig = getFiscalParametersPostReform(year);

  const {
    domesticActivities = [],
    exportActivities = [],
    exchangeRate = 1,
    totalSalaryExpense = 0,
    proLabores = [],
    b2bRevenuePercentage = 100,
    rbt12,
    selectedPlan = 'expertsEssencial',
    creditGeneratingExpenses = 0,
  } = values;

  const proLaboresToUse = proLaboreOverride ?? proLabores;
  const totalProLaboreBruto = proLaboresToUse.reduce((s, p) => s + (p?.value || 0), 0);
  const totalPayroll = totalSalaryExpense + totalProLaboreBruto;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig);

  const domesticRevenue = domesticActivities.reduce((s, a) => s + (a?.revenue || 0), 0);
  const exportRevenue = exportActivities.reduce((s, a) => s + ((a?.revenue || 0) * (exchangeRate || 1)), 0);
  const totalRevenue = domesticRevenue + exportRevenue;

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;

  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const fee = resolveSelectedPlan(feeBracket?.plans, values.selectedPlan);

  let totalDas = 0;
  let cppFromAnnexIV = 0;
  let ivaTaxes = 0;
  let finalAnnex: Annex = 'III';
  const cppRate = fiscalConfig.aliquotas_cpp_patronal?.base ?? 0;

  const allActivities = [
    ...domesticActivities.map(a => ({ ...a, isExport: false })),
    ...exportActivities.map(a => ({ ...a, revenue: (a?.revenue || 0) * (exchangeRate || 1), isExport: true })),
  ];
  let hasProcessedActivity = false;

  allActivities.forEach(activity => {
    if (!activity) return;
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return;

    hasProcessedActivity = true;
    const revenueForActivity = activity.revenue || 0;
    if (revenueForActivity === 0) return;

    let effectiveAnnex: Annex;
    if (cnaeInfo.requiresFatorR) {
      effectiveAnnex = fatorREffective >= (fiscalConfig.simples_nacional?.limite_fator_r ?? 0.28) ? 'III' : 'V';
    } else {
      effectiveAnnex = normalizeAnnex(cnaeInfo.annex);
    }
    finalAnnex = effectiveAnnex;

    if (!effectiveAnnex || !VALID_ANNEXES.includes(effectiveAnnex)) {
      console.warn('Anexo inválido, pulando cálculo do Simples para esta atividade', { effectiveAnnex, year, activity });
      return;
    }

    const annexTable = fiscalConfig.simples_nacional?.[effectiveAnnex];
    const bracket = safeFindBracket(effectiveRbt12, annexTable, { who: '_calculateSimples2026', year, annex: effectiveAnnex });
    
    if(!bracket) return;

    const { rate, deduction, distribution } = bracket;
    const effectiveDasRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * rate - deduction) / effectiveRbt12) : rate;

    const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0, CBS = 0, IBS = 0 } = distribution ?? {};
    const consumptionTaxProportionInDas = (CBS || 0) + (IBS || 0) + (PIS || 0) + (COFINS || 0) + (ISS || 0) + (ICMS || 0) + (IPI || 0);
    let dasRateForActivity = effectiveDasRate;

    if (isHybrid && !activity.isExport && year >= 2027) {
      dasRateForActivity *= (1 - consumptionTaxProportionInDas);
    } else if (activity.isExport) {
      dasRateForActivity -= effectiveDasRate * (PIS + COFINS + ISS + ICMS + IPI + (CBS || 0) + (IBS || 0));
    }
    totalDas += revenueForActivity * dasRateForActivity;
    if (effectiveAnnex === 'IV') {
      cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig);
    }
  });

  if (!hasProcessedActivity && totalProLaboreBruto <= 0) {
      return null;
  }

  if (isHybrid && year >= 2027) {
    const config2026 = getFiscalParametersPostReform(year);
    const baseCbsRate = config2026.reforma_tributaria?.cbs_aliquota_padrao ?? 0;
    const baseIbsRate = config2026.reforma_tributaria?.ibs_aliquota_padrao ?? 0;

    let totalIbsDebit = 0;
    let totalCbsDebit = 0;
    let totalCbsCredit = 0;
    let totalIbsCredit = 0;

    const b2bRevenuePortion = (b2bRevenuePercentage ?? 100) / 100;

    domesticActivities.forEach(activity => {
      if (!activity || (activity.revenue || 0) <= 0) return;
      const reduction = getIvaReduction(activity.code, activity.cClassTrib);
      const reducaoIBSDecimal = (reduction.reducaoIBS ?? 0) / 100;
      const reducaoCBSDecimal = (reduction.reducaoCBS ?? 0) / 100;
      const activityB2bRevenue = (activity.revenue || 0) * b2bRevenuePortion;
      totalCbsDebit += activityB2bRevenue * (baseCbsRate * (1 - reducaoCBSDecimal));
      totalIbsDebit += activityB2bRevenue * (baseIbsRate * (1 - reducaoIBSDecimal));
    });

    if (creditGeneratingExpenses > 0 && domesticActivities.length > 0) {
      const firstActivity = domesticActivities[0];
      const reduction = getIvaReduction(firstActivity.code, firstActivity.cClassTrib);
      const reducaoIBSDecimal = (reduction.reducaoIBS ?? 0) / 100;
      const reducaoCBSDecimal = (reduction.reducaoCBS ?? 0) / 100;
      totalCbsCredit = creditGeneratingExpenses * (baseCbsRate * (1 - reducaoCBSDecimal));
      totalIbsCredit = creditGeneratingExpenses * (baseIbsRate * (1 - reducaoIBSDecimal));
    }
    const finalIbs = Math.max(0, totalIbsDebit - totalIbsCredit);
    const finalCbs = Math.max(0, totalCbsDebit - totalCbsCredit);
    ivaTaxes = finalIbs + finalCbs;
  }

  const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
  const totalMonthlyCost = totalTax + Number(fee || 0);
  const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;

  const breakdown = [
    { name: 'DAS (Simples Nacional)', value: totalDas, rate: effectiveDasRate },
    { name: 'IVA (IBS/CBS pago por fora)', value: ivaTaxes },
    { name: 'CPP (INSS Patronal)', value: cppFromAnnexIV, rate: cppRate },
    { name: 'INSS s/ Pró-labore', value: totalINSSRetido, rate: fiscalConfig.aliquota_inss_prolabore },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
  ].filter(item => (item?.value ?? 0) > 0.001);

  const notes: string[] = [];
  if (isHybrid) {
    if (year < 2027) {
      notes.push(`SN Híbrido não aplicável em ${year}. O regime opcional inicia em 2027.`);
    } else {
      notes.push(`Cenário B2B: ${formatPercent((b2bRevenuePercentage ?? 100) / 100)} da receita paga IVA por fora, gerando crédito para clientes. Reduções setoriais aplicadas.`);
    }
  } else {
    if (year >= 2027) {
      notes.push('Regime padrão do Simples. Crédito de IVA limitado para clientes. Exportações com tributos zerados no DAS.');
    } else {
      notes.push('Empresas do SN dispensadas da fase de testes do IVA em 2026.');
    }
  }
  if (cppFromAnnexIV > 0) {
    notes.push(`Anexo IV: CPP (${formatPercent(cppRate)}) calculada sobre a folha.`);
  }

  const baseLabel = proLaboreOverride ? 'Otimizado' : isHybrid ? 'Híbrido' : 'Tradicional';
  const regimeName = buildSimplesRegimeLabel(baseLabel, finalAnnex, isHybrid);

  const result: TaxDetails2026 = {
    regime: regimeName,
    annex: finalAnnex,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    domesticRevenue,
    exportRevenue,
    proLabore: totalProLaboreBruto,
    fatorR: fatorREffective,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    effectiveDasRate,
    contabilizeiFee: fee ?? 0,
    breakdown,
    notes,
    partnerTaxes,
  };

  if (proLaboreOverride) {
    result.optimizationNote = `Pró-labore ajustado para ${formatCurrencyBRL(totalProLaboreBruto)} visando Anexo III.`;
  }

  return result;
}

/* ---------------------------
   ORQUESTRADOR: calculateTaxes2026
   --------------------------- */

export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const {
    rbt12,
    totalSalaryExpense = 0,
    proLabores = [],
    fp12,
    domesticActivities = [],
    exportActivities = [],
    exchangeRate = 1,
    year = 2026,
    selectedCnaes = [],
  } = values;

  const fiscalConfig = getFiscalParametersPostReform(year);

  const totalRevenue =
    (domesticActivities.reduce((s, a) => s + (a?.revenue || 0), 0) || 0) +
    (exportActivities.reduce((s, a) => s + ((a?.revenue || 0) * (exchangeRate || 1)), 0) || 0);

  const totalProLaboreBruto = proLabores.reduce((s, p) => s + (p?.value || 0), 0);
  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
  const fatorR_naoOtimizado = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;

  const simplesNacionalTradicional = values.selectedCnaes?.length ? _calculateSimples2026(values, false, fatorR_naoOtimizado) : null;
  const simplesNacionalHibrido = (year >= 2027 && values.selectedCnaes?.length) ? _calculateSimples2026(values, true, fatorR_naoOtimizado) : null;

  let simplesNacionalOtimizado: TaxDetails2026 | null = null;
  let simplesNacionalOtimizadoHibrido: TaxDetails2026 | null = null;

  const hasAnnexVActivity = (selectedCnaes ?? []).some(item => getCnaeData(item.code)?.requiresFatorR);

  if (hasAnnexVActivity && totalRevenue > 0) {
    const limiteFatorR = fiscalConfig.simples_nacional?.limite_fator_r ?? 0.28;
    if (fatorR_naoOtimizado < limiteFatorR) {
        const requiredAnnualPayroll = effectiveRbt12 * limiteFatorR;
        const currentAnnualPayroll = effectiveFp12;
        const additionalAnnualPayrollNeeded = Math.max(0, requiredAnnualPayroll - currentAnnualPayroll);
        
        if (additionalAnnualPayrollNeeded > 0) {
            const proLaboresCopy: ProLaboreForm[] = JSON.parse(JSON.stringify(proLabores));
            const additionalMonthlyProLaboreNeeded = additionalAnnualPayrollNeeded / 12;

            if (proLaboresCopy.length > 0) {
                let minValue = Infinity;
                let minCount = 0;
                proLaboresCopy.forEach(p => {
                    if (p.value < minValue) {
                        minValue = p.value;
                        minCount = 1;
                    } else if (p.value === minValue) {
                        minCount++;
                    }
                });
                const addPerPartner = additionalMonthlyProLaboreNeeded / Math.max(1, minCount);
                proLaboresCopy.forEach(p => {
                    if (p.value === minValue) p.value += addPerPartner;
                });
            }

            const optimizedValues = { ...values, proLabores: proLaboresCopy };
            simplesNacionalOtimizado = _calculateSimples2026(optimizedValues, false, limiteFatorR, proLaboresCopy);
            if (year >= 2027) {
                simplesNacionalOtimizadoHibrido = _calculateSimples2026(optimizedValues, true, limiteFatorR, proLaboresCopy);
            }
        }
    } else if (fatorR_naoOtimizado >= limiteFatorR) {
        simplesNacionalOtimizado = simplesNacionalTradicional ? {
            ...simplesNacionalTradicional,
            regime: 'Simples Nacional (Fator R Otimizado)',
            optimizationNote: `Fator R atual: ${formatPercent(fatorR_naoOtimizado)}. Já enquadrado no Anexo III.`,
        } : null;
        if (year >= 2027 && simplesNacionalHibrido) {
            simplesNacionalOtimizadoHibrido = {
                ...simplesNacionalHibrido,
                regime: 'Simples Nacional (Fator R Otimizado) Híbrido',
                optimizationNote: `Fator R atual: ${formatPercent(fatorR_naoOtimizado)}. Já enquadrado no Anexo III.`,
            };
        }
    }
  }

  const lucroPresumido = calculateLucroPresumido(values, false) as TaxDetails2026;
  const lucroPresumidoAtual = calculateLucroPresumido(values, true) as TaxDetails;

  let orderCounter = 0;
  const result: CalculationResults2026 = {
    simplesNacionalOtimizado: null,
    simplesNacionalOtimizadoHibrido: null,
    simplesNacionalTradicional: null,
    simplesNacionalHibrido: null,
    lucroPresumido: { ...lucroPresumido, order: 98 },
    lucroPresumidoAtual: { ...lucroPresumidoAtual, order: 99 },
  };

  if (simplesNacionalOtimizado) {
    result.simplesNacionalOtimizado = { ...simplesNacionalOtimizado, order: orderCounter++ };
  }
  if (simplesNacionalOtimizadoHibrido) {
    result.simplesNacionalOtimizadoHibrido = { ...simplesNacionalOtimizadoHibrido, order: orderCounter++ };
  }

  result.simplesNacionalTradicional = simplesNacionalTradicional ? { ...simplesNacionalTradicional, order: orderCounter++ } : null;

  if (simplesNacionalHibrido) {
    result.simplesNacionalHibrido = { ...simplesNacionalHibrido, order: orderCounter++ };
  }

  return result;
}
