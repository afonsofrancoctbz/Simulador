
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


function _getCnaeData(code: string): CnaeData | undefined {
  return CNAE_DATA.find(c => c.code === code);
}

/**
 * Encapsulates the tax calculation logic for a partner's pro-labore.
 * This function calculates INSS and IRRF based on the provided gross value,
 * considering the INSS ceiling and other potential income sources.
 * @param input The necessary data for the calculation, including gross pro-labore, other income, and fiscal configuration.
 * @returns A detailed breakdown of the calculated taxes and net value.
 */
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

  // --- Passo 1: Calcular a Contribuição ao INSS ---
  // 1.1. Determinar o Salário de Contribuição, considerando o teto do INSS e outras fontes de renda.
  // A contribuição sobre o pró-labore é limitada pela diferença entre o teto e o que já foi contribuído por outras fontes.
  const tetoINSS = configuracaoFiscal.teto_inss;
  const espacoContribuicaoRestante = Math.max(0, tetoINSS - (outrasFontesRendaINSS ?? 0));
  const baseCalculoINSS = Math.min(valorProLaboreBruto, espacoContribuicaoRestante);

  // 1.2. Aplicar a alíquota de 11% sobre a base de cálculo.
  // Nota: A regra da tabela progressiva (CLT) não se aplica ao pró-labore de sócios, que segue a alíquota fixa.
  const valorINSSCalculado = baseCalculoINSS * configuracaoFiscal.aliquota_inss_prolabore;

  // --- Passo 2: Calcular o Imposto de Renda Retido na Fonte (IRRF) ---
  // 2.1. Determinar a Base de Cálculo do IRRF.
  // A dedução do INSS é um dos principais benefícios para reduzir a base do IRRF.
  // A dedução simplificada também é uma opção. Usamos a maior das duas.
  const applicableDeduction = Math.max(valorINSSCalculado, configuracaoFiscal.deducao_simplificada_irrf);
  const baseCalculoIRRF = valorProLaboreBruto - applicableDeduction;

  // 2.2. Aplicar a Tabela Progressiva do IRRF.
  const irrfBracket = _findBracket(configuracaoFiscal.tabela_irrf, baseCalculoIRRF);
  const valorIRRFCalculado = Math.max(0, baseCalculoIRRF * irrfBracket.rate - irrfBracket.deduction);

  // --- Passo 3: Calcular o Valor Líquido ---
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
  const notes: string[] = [];
  const municipalISSRate = fiscalConfig.aliquota_iss_padrao * 100;

  // --- 1. Revenue Calculation ---
  const allDomesticActivities = domesticActivities.map(a => ({ ...a, type: 'domestic' as const }));
  const allExportActivities = exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }));
  const domesticRevenue = allDomesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = allExportActivities.reduce((sum, act) => sum + act.revenue, 0);
  const totalRevenue = domesticRevenue + exportRevenue;
  const rbt12 = totalRevenue * 12;

  if (exportRevenue > 0) {
    notes.push("Receitas de exportação têm isenção de PIS, COFINS e ISS, resultando em uma alíquota efetiva menor.");
  }
  
  const allActivities = [...allDomesticActivities, ...allExportActivities];

  // --- 2. Fator R Calculation & Annex Determination ---
  const fgtsOnSalary = totalSalaryExpense * 0.08;
  const totalPayrollForFatorR = totalSalaryExpense + proLabore + fgtsOnSalary;
  const fatorR = totalRevenue > 0 ? totalPayrollForFatorR / totalRevenue : 0;
  
  const revenueAnnexV = allActivities
    .filter(a => _getCnaeData(a.code)?.requiresFatorR)
    .reduce((sum, act) => sum + act.revenue, 0);
  
  const isFatorRApplicable = revenueAnnexV > 0;
  let effectiveAnnexForV: Annex = 'V';
  
  if (isFatorRApplicable) {
    const useAnnexIIIForV = fatorR >= 0.28;
    effectiveAnnexForV = useAnnexIIIForV ? 'III' : 'V';
    notes.push(`Seu "Fator R" é de ${(fatorR * 100).toFixed(2)}%. ${useAnnexIIIForV ? 'Suas atividades do Anexo V serão tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V serão tributadas pelas alíquotas do Anexo V.'}`);
  }

  // --- 3. Group Revenue & Calculate DAS ---
  const revenueByAnnex = allActivities.reduce((acc, activity) => {
    const cnaeInfo = _getCnaeData(activity.code);
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
  const dasComponents = new Map<string, number>();
  
  for (const annexStr in revenueByAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    const bracketIndex = _findBracketIndex(annexTable, rbt12);
    const bracket = annexTable[bracketIndex];
    const effectiveRate = totalRevenue > 0 ? ((rbt12 * bracket.rate - bracket.deduction) / rbt12) : 0;
    
    const { PIS = 0, COFINS = 0, ISS = 0, IPI = 0, ICMS = 0 } = bracket.distribution;
    const exportExemptionProportion = PIS + COFINS + (ISS ?? 0) + (IPI ?? 0) + (ICMS ?? 0);
    const effectiveRateForExport = Math.max(0, effectiveRate * (1 - exportExemptionProportion));
    
    const dasForDomestic = annexInfo.domestic * effectiveRate;
    const dasForExport = annexInfo.export * effectiveRateForExport;
    
    if (dasForDomestic > 0) {
      Object.entries(bracket.distribution).forEach(([tax, percent]) => {
        dasComponents.set(tax, (dasComponents.get(tax) || 0) + dasForDomestic * percent);
      });
    }

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
      const cppRate = fiscalConfig.aliquotas_cpp_patronal.total;
      cppFromAnnexIV += (totalSalaryExpense + proLabore) * cppRate;
      notes.push("Anexo IV paga a CPP (INSS Patronal) fora do DAS.");
    }
    if (bracketIndex === annexTable.length - 1 && ['III', 'IV', 'V'].includes(annex) && annexInfo.domestic > 0) {
      totalIssSeparado += annexInfo.domestic * (municipalISSRate / 100);
      notes.push(`Na última faixa do Anexo ${annex}, o ISS é recolhido à parte.`);
    }
  }

  // --- 4. Pro-labore Taxes ---
  const proLaborePerPartner = numberOfPartners > 0 ? proLabore / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calcularEncargosProLabore({
    valorProLaboreBruto: proLaborePerPartner,
    outrasFontesRendaINSS: 0, // Campo não disponível na UI atual
    configuracaoFiscal: fiscalConfig,
  });

  const totalINSSProLabore = proLaboreTaxesPerPartner.valorINSSCalculado * numberOfPartners;
  const totalIRRFProLabore = proLaboreTaxesPerPartner.valorIRRFCalculado * numberOfPartners;


  // --- 5. Assemble Final Results ---
  const totalTax = totalDas + cppFromAnnexIV + totalIssSeparado + totalINSSProLabore + totalIRRFProLabore;
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const mainAnnex = Object.keys(revenueByAnnex).reduce((a, b) => revenueByAnnex[a as Annex].domestic + revenueByAnnex[a as Annex].export > revenueByAnnex[b as Annex].domestic + revenueByAnnex[b as Annex].export ? a : b) as Annex;

  const breakdown = [
    ...Array.from(dasComponents.entries()).map(([name, value]) => ({ name: `DAS - ${name}`, value })),
    ...(cppFromAnnexIV > 0 ? [{ name: "CPP (Fora do DAS)", value: cppFromAnnexIV }] : []),
    ...(totalIssSeparado > 0 ? [{ name: "ISS (Fora do DAS)", value: totalIssSeparado }] : []),
    { name: "INSS s/ Pró-labore", value: totalINSSProLabore },
    { name: "IRRF s/ Pró-labore", value: totalIRRFProLabore },
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
  const notes: string[] = [];
  const municipalISSRate = fiscalConfig.aliquota_iss_padrao * 100;

  // --- 1. Revenue Calculation ---
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  
  if (exportRevenueBRL > 0) notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS no Lucro Presumido.");
  
  // --- 2. Federal Taxes Calculation ---
  const allActivities = [ ...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate})) ];
  let presumedProfitBase = allActivities.reduce((sum, activity) => {
    const cnaeInfo = _getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
  }, 0);

  let irpj = presumedProfitBase * 0.15 + Math.max(0, presumedProfitBase - 20000) * 0.10;
  const csll = presumedProfitBase * 0.09;
  const pis = domesticRevenue * 0.0065; // PIS incide apenas sobre receita nacional
  const cofins = domesticRevenue * 0.03; // COFINS incide apenas sobre receita nacional
  
  // --- 3. Municipal and Payroll Taxes ---
  const iss = domesticRevenue * fiscalConfig.aliquota_iss_padrao; // ISS incide apenas sobre receita nacional
  const totalPayroll = totalSalaryExpense + proLaborePartners;
  const inssPatronal = totalPayroll * fiscalConfig.aliquotas_cpp_patronal.total; // CPP
  if (totalPayroll > 0) notes.push("No Lucro Presumido, a CPP (INSS Patronal) é paga sobre a folha de pagamento.");

  const proLaborePerPartner = numberOfPartners > 0 ? proLaborePartners / numberOfPartners : 0;
  const proLaboreTaxesPerPartner = calcularEncargosProLabore({
    valorProLaboreBruto: proLaborePerPartner,
    outrasFontesRendaINSS: 0, // Campo não disponível na UI atual
    configuracaoFiscal: fiscalConfig,
  });

  const totalProLaboreTaxes = { 
      inssOnProLabore: proLaboreTaxesPerPartner.valorINSSCalculado * numberOfPartners, 
      irrf: proLaboreTaxesPerPartner.valorIRRFCalculado * numberOfPartners 
  };

  // --- 4. Assemble Final Results ---
  const totalTax = irpj + csll + pis + cofins + iss + inssPatronal + totalProLaboreTaxes.inssOnProLabore + totalProLaboreTaxes.irrf;
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);

  const breakdown = [
    { name: "PIS", value: pis, rate: 0.0065 }, { name: "COFINS", value: cofins, rate: 0.03 },
    { name: "ISS", value: iss, rate: municipalISSRate / 100 }, { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll }, { name: "CPP (INSS Patronal)", value: inssPatronal },
    { name: "INSS s/ Pró-labore", value: totalProLaboreTaxes.inssOnProLabore },
    { name: "IRRF s/ Pró-labore", value: totalProLaboreTaxes.irrf },
  ];

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost: totalTax + totalSalaryExpense + proLaborePartners,
    totalRevenue,
    proLabore: proLaborePartners,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee: feeBracket?.plans.expertsEssencial ?? 0,
    breakdown: breakdown.filter(item => item.value > 0),
    notes,
    explanation: "Neste regime, os impostos são calculados sobre uma presunção de lucro (32% para serviços). Cada tributo (IRPJ, CSLL, PIS, COFINS, ISS) é pago em uma guia separada, oferecendo mais previsibilidade.",
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const lucroPresumido = calculateLucroPresumido(values);
  const simplesNacionalBase = _calculateSimplesNacional(values, values.proLaborePartners, 'Simples Nacional');

  let simplesNacionalOtimizado = { ...simplesNacionalBase, regime: 'Simples Nacional (Otimizado)' };

  const hasAnnexVActivity = [...values.domesticActivities, ...values.exportActivities].some(a => _getCnaeData(a.code)?.requiresFatorR);
  
  if (hasAnnexVActivity && (simplesNacionalBase.fatorR ?? 0) < 0.28) {
      const totalRevenue = simplesNacionalBase.totalRevenue;
      if (totalRevenue > 0) {
          const fgtsOnSalary = values.totalSalaryExpense * 0.08;
          const requiredPayroll = totalRevenue * 0.28;
          const currentPayrollForFatorR = values.totalSalaryExpense + values.proLaborePartners + fgtsOnSalary;
          
          if (requiredPayroll > currentPayrollForFatorR) {
              const adjustedProLabore = values.proLaborePartners + (requiredPayroll - currentPayrollForFatorR);
              const optimizedResult = _calculateSimplesNacional(values, adjustedProLabore, 'Simples Nacional (Otimizado)');
              
              if (optimizedResult.totalMonthlyCost < simplesNacionalBase.totalMonthlyCost) {
                  simplesNacionalOtimizado = optimizedResult;
              }
          }
      }
  }

  const simplesNacionalSemFatorR = { ...simplesNacionalBase };
  if (simplesNacionalOtimizado.totalMonthlyCost >= simplesNacionalBase.totalMonthlyCost) {
      simplesNacionalOtimizado = { ...simplesNacionalBase, regime: 'Simples Nacional (Otimizado)' }; // Redefine para não mostrar otimização se não for vantajosa
  }
  
  const scenarios = [
    simplesNacionalOtimizado,
    simplesNacionalSemFatorR,
    lucroPresumido
  ].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);
  
  const best = scenarios[0];
  const secondBest = scenarios.find(s => s.totalMonthlyCost > best.totalMonthlyCost && s.regime !== best.regime);

  if (best && secondBest) {
    const annualSavings = (secondBest.totalMonthlyCost - best.totalMonthlyCost) * 12;
    if (annualSavings > 0) {
      best.annualSavings = annualSavings;
    }
  }

  return {
    simplesNacionalComFatorR: simplesNacionalOtimizado,
    simplesNacionalSemFatorR: simplesNacionalSemFatorR,
    lucroPresumido,
  };
}
