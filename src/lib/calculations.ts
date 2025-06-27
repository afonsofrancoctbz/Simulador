import {
  IRRF_TABLE,
  SIMPLIFIED_DEDUCTION_IRRF,
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

function calculateProLaboreTaxes(proLabore: number) {
  const INSS_RATE = 0.11;
  const INSS_CEILING = 7786.02;

  // 1. Calculate INSS on pro-labore (this is a tax, not just a deduction for IRRF)
  const inssOnProLabore = Math.min(proLabore, INSS_CEILING) * INSS_RATE;

  // 2. Calculate IRRF
  // The law allows choosing between standard deductions (like INSS) and a simplified deduction.
  // We should choose the option that results in the lowest tax, which means choosing the largest deduction.
  const applicableDeduction = Math.max(inssOnProLabore, SIMPLIFIED_DEDUCTION_IRRF);
  
  const irrfCalculationBase = proLabore - applicableDeduction;

  const irrfBracket = findBracket(IRRF_TABLE, irrfCalculationBase);
  // Ensure IRRF is not negative
  const irrf = Math.max(0, irrfCalculationBase * irrfBracket.rate - irrfBracket.deduction);

  return { inssOnProLabore, irrf };
}

function calculateSimplesNacional(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners, numberOfPartners, municipalISSRate } = values;

  const notes: string[] = [];

  const allActivities = [
    ...domesticActivities.map(a => ({ ...a, type: 'domestic' as const })),
    ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const })),
  ];
  
  const hasExportRevenue = allActivities.some(act => act.type === 'export' && act.revenue > 0);

  if (allActivities.length === 0 && proLaborePartners === 0 && totalSalaryExpense === 0) {
    return {
      regime: 'Simples Nacional',
      totalTax: 0,
      totalMonthlyCost: 0,
      breakdown: [],
      notes: ["Nenhuma informação de faturamento ou despesa foi adicionada."]
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

  if (hasExportRevenue) {
    notes.push("As receitas de exportação têm isenção de PIS, COFINS e ISS no Simples Nacional, resultando em uma alíquota efetiva menor sobre estes valores.");
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
      acc[effectiveAnnex] = { domestic: 0, export: 0 };
    }

    if (activity.type === 'domestic') {
      acc[effectiveAnnex].domestic += activity.revenue;
    } else {
      acc[effectiveAnnex].export += activity.revenue;
    }
    
    return acc;
  }, {} as Record<Annex, { domestic: number; export: number }>);
  
  let totalDas = 0;
  let cppFromAnnexIV = 0;
  let totalIssSeparado = 0;

  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    
    const bracketIndex = findBracketIndex(annexTable, rbt12);
    const bracket = annexTable[bracketIndex];
    
    const effectiveRate = totalRevenue > 0 ? ((rbt12 * bracket.rate - bracket.deduction) / rbt12) : 0;

    // Calculate tax on domestic revenue
    totalDas += annexInfo.domestic * effectiveRate;

    // Calculate tax on export revenue (with exemptions)
    const { PIS = 0, COFINS = 0, ISS = 0, IPI = 0, ICMS = 0 } = bracket.distribution;
    const exportExemptionRate = PIS + COFINS + (ISS ?? 0) + (IPI ?? 0) + (ICMS ?? 0);
    const effectiveRateForExport = Math.max(0, effectiveRate * (1 - exportExemptionRate));
    totalDas += annexInfo.export * effectiveRateForExport;

    // Annex IV has CPP paid separately
    if (annex === 'IV') {
        const cppRate = 0.20 + 0.03 + 0.058; // Simplified INSS Patronal + RAT + Terceiros
        cppFromAnnexIV += (totalPayroll) * cppRate;
        notes.push("Atividades do Anexo IV pagam a Contribuição Previdenciária Patronal (CPP) fora do DAS, similar ao Lucro Presumido.");
    }

     // Check for last bracket taxes ("por fora")
     if (bracketIndex === annexTable.length - 1) {
      if (['III', 'IV', 'V'].includes(annex) && annexInfo.domestic > 0) {
        const issSeparado = annexInfo.domestic * (municipalISSRate / 100);
        totalIssSeparado += issSeparado;
        notes.push(`Para faturamento na última faixa do Anexo ${annex}, o ISS (${municipalISSRate}%) é recolhido separadamente do DAS.`);
      }
      if (['I', 'II'].includes(annex) && annexInfo.domestic > 0) {
        notes.push(`Para faturamento na última faixa do Anexo ${annex}, o ICMS deve ser recolhido separadamente, conforme as regras do seu estado.`);
      }
    }
  }

  const proLaborePerPartner = numberOfPartners > 0 ? proLaborePartners / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calculateProLaboreTaxes(proLaborePerPartner);
  const totalProLaboreTaxes = {
    inssOnProLabore: proLaboreTaxesPerPartner.inssOnProLabore * numberOfPartners,
    irrf: proLaboreTaxesPerPartner.irrf * numberOfPartners
  };

  const totalTax = totalDas + cppFromAnnexIV + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf + totalIssSeparado;
  const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners;

  const breakdown = [
    { name: "DAS (Imposto Unificado)", value: totalDas },
    ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Anexo IV)", value: cppFromAnnexIV }] : []),
    ...(totalIssSeparado > 0 ? [{ name: "ISS (Recolhido à parte)", value: totalIssSeparado }] : []),
    { name: "INSS sobre Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF sobre Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: 'Simples Nacional',
    totalTax,
    totalMonthlyCost,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
  };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners, numberOfPartners, municipalISSRate } = values;

  const notes: string[] = [];
  const hasExportRevenue = exportActivities.some(act => act.revenue > 0);
  if (hasExportRevenue) {
    notes.push("As receitas de exportação são isentas de PIS, COFINS e ISS no Lucro Presumido.");
  }

  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  
  const allActivities = [ ...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate})) ];
  
  if (allActivities.length === 0 && proLaborePartners === 0 && totalSalaryExpense === 0) {
    return {
      regime: 'Lucro Presumido',
      totalTax: 0,
      totalMonthlyCost: 0,
      breakdown: [],
      notes: ["Nenhuma informação de faturamento ou despesa foi adicionada."]
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

  const proLaborePerPartner = numberOfPartners > 0 ? proLaborePartners / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calculateProLaboreTaxes(proLaborePerPartner);
  const totalProLaboreTaxes = {
    inssOnProLabore: proLaboreTaxesPerPartner.inssOnProLabore * numberOfPartners,
    irrf: proLaboreTaxesPerPartner.irrf * numberOfPartners
  };


  const totalTax = irpj + csll + pis + cofins + iss + inssPatronal + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
  const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners;

  const breakdown = [
    { name: "PIS", value: pis },
    { name: "COFINS", value: cofins },
    { name: "ISS", value: iss },
    { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll },
    { name: "INSS Patronal (Folha)", value: inssPatronal },
    { name: "INSS sobre Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF sobre Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
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
