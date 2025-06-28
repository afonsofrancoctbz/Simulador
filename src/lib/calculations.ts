
import { getFiscalParameters } from '@/config/fiscal';
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
} from './types';

const fiscalConfig = getFiscalParameters();

const ANNEX_TABLES = {
  I: fiscalConfig.simples_nacional.anexoI,
  II: fiscalConfig.simples_nacional.anexoII,
  III: fiscalConfig.simples_nacional.anexoIII,
  IV: fiscalConfig.simples_nacional.anexoIV,
  V: fiscalConfig.simples_nacional.anexoV,
};

// --- INTERNAL HELPERS ---

function _findBracket(table: { max: number }[], value: number) {
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

function _findFeeBracket(table: FeeBracket[], revenue: number): FeeBracket | undefined {
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
  const { valorProLaboreBruto, outrasFontesRendaINSS, configuracaoFiscal } = input;

  if (valorProLaboreBruto <= 0) {
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
  const espacoContribuicaoRestante = Math.max(0, tetoINSS - (outrasFontesRendaINSS ?? 0));
  const baseCalculoINSS = Math.min(valorProLaboreBruto, espacoContribuicaoRestante);

  const valorINSSCalculado = baseCalculoINSS * configuracaoFiscal.aliquota_inss_prolabore;
  
  // Base para IRRF é o bruto MENOS o INSS efetivamente descontado.
  const baseCalculoIRRF = valorProLaboreBruto - valorINSSCalculado;

  const irrfBracket = _findBracket(configuracaoFiscal.tabela_irrf, baseCalculoIRRF);
  const valorIRRFCalculado = Math.max(0, baseCalculoIRRF * irrfBracket.rate - irrfBracket.deduction);

  const valorLiquido = valorProLaboreBruto - valorINSSCalculado - valorIRRFCalculado;
  
  const aliquotaEfetivaINSS = valorProLaboreBruto > 0 ? valorINSSCalculado / valorProLaboreBruto : 0;

  return {
    valorBruto: valorProLaboreBruto,
    baseCalculoINSS,
    aliquotaEfetivaINSS,
    valorINSSCalculado,
    baseCalculoIRRF,
    valorIRRFCalculado,
    valorLiquido,
  };
}

function _calculateSimplesNacional(values: TaxFormValues, proLabore: number, regimeName: string): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, numberOfPartners } = values;
  const proLaboreToUse = proLabore > 0 ? proLabore : 0;

  // --- 1. Revenue Calculation ---
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenue;

  // --- 2. Pro-labore Taxes (Always calculated) ---
  const proLaborePerPartner = numberOfPartners > 0 ? proLaboreToUse / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calcularEncargosProLabore({
    valorProLaboreBruto: proLaborePerPartner,
    outrasFontesRendaINSS: 0,
    configuracaoFiscal: fiscalConfig,
  });
  const totalINSSProLabore = proLaboreTaxesPerPartner.valorINSSCalculado * numberOfPartners;
  const totalIRRFProLabore = proLaboreTaxesPerPartner.valorIRRFCalculado * numberOfPartners;

  // --- Guard Clause for Zero Revenue ---
  if (totalRevenue === 0) {
    let cppFromAnnexIV = 0;
    const hasAnnexIV = [...domesticActivities, ...exportActivities].some(a => getCnaeData(a.code)?.annex === 'IV');
    if (hasAnnexIV && (totalSalaryExpense + proLaboreToUse > 0)) {
        const cppRate = fiscalConfig.aliquotas_cpp_patronal.base;
        cppFromAnnexIV = (totalSalaryExpense + proLaboreToUse) * cppRate;
    }
    
    const companyTaxes = cppFromAnnexIV;
    const totalWithheldTaxes = totalINSSProLabore + totalIRRFProLabore;
    const totalTax = companyTaxes + totalWithheldTaxes;
    const fee = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue)?.plans.expertsEssencial ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans.expertsEssencial;
    const totalMonthlyCost = companyTaxes + totalSalaryExpense + proLaboreToUse + fee;

    const breakdown = [
        ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Fora do DAS)", value: cppFromAnnexIV }] : []),
        ...(totalINSSProLabore > 0 ? [{ name: "INSS s/ Pró-labore", value: totalINSSProLabore }] : []),
        ...(totalIRRFProLabore > 0 ? [{ name: "IRRF s/ Pró-labore", value: totalIRRFProLabore }] : []),
    ];

    return {
      regime: regimeName,
      totalTax,
      totalMonthlyCost,
      totalRevenue: 0,
      proLabore: proLaboreToUse,
      effectiveRate: 0,
      contabilizeiFee: fee,
      breakdown: breakdown.filter(item => item.value > 0),
    };
  }
  
  const notes: string[] = [];
  const municipalISSRate = fiscalConfig.aliquota_iss_padrao;

  if (exportRevenue > 0) {
    notes.push("Receitas de exportação têm isenção de PIS, COFINS e ISS, resultando em uma alíquota efetiva menor.");
  }
  
  const allDomesticActivities = domesticActivities.map(a => ({ ...a, type: 'domestic' as const }));
  const allExportActivitiesWithBRL = exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }));
  const allActivities = [...allDomesticActivities, ...allExportActivitiesWithBRL];
  const rbt12 = totalRevenue * 12;

  // --- Fator R Calculation & Annex Determination ---
  const fgtsOnSalary = totalSalaryExpense * 0.08;
  const totalPayrollForFatorR = totalSalaryExpense + proLaboreToUse + fgtsOnSalary;
  const fatorR = totalRevenue > 0 ? totalPayrollForFatorR / totalRevenue : 0;
  
  const revenueAnnexV = allActivities
    .filter(a => getCnaeData(a.code)?.requiresFatorR)
    .reduce((sum, act) => sum + act.revenue, 0);
  
  const isFatorRApplicable = revenueAnnexV > 0;
  let effectiveAnnexForV: Annex = 'V';
  
  if (isFatorRApplicable) {
    const useAnnexIIIForV = fatorR >= 0.28;
    effectiveAnnexForV = useAnnexIIIForV ? 'III' : 'V';
    notes.push(`Seu "Fator R" é de ${(fatorR * 100).toFixed(2)}%. ${useAnnexIIIForV ? 'Suas atividades do Anexo V serão tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V serão tributadas pelas alíquotas do Anexo V.'}`);
  }

  // --- Group Revenue & Calculate DAS ---
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
  
  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    const bracketIndex = _findBracketIndex(annexTable, rbt12);
    const bracket = annexTable[bracketIndex];
    const effectiveRate = totalRevenue > 0 ? ((rbt12 * bracket.rate - bracket.deduction) / rbt12) : 0;
    
    const { PIS = 0, COFINS = 0, ISS = 0 } = bracket.distribution;
    
    // Revenue-based taxes are only on domestic revenue
    const dasForDomestic = annexInfo.domestic * effectiveRate;
    
    // For export revenue, recalculate rate excluding exempt taxes
    const exportExemptionProportion = PIS + COFINS + ISS;
    const taxProportionOnDomestic = 1;
    const taxProportionOnExport = taxProportionOnDomestic > 0 ? (taxProportionOnDomestic - exportExemptionProportion) : 0;
    const effectiveRateForExport = effectiveRate * taxProportionOnExport;
    const dasForExport = annexInfo.export * effectiveRateForExport;

    totalDas += dasForDomestic + dasForExport;
    
    if (annex === 'IV' && (totalSalaryExpense + proLaboreToUse > 0)) {
      const cppRate = fiscalConfig.aliquotas_cpp_patronal.base;
      cppFromAnnexIV += (totalSalaryExpense + proLaboreToUse) * cppRate;
      notes.push("Anexo IV paga a CPP (INSS Patronal) de 20% fora do DAS.");
    }
    if (bracketIndex === annexTable.length - 1 && ['III', 'IV', 'V'].includes(annex) && annexInfo.domestic > 0) {
      totalIssSeparado += annexInfo.domestic * municipalISSRate;
      notes.push(`Na última faixa do Anexo ${annex}, o ISS é recolhido à parte.`);
    }
  }

  // --- 5. Assemble Final Results ---
  const companyTaxes = totalDas + cppFromAnnexIV + totalIssSeparado;
  const totalWithheldTaxes = totalINSSProLabore + totalIRRFProLabore;
  const totalTax = companyTaxes + totalWithheldTaxes;
  
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const contabilizeiFee = feeBracket?.plans.expertsEssencial ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans.expertsEssencial;

  const totalMonthlyCost = companyTaxes + totalSalaryExpense + proLaboreToUse + contabilizeiFee;
  
  const annexKeys = Object.keys(revenueByAnnex) as Annex[];
  const mainAnnex: Annex = annexKeys.length > 0
    ? annexKeys.reduce((a, b) => {
        const revenueA = (revenueByAnnex[a as Annex]?.domestic || 0) + (revenueByAnnex[a as Annex]?.export || 0);
        const revenueB = (revenueByAnnex[b as Annex]?.domestic || 0) + (revenueByAnnex[b as Annex]?.export || 0);
        return revenueA >= revenueB ? a : b;
      }, annexKeys[0] as Annex)
    : 'III';

  const breakdown = [
    ...(totalDas > 0 ? [{ name: 'DAS (Guia Unificada)', value: totalDas }] : []),
    ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Fora do DAS)", value: cppFromAnnexIV }] : []),
    ...(totalIssSeparado > 0 ? [{ name: "ISS (Fora do DAS)", value: totalIssSeparado }] : []),
    ...(totalINSSProLabore > 0 ? [{ name: "INSS s/ Pró-labore", value: totalINSSProLabore }] : []),
    ...(totalIRRFProLabore > 0 ? [{ name: "IRRF s/ Pró-labore", value: totalIRRFProLabore }] : []),
  ];

  return {
    regime: regimeName,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: proLaboreToUse,
    fatorR: isFatorRApplicable ? fatorR : undefined,
    annex: `Anexo ${mainAnnex}`,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee: contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
  };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLaborePartners, numberOfPartners } = values;
  const proLaboreToUse = proLaborePartners > 0 ? proLaborePartners : 0;
  
  // --- Revenue Calculation ---
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;

  const proLaborePerPartner = numberOfPartners > 0 ? proLaboreToUse / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calcularEncargosProLabore({
    valorProLaboreBruto: proLaborePerPartner,
    outrasFontesRendaINSS: 0,
    configuracaoFiscal: fiscalConfig,
  });

  const totalProLaboreTaxes = { 
      inssOnProLabore: proLaboreTaxesPerPartner.valorINSSCalculado * numberOfPartners, 
      irrf: proLaboreTaxesPerPartner.valorIRRFCalculado * numberOfPartners 
  };
  
  const totalPayroll = totalSalaryExpense + proLaboreToUse;
  const inssPatronal = totalPayroll > 0 ? totalPayroll * fiscalConfig.aliquotas_cpp_patronal.base : 0;

  // --- Guard Clause for Zero Revenue ---
  if (totalRevenue === 0) {
      const companyTaxes = inssPatronal;
      const totalWithheldTaxes = totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
      const totalTax = companyTaxes + totalWithheldTaxes;
      const fee = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue)?.plans.expertsEssencial ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans.expertsEssencial;
      const totalMonthlyCost = companyTaxes + totalSalaryExpense + proLaboreToUse + fee;

      const breakdown = [
        ...(inssPatronal > 0 ? [{ name: "CPP (INSS Patronal)", value: inssPatronal }] : []),
        ...(totalProLaboreTaxes.inssOnProLabore > 0 ? [{ name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore }] : []),
        ...(totalProLaboreTaxes.irrf > 0 ? [{ name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf }] : []),
      ];

      return {
          regime: 'Lucro Presumido',
          totalTax,
          totalMonthlyCost,
          totalRevenue: 0,
          proLabore: proLaboreToUse,
          effectiveRate: 0,
          contabilizeiFee: fee,
          breakdown: breakdown.filter(item => item.value > 0),
      };
  }

  const notes: string[] = [];
  if (exportRevenueBRL > 0) notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS no Lucro Presumido.");
  if (totalPayroll > 0) notes.push("No Lucro Presumido, a CPP (INSS Patronal) de 20% é paga sobre a folha de pagamento.");
  
  // --- Federal Taxes Calculation ---
  const allActivities = [ ...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate})) ];
  let presumedProfitBase = allActivities.reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
  }, 0);
  
  const IRPJ_ADDITIONAL_THRESHOLD = 20000;
  
  let irpj = presumedProfitBase * 0.15 + Math.max(0, presumedProfitBase - IRPJ_ADDITIONAL_THRESHOLD) * 0.10;
  const csll = presumedProfitBase * 0.09;
  const pis = domesticRevenue * 0.0065; 
  const cofins = domesticRevenue * 0.03; 
  const iss = domesticRevenue * fiscalConfig.aliquota_iss_padrao; 

  // --- Assemble Final Results ---
  const companyRevenueTaxes = irpj + csll + pis + cofins + iss;
  const companyPayrollTaxes = inssPatronal;
  const totalWithheldTaxes = totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
  const totalTax = companyRevenueTaxes + companyPayrollTaxes + totalWithheldTaxes;

  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
  const contabilizeiFee = feeBracket?.plans.expertsEssencial ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans.expertsEssencial;

  const totalMonthlyCost = companyRevenueTaxes + companyPayrollTaxes + totalSalaryExpense + proLaboreToUse + contabilizeiFee;

  const breakdown = [
    { name: "PIS", value: pis }, { name: "COFINS", value: cofins },
    { name: "ISS", value: iss }, { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll }, { name: "CPP (INSS Patronal)", value: inssPatronal },
    { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: proLaboreToUse,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const proLaboreToUse = values.proLaborePartners > 0 ? values.proLaborePartners : 0;
  const effectiveValues = { ...values, proLaborePartners: proLaboreToUse };

  const lucroPresumido = calculateLucroPresumido(effectiveValues);
  const simplesNacionalBase = _calculateSimplesNacional(effectiveValues, proLaboreToUse, 'Simples Nacional');

  let simplesNacionalOtimizado = { ...simplesNacionalBase, regime: 'Simples Nacional (Otimizado)' };

  const hasAnnexVActivity = [...values.domesticActivities, ...values.exportActivities].some(a => getCnaeData(a.code)?.requiresFatorR);
  
  if (hasAnnexVActivity && (simplesNacionalBase.fatorR ?? 0) < 0.28) {
      const totalRevenue = simplesNacionalBase.totalRevenue;
      if (totalRevenue > 0) {
          const requiredPayroll = totalRevenue * 0.28;
          const fgtsOnSalary = values.totalSalaryExpense * 0.08;
          const currentPayrollForFatorR = values.totalSalaryExpense + proLaboreToUse + fgtsOnSalary;
          
          if (requiredPayroll > currentPayrollForFatorR) {
              const adjustedProLabore = proLaboreToUse + (requiredPayroll - currentPayrollForFatorR);
              const optimizedValues = { ...values, proLaborePartners: adjustedProLabore };
              simplesNacionalOtimizado = _calculateSimplesNacional(optimizedValues, adjustedProLabore, 'Simples Nacional (Otimizado)');
          }
      }
  }
  
  return {
    simplesNacionalComFatorR: simplesNacionalOtimizado,
    simplesNacionalSemFatorR: simplesNacionalBase,
    lucroPresumido,
  };
}
