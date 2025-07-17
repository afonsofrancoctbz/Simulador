

import { getFiscalParameters, type FiscalConfig } from '@/config/fiscal';
import {
  CNAE_DATA,
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
} from './constants';
import {
  type CalculationResults,
  type TaxFormValues,
  type TaxDetails,
  type CnaeData,
  type Annex,
  type FeeBracket,
  type ProLaboreInput,
  type ProLaboreOutput,
  type PartnerTaxDetails,
  type ProLaboreForm,
} from './types';
import { formatCurrencyBRL, formatPercent } from './utils';

const fiscalConfig2025 = getFiscalParameters(2025);

const ANNEX_TABLES = {
  I: fiscalConfig2025.simples_nacional.anexoI,
  II: fiscalConfig2025.simples_nacional.anexoII,
  III: fiscalConfig2025.simples_nacional.anexoIII,
  IV: fiscalConfig2025.simples_nacional.anexoIV,
  V: fiscalConfig2025.simples_nacional.anexoV,
};

// --- INTERNAL HELPERS ---

export function _findBracket(table: { max: number }[], value: number) {
  if (value === 0) {
    return table[0];
  }
  for (const bracket of table) {
    if (value <= bracket.max) {
      return bracket;
    }
  }
  return table[table.length - 1]; // Fallback for values over the max limit
}

export function _findFeeBracket(table: FeeBracket[], revenue: number): FeeBracket | undefined {
    return table.find(bracket => revenue >= bracket.min && revenue <= bracket.max);
}

function _findBracketIndex(table: { max: number }[], value: number): number {
    if (value === 0) {
      return 0;
    }
    for (let i = 0; i < table.length; i++) {
        if (value <= table[i].max) {
            return i;
        }
    }
    return table.length - 1; // Fallback for values over the max limit
}


export function getCnaeData(code: string): CnaeData | undefined {
  return CNAE_DATA.find(c => c.code === code);
}

export function calcularEncargosProLabore(input: ProLaboreInput): ProLaboreOutput {
  const { proLaboreBruto, otherContributionSalary = 0, configuracaoFiscal } = input;

  if (proLaboreBruto <= 0) {
    return {
      valorBruto: 0,
      baseCalculoINSS: 0,
      aliquotaEfetivaINSS: 0,
      valorINSSCalculado: 0,
      baseCalculoIRRF: 0,
      valorIRRFCalculado: 0,
      valorLiquido: 0,
    };
  }

  const tetoINSS = configuracaoFiscal.teto_inss;
  
  const remainingContributionRoom = Math.max(0, tetoINSS - otherContributionSalary);
  const baseCalculoINSS = Math.min(proLaboreBruto, remainingContributionRoom);
  
  const valorINSSCalculado = baseCalculoINSS * configuracaoFiscal.aliquota_inss_prolabore;
  
  const baseCalculoIRRF = proLaboreBruto - valorINSSCalculado;

  const irrfBracket = _findBracket(configuracaoFiscal.tabela_irrf, baseCalculoIRRF);
  const valorIRRFCalculado = Math.max(0, baseCalculoIRRF * irrfBracket.rate - irrfBracket.deduction);

  const valorLiquido = proLaboreBruto - valorINSSCalculado - valorIRRFCalculado;
  
  const aliquotaEfetivaINSS = proLaboreBruto > 0 ? valorINSSCalculado / proLaboreBruto : 0;

  return {
    valorBruto: proLaboreBruto,
    baseCalculoINSS,
    aliquotaEfetivaINSS,
    valorINSSCalculado,
    baseCalculoIRRF,
    valorIRRFCalculado,
    valorLiquido,
  };
}

export function _calculatePartnerTaxes(proLabores: ProLaboreForm[], config: FiscalConfig): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
    const partnerTaxes: PartnerTaxDetails[] = [];
    let totalINSSRetido = 0;
    let totalIRRFRetido = 0;

    for (const proLabore of proLabores) {
        const proLaboreTaxesPerPartner = calcularEncargosProLabore({
            proLaboreBruto: proLabore.value,
            otherContributionSalary: proLabore.hasOtherInssContribution ? proLabore.otherContributionSalary : 0,
            configuracaoFiscal: config,
        });
        
        partnerTaxes.push({
            proLaboreBruto: proLaboreTaxesPerPartner.valorBruto,
            inss: proLaboreTaxesPerPartner.valorINSSCalculado,
            irrf: proLaboreTaxesPerPartner.valorIRRFCalculado,
            proLaboreLiquido: proLaboreTaxesPerPartner.valorLiquido,
        });
        totalINSSRetido += proLaboreTaxesPerPartner.valorINSSCalculado;
        totalIRRFRetido += proLaboreTaxesPerPartner.valorIRRFCalculado;
    }

    return { partnerTaxes, totalINSSRetido, totalIRRFRetido };
}


function _calculateSimplesNacional(values: TaxFormValues, totalProLaboreBruto: number, monthlyPayroll: number): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, proLabores, rbt12, fp12, selectedPlan, selectedCnaes } = values;

  // --- 1. Revenue Calculation ---
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenue;

  // --- 2. Pro-labore Taxes (per partner, then aggregated) ---
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);
  
  const allCnaesData = selectedCnaes
      .map(code => getCnaeData(code))
      .filter((c): c is CnaeData => !!c);

  const hasAnnexIV = allCnaesData.some(c => c.annex === 'IV');
  
  // --- 3. RBT12, FP12, and Fator R Calculation ---
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  
  const monthlyPayrollForFatorR = values.totalSalaryExpense + totalProLaboreBruto;
  // According to legislation, FP12 for Fator R does NOT include INSS Patronal (CPP) or FGTS.
  const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayrollForFatorR * 12;

  const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;

  // --- 4. Calculate CPP for Anexo IV (if applicable) ---
  let cppFromAnnexIV = 0;
  if (hasAnnexIV && monthlyPayroll > 0) {
    const cppRate = fiscalConfig2025.aliquotas_cpp_patronal.base;
    cppFromAnnexIV = monthlyPayroll * cppRate;
  }

  // --- Guard Clause for Zero Revenue and Payroll ---
  if (totalRevenue === 0 && effectiveRbt12 === 0 && monthlyPayroll === 0) {
    const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    return {
      regime: 'Simples Nacional',
      totalTax: 0,
      totalMonthlyCost: fee,
      totalRevenue: 0,
      proLabore: 0,
      effectiveRate: 0,
      contabilizeiFee: fee,
      breakdown: [],
      partnerTaxes: [],
      annex: 'N/A',
      netProfit: -fee,
    };
  }
  
  // --- Guard Clause for Zero Revenue with Payroll (Anexo IV case) ---
  if (totalRevenue === 0 && effectiveRbt12 === 0 && monthlyPayroll > 0) {
    const companyTaxes = cppFromAnnexIV;
    const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
    const totalTax = companyTaxes + totalWithheldTaxes;
    const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        ...(cppFromAnnexIV > 0 ? [{ name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)})`, value: cppFromAnnexIV }] : []),
        ...(totalINSSRetido > 0 ? [{ name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido }] : []),
        ...(totalIRRFRetido > 0 ? [{ name: "IRRF s/ Pró-labore", value: totalIRRFRetido }] : []),
    ];

    const uniqueAnnexes = [...new Set(allCnaesData.map(c => c.annex))];
    let annexLabel;
    if (uniqueAnnexes.length === 1) {
        annexLabel = `Anexo ${uniqueAnnexes[0]}`;
    } else if (uniqueAnnexes.length > 1) {
        annexLabel = 'Múltiplos Anexos';
    } else {
        annexLabel = 'Padrão'; 
    }
    
    const companyCosts = companyTaxes + totalProLaboreBruto + fee;
    const netProfit = totalRevenue - companyCosts;

    return {
      regime: `Simples Nacional`,
      annex: annexLabel,
      totalTax,
      totalMonthlyCost,
      totalRevenue: 0,
      proLabore: totalProLaboreBruto,
      effectiveRate: 0,
      contabilizeiFee: fee,
      breakdown: breakdown.filter(item => item.value > 0),
      partnerTaxes,
      netProfit,
    };
  }
  
  const notes: string[] = [];
  const municipalISSRate = fiscalConfig2025.aliquota_iss_padrao;

  if (exportRevenue > 0) {
    notes.push("Receitas de exportação têm isenção de PIS, COFINS e ISS, resultando em uma alíquota efetiva menor.");
  }
  
  const allDomesticActivities = domesticActivities.map(a => ({ ...a, type: 'domestic' as const }));
  const allExportActivitiesWithBRL = exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }));
  const allActivities = [...allDomesticActivities, ...allExportActivitiesWithBRL];
  
  const SUBLIMIT_SIMPLES = 3600000;
  const rbt12ExceededSublimit = effectiveRbt12 > SUBLIMIT_SIMPLES;

  // --- Annex Determination (Fator R) ---
  const hasAnnexVActivity = allCnaesData.some(a => a.requiresFatorR);
  
  const useAnnexIIIForV = hasAnnexVActivity && fatorR >= 0.28;
  
  if (hasAnnexVActivity && totalRevenue > 0) {
    notes.push(`Seu "Fator R" é de ${formatPercent(fatorR)}. ${useAnnexIIIForV ? 'Suas atividades do Anexo V são tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V são tributadas pelas alíquotas do Anexo V.'}`);
  }

  if (hasAnnexIV) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)}) sobre a folha de pagamento, fora do DAS.`);
  }

  // --- Group Revenue & Calculate DAS ---
  const revenueByAnnex = allActivities.reduce((acc, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return acc;
    let effectiveAnnex: Annex = cnaeInfo.annex;
    if (cnaeInfo.requiresFatorR) {
      effectiveAnnex = useAnnexIIIForV ? 'III' : 'V';
    }
    if (!acc[effectiveAnnex]) acc[effectiveAnnex] = { domestic: 0, export: 0 };
    if (activity.type === 'domestic') acc[effectiveAnnex].domestic += activity.revenue;
    else acc[effectiveAnnex].export += activity.revenue;
    return acc;
  }, {} as Record<Annex, { domestic: number; export: number }>);
  
  let totalDas = 0;
  let totalIssSeparado = 0;
  
  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    const bracketIndex = _findBracketIndex(annexTable, effectiveRbt12);
    const bracket = annexTable[bracketIndex];
    const effectiveRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12) : bracket.rate;
    
    const { PIS = 0, COFINS = 0, ISS = 0 } = bracket.distribution;
    const isLastBracket = bracketIndex === annexTable.length - 1;

    // --- DAS on Domestic Revenue ---
    let dasForDomestic = annexInfo.domestic * effectiveRate;
    if ((rbt12ExceededSublimit || (isLastBracket && ['III', 'IV', 'V'].includes(annex))) && annexInfo.domestic > 0) {
        totalIssSeparado += annexInfo.domestic * municipalISSRate;
        dasForDomestic -= annexInfo.domestic * (effectiveRate * ISS);
        if (rbt12ExceededSublimit && !notes.some(n => n.includes('sublimite'))) {
            notes.push(`Como o faturamento anual ultrapassou o sublimite de ${formatCurrencyBRL(SUBLIMIT_SIMPLES)}, o ISS é recolhido fora do DAS.`);
        } else if (isLastBracket && !rbt12ExceededSublimit && !notes.some(n => n.includes('Na última faixa'))) {
            notes.push(`Na última faixa do Anexo ${annex}, o ISS é recolhido à parte.`);
        }
    }
    
    let dasForExport = annexInfo.export * effectiveRate;
    const exportExemptionValue = annexInfo.export * effectiveRate * (PIS + COFINS + ISS);
    dasForExport -= exportExemptionValue;
    
    totalDas += dasForDomestic + dasForExport;
  }

  // --- 5. Assemble Final Results ---
  const companyTaxes = totalDas + cppFromAnnexIV + totalIssSeparado;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
  const totalTax = companyTaxes + totalWithheldTaxes;
  
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];

  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  let mainAnnexLabel: string;
  let regimeName: string;
  let optimizationNote: string | undefined = undefined;

  const annexKeys = Object.keys(revenueByAnnex) as Annex[];
  if (annexKeys.length === 1) {
    mainAnnexLabel = `Anexo ${annexKeys[0]}`;
  } else if (annexKeys.length > 1) {
    mainAnnexLabel = `Múltiplos Anexos (${annexKeys.join(', ')})`;
  } else {
    const uniqueAnnexesFromCnaes = [...new Set(allCnaesData.map(c => c.annex))];
    mainAnnexLabel = uniqueAnnexesFromCnaes.length > 0 
      ? `Anexo ${uniqueAnnexesFromCnaes.join('/')}`
      : 'Padrão';
  }

  if (useAnnexIIIForV) {
      regimeName = "Simples Nacional - Anexo III (Com Fator R)";
      mainAnnexLabel = "Anexo III";
  } else if (hasAnnexVActivity) {
      regimeName = "Simples Nacional - Anexo V";
      mainAnnexLabel = "Anexo V";
  } else {
      regimeName = `Simples Nacional`;
  }

  const breakdown = [
    { name: `DAS (${formatPercent(totalRevenue > 0 ? totalDas / totalRevenue : 0)})`, value: totalDas },
    { name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)})`, value: cppFromAnnexIV },
    { name: `ISS (Fora do DAS)`, value: totalIssSeparado },
    { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
  ];

  const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;
  
  const companyCosts = companyTaxes + totalProLaboreBruto + contabilizeiFee;
  const netProfit = totalRevenue - companyCosts;

  return {
    regime: regimeName,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: totalProLaboreBruto,
    fatorR: hasAnnexVActivity ? fatorR : undefined,
    annex: mainAnnexLabel,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    effectiveDasRate,
    contabilizeiFee: contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0.001), 
    notes,
    partnerTaxes,
    optimizationNote: optimizationNote,
    netProfit,
  };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan } = values;
  const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
  
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);

  const totalPayroll = totalSalaryExpense + totalProLaboreBruto;
  const inssPatronal = totalPayroll > 0 ? totalPayroll * fiscalConfig2025.aliquotas_cpp_patronal.base : 0;

  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
  const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

  if (totalRevenue === 0) {
      const companyPayrollTaxes = inssPatronal;
      const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
      const totalTax = companyPayrollTaxes + totalWithheldTaxes;
      const totalMonthlyCost = totalTax + contabilizeiFee;
      const breakdown = [
        ...(inssPatronal > 0 ? [{ name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)})`, value: inssPatronal }] : []),
        ...(totalINSSRetido > 0 ? [{ name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido }] : []),
        ...(totalIRRFRetido > 0 ? [{ name: "IRRF s/ Pró-labore", value: totalIRRFRetido }] : []),
      ];
      const companyCosts = companyPayrollTaxes + totalProLaboreBruto + contabilizeiFee;
      const netProfit = totalRevenue - companyCosts;

      return {
          regime: 'Lucro Presumido',
          totalTax, totalMonthlyCost, totalRevenue: 0,
          proLabore: totalProLaboreBruto, effectiveRate: 0,
          contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001),
          partnerTaxes, netProfit,
      };
  }

  const notes: string[] = [];
  if (exportRevenueBRL > 0) notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS. No Lucro Presumido, também são isentas de IRPJ e CSLL.");
  if (totalPayroll > 0) notes.push(`No Lucro Presumido, a empresa paga o INSS Patronal (CPP de ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)}) sobre a folha de pagamento.`);
  
  const domesticActivitiesWithProfitRate = domesticActivities.map(activity => ({
    revenue: activity.revenue,
    profitRate: getCnaeData(activity.code)?.presumedProfitRate ?? 0.32,
  }));

  // Presumed profit base considers only domestic revenue for IRPJ and CSLL due to export exemption.
  let presumedProfitBase = domesticActivitiesWithProfitRate.reduce((sum, activity) => {
    return sum + (activity.revenue * activity.profitRate);
  }, 0);
  
  const IRPJ_ADDITIONAL_THRESHOLD = 20000 * 3; // Trimestral
  const quarterlyPresumedProfit = presumedProfitBase * 3;
  let irpj = (presumedProfitBase * 0.15) + (Math.max(0, quarterlyPresumedProfit - IRPJ_ADDITIONAL_THRESHOLD) / 3 * 0.10);
  
  const csll = presumedProfitBase * 0.09;
  const pis = domesticRevenue * 0.0065; 
  const cofins = domesticRevenue * 0.03; 
  const iss = domesticRevenue * fiscalConfig2025.aliquota_iss_padrao; 

  const companyRevenueTaxes = irpj + csll + pis + cofins + iss;
  const companyPayrollTaxes = inssPatronal;
  const totalCompanyTaxes = companyRevenueTaxes + companyPayrollTaxes;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
  const totalTax = totalCompanyTaxes + totalWithheldTaxes;
  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  const companyCosts = totalCompanyTaxes + totalProLaboreBruto + contabilizeiFee;
  const netProfit = totalRevenue - companyCosts;

  const breakdown = [
    { name: `PIS (${formatPercent(0.0065)})`, value: pis }, { name: `COFINS (${formatPercent(0.03)})`, value: cofins },
    { name: `ISS (${formatPercent(fiscalConfig2025.aliquota_iss_padrao)})`, value: iss }, { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll }, { name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)})`, value: inssPatronal },
    { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
    { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
  ];

  return {
    regime: 'Lucro Presumido',
    totalTax, totalMonthlyCost, totalRevenue, proLabore: totalProLaboreBruto,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001),
    notes, partnerTaxes, netProfit,
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const totalProLaboreBruto = values.proLabores.reduce((acc, p) => acc + p.value, 0);
  const monthlyPayroll = values.totalSalaryExpense + totalProLaboreBruto;

  const lucroPresumido = calculateLucroPresumido(values);
  const simplesNacionalBase = _calculateSimplesNacional(values, totalProLaboreBruto, monthlyPayroll);

  let simplesNacionalOtimizado: TaxDetails | null = null;
  
  const allCnaesData = values.selectedCnaes.map(code => getCnaeData(code)).filter((c): c is CnaeData => !!c);
  const hasAnnexVActivity = allCnaesData.some(c => c.requiresFatorR);
  
  const fatorRBase = simplesNacionalBase.fatorR;
  
  if (hasAnnexVActivity && fatorRBase !== undefined && fatorRBase < 0.28) {
      const totalRevenue = simplesNacionalBase.totalRevenue;
      if (totalRevenue > 0) {
          const requiredPayrollForFatorR = totalRevenue * 0.28;
          let requiredTotalProLabore = requiredPayrollForFatorR - values.totalSalaryExpense;
          const minProLaboreTotal = fiscalConfig2025.salario_minimo * values.numberOfPartners;

          if (requiredTotalProLabore < minProLaboreTotal) {
            requiredTotalProLabore = minProLaboreTotal;
          }

          if (requiredTotalProLabore > totalProLaboreBruto) {
              const optimizedProLaborePerPartner = requiredTotalProLabore / values.numberOfPartners;
              
              const optimizedProLabores = values.proLabores.map(p => ({
                ...p,
                value: optimizedProLaborePerPartner
              }));

              const optimizedValues: TaxFormValues = { ...values, proLabores: optimizedProLabores };
              
              const optimizedMonthlyPayrollFull = values.totalSalaryExpense + requiredTotalProLabore;

              const rbt12 = values.rbt12 > 0 ? values.rbt12 : totalRevenue * 12;
              
              // Recalculate FP12 for optimized scenario, using same logic as base scenario
              const fp12Otimizado = values.fp12 > 0 
                  ? (values.fp12 - totalProLaboreBruto * 12 + requiredTotalProLabore * 12)
                  : (values.totalSalaryExpense + requiredTotalProLabore) * 12;

              simplesNacionalOtimizado = _calculateSimplesNacional(
                { ...optimizedValues, fp12: fp12Otimizado, rbt12 }, 
                requiredTotalProLabore, 
                optimizedMonthlyPayrollFull
              );
          }
      }
  }
  
  const scenarios = [simplesNacionalBase, simplesNacionalOtimizado, lucroPresumido].filter(Boolean) as TaxDetails[];
  
  let order = 1;
  const orderedScenarios = scenarios.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);
  for(const s of orderedScenarios) {
      if (s.regime === simplesNacionalBase.regime) simplesNacionalBase.order = order++;
      if (simplesNacionalOtimizado && s.regime === simplesNacionalOtimizado.regime) simplesNacionalOtimizado.order = order++;
      if (s.regime === lucroPresumido.regime) lucroPresumido.order = order++;
  }


  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}
