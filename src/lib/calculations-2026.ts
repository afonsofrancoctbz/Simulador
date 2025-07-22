

import { getFiscalParameters, type FiscalConfig, type FiscalConfig2026 } from '@/config/fiscal';
import {
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
} from './cnae-helpers';
import {
  type CalculationResults2026,
  type TaxFormValues,
  type TaxDetails2026,
  type Annex,
  type FeeBracket,
} from './types';
import { formatPercent, findBracket, findFeeBracket } from './utils';
import { getCnaeData } from './cnae-helpers';
import { _calculatePartnerTaxes, _calculateCpp } from './calculations';

const fiscalConfig2026 = getFiscalParameters(2026) as FiscalConfig2026;

function calculateLucroPresumido2026(values: TaxFormValues): TaxDetails2026 {
  const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan } = values;
  const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
  
  const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
  const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + act.revenue, 0) * exchangeRate;
  const totalRevenue = domesticRevenue + exportRevenueBRL;
  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

  // Uses the centralized function from calculations.ts
  const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2026);
  // Uses the centralized function from calculations.ts
  const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig2026);

  let presumedProfitBase = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))].reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
  }, 0);

  const irpj = presumedProfitBase * fiscalConfig2026.lucro_presumido_rates.IRPJ_BASE;
  const irpjAdicional = Math.max(0, (presumedProfitBase - (fiscalConfig2026.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL * 1))) * fiscalConfig2026.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
  const csll = presumedProfitBase * fiscalConfig2026.lucro_presumido_rates.CSLL;
  
  const totalIva = domesticActivities.reduce((sum, activity) => {
    const cnaeInfo = getCnaeData(activity.code);
    const reduction = cnaeInfo?.ivaReduction ?? 0;
    const effectiveIvaRate = fiscalConfig2026.reforma_tributaria.iva_rate * (1 - reduction);
    return sum + (activity.revenue * effectiveIvaRate);
  }, 0);

  const cbs = totalIva > 0 ? totalIva * (fiscalConfig2026.reforma_tributaria.cbs_rate / fiscalConfig2026.reforma_tributaria.iva_rate) : 0;
  const ibs = totalIva > 0 ? totalIva * (fiscalConfig2026.reforma_tributaria.ibs_rate / fiscalConfig2026.reforma_tributaria.iva_rate) : 0;

  const companyRevenueTaxes = irpj + irpjAdicional + csll + cbs + ibs;
  const totalTax = companyRevenueTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
  const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
  const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];
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
        { name: `CBS (${formatPercent(totalRevenue > 0 ? cbs / totalRevenue : 0)})`, value: cbs },
        { name: `IBS (${formatPercent(totalRevenue > 0 ? ibs / totalRevenue : 0)})`, value: ibs },
        { name: `IRPJ (${formatPercent(totalRevenue > 0 ? (irpj+irpjAdicional) / totalRevenue : 0)})`, value: irpj + irpjAdicional },
        { name: `CSLL (${formatPercent(totalRevenue > 0 ? csll / totalRevenue : 0)})`, value: csll }, 
        { name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2026.aliquotas_cpp_patronal.base)})`, value: inssPatronal },
        { name: "INSS s/ Pró-labore (11,00%)", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
    ].filter(i => i.value > 0.001),
    notes: ["No cenário de 2026, PIS/COFINS e ISS são substituídos por CBS e IBS. IRPJ, CSLL e encargos sobre a folha permanecem."],
    partnerTaxes
  };
}


function _calculateSimples2026(values: TaxFormValues, isHybrid: boolean): TaxDetails2026 {
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, b2bRevenuePercentage = 0, rbt12, selectedPlan, fp12 } = values;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    const totalPayroll = totalSalaryExpense + totalProLaboreBruto;

    // Uses the centralized function from calculations.ts
    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2026);

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenue;
    
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : totalPayroll * 12;

    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    if (totalRevenue === 0 && effectiveRbt12 === 0) {
      return {
        regime: isHybrid ? 'Simples Nacional Híbrido' : 'Simples Nacional Tradicional',
        totalTax: totalINSSRetido + totalIRRFRetido,
        totalMonthlyCost: totalINSSRetido + totalIRRFRetido + fee,
        totalRevenue: 0,
        proLabore: totalProLaboreBruto,
        effectiveRate: 0,
        contabilizeiFee: fee,
        breakdown: [
          { name: "INSS s/ Pró-labore (11,00%)", value: totalINSSRetido },
          { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
        ].filter(i => i.value > 0.001),
        partnerTaxes
      };
    }

    const allActivities = [...domesticActivities, ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate }))];
    const fatorR = totalRevenue > 0 ? totalPayroll / totalRevenue : (effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0);
    
    let totalDas = 0;
    let cppFromAnnexIV = 0;
    let ivaTaxes = 0;
    let hasAnnexIVActivity = false;

    const revenueByAnnex = allActivities.reduce((acc, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return acc;
        let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig2026.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        if (!acc[effectiveAnnex]) acc[effectiveAnnex] = 0;
        acc[effectiveAnnex] += activity.revenue;
        return acc;
    }, {} as Record<Annex, number>);

    for (const annexStr in revenueByAnnex) {
        const annex = annexStr as Annex;
        const annexRevenue = revenueByAnnex[annex];
        const annexTable = fiscalConfig2026.simples_nacional[annex];
        const bracket = findBracket(annexTable, effectiveRbt12);
        const effectiveRate = effectiveRbt12 > 0 ? (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12 : bracket.rate;
        
        totalDas += annexRevenue * effectiveRate;

        if (annex === 'IV') {
            hasAnnexIVActivity = true;
        }
    }
    
    if (hasAnnexIVActivity) {
        cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig2026);
    }

    if (isHybrid) {
      const b2bRevenue = domesticRevenue * (b2bRevenuePercentage / 100);
      
      const totalIvaPorFora = domesticActivities.reduce((sum, activity) => {
          const activityB2bRevenue = activity.revenue * (b2bRevenuePercentage / 100);
          const cnaeInfo = getCnaeData(activity.code);
          const reduction = cnaeInfo?.ivaReduction ?? 0;
          const effectiveIvaRate = fiscalConfig2026.reforma_tributaria.iva_rate * (1 - reduction);
          return sum + (activityB2bRevenue * effectiveIvaRate);
      }, 0);
      
      ivaTaxes = totalIvaPorFora;
  
      const dasReduction = domesticActivities.reduce((sum, activity) => {
          const activityB2bRevenue = activity.revenue * (b2bRevenuePercentage / 100);
          const cnaeInfo = getCnaeData(activity.code);
          if (!cnaeInfo) return sum;
  
          let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig2026.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
          const annexTable = fiscalConfig2026.simples_nacional[effectiveAnnex];
          const bracket = findBracket(annexTable, effectiveRbt12);
          const effectiveRate = effectiveRbt12 > 0 ? (effectiveRbt12 * bracket.rate - bracket.deduction) / effectiveRbt12 : bracket.rate;
          
          const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
          const ivaProportionInDas = PIS + COFINS + ISS + ICMS + IPI;
          
          return sum + (activityB2bRevenue * effectiveRate * ivaProportionInDas);
      }, 0);
      
      totalDas -= dasReduction;
    }
    
    const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        { name: 'DAS (Simples Nacional)', value: totalDas },
        { name: 'IVA (CBS+IBS) fora do DAS', value: ivaTaxes },
        { name: `CPP (INSS Patronal - ${formatPercent(fiscalConfig2026.aliquotas_cpp_patronal.base)})`, value: cppFromAnnexIV },
        { name: "INSS s/ Pró-labore (11,00%)", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
    ];

    const notes = [];
    if (isHybrid) {
      notes.push(`Neste cenário, ${formatPercent(b2bRevenuePercentage/100)} do faturamento (B2B) paga IVA fora do DAS. A alíquota do IVA pode ser reduzida dependendo da sua atividade.`);
    } else {
      notes.push("Regime padrão do Simples Nacional. O crédito de IVA gerado para clientes B2B é limitado à alíquota do DAS.");
    }
    if (cppFromAnnexIV > 0) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig2026.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
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
  const simplesNacionalTradicional = _calculateSimples2026(values, false);
  const simplesNacionalHibrido = _calculateSimples2026(values, true);
  
  return {
    simplesNacionalTradicional: { ...simplesNacionalTradicional, order: 1 },
    simplesNacionalHibrido: { ...simplesNacionalHibrido, order: 2 },
    lucroPresumido: { ...lucroPresumido, order: 3 },
  };
}

    