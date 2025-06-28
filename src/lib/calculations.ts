import {
  IRRF_TABLE,
  SIMPLIFIED_DEDUCTION_IRRF,
  PRO_LABORE_INSS_RATE,
  INSS_CEILING,
  SIMPLES_NACIONAL_ANNEX_I,
  SIMPLES_NACIONAL_ANNEX_II,
  SIMPLES_NACIONAL_ANNEX_III,
  SIMPLES_NACIONAL_ANNEX_IV,
  SIMPLES_NACIONAL_ANNEX_V,
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
} from './types';

const ANNEX_TABLES = {
  I: SIMPLES_NACIONAL_ANNEX_I,
  II: SIMPLES_NACIONAL_ANNEX_II,
  III: SIMPLES_NACIONAL_ANNEX_III,
  IV: SIMPLES_NACIONAL_ANNEX_IV,
  V: SIMPLES_NACIONAL_ANNEX_V,
};

const formatCurrencyBRL = (value: number) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

function findBracket(table: { max: number }[], value: number) {
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

function findFeeBracket(table: FeeBracket[], revenue: number): FeeBracket | undefined {
    return table.find(bracket => revenue >= bracket.min && revenue <= bracket.max);
}

function findBracketIndex(table: { max: number }[], value: number): number {
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


function getCnaeData(code: string): CnaeData | undefined {
  return CNAE_DATA.find(c => c.code === code);
}

function calculateProLaboreTaxes(proLabore: number, healthPlanCost: number = 0) {
  // 1. Calculate INSS on pro-labore (this is a tax, not just a deduction for IRRF)
  const inssOnProLabore = Math.min(proLabore, INSS_CEILING) * PRO_LABORE_INSS_RATE;

  // 2. Calculate IRRF
  // The IRRF base includes the health plan cost paid by the company.
  const irrfBase = proLabore + healthPlanCost;

  // The law allows choosing between standard deductions (like INSS) and a simplified deduction.
  // We should choose the option that results in the lowest tax, which means choosing the largest deduction.
  const applicableDeduction = Math.max(inssOnProLabore, SIMPLIFIED_DEDUCTION_IRRF);
  
  const irrfCalculationBase = irrfBase - applicableDeduction;

  const irrfBracket = findBracket(IRRF_TABLE, irrfCalculationBase);
  // Ensure IRRF is not negative
  const irrf = Math.max(0, irrfCalculationBase * irrfBracket.rate - irrfBracket.deduction);

  return { inssOnProLabore, irrf };
}

function _calculateSimplesNacional(values: TaxFormValues, proLabore: number, regimeName: string): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, numberOfPartners, municipalISSRate, healthPlanCost = 0 } = values;

  const notes: string[] = [];

  const allActivities = [
    ...domesticActivities.map(a => ({ ...a, type: 'domestic' as const })),
    ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const })),
  ];
  
  const hasExportRevenue = allActivities.some(act => act.type === 'export' && act.revenue > 0);

  if (allActivities.length === 0 && proLabore === 0 && totalSalaryExpense === 0) {
    return {
      regime: regimeName,
      totalTax: 0,
      totalMonthlyCost: 0,
      contabilizeiFee: 0,
      breakdown: [],
      notes: ["Nenhuma informação de faturamento ou despesa foi adicionada."],
      totalRevenue: 0,
      proLabore: 0,
      effectiveRate: 0,
    };
  }

  const totalRevenue = allActivities.reduce((sum, act) => sum + act.revenue, 0);
  const rbt12 = totalRevenue * 12;

  const revenueAnnexV = allActivities
    .filter(a => getCnaeData(a.code)?.requiresFatorR)
    .reduce((sum, act) => sum + act.revenue, 0);
  
  const totalPayroll = totalSalaryExpense + proLabore;
  const fatorR = totalRevenue > 0 ? totalPayroll / totalRevenue : 0;
  const isFatorRApplicable = revenueAnnexV > 0;
  let effectiveAnnexForV: Annex = 'V';
  
  if (isFatorRApplicable) {
    const useAnnexIIIForV = fatorR >= 0.28;
    effectiveAnnexForV = useAnnexIIIForV ? 'III' : 'V';
    
    notes.push(`Seu "Fator R" é de ${(fatorR * 100).toFixed(2)}%. ${useAnnexIIIForV ? 'Suas atividades do Anexo V serão tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V serão tributadas pelas alíquotas do Anexo V.'}`);
    if (!useAnnexIIIForV && regimeName.includes('Sem Fator R')) { // Add suggestion only for the non-optimized scenario
        const requiredPayroll = totalRevenue * 0.28;
        const payrollShortfall = requiredPayroll - totalPayroll;
        if (payrollShortfall > 0) {
            notes.push(`SUGESTÃO: Para se beneficiar das alíquotas do Anexo III, você pode aumentar seu pró-labore ou folha de pagamento em ${formatCurrencyBRL(payrollShortfall)}.`);
        }
    }
  }

  if (hasExportRevenue) {
    notes.push("Receitas de exportação têm isenção de PIS, COFINS e ISS, resultando em uma alíquota efetiva menor.");
  }

  const revenueByAnnex = allActivities.reduce((acc, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return acc;

    let effectiveAnnex: Annex = cnaeInfo.annex;
    if (cnaeInfo.annex === 'V' && isFatorRApplicable) {
      effectiveAnnex = effectiveAnnexForV;
    }
    
    if (!acc[effectiveAnnex]) {
      acc[effectiveAnnex] = { domestic: 0, export: 0 };
    }

    if (activity.type === 'domestic') {
      acc[effectiveAnnex].domestic += activity.revenue;
    } else {
      acc[effectiveAnnex].export += activity.revenue;
    }
    
    return acc;
  }, {} as Record<Annex, { domestic: number; export: number }>);
  
  const dasBreakdownByAnnex: { name: string; value: number }[] = [];
  let totalDas = 0;
  let cppFromAnnexIV = 0;
  let totalIssSeparado = 0;
  let mainAnnex: Annex | undefined;
  if(Object.keys(revenueByAnnex).length > 0) {
    mainAnnex = Object.keys(revenueByAnnex).reduce((a, b) => revenueByAnnex[a as Annex].domestic + revenueByAnnex[a as Annex].export > revenueByAnnex[b as Annex].domestic + revenueByAnnex[b as Annex].export ? a : b) as Annex;
  }
  

  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    
    const bracketIndex = findBracketIndex(annexTable, rbt12);
    const bracket = annexTable[bracketIndex];
    
    const effectiveRate = totalRevenue > 0 ? ((rbt12 * bracket.rate - bracket.deduction) / rbt12) : 0;
    
    let annexDas = 0;
    annexDas += annexInfo.domestic * effectiveRate;

    const { PIS = 0, COFINS = 0, ISS = 0, IPI = 0, ICMS = 0 } = bracket.distribution;
    const exportExemptionRate = PIS + COFINS + (ISS ?? 0) + (IPI ?? 0) + (ICMS ?? 0);
    const effectiveRateForExport = Math.max(0, effectiveRate * (1 - exportExemptionRate));
    annexDas += annexInfo.export * effectiveRateForExport;

    if (annexDas > 0) {
        dasBreakdownByAnnex.push({ name: `DAS (Anexo ${annex})`, value: annexDas });
    }
    totalDas += annexDas;

    if (annex === 'IV') {
        const cppRate = 0.20 + 0.03 + 0.058;
        cppFromAnnexIV += (totalPayroll) * cppRate;
        notes.push("Anexo IV paga a CPP (28.8%) fora do DAS, sobre a folha de pagamento.");
    }
     if (bracketIndex === annexTable.length - 1) {
      if (['III', 'IV', 'V'].includes(annex) && annexInfo.domestic > 0) {
        const issSeparado = annexInfo.domestic * (municipalISSRate / 100);
        totalIssSeparado += issSeparado;
        notes.push(`Na última faixa do Anexo ${annex}, o ISS (${municipalISSRate}%) é recolhido à parte.`);
      }
    }
  }

  const proLaborePerPartner = numberOfPartners > 0 ? proLabore / numberOfPartners : 0;
  const healthPlanCostPerPartner = numberOfPartners > 0 ? healthPlanCost / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calculateProLaboreTaxes(proLaborePerPartner, healthPlanCostPerPartner);
  const totalProLaboreTaxes = {
    inssOnProLabore: proLaboreTaxesPerPartner.inssOnProLabore * numberOfPartners,
    irrf: proLaboreTaxesPerPartner.irrf * numberOfPartners
  };

  const totalTax = totalDas + cppFromAnnexIV + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf + totalIssSeparado;
  const totalMonthlyCost = totalTax + totalSalaryExpense + proLabore + healthPlanCost;

  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const contabilizeiFee = feeBracket?.plans.expertsEssencial ?? 0;

  const breakdown = [
    { name: "DAS", value: totalDas },
    ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Anexo IV)", value: cppFromAnnexIV }] : []),
    ...(totalIssSeparado > 0 ? [{ name: "ISS (À parte)", value: totalIssSeparado }] : []),
    { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: regimeName,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore,
    fatorR: isFatorRApplicable ? fatorR : undefined,
    annex: mainAnnex ? `Anexo ${mainAnnex}`: undefined,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
  };
}


function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners, numberOfPartners, municipalISSRate, healthPlanCost = 0 } = values;

  const notes: string[] = [];
  const hasExportRevenue = exportActivities.some(act => act.revenue > 0);
  if (hasExportRevenue) {
    notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS no Lucro Presumido.");
  }

  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  
  const allActivities = [ ...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate})) ];
  
  if (allActivities.length === 0 && proLaborePartners === 0 && totalSalaryExpense === 0) {
    return {
      regime: 'Lucro Presumido',
      totalTax: 0,
      totalMonthlyCost: 0,
      contabilizeiFee: 0,
      breakdown: [],
      notes: ["Nenhuma informação de faturamento ou despesa foi adicionada."],
      totalRevenue: 0,
      proLabore: 0,
      effectiveRate: 0,
    };
  }

  let presumedProfitBase = 0;
  allActivities.forEach(activity => {
      const cnaeInfo = getCnaeData(activity.code);
      if (cnaeInfo) {
          presumedProfitBase += activity.revenue * cnaeInfo.presumedProfitRate;
      }
  });

  const IRPJ_RATE = 0.15;
  const IRPJ_ADDITIONAL_RATE = 0.10;
  const IRPJ_ADDITIONAL_THRESHOLD = 20000;
  let irpj = presumedProfitBase * IRPJ_RATE;
  if (presumedProfitBase > IRPJ_ADDITIONAL_THRESHOLD) {
    irpj += (presumedProfitBase - IRPJ_ADDITIONAL_THRESHOLD) * IRPJ_ADDITIONAL_RATE;
  }

  const CSLL_RATE = 0.09;
  const csll = presumedProfitBase * CSLL_RATE;

  const PIS_RATE = 0.0065;
  const COFINS_RATE = 0.03;
  const pis = domesticRevenue * PIS_RATE;
  const cofins = domesticRevenue * COFINS_RATE;

  const iss = domesticRevenue * (municipalISSRate / 100);

  const INSS_PATRONAL_RATE = 0.20;
  const RAT_RATE = 0.03; // Assumed 3%
  const TERCEIROS_RATE = 0.058; // Assumed 5.8%
  const totalPayroll = totalSalaryExpense + proLaborePartners;
  const inssPatronal = totalPayroll * (INSS_PATRONAL_RATE + RAT_RATE + TERCEIROS_RATE);
  
  if (totalPayroll > 0) {
    notes.push("A CPP (28.8%) incide sobre o total da folha de pagamento (salários + pró-labore).");
  }

  const proLaborePerPartner = numberOfPartners > 0 ? proLaborePartners / numberOfPartners : 0;
  const healthPlanCostPerPartner = numberOfPartners > 0 ? healthPlanCost / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calculateProLaboreTaxes(proLaborePerPartner, healthPlanCostPerPartner);
  const totalProLaboreTaxes = {
    inssOnProLabore: proLaboreTaxesPerPartner.inssOnProLabore * numberOfPartners,
    irrf: proLaboreTaxesPerPartner.irrf * numberOfPartners
  };


  const totalTax = irpj + csll + pis + cofins + iss + inssPatronal + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
  const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners + healthPlanCost;

  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
  const contabilizeiFee = feeBracket?.plans.expertsEssencial ?? 0;

  const breakdown = [
    { name: "PIS", value: pis, rate: PIS_RATE },
    { name: "COFINS", value: cofins, rate: COFINS_RATE },
    { name: "ISS", value: iss, rate: municipalISSRate / 100 },
    { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll },
    { name: "INSS Patronal", value: inssPatronal },
    { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: proLaborePartners,
    effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
    contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const lucroPresumido = calculateLucroPresumido(values);
  
  const simplesNacionalSemFatorR = _calculateSimplesNacional(values, values.proLaborePartners, 'Simples Nacional Sem Fator R');

  let simplesNacionalComFatorR = simplesNacionalSemFatorR;

  const hasAnnexVActivity = [...values.domesticActivities, ...values.exportActivities].some(a => getCnaeData(a.code)?.requiresFatorR);

  if (hasAnnexVActivity && (simplesNacionalSemFatorR.fatorR ?? 0) < 0.28) {
    const totalRevenue = simplesNacionalSemFatorR.totalRevenue;
    const requiredPayroll = totalRevenue * 0.28;
    const currentPayroll = values.totalSalaryExpense + values.proLaborePartners;
    
    if (requiredPayroll > currentPayroll) {
        const adjustedProLabore = values.proLaborePartners + (requiredPayroll - currentPayroll);
        const optimizedValues = { ...values, proLaborePartners: adjustedProLabore };
        const optimizedResult = _calculateSimplesNacional(optimizedValues, adjustedProLabore, 'Simples Nacional Com Fator R');
        
        // Only consider the optimized result if it's actually cheaper
        if (optimizedResult.totalMonthlyCost < simplesNacionalSemFatorR.totalMonthlyCost) {
            simplesNacionalComFatorR = optimizedResult;
        } else {
             simplesNacionalComFatorR = { ...simplesNacionalSemFatorR, regime: 'Simples Nacional Com Fator R' };
        }
    } else {
       simplesNacionalComFatorR = { ...simplesNacionalSemFatorR, regime: 'Simples Nacional Com Fator R' };
    }
  } else {
     simplesNacionalComFatorR = { ...simplesNacionalSemFatorR, regime: 'Simples Nacional Com Fator R' };
  }


  return {
    simplesNacionalComFatorR,
    simplesNacionalSemFatorR,
    lucroPresumido,
  };
}
