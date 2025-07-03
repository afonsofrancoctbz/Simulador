
import { getFiscalParameters } from '@/config/fiscal';
import {
  CNAE_DATA,
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
} from './constants';
import {
  type CalculationResults2026,
  type TaxFormValues,
  type TaxDetails2026,
  type CnaeData,
  type Annex,
  type FeeBracket,
  type ProLaboreInput,
  type ProLaboreOutput,
  type PartnerTaxDetails,
  type ProLaboreForm,
} from './types';
import { formatCurrencyBRL, formatPercent } from './utils';

const fiscalConfig = getFiscalParameters(2026);
const ANNEX_TABLES = {
  I: fiscalConfig.simples_nacional.anexoI,
  II: fiscalConfig.simples_nacional.anexoII,
  III: fiscalConfig.simples_nacional.anexoIII,
  IV: fiscalConfig.simples_nacional.anexoIV,
  V: fiscalConfig.simples_nacional.anexoV,
};
const IVA_RATE = fiscalConfig.reforma_tributaria.iva_rate;
const CBS_RATE = fiscalConfig.reforma_tributaria.cbs_rate;
const IBS_RATE = fiscalConfig.reforma_tributaria.ibs_rate;

// --- DUPLICATED HELPERS (to avoid altering calculations.ts) ---

function _findBracket(table: { max: number }[], value: number) {
  if (!table || table.length === 0) return { max: 0 };
  if (value === 0) return table[0];
  for (const bracket of table) if (value <= bracket.max) return bracket;
  return table[table.length - 1];
}

function _findFeeBracket(table: FeeBracket[], revenue: number): FeeBracket | undefined {
    return table.find(bracket => revenue >= bracket.min && revenue <= bracket.max);
}

export function getCnaeData(code: string): CnaeData | undefined {
  return CNAE_DATA.find(c => c.code === code);
}

function _calcularEncargosProLabore(input: ProLaboreInput): ProLaboreOutput {
  const { proLaboreBruto, otherContributionSalary = 0, configuracaoFiscal } = input;
  if (proLaboreBruto <= 0) return { valorBruto: 0, baseCalculoINSS: 0, aliquotaEfetivaINSS: 0, valorINSSCalculado: 0, baseCalculoIRRF: 0, valorIRRFCalculado: 0, valorLiquido: 0 };
  const tetoINSS = configuracaoFiscal.teto_inss;
  const remainingContributionRoom = Math.max(0, tetoINSS - otherContributionSalary);
  const baseCalculoINSS = Math.min(proLaboreBruto, remainingContributionRoom);
  const valorINSSCalculado = baseCalculoINSS * configuracaoFiscal.aliquota_inss_prolabore;
  const baseCalculoIRRF = proLaboreBruto - valorINSSCalculado;
  const irrfBracket = _findBracket(configuracaoFiscal.tabela_irrf, baseCalculoIRRF);
  const valorIRRFCalculado = Math.max(0, baseCalculoIRRF * irrfBracket.rate - irrfBracket.deduction);
  const valorLiquido = proLaboreBruto - valorINSSCalculado - valorIRRFCalculado;
  const aliquotaEfetivaINSS = proLaboreBruto > 0 ? valorINSSCalculado / proLaboreBruto : 0;
  return { valorBruto: proLaboreBruto, baseCalculoINSS, aliquotaEfetivaINSS, valorINSSCalculado, baseCalculoIRRF, valorIRRFCalculado, valorLiquido };
}

function _calculatePartnerTaxes(proLabores: ProLaboreForm[]): { partnerTaxes: PartnerTaxDetails[], totalINSSRetido: number, totalIRRFRetido: number } {
    const partnerTaxes: PartnerTaxDetails[] = [];
    let totalINSSRetido = 0, totalIRRFRetido = 0;
    for (const proLabore of proLabores) {
        const proLaboreTaxesPerPartner = _calcularEncargosProLabore({ proLaboreBruto: proLabore.value, otherContributionSalary: proLabore.hasOtherInssContribution ? proLabore.otherContributionSalary : 0, configuracaoFiscal: fiscalConfig });
        partnerTaxes.push({ proLaboreBruto: proLaboreTaxesPerPartner.valorBruto, inss: proLaboreTaxesPerPartner.valorINSSCalculado, irrf: proLaboreTaxesPerPartner.valorIRRFCalculado, proLaboreLiquido: proLaboreTaxesPerPartner.valorLiquido });
        totalINSSRetido += proLaboreTaxesPerPartner.valorINSSCalculado;
        totalIRRFRetido += proLaboreTaxesPerPartner.valorIRRFCalculado;
    }
    return { partnerTaxes, totalINSSRetido, totalIRRFRetido };
}

// --- CALCULATION LOGIC FOR 2026 ---

function calculateLucroPresumido2026(values: TaxFormValues): TaxDetails2026 {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores } = values;
  const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
  
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;

  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores);
  const totalPayroll = totalSalaryExpense + totalProLaboreBruto;
  const inssPatronal = totalPayroll > 0 ? totalPayroll * fiscalConfig.aliquotas_cpp_patronal.base : 0;

  let presumedProfitBase = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))].reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRate ?? 0.32));
  }, 0);

  const irpj = presumedProfitBase * 0.15 + Math.max(0, presumedProfitBase - 20000) * 0.10;
  const csll = presumedProfitBase * 0.09;
  
  // Reforma Tributária: PIS/COFINS -> CBS, ISS -> IBS
  // Calculate total IVA considering reductions for each activity
  const totalIva = domesticActivities.reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    const reduction = cnaeInfo?.ivaReduction ?? 0;
    const effectiveIvaRate = IVA_RATE * (1 - reduction);
    return sum + (activity.revenue * effectiveIvaRate);
  }, 0);

  // Split total IVA proportionally between CBS and IBS
  const cbs = IVA_RATE > 0 ? totalIva * (CBS_RATE / IVA_RATE) : 0;
  const ibs = IVA_RATE > 0 ? totalIva * (IBS_RATE / IVA_RATE) : 0;


  const companyRevenueTaxes = irpj + csll + cbs + ibs;
  const totalTax = companyRevenueTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
  const fee = _findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue)?.plans.expertsEssencial ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans.expertsEssencial;
  const totalMonthlyCost = totalTax + fee;

  return {
    regime: 'Lucro Presumido',
    totalTax,
    totalMonthlyCost,
    totalRevenue,
    proLabore: totalProLaboreBruto,
    effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
    contabilizeiFee: fee,
    breakdown: [
        { name: "CBS", value: cbs }, { name: "IBS", value: ibs },
        { name: "IRPJ", value: irpj }, { name: "CSLL", value: csll }, 
        { name: "CPP (INSS Patronal - 20%)", value: inssPatronal },
        { name: "INSS s/ Pró-labore (11%)", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
    ].filter(i => i.value > 0.001),
    notes: ["No cenário de 2026, PIS/COFINS e ISS são substituídos por CBS e IBS. IRPJ, CSLL e encargos sobre a folha permanecem."],
    partnerTaxes
  };
}

function _calculateSimples(values: TaxFormValues, isHybrid: boolean): TaxDetails2026 {
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, b2bRevenuePercentage = 0 } = values;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores);

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
    const totalRevenue = domesticRevenue + exportRevenue;
    
    if (totalRevenue === 0) {
      // Handle zero revenue case
      return {
        regime: isHybrid ? 'Simples Nacional Híbrido' : 'Simples Nacional Tradicional',
        totalTax: totalINSSRetido + totalIRRFRetido,
        totalMonthlyCost: totalINSSRetido + totalIRRFRetido + CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans.expertsEssencial,
        totalRevenue: 0,
        proLabore: totalProLaboreBruto,
        effectiveRate: 0,
        contabilizeiFee: CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans.expertsEssencial,
        breakdown: [
          { name: "INSS s/ Pró-labore (11%)", value: totalINSSRetido },
          { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
        ].filter(i => i.value > 0.001),
        partnerTaxes
      };
    }

    const allActivities = [...domesticActivities, ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate }))];
    const rbt12 = totalRevenue * 12;
    const totalPayrollForFatorR = totalSalaryExpense + totalProLaboreBruto;
    const fatorR = totalRevenue > 0 ? totalPayrollForFatorR / totalRevenue : 0;
    
    let totalDas = 0;
    let cppFromAnnexIV = 0;
    let ivaTaxes = 0;

    const revenueByAnnex = allActivities.reduce((acc, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return acc;
        let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= 0.28) ? 'III' : cnaeInfo.annex;
        if (!acc[effectiveAnnex]) acc[effectiveAnnex] = 0;
        acc[effectiveAnnex] += activity.revenue;
        return acc;
    }, {} as Record<Annex, number>);

    for (const annexStr in revenueByAnnex) {
        const annex = annexStr as Annex;
        const annexRevenue = revenueByAnnex[annex];
        const annexTable = ANNEX_TABLES[annex];
        const bracket = _findBracket(annexTable, rbt12);
        const effectiveRate = (rbt12 * bracket.rate - bracket.deduction) / rbt12;
        
        totalDas += annexRevenue * effectiveRate;

        if (annex === 'IV') {
            const cppRate = fiscalConfig.aliquotas_cpp_patronal.base;
            cppFromAnnexIV += (totalSalaryExpense + totalProLaboreBruto) * cppRate * (annexRevenue / totalRevenue);
        }
    }

    if (isHybrid) {
      // 1. Calculate the IVA that will be paid "por fora"
      const totalIvaPorFora = domesticActivities.reduce((sum, activity) => {
          const activityB2bRevenue = activity.revenue * (b2bRevenuePercentage / 100);
          const cnaeInfo = getCnaeData(activity.code);
          const reduction = cnaeInfo?.ivaReduction ?? 0;
          const effectiveIvaRate = IVA_RATE * (1 - reduction);
          return sum + (activityB2bRevenue * effectiveIvaRate);
      }, 0);
      
      ivaTaxes = totalIvaPorFora;
  
      // 2. Calculate how much the DAS should be reduced
      const dasReduction = domesticActivities.reduce((sum, activity) => {
          const activityB2bRevenue = activity.revenue * (b2bRevenuePercentage / 100);
          const cnaeInfo = getCnaeData(activity.code);
          if (!cnaeInfo) return sum;
  
          let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= 0.28) ? 'III' : cnaeInfo.annex;
          const annexTable = ANNEX_TABLES[effectiveAnnex];
          const bracket = _findBracket(annexTable, rbt12);
          const effectiveRate = totalRevenue > 0 ? (rbt12 * bracket.rate - bracket.deduction) / rbt12 : 0;
          
          const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
          const ivaProportionInDas = PIS + COFINS + ISS + ICMS + IPI;
          
          return sum + (activityB2bRevenue * effectiveRate * ivaProportionInDas);
      }, 0);
      
      totalDas -= dasReduction;
    }
    
    const fee = _findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue)?.plans.expertsEssencial ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans.expertsEssencial;
    const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        { name: 'DAS (Simples Nacional)', value: totalDas },
        { name: 'IVA (CBS+IBS) fora do DAS', value: ivaTaxes },
        { name: "CPP (INSS Patronal - 20%)", value: cppFromAnnexIV },
        { name: "INSS s/ Pró-labore (11%)", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
    ];

    const notes = [];
    if (isHybrid) {
      notes.push(`Neste cenário, ${formatPercent(b2bRevenuePercentage/100)} do faturamento (B2B) paga IVA fora do DAS. A alíquota do IVA pode ser reduzida dependendo da sua atividade.`);
    } else {
      notes.push("Regime padrão do Simples Nacional. O crédito de IVA gerado para clientes B2B é limitado à alíquota do DAS.");
    }

    return {
        regime: isHybrid ? 'Simples Nacional Híbrido' : 'Simples Nacional Tradicional',
        totalTax, totalMonthlyCost, totalRevenue,
        proLabore: totalProLaboreBruto,
        fatorR,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown: breakdown.filter(item => item.value > 0.001),
        notes,
        partnerTaxes
    };
}


export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const lucroPresumido = calculateLucroPresumido2026(values);
  const simplesNacionalTradicional = _calculateSimples(values, false);
  const simplesNacionalHibrido = _calculateSimples(values, true);
  
  return {
    simplesNacionalTradicional,
    simplesNacionalHibrido,
    lucroPresumido,
  };
}
