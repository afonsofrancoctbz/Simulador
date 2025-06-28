
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

function calculateProLaboreTaxes(proLabore: number) {
  const inssOnProLabore = Math.min(proLabore, INSS_CEILING) * PRO_LABORE_INSS_RATE;
  const applicableDeduction = Math.max(inssOnProLabore, SIMPLIFIED_DEDUCTION_IRRF);
  const irrfCalculationBase = proLabore - applicableDeduction;
  const irrfBracket = findBracket(IRRF_TABLE, irrfCalculationBase);
  const irrf = Math.max(0, irrfCalculationBase * irrfBracket.rate - irrfBracket.deduction);
  return { inssOnProLabore, irrf };
}

function _calculateSimplesNacional(values: TaxFormValues, proLabore: number, regimeName: string): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, numberOfPartners } = values;
  const municipalISSRate = 5; 
  const notes: string[] = [];

  const allDomesticActivities = domesticActivities.map(a => ({ ...a, type: 'domestic' as const }));
  const allExportActivities = exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }));

  const domesticRevenue = allDomesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = allExportActivities.reduce((sum, act) => sum + act.revenue, 0);
  const totalRevenue = domesticRevenue + exportRevenue;
  
  const allActivities = [...allDomesticActivities, ...allExportActivities];

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
      explanation: "",
    };
  }

  const rbt12 = totalRevenue * 12;

  const revenueAnnexV = allActivities
    .filter(a => getCnaeData(a.code)?.requiresFatorR)
    .reduce((sum, act) => sum + act.revenue, 0);
  
  const fgtsOnSalary = totalSalaryExpense * 0.08;
  const totalPayrollForFatorR = totalSalaryExpense + proLabore + fgtsOnSalary;
  const fatorR = totalRevenue > 0 ? totalPayrollForFatorR / totalRevenue : 0;
  
  const isFatorRApplicable = revenueAnnexV > 0;
  let effectiveAnnexForV: Annex = 'V';
  
  if (isFatorRApplicable) {
    const useAnnexIIIForV = fatorR >= 0.28;
    effectiveAnnexForV = useAnnexIIIForV ? 'III' : 'V';
    notes.push(`Seu "Fator R" é de ${(fatorR * 100).toFixed(2)}%. ${useAnnexIIIForV ? 'Suas atividades do Anexo V serão tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V serão tributadas pelas alíquotas do Anexo V.'}`);
  }

  if (exportRevenue > 0) {
    notes.push("Receitas de exportação têm isenção de PIS, COFINS e ISS, resultando em uma alíquota efetiva menor.");
  }

  const revenueByAnnex = allActivities.reduce((acc, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    if (!cnaeInfo) return acc;
    let effectiveAnnex: Annex = cnaeInfo.annex;
    if (cnaeInfo.annex === 'V' && isFatorRApplicable) {
      effectiveAnnex = effectiveAnnexForV;
    }
    if (!acc[effectiveAnnex]) acc[effectiveAnnex] = { domestic: 0, export: 0 };
    if (activity.type === 'domestic') acc[effectiveAnnex].domestic += activity.revenue;
    else acc[effectiveAnnex].export += activity.revenue;
    return acc;
  }, {} as Record<Annex, { domestic: number; export: number }>);
  
  let totalDas = 0;
  let cppFromAnnexIV = 0;
  let totalIssSeparado = 0;
  if(Object.keys(revenueByAnnex).length === 0) {
    // Handle case with no revenue activities but possibly pro-labore/salary expenses
    const proLaborePerPartner = numberOfPartners > 0 ? proLabore / numberOfPartners : 0;
    const proLaboreTaxesPerPartner = calculateProLaboreTaxes(proLaborePerPartner);
    const totalProLaboreTaxes = {
        inssOnProLabore: proLaboreTaxesPerPartner.inssOnProLabore * numberOfPartners,
        irrf: proLaboreTaxesPerPartner.irrf * numberOfPartners
    };
    const totalTax = totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
    return {
        regime: regimeName, totalTax, totalMonthlyCost: totalTax + totalSalaryExpense + proLabore,
        totalRevenue: 0, proLabore, fatorR: 0, effectiveRate: 0, contabilizeiFee: 0,
        breakdown: [
            { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
            { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
        ].filter(i => i.value > 0),
        notes, annex: undefined,
        explanation: "Regime unificado que recolhe os principais tributos em uma única guia (DAS). A alíquota é progressiva e baseada no seu faturamento anual. O 'Fator R' (relação entre folha de pagamento e faturamento) pode reduzir sua alíquota.",
    }
  }

  const mainAnnex = Object.keys(revenueByAnnex).reduce((a, b) => revenueByAnnex[a as Annex].domestic + revenueByAnnex[a as Annex].export > revenueByAnnex[b as Annex].domestic + revenueByAnnex[b as Annex].export ? a : b) as Annex;

  const dasComponents = new Map<string, number>();

  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    const bracketIndex = findBracketIndex(annexTable, rbt12);
    const bracket = annexTable[bracketIndex];
    const effectiveRate = totalRevenue > 0 ? ((rbt12 * bracket.rate - bracket.deduction) / rbt12) : 0;
    
    // Calculate effective rate for export, considering exemptions
    const { PIS = 0, COFINS = 0, ISS = 0, IPI = 0, ICMS = 0 } = bracket.distribution;
    const exportExemptionProportion = PIS + COFINS + (ISS ?? 0) + (IPI ?? 0) + (ICMS ?? 0);
    const effectiveRateForExport = Math.max(0, effectiveRate * (1 - exportExemptionProportion));
    
    const dasForDomestic = annexInfo.domestic * effectiveRate;
    const dasForExport = annexInfo.export * effectiveRateForExport;
    
    // Breakdown for domestic revenue
    if (dasForDomestic > 0) {
      Object.entries(bracket.distribution).forEach(([tax, percent]) => {
        dasComponents.set(tax, (dasComponents.get(tax) || 0) + dasForDomestic * percent);
      });
    }

    // Breakdown for export revenue (re-normalized for remaining taxes)
    if (dasForExport > 0) {
      const remainingTaxes = Object.entries(bracket.distribution).filter(([taxName]) => 
          !['PIS', 'COFINS', 'ISS', 'ICMS', 'IPI'].includes(taxName)
      );
      const totalProportionOfRemainingTaxes = remainingTaxes.reduce((sum, [, proportion]) => sum + proportion, 0);
      
      if (totalProportionOfRemainingTaxes > 0) {
        remainingTaxes.forEach(([taxName, proportion]) => {
            const adjustedProportion = proportion / totalProportionOfRemainingTaxes;
            dasComponents.set(taxName, (dasComponents.get(taxName) || 0) + dasForExport * adjustedProportion);
        });
      }
    }

    totalDas += dasForDomestic + dasForExport;
    
    if (annex === 'IV') {
      const cppRate = 0.20 + 0.03 + 0.058;
      cppFromAnnexIV += (totalSalaryExpense + proLabore) * cppRate;
      notes.push("Anexo IV paga a CPP (INSS Patronal) fora do DAS.");
    }
    if (bracketIndex === annexTable.length - 1 && ['III', 'IV', 'V'].includes(annex) && annexInfo.domestic > 0) {
      totalIssSeparado += annexInfo.domestic * (municipalISSRate / 100);
      notes.push(`Na última faixa do Anexo ${annex}, o ISS é recolhido à parte.`);
    }
  }

  const proLaborePerPartner = numberOfPartners > 0 ? proLabore / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calculateProLaboreTaxes(proLaborePerPartner);
  const totalProLaboreTaxes = {
    inssOnProLabore: proLaboreTaxesPerPartner.inssOnProLabore * numberOfPartners,
    irrf: proLaboreTaxesPerPartner.irrf * numberOfPartners
  };

  const totalTax = totalDas + cppFromAnnexIV + totalIssSeparado + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);

  const breakdown = [
    ...Array.from(dasComponents.entries()).map(([name, value]) => ({ name: `DAS - ${name}`, value })),
    ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Fora do DAS)", value: cppFromAnnexIV }] : []),
    ...(totalIssSeparado > 0 ? [{ name: "ISS (Fora do DAS)", value: totalIssSeparado }] : []),
    { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: regimeName,
    totalTax,
    totalMonthlyCost: totalTax + totalSalaryExpense + proLabore,
    totalRevenue,
    proLabore,
    fatorR: isFatorRApplicable ? fatorR : undefined,
    annex: `Anexo ${mainAnnex}`,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee: feeBracket?.plans.expertsEssencial ?? 0,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
    explanation: "Regime unificado que recolhe os principais tributos em uma única guia (DAS). A alíquota é progressiva e baseada no seu faturamento anual. O 'Fator R' (relação entre folha de pagamento e faturamento) pode reduzir sua alíquota."
  };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners, numberOfPartners } = values;
  const municipalISSRate = 5;
  const notes: string[] = [];
  
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  
  const allActivities = [ ...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate})) ];

  if (exportRevenueBRL > 0) notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS no Lucro Presumido.");
  
  if (allActivities.length === 0 && proLaborePartners === 0 && totalSalaryExpense === 0) {
    return {
      regime: 'Lucro Presumido', totalTax: 0, totalMonthlyCost: 0, contabilizeiFee: 0,
      breakdown: [], notes: ["Nenhuma informação de faturamento ou despesa foi adicionada."],
      totalRevenue: 0, proLabore: 0, effectiveRate: 0,
      explanation: "Neste regime, os impostos são calculados sobre uma presunção de lucro (32% para serviços). Cada tributo (IRPJ, CSLL, PIS, COFINS, ISS) é pago em uma guia separada, oferecendo mais previsibilidade.",
    };
  }

  let presumedProfitBase = allActivities.reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
  }, 0);

  let irpj = presumedProfitBase * 0.15 + Math.max(0, presumedProfitBase - 20000) * 0.10;
  const csll = presumedProfitBase * 0.09;
  const pis = domesticRevenue * 0.0065;
  const cofins = domesticRevenue * 0.03;
  const iss = domesticRevenue * (municipalISSRate / 100);

  const totalPayroll = totalSalaryExpense + proLaborePartners;
  const inssPatronal = totalPayroll * (0.20 + 0.03 + 0.058);
  if (totalPayroll > 0) notes.push("No Lucro Presumido, a CPP (INSS Patronal) é paga sobre a folha de pagamento.");

  const proLaborePerPartner = numberOfPartners > 0 ? proLaborePartners / numberOfPartners : 0;
  const { inssOnProLabore, irrf } = calculateProLaboreTaxes(proLaborePerPartner);
  const totalProLaboreTaxes = { inssOnProLabore: inssOnProLabore * numberOfPartners, irrf: irrf * numberOfPartners };

  const totalTax = irpj + csll + pis + cofins + iss + inssPatronal + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);

  const breakdown = [
    { name: "PIS", value: pis, rate: 0.0065 }, { name: "COFINS", value: cofins, rate: 0.03 },
    { name: "ISS", value: iss, rate: municipalISSRate / 100 }, { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll }, { name: "CPP (INSS Patronal)", value: inssPatronal },
    { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: 'Lucro Presumido', totalTax, totalMonthlyCost: totalTax + totalSalaryExpense + proLaborePartners,
    totalRevenue, proLabore: proLaborePartners,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee: feeBracket?.plans.expertsEssencial ?? 0,
    breakdown: breakdown.filter(item => item.value > 0), notes,
    explanation: "Neste regime, os impostos são calculados sobre uma presunção de lucro (normalmente 32% para serviços). Cada tributo (IRPJ, CSLL, PIS, COFINS, ISS) é pago em uma guia separada, oferecendo mais previsibilidade."
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const lucroPresumido = calculateLucroPresumido(values);
  
  let simplesNacionalSemFatorR = _calculateSimplesNacional(values, values.proLaborePartners, 'Simples Nacional (Sem Otimização)');
  let simplesNacionalComFatorR = { ...simplesNacionalSemFatorR, regime: 'Simples Nacional (Otimizado)' };

  const hasAnnexVActivity = [...values.domesticActivities, ...values.exportActivities].some(a => getCnaeData(a.code)?.requiresFatorR);

  if (hasAnnexVActivity && (simplesNacionalSemFatorR.fatorR ?? 0) < 0.28) {
      const totalRevenue = simplesNacionalSemFatorR.totalRevenue;
      const fgtsOnSalary = values.totalSalaryExpense * 0.08;
      const requiredPayroll = totalRevenue * 0.28;
      const currentPayrollForFatorR = values.totalSalaryExpense * 1.08 + values.proLaborePartners;
      
      if (requiredPayroll > currentPayrollForFatorR) {
          const adjustedProLabore = values.proLaborePartners + (requiredPayroll - currentPayrollForFatorR);
          const optimizedValues = { ...values, proLaborePartners: adjustedProLabore };
          const optimizedResult = _calculateSimplesNacional(optimizedValues, adjustedProLabore, 'Simples Nacional (Otimizado)');
          
          if (optimizedResult.totalMonthlyCost < simplesNacionalSemFatorR.totalMonthlyCost) {
              simplesNacionalComFatorR = optimizedResult;
          }
      }
  }

  if (simplesNacionalComFatorR.totalMonthlyCost >= simplesNacionalSemFatorR.totalMonthlyCost) {
      simplesNacionalSemFatorR.regime = 'Simples Nacional';
      simplesNacionalComFatorR = { ...simplesNacionalSemFatorR, regime: 'Simples Nacional (Otimizado)' };
  }
  
  const scenarios = [
    simplesNacionalComFatorR,
    simplesNacionalSemFatorR,
    lucroPresumido
  ].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);
  
  const best = scenarios[0];
  const secondBest = scenarios.find(s => s.totalMonthlyCost > best.totalMonthlyCost);

  if (best && secondBest) {
    const annualSavings = (secondBest.totalMonthlyCost - best.totalMonthlyCost) * 12;
    if (annualSavings > 0) {
      best.annualSavings = annualSavings;
    }
  }

  return {
    simplesNacionalComFatorR,
    simplesNacionalSemFatorR,
    lucroPresumido,
  };
}
