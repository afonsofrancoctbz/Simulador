
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
  const { domesticActivities, exportActivities, exchangeRate, proLabores, rbt12, selectedPlan, selectedCnaes, fp12 } = values;

  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenue;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);
  
  const allCnaesData = selectedCnaes
      .map(code => getCnaeData(code))
      .filter((c): c is CnaeData => !!c);

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
  
  let fatorR = 0;
  if (totalRevenue > 0) {
      fatorR = monthlyPayroll / totalRevenue;
  } else if (effectiveRbt12 > 0) {
      fatorR = effectiveFp12 / effectiveRbt12;
  }

  const hasAnnexVActivity = allCnaesData.some(a => a.requiresFatorR);
  const useAnnexIIIForV = hasAnnexVActivity && fatorR >= 0.28;
  
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
  
  const revenueByEffectiveAnnex = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))].reduce((acc, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return acc;
    let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= 0.28) ? 'III' : cnaeInfo.annex;
    if (!acc[effectiveAnnex]) acc[effectiveAnnex] = 0;
    acc[effectiveAnnex] += activity.revenue;
    return acc;
  }, {} as Record<Annex, number>);

  const hasAnexoIV = 'IV' in revenueByEffectiveAnnex;
  const cppFromAnnexIV = hasAnexoIV ? monthlyPayroll * fiscalConfig2025.aliquotas_cpp_patronal.base : 0;
  
  if (totalRevenue === 0) {
      const totalTax = cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
      const totalMonthlyCost = totalTax + contabilizeiFee;
      return {
          regime: 'Simples Nacional', totalTax, totalMonthlyCost, totalRevenue,
          proLabore: totalProLaboreBruto, effectiveRate: 0, contabilizeiFee,
          breakdown: [
              { name: `CPP (INSS Patronal - 20,00%)`, value: cppFromAnnexIV },
              { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
              { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido }
          ].filter(i => i.value > 0.001),
          partnerTaxes, netProfit: -totalMonthlyCost, annex: hasAnexoIV ? 'Anexo IV' : 'N/A'
      };
  }
  
  const notes: string[] = [];
  
  let totalDas = 0;

  if (hasAnexoIV && cppFromAnnexIV > 0) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
  }

  const revenueByAnnexWithTypes = [...domesticActivities, ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }))]
  .reduce((acc, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return acc;
    let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= 0.28) ? 'III' : cnaeInfo.annex;
    if (!acc[effectiveAnnex]) acc[effectiveAnnex] = { domestic: 0, export: 0 };
    if ('type' in activity && activity.type === 'export') {
      acc[effectiveAnnex].export += activity.revenue;
    } else {
      acc[effectiveAnnex].domestic += activity.revenue;
    }
    return acc;
  }, {} as Record<Annex, { domestic: number; export: number }>);

  
  for (const annexStr in revenueByAnnexWithTypes) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnexWithTypes[annex];
    const annexTable = ANNEX_TABLES[annex];
    const bracket = _findBracket(annexTable, effectiveRbt12);
    
    const effectiveRate = effectiveRbt12 > 0 ? (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12 : bracket.rate;
    
    if (annexInfo.domestic > 0) {
      totalDas += annexInfo.domestic * effectiveRate;
    }
    
    if (annexInfo.export > 0) {
      const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
      const exportExemptionFactor = PIS + COFINS + ISS + IPI + ICMS;
      const exportDasRate = effectiveRate * (1 - exportExemptionFactor);
      totalDas += annexInfo.export * exportDasRate;
       if (!notes.some(n => n.includes('exportação'))) {
         notes.push("Receitas de exportação têm isenção de PIS, COFINS, ISS, IPI e ICMS no Simples Nacional.");
       }
    }
  }

  const companyTaxes = totalDas + cppFromAnnexIV;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
  const totalTax = companyTaxes + totalWithheldTaxes;
  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  let regimeName = "Simples Nacional";
  let annexLabel = "";

  const finalAnnexes = Object.keys(revenueByEffectiveAnnex) as Annex[];
  if (useAnnexIIIForV) {
    regimeName = "Simples Nacional Anexo III";
    annexLabel = "Com Fator R";
  } else if (hasAnnexVActivity) {
    regimeName = "Simples Nacional Anexo V";
    annexLabel = "Sem Fator R";
  } else if (finalAnnexes.length === 1) {
    annexLabel = `Anexo ${finalAnnexes[0]}`;
  } else if (finalAnnexes.length > 1) {
    annexLabel = `Anexos (${finalAnnexes.join(', ')})`;
  }

  const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;
  
  const breakdown = [
    { name: `DAS (${formatPercent(effectiveDasRate)})`, value: totalDas },
    { name: `CPP (INSS Patronal - 20,00%)`, value: cppFromAnnexIV },
    { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
  ];

  const netProfit = totalRevenue - totalMonthlyCost;

  return {
    regime: regimeName, totalTax, totalMonthlyCost, totalRevenue,
    proLabore: totalProLaboreBruto, fatorR: hasAnnexVActivity ? fatorR : undefined,
    annex: annexLabel, effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    effectiveDasRate, contabilizeiFee, breakdown: breakdown.filter(item => item.value > 0.001), 
    notes, partnerTaxes, netProfit,
  };
}

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
  
  // CPP is always due for services in Lucro Presumido
  const cpp = monthlyPayroll * fiscalConfig2025.aliquotas_cpp_patronal.base;
  
  if (totalRevenue === 0) {
      const totalTax = totalINSSRetido + totalIRRFRetido + cpp;
      const totalMonthlyCost = totalTax + contabilizeiFee;
      return {
          regime: 'Lucro Presumido', totalTax, totalMonthlyCost, totalRevenue: 0,
          proLabore: totalProLaboreBruto, effectiveRate: 0, contabilizeiFee, 
          breakdown: [
              { name: `CPP (INSS Patronal - 20,00%)`, value: cpp },
              { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
              { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
          ].filter(item => item.value > 0.001),
          partnerTaxes, netProfit: -totalMonthlyCost,
      };
  }

  const notes: string[] = [];
  if (exportRevenueBRL > 0) notes.push("Receitas de exportação de serviços são isentas de PIS, COFINS e ISS.");
  
  const pis = domesticRevenue * 0.0065; 
  const cofins = domesticRevenue * 0.03; 
  const iss = domesticRevenue * fiscalConfig2025.aliquota_iss_padrao; 

  const allActivities = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))];
  const presumedProfitBase = allActivities.reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
  }, 0);
  
  const irpjBase = presumedProfitBase;
  const irpj = irpjBase * 0.15;
  const additionalIrpj = Math.max(0, (irpjBase/3) - 20000) * 3 * 0.10;
  const csll = presumedProfitBase * 0.09;
  
  const companyRevenueTaxes = irpj + additionalIrpj + csll + pis + cofins + iss;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;

  const totalTax = companyRevenueTaxes + cpp + totalWithheldTaxes;
  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  const netProfit = totalRevenue - totalMonthlyCost;

  const breakdown = [
    { name: `IRPJ (${formatPercent((irpj + additionalIrpj) / totalRevenue)})`, value: irpj + additionalIrpj },
    { name: `CSLL (${formatPercent(csll / totalRevenue)})`, value: csll },
    { name: `PIS (${formatPercent(pis / totalRevenue)})`, value: pis },
    { name: `COFINS (${formatPercent(cofins / totalRevenue)})`, value: cofins },
    { name: `ISS (${formatPercent(iss / totalRevenue)})`, value: iss },
    { name: `CPP (INSS Patronal - 20,00%)`, value: cpp },
    { name: `INSS s/ Pró-labore (${formatPercent(fiscalConfig2025.aliquota_inss_prolabore)})`, value: totalINSSRetido },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
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

              simplesNacionalOtimizado = _calculateSimplesNacional(
                optimizedValues, 
                requiredTotalProLabore, 
                optimizedMonthlyPayrollFull
              );
              if (simplesNacionalOtimizado) {
                 simplesNacionalOtimizado.regime = "Simples Nacional Anexo III";
                 simplesNacionalOtimizado.annex = "Com Fator R";
                 simplesNacionalOtimizado.optimizationNote = `Pró-labore ajustado para ${formatCurrencyBRL(requiredTotalProLabore)} para otimizar o Fator R.`
              }
          }
      }
  }
  
  const scenarios = [simplesNacionalBase, simplesNacionalOtimizado, lucroPresumido].filter(Boolean) as TaxDetails[];
  
  let order = 1;
  const orderedScenarios = [...scenarios].sort((a, b) => {
    if (a.regime.includes('Anexo V')) return 1;
    if (b.regime.includes('Anexo V')) return -1;
    if (a.regime.includes('Anexo III')) return -1;
    if (b.regime.includes('Anexo III')) return 1;
    return 0;
  });

  for(const s of orderedScenarios) {
      s.order = order++;
  }

  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}
