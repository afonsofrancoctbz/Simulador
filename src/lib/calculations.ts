
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
  
  // Logic for "duplo vínculo" (double contribution)
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


function _calculateSimplesNacional(values: TaxFormValues, totalProLaboreBruto: number, regimeName: string): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, rbt12, selectedPlan } = values;

  // --- 1. Revenue Calculation ---
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenue;

  // New logic: Use monthly revenue to estimate RBT12 if not provided.
  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;

  // --- 2. Pro-labore Taxes (per partner, then aggregated) ---
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);
  
  const allCnaesData = [...domesticActivities, ...exportActivities]
      .map(a => getCnaeData(a.code))
      .filter((c): c is CnaeData => !!c);

  // --- Guard Clause for Zero Revenue ---
  if (totalRevenue === 0 && effectiveRbt12 === 0) {
    let cppFromAnnexIV = 0;
    
    const hasAnnexIV = allCnaesData.some(c => c.annex === 'IV');
    if (hasAnnexIV && (totalSalaryExpense + totalProLaboreBruto > 0)) {
        const cppRate = fiscalConfig2025.aliquotas_cpp_patronal.base;
        cppFromAnnexIV = (totalSalaryExpense + totalProLaboreBruto) * cppRate;
    }
    
    const companyTaxes = cppFromAnnexIV;
    const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
    const totalTax = companyTaxes + totalWithheldTaxes;
    const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        ...(cppFromAnnexIV > 0 ? [{ name: "CPP (INSS Patronal - 20%)", value: cppFromAnnexIV }] : []),
        ...(totalINSSRetido > 0 ? [{ name: "INSS s/ Pró-labore (11%)", value: totalINSSRetido }] : []),
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

    return {
      regime: regimeName,
      totalTax,
      totalMonthlyCost,
      totalRevenue: 0,
      proLabore: totalProLaboreBruto,
      effectiveRate: 0,
      contabilizeiFee: fee,
      breakdown: breakdown.filter(item => item.value > 0),
      partnerTaxes,
      annex: annexLabel,
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

  // --- Fator R Calculation & Annex Determination ---
  const totalPayrollForFatorR = totalSalaryExpense + totalProLaboreBruto;
  const fatorR = totalRevenue > 0 ? totalPayrollForFatorR / totalRevenue : 0;
  
  const revenueAnnexV = allActivities
    .filter(a => getCnaeData(a.code)?.requiresFatorR)
    .reduce((sum, act) => sum + act.revenue, 0);
  
  const isFatorRApplicable = revenueAnnexV > 0;
  let effectiveAnnexForV: Annex = 'V';
  
  if (isFatorRApplicable) {
    const useAnnexIIIForV = fatorR >= 0.28;
    effectiveAnnexForV = useAnnexIIIForV ? 'III' : 'V';
    notes.push(`Seu "Fator R" é de ${formatPercent(fatorR)}. ${useAnnexIIIForV ? 'Suas atividades do Anexo V serão tributadas pelo Anexo III, o que é vantajoso.' : 'Como o valor é inferior a 28%, suas atividades do Anexo V serão tributadas pelas alíquotas do Anexo V.'}`);
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
    const bracketIndex = _findBracketIndex(annexTable, effectiveRbt12);
    const bracket = annexTable[bracketIndex];
    const effectiveRate = effectiveRbt12 > 0 ? ((effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12) : bracket.rate;
    
    const { PIS = 0, COFINS = 0, ISS = 0 } = bracket.distribution;
    const isLastBracket = bracketIndex === annexTable.length - 1;

    // --- DAS on Domestic Revenue ---
    let dasForDomestic = annexInfo.domestic * effectiveRate;
    // If sublimit is exceeded OR it's the last bracket for services, ISS is paid separately.
    if ((rbt12ExceededSublimit || (isLastBracket && ['III', 'IV', 'V'].includes(annex))) && annexInfo.domestic > 0) {
        totalIssSeparado += annexInfo.domestic * municipalISSRate;
        // Subtract the ISS part from the DAS calculation for domestic revenue.
        dasForDomestic -= annexInfo.domestic * (effectiveRate * ISS);

        // Add a note only once.
        if (rbt12ExceededSublimit && !notes.some(n => n.includes('sublimite'))) {
            notes.push(`Como o faturamento anual ultrapassou o sublimite de ${formatCurrencyBRL(SUBLIMIT_SIMPLES)}, o ISS é recolhido fora do DAS.`);
        } else if (isLastBracket && !rbt12ExceededSublimit && !notes.some(n => n.includes('Na última faixa'))) {
            notes.push(`Na última faixa do Anexo ${annex}, o ISS é recolhido à parte.`);
        }
    }
    
    // --- DAS on Export Revenue ---
    // Export is always exempt from PIS, COFINS, and ISS.
    let dasForExport = annexInfo.export * effectiveRate;
    const exportExemptionValue = annexInfo.export * effectiveRate * (PIS + COFINS + ISS);
    dasForExport -= exportExemptionValue;
    
    totalDas += dasForDomestic + dasForExport;
    
    if (annex === 'IV' && (totalSalaryExpense + totalProLaboreBruto > 0)) {
      const annexIVRevenue = (annexInfo.domestic || 0) + (annexInfo.export || 0);
      const proportionAnnexIV = totalRevenue > 0 ? annexIVRevenue / totalRevenue : 0;
      const cppRate = fiscalConfig2025.aliquotas_cpp_patronal.base;
      cppFromAnnexIV += (totalSalaryExpense + totalProLaboreBruto) * cppRate * proportionAnnexIV;
      
      if (!notes.some(n => n.includes("Anexo IV paga a CPP"))) {
          notes.push("Anexo IV paga a CPP (INSS Patronal - 20%) fora do DAS, proporcional à sua receita.");
      }
    }
  }

  // --- 5. Assemble Final Results ---
  const companyTaxes = totalDas + cppFromAnnexIV + totalIssSeparado;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
  const totalTax = companyTaxes + totalWithheldTaxes;
  
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];

  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  const annexKeys = Object.keys(revenueByAnnex) as Annex[];
  let mainAnnexLabel: string;
  if(annexKeys.length === 1) {
    mainAnnexLabel = `Anexo ${annexKeys[0]}`;
  } else if (annexKeys.length > 1) {
    mainAnnexLabel = 'Múltiplos Anexos';
  } else {
    // Fallback if no revenue was provided but we got here somehow.
    const uniqueAnnexesFromCnaes = [...new Set(allCnaesData.map(c => c.annex))];
    if (uniqueAnnexesFromCnaes.length === 1) {
        mainAnnexLabel = `Anexo ${uniqueAnnexesFromCnaes[0]}`;
    } else if (uniqueAnnexesFromCnaes.length > 1) {
        mainAnnexLabel = 'Múltiplos Anexos';
    } else {
        mainAnnexLabel = 'Padrão'; 
    }
  }


  const breakdown = [
    { name: 'DAS (Guia Unificada)', value: totalDas },
    { name: "CPP (INSS Patronal - 20%)", value: cppFromAnnexIV },
    { name: "ISS (Fora do DAS)", value: totalIssSeparado },
    { name: 'INSS s/ Pró-labore (11%)', value: totalINSSRetido },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
  ];

  const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;

  return {
    regime: regimeName,
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: totalProLaboreBruto,
    fatorR: isFatorRApplicable ? fatorR : undefined,
    annex: mainAnnexLabel,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    effectiveDasRate,
    contabilizeiFee: contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0.001), // Filter out zero or negligible values
    notes,
    partnerTaxes
  };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan } = values;
  const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
  
  // --- Revenue Calculation ---
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2025);

  const totalPayroll = totalSalaryExpense + totalProLaboreBruto;
  const inssPatronal = totalPayroll > 0 ? totalPayroll * fiscalConfig2025.aliquotas_cpp_patronal.base : 0;

  // --- Guard Clause for Zero Revenue ---
  if (totalRevenue === 0) {
      const companyPayrollTaxes = inssPatronal;
      const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
      const totalTax = companyPayrollTaxes + totalWithheldTaxes;
      const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
      const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];
      
      const totalMonthlyCost = totalTax + fee;

      const breakdown = [
        ...(inssPatronal > 0 ? [{ name: "CPP (INSS Patronal - 20%)", value: inssPatronal }] : []),
        ...(totalINSSRetido > 0 ? [{ name: "INSS s/ Pró-labore (11%)", value: totalINSSRetido }] : []),
        ...(totalIRRFRetido > 0 ? [{ name: "IRRF s/ Pró-labore", value: totalIRRFRetido }] : []),
      ];

      return {
          regime: 'Lucro Presumido',
          totalTax,
          totalMonthlyCost,
          totalRevenue: 0,
          proLabore: totalProLaboreBruto,
          effectiveRate: 0,
          contabilizeiFee: fee,
          breakdown: breakdown.filter(item => item.value > 0.001),
          partnerTaxes,
      };
  }

  const notes: string[] = [];
  if (exportRevenueBRL > 0) notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS no Lucro Presumido.");
  if (totalPayroll > 0) notes.push(`No Lucro Presumido, a empresa paga o INSS Patronal (CPP de ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)}) sobre a folha de pagamento.`);
  
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
  const iss = domesticRevenue * fiscalConfig2025.aliquota_iss_padrao; 

  // --- Assemble Final Results ---
  const companyRevenueTaxes = irpj + csll + pis + cofins + iss;
  const companyPayrollTaxes = inssPatronal;
  const totalCompanyTaxes = companyRevenueTaxes + companyPayrollTaxes;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
  const totalTax = totalCompanyTaxes + totalWithheldTaxes;

  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
  const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];

  const totalMonthlyCost = totalTax + contabilizeiFee;

  const breakdown = [
    { name: "PIS", value: pis }, { name: "COFINS", value: cofins },
    { name: "ISS", value: iss }, { name: "IRPJ", value: irpj },
    { name: "CSLL", value: csll }, { name: "CPP (INSS Patronal - 20%)", value: inssPatronal },
    { name: "INSS s/ Pró-labore (11%)", value: totalINSSRetido },
    { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
  ];

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: totalProLaboreBruto,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee,
    breakdown: breakdown.filter(item => item.value > 0.001),
    notes,
    partnerTaxes
  };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
  const totalProLaboreBruto = values.proLabores.reduce((acc, p) => acc + p.value, 0);

  const lucroPresumido = calculateLucroPresumido(values);
  const simplesNacionalBase = _calculateSimplesNacional(values, totalProLaboreBruto, 'Simples Nacional');

  let simplesNacionalOtimizado = { ...simplesNacionalBase, regime: 'Simples Nacional com Fator R' };

  const hasAnnexVActivity = [...values.domesticActivities, ...values.exportActivities].some(a => getCnaeData(a.code)?.requiresFatorR);
  
  if (hasAnnexVActivity) {
      const totalRevenue = simplesNacionalBase.totalRevenue;
      if (totalRevenue > 0 && simplesNacionalBase.fatorR && simplesNacionalBase.fatorR < 0.28) {
          const requiredPayroll = totalRevenue * 0.28;
          const currentPayrollForFatorR = values.totalSalaryExpense;
          let requiredTotalProLabore = requiredPayroll - currentPayrollForFatorR;

          const minProLaboreTotal = fiscalConfig2025.salario_minimo * values.numberOfPartners;
          
          if (requiredTotalProLabore < minProLaboreTotal) {
            requiredTotalProLabore = minProLaboreTotal;
          }

          if (requiredTotalProLabore > totalProLaboreBruto) {
              const optimizedProLaborePerPartner = requiredTotalProLabore / values.numberOfPartners;
              
              const optimizedProLabores = values.proLabores.map(p => ({
                ...p, // Preserve the partner's "duplo vínculo" information
                value: optimizedProLaborePerPartner
              }));

              const optimizedValues: TaxFormValues = { ...values, proLabores: optimizedProLabores };
              simplesNacionalOtimizado = _calculateSimplesNacional(optimizedValues, requiredTotalProLabore, 'Simples Nacional com Fator R');
          }
      }
  }
  
  return {
    simplesNacionalOtimizado: { ...simplesNacionalOtimizado, order: 1 },
    simplesNacionalBase: { ...simplesNacionalBase, order: 2 },
    lucroPresumido: { ...lucroPresumido, order: 3 },
  };
}
