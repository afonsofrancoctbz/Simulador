import {
  IRRF_TABLE,
  SIMPLES_NACIONAL_ANNEX_I,
  SIMPLES_NACIONAL_ANNEX_II,
  SIMPLES_NACIONAL_ANNEX_III,
  SIMPLES_NACIONAL_ANNEX_IV,
  SIMPLES_NACIONAL_ANNEX_V,
  CNAE_DATA,
} from './constants';
import {
  type CalculationResults,
  type TaxFormValues,
  type TaxDetails,
  type CnaeData,
  type Annex,
} from './types';

const ANNEX_TABLES = {
  I: SIMPLES_NACIONAL_ANNEX_I,
  II: SIMPLES_NACIONAL_ANNEX_II,
  III: SIMPLES_NACIONAL_ANNEX_III,
  IV: SIMPLES_NACIONAL_ANNEX_IV,
  V: SIMPLES_NACIONAL_ANNEX_V,
};

function findBracket(table: { max: number }[], value: number) {
  for (const bracket of table) {
    if (value <= bracket.max) {
      return bracket;
    }
  }
  return table[table.length - 1]; // Fallback for values over the max limit
}

function getCnaeData(code: string): CnaeData | undefined {
  return CNAE_DATA.find(c => c.code === code);
}

function calculateProLaboreTaxes(proLabore: number) {
  const INSS_RATE = 0.11;
  const INSS_CEILING = 7786.02;

  const inssOnProLabore = Math.min(proLabore, INSS_CEILING) * INSS_RATE;
  const irrfCalculationBase = proLabore - inssOnProLabore;
  const irrfBracket = findBracket(IRRF_TABLE, irrfCalculationBase);
  const irrf = irrfCalculationBase * irrfBracket.rate - irrfBracket.deduction;

  return { inssOnProLabore, irrf };
}

function calculateSimplesNacional(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners } = values;

  const notes: string[] = [];

  const allActivities = [
    ...domesticActivities.map(a => ({ ...a, type: 'domestic' })),
    ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' })),
  ];

  if (allActivities.length === 0) {
    return {
      regime: 'Simples Nacional',
      totalTax: 0,
      totalMonthlyCost: totalSalaryExpense + proLaborePartners,
      breakdown: [],
      notes: ["Nenhuma atividade de faturamento foi adicionada."]
    };
  }

  const totalRevenue = allActivities.reduce((sum, act) => sum + act.revenue, 0);
  const rbt12 = totalRevenue * 12;

  const revenueAnnexV = allActivities
    .filter(a => getCnaeData(a.code)?.annex === 'V')
    .reduce((sum, act) => sum + act.revenue, 0);
  
  const totalPayroll = totalSalaryExpense + proLaborePartners;
  const fatorR = totalRevenue > 0 ? totalPayroll / totalRevenue : 0;
  const isFatorRApplicable = revenueAnnexV > 0;
  const useAnnexIIIForV = fatorR >= 0.28;

  if (isFatorRApplicable) {
    notes.push(`Seu "Fator R" é de ${(fatorR * 100).toFixed(2)}%. ${useAnnexIIIForV ? 'Suas atividades do Anexo V serão tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V serão tributadas pelas alíquotas do Anexo V.'}`);
  }

  // Group revenue by effective annex
  const revenueByAnnex = allActivities.reduce((acc, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return acc;

    let effectiveAnnex: Annex = cnaeInfo.annex;
    if (cnaeInfo.annex === 'V' && useAnnexIIIForV) {
      effectiveAnnex = 'III';
    }
    
    if (!acc[effectiveAnnex]) {
      acc[effectiveAnnex] = { domestic: 0, export: 0, rbt12: 0 };
    }

    if (activity.type === 'domestic') {
      acc[effectiveAnnex].domestic += activity.revenue;
    } else {
      acc[effectiveAnnex].export += activity.revenue;
    }
    
    return acc;
  }, {} as Record<Annex, { domestic: number; export: number, rbt12: number }>);
  
  let totalDas = 0;
  let cppFromAnnexIV = 0;

  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    
    const bracket = findBracket(annexTable, rbt12); // Use total RBT12 to find the bracket
    const effectiveRate = rbt12 > 0 ? ((rbt12 * bracket.rate - bracket.deduction) / rbt12) : 0;

    // Calculate tax on domestic revenue
    totalDas += annexInfo.domestic * effectiveRate;

    // Calculate tax on export revenue (with exemptions)
    const { PIS = 0, COFINS = 0, ISS = 0, IPI = 0, ICMS = 0 } = bracket.distribution;
    const exportExemptionRate = PIS + COFINS + ISS + IPI + ICMS;
    const effectiveRateForExport = Math.max(0, effectiveRate * (1 - exportExemptionRate));
    totalDas += annexInfo.export * effectiveRateForExport;

    // Annex IV has CPP paid separately
    if (annex === 'IV') {
        const cppRate = 0.20 + 0.03 + 0.058; // Simplified INSS Patronal + RAT + Terceiros
        cppFromAnnexIV += (totalPayroll) * cppRate;
        notes.push("Atividades do Anexo IV pagam a Contribuição Previdenciária Patronal (CPP) fora do DAS, similar ao Lucro Presumido.");
    }
  }

  const proLaboreTaxes = calculateProLaboreTaxes(proLaborePartners);

  const totalTax = totalDas + cppFromAnnexIV + proLaboreTaxes.inssOnProLabore + proLaboreTaxes.irrf;
  const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners;

  return {
    regime: 'Simples Nacional',
    totalTax,
    totalMonthlyCost,
    breakdown: [
      { name: "DAS (Imposto Unificado)", value: totalDas },
      ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Anexo IV)", value: cppFromAnnexIV }] : []),
      { name: "INSS sobre Pró-labore", value: proLaboreTaxes.inssOnProLabore },
      { name: "IRRF sobre Pró-labore", value: proLaboreTaxes.irrf },
    ],
    notes,
  };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners, municipalISSRate } = values;

  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  
  const allActivities = [ ...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate})) ];
  
  if (allActivities.length === 0) {
    return {
      regime: 'Lucro Presumido',
      totalTax: 0,
      totalMonthlyCost: totalSalaryExpense + proLaborePartners,
      breakdown: []
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

  const proLaboreTaxes = calculateProLaboreTaxes(proLaborePartners);

  const totalTax = irpj + csll + pis + cofins + iss + inssPatronal + proLaboreTaxes.inssOnProLabore + proLaboreTaxes.irrf;
  const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners;

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost,
    breakdown: [
      { name: "PIS", value: pis },
      { name: "COFINS", value: cofins },
      { name: "ISS", value: iss },
      { name: "IRPJ", value: irpj },
      { name: "CSLL", value: csll },
      { name: "INSS Patronal (Folha)", value: inssPatronal },
      { name: "INSS sobre Pró-labore", value: proLaboreTaxes.inssOnProLabore },
      { name: "IRRF sobre Pró-labore", value: proLaboreTaxes.irrf },
    ],
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const simplesNacional = calculateSimplesNacional(values);
  const lucroPresumido = calculateLucroPresumido(values);

  return {
    simplesNacional,
    lucroPresumido,
  };
}
