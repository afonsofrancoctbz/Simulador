
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
  const { domesticActivities, exportActivities, exchangeRate, proLabores, rbt12, selectedPlan, selectedCnaes, fp12 } = values;

  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenue = exportActivities.reduce((sum, act) => act.revenue, 0) * exchangeRate;
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

  let cppFromAnnexIV = 0;
  const hasAnexoIV = allCnaesData.some(c => c.annex === 'IV');
  if (hasAnexoIV && monthlyPayroll > 0) {
    const cppRate = fiscalConfig2025.aliquotas_cpp_patronal.base;
    cppFromAnnexIV = monthlyPayroll * cppRate;
  }
  
  const feeBracket = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
  const contabilizeiFee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
  
  if (totalRevenue === 0 && effectiveRbt12 === 0) {
      const totalTax = cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
      const totalMonthlyCost = totalTax + contabilizeiFee;
      return {
          regime: 'Simples Nacional', totalTax, totalMonthlyCost, totalRevenue,
          proLabore: totalProLaboreBruto, effectiveRate: 0, contabilizeiFee,
          breakdown: [
              { name: `CPP (INSS Patronal)`, value: cppFromAnnexIV },
              { name: `INSS s/ Pró-labore`, value: totalINSSRetido },
              { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido }
          ].filter(i => i.value > 0),
          partnerTaxes, netProfit: -totalMonthlyCost, annex: hasAnexoIV ? 'Anexo IV' : 'N/A'
      };
  }
  
  const notes: string[] = [];
  const municipalISSRate = fiscalConfig2025.aliquota_iss_padrao;

  const allDomesticActivities = domesticActivities.map(a => ({ ...a, type: 'domestic' as const }));
  const allExportActivitiesWithBRL = exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, type: 'export' as const }));
  const allActivities = [...allDomesticActivities, ...allExportActivitiesWithBRL];
  
  const SUBLIMIT_SIMPLES = 3600000;
  const rbt12ExceededSublimit = effectiveRbt12 > SUBLIMIT_SIMPLES;

  if (hasAnexoIV) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig2025.aliquotas_cpp_patronal.base)}) sobre a folha de pagamento, fora do DAS.`);
  }

  const revenueByEffectiveAnnex = allActivities.reduce((acc, activity) => {
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
  
  for (const annexStr in revenueByEffectiveAnnex) {
    const annex = annexStr as Annex;
    const annexInfo = revenueByEffectiveAnnex[annex];
    const annexTable = ANNEX_TABLES[annex];
    const bracketIndex = _findBracketIndex(annexTable, effectiveRbt12);
    const bracket = annexTable[bracketIndex];
    
    let effectiveRate;
    if (effectiveRbt12 > 0) {
      effectiveRate = (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12;
    } else {
      effectiveRate = annexTable[0].rate;
    }
    
    const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
    const isLastBracket = bracketIndex === annexTable.length - 1;

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
    
    const exportExemptionFactor = PIS + COFINS + ISS + IPI + ICMS;
    const dasForExport = annexInfo.export * (effectiveRate * (1 - exportExemptionFactor));
    if (annexInfo.export > 0 && !notes.some(n => n.includes('exportação'))) {
       notes.push("Receitas de exportação têm isenção de PIS, COFINS, ISS, IPI e ICMS, resultando em uma alíquota de DAS menor sobre essa parcela.");
    }
    
    totalDas += dasForDomestic + dasForExport;
  }

  const companyTaxes = totalDas + cppFromAnnexIV + totalIssSeparado;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;
  const totalTax = companyTaxes + totalWithheldTaxes;
  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  let regimeName = "Simples Nacional";
  let annexLabel = "";

  const annexKeys = Object.keys(revenueByEffectiveAnnex) as Annex[];
  if (useAnnexIIIForV) {
    annexLabel = "Anexo III (Com Fator R)";
    regimeName = "Simples Nacional Anexo III"
  } else if (hasAnnexVActivity) {
    annexLabel = "Anexo V (Sem Fator R)";
    regimeName = "Simples Nacional Anexo V"
  } else if (annexKeys.length === 1) {
    annexLabel = `Anexo ${annexKeys[0]}`;
  } else if (annexKeys.length > 1) {
    annexLabel = `Múltiplos Anexos (${annexKeys.join(', ')})`;
  }


  const effectiveDasRate = totalRevenue > 0 ? totalDas / totalRevenue : 0;
  
  const breakdown = [
    { name: `DAS`, value: totalDas },
    { name: `CPP (INSS Patronal)`, value: cppFromAnnexIV },
    { name: `ISS (Fora do DAS)`, value: totalIssSeparado },
    { name: `INSS s/ Pró-labore`, value: totalINSSRetido },
    { name: 'IRRF s/ Pró-labore', value: totalIRRFRetido },
  ];

  const companyCosts = companyTaxes + totalProLaboreBruto + contabilizeiFee;
  const netProfit = totalRevenue - companyCosts;

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
  
  // A CPP de 20% incide sobre a folha para prestadores de serviço no Lucro Presumido.
  const cpp = monthlyPayroll > 0 ? monthlyPayroll * fiscalConfig2025.aliquotas_cpp_patronal.base : 0;

  if (totalRevenue === 0) {
      const totalTax = totalINSSRetido + totalIRRFRetido + cpp;
      const totalMonthlyCost = totalTax + contabilizeiFee;
      return {
          regime: 'Lucro Presumido', totalTax, totalMonthlyCost, totalRevenue: 0,
          proLabore: totalProLaboreBruto, effectiveRate: 0, contabilizeiFee, 
          breakdown: [
              { name: `CPP (INSS Patronal)`, value: cpp },
              { name: `INSS s/ Pró-labore`, value: totalINSSRetido },
              { name: `IRRF s/ Pró-labore`, value: totalIRRFRetido },
          ].filter(item => item.value > 0.001),
          partnerTaxes, netProfit: -totalMonthlyCost,
      };
  }

  const notes: string[] = [];
  if (exportRevenueBRL > 0) notes.push("Receitas de exportação são isentas de PIS, COFINS e ISS. IRPJ e CSLL incidem sobre a presunção de lucro do faturamento total.");
  
  const pis = domesticRevenue * 0.0065; 
  const cofins = domesticRevenue * 0.03; 
  const iss = domesticRevenue * fiscalConfig2025.aliquota_iss_padrao; 

  const allActivities = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))];
  const presumedProfitBase = allActivities.reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
  }, 0);

  const IRPJ_ADDITIONAL_MONTHLY_THRESHOLD = 20000;
  const irpjAdicionalMensal = Math.max(0, presumedProfitBase - IRPJ_ADDITIONAL_MONTHLY_THRESHOLD) * 0.10;
  const irpj = (presumedProfitBase * 0.15) + irpjAdicionalMensal;
  const csll = presumedProfitBase * 0.09;
  
  const companyRevenueTaxes = irpj + csll + pis + cofins + iss;
  const totalWithheldTaxes = totalINSSRetido + totalIRRFRetido;

  const totalTax = companyRevenueTaxes + cpp + totalWithheldTaxes;
  const totalMonthlyCost = totalTax + contabilizeiFee;
  
  const companyCosts = companyRevenueTaxes + cpp + totalProLaboreBruto + contabilizeiFee;
  const netProfit = totalRevenue - companyCosts;
  
  const irpjRate = totalRevenue > 0 ? irpj / totalRevenue : 0;
  const csllRate = totalRevenue > 0 ? csll / totalRevenue : 0;
  const inssRate = totalProLaboreBruto > 0 ? totalINSSRetido / totalProLaboreBruto : 0;
  const cppRate = totalProLaboreBruto > 0 ? cpp / totalProLaboreBruto : 0;


  const breakdown = [
    { name: `IRPJ (${formatPercent(irpjRate)})`, value: irpj },
    { name: `CSLL (${formatPercent(csllRate)})`, value: csll },
    { name: `PIS`, value: pis },
    { name: `COFINS`, value: cofins },
    { name: `ISS`, value: iss },
    { name: `CPP (INSS Patronal - ${formatPercent(cppRate)})`, value: cpp },
    { name: `INSS s/ Pró-labore (${formatPercent(inssRate)})`, value: totalINSSRetido },
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
                 simplesNacionalOtimizado.optimizationNote = `Pró-labore ajustado para ${formatCurrencyBRL(requiredTotalProLabore)} para otimizar o Fator R.`
              }
          }
      }
  }
  
  const scenarios = [simplesNacionalBase, simplesNacionalOtimizado, lucroPresumido].filter(Boolean) as TaxDetails[];
  
  let order = 1;
  const orderedScenarios = scenarios.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);
  for(const s of orderedScenarios) {
      s.order = order++;
  }


  return {
    simplesNacionalBase,
    simplesNacionalOtimizado,
    lucroPresumido,
  };
}



