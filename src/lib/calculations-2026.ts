


import { getFiscalParameters, type FiscalConfig } from '@/config/fiscal';
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
  type TaxDetails,
  type ProLaboreForm,
} from './types';
import { formatPercent, findBracket, findFeeBracket } from './utils';
import { getCnaeData } from './cnae-helpers';
import { _calculatePartnerTaxes, _calculateCpp } from './calculations';

const fiscalConfig2026 = getFiscalParameters(2026);

function calculateLucroPresumido(values: TaxFormValues, isPostReform: boolean): TaxDetails | TaxDetails2026 {
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan, b2bRevenuePercentage = 100, creditGeneratingExpenses = 0 } = values;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    
    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig2026);
    const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig2026);

    // IRPJ and CSLL (Unchanged by consumption reform)
    let presumedProfitBase = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))].reduce((sum, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
    }, 0);

    const irpj = presumedProfitBase * fiscalConfig2026.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicional = Math.max(0, (presumedProfitBase - (fiscalConfig2026.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL * 1))) * fiscalConfig2026.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    const csll = presumedProfitBase * fiscalConfig2026.lucro_presumido_rates.CSLL;
    
    let consumptionTaxes = 0;
    const breakdown = [
        { name: `IRPJ`, value: irpj + irpjAdicional },
        { name: `CSLL`, value: csll }, 
        { name: `CPP (INSS Patronal)`, value: inssPatronal },
        { name: "INSS s/ Pró-labore", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
    ];

    if (isPostReform) {
        // NEW: IBS/CBS Calculation (Replaces PIS/COFINS/ISS)
        // Export revenues are immune.
        const totalIvaDebit = domesticActivities.reduce((sum, activity) => {
            const cnaeInfo = getCnaeData(activity.code);
            const reduction = cnaeInfo?.ivaReduction ?? 0;
            const effectiveIvaRate = fiscalConfig2026.reforma_tributaria.iva_rate * (1 - reduction);
            return sum + (activity.revenue * effectiveIvaRate);
        }, 0);

        const totalIvaCredit = creditGeneratingExpenses * fiscalConfig2026.reforma_tributaria.iva_rate;
        const totalIvaDue = totalIvaDebit - totalIvaCredit;

        const cbs = totalIvaDue > 0 ? totalIvaDue * (fiscalConfig2026.reforma_tributaria.cbs_rate_test / (fiscalConfig2026.reforma_tributaria.cbs_rate_test + fiscalConfig2026.reforma_tributaria.ibs_rate_test)) : 0;
        const ibs = totalIvaDue > 0 ? totalIvaDue * (fiscalConfig2026.reforma_tributaria.ibs_rate_test / (fiscalConfig2026.reforma_tributaria.cbs_rate_test + fiscalConfig2026.reforma_tributaria.ibs_rate_test)) : 0;

        consumptionTaxes = ibs + cbs;
        breakdown.push({ name: `CBS (8,8%)`, value: cbs });
        breakdown.push({ name: `IBS (17,7%)`, value: ibs });
    } else {
        // Old PIS/COFINS/ISS
        const pis = domesticRevenue * fiscalConfig2026.lucro_presumido_rates.PIS;
        const cofins = domesticRevenue * fiscalConfig2026.lucro_presumido_rates.COFINS;
        const issValue = values.issRate ?? fiscalConfig2026.lucro_presumido_rates.ISS;
        const iss = domesticRevenue * issValue;
        consumptionTaxes = pis + cofins + iss;
        breakdown.push({ name: `PIS`, value: pis });
        breakdown.push({ name: `COFINS`, value: cofins });
        breakdown.push({ name: `ISS (${(issValue * 100).toFixed(2).replace('.',',')}%)`, value: iss });
    }

    // Total Taxes
    const companyRevenueTaxes = irpj + irpjAdicional + csll + consumptionTaxes;
    const totalTax = companyRevenueTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
    
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];
    const totalMonthlyCost = totalTax + fee;

    const regimeName = isPostReform ? 'Lucro Presumido' : 'Lucro Presumido (Regras Atuais)';
    const notes = isPostReform 
        ? ["Cálculo pós-reforma: PIS, COFINS e ISS são substituídos por CBS e IBS. Alíquota do IVA pode ter redução de 30% ou 60% dependendo da atividade. Receitas de exportação são imunes ao IVA. Créditos de insumos foram considerados."]
        : ["Cálculo pré-reforma: PIS, COFINS e ISS cumulativos. Receitas de exportação são isentas de PIS/COFINS/ISS."];

    const result: TaxDetails | TaxDetails2026 = {
        regime: regimeName as any, // Type assertion to satisfy discriminated union
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        proLabore: totalProLaboreBruto,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown: breakdown.filter(i => i.value > 0.001),
        notes,
        partnerTaxes
    };
    return result;
}


function _calculateSimples2026(values: TaxFormValues, isHybrid: boolean, proLaboreOverride?: ProLaboreForm[]): TaxDetails2026 {
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, b2bRevenuePercentage = 100, rbt12, selectedPlan, fp12, creditGeneratingExpenses = 0 } = values;
    
    const proLaboresToUse = proLaboreOverride || proLabores;
    const totalProLaboreBruto = proLaboresToUse.reduce((a, p) => a + p.value, 0);
    const totalPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig2026);

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenue;
    
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
    const effectiveFp12 = fp12 > 0 ? fp12 : totalPayroll * 12;

    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    const fatorR = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
    
    let totalDas = 0;
    let cppFromAnnexIV = 0;
    let ivaTaxes = 0;
    let hasAnnexIVActivity = false;

    const allActivities = [...domesticActivities.map(a=>({...a, isExport: false})), ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, isExport: true }))];

    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;
        
        const revenueForActivity = activity.revenue;
        if(revenueForActivity === 0) return;

        let effectiveAnnex: Annex = (cnaeInfo.requiresFatorR && fatorR >= fiscalConfig2026.simples_nacional.limite_fator_r) ? 'III' : cnaeInfo.annex;
        const annexTable = fiscalConfig2026.simples_nacional[effectiveAnnex];
        const bracket = findBracket(annexTable, effectiveRbt12);
        const { rate, deduction, distribution } = bracket;
        const effectiveRate = effectiveRbt12 > 0 ? (effectiveRbt12 * rate - deduction) / effectiveRbt12 : rate;

        const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0, CBS = 0, IBS = 0 } = distribution;
        const consumptionTaxProportionInDas = isHybrid ? (PIS + COFINS + (ISS || 0) + (ICMS || 0) + (IPI || 0) + (CBS || 0) + (IBS || 0)) : (PIS + COFINS + (ISS || 0) + (ICMS || 0) + (IPI || 0));

        let rateForDas = effectiveRate;
        
        // Apply export exemption by reducing the rate
        if (activity.isExport) {
            rateForDas -= effectiveRate * consumptionTaxProportionInDas;
        }

        // For hybrid, further reduce the rate for the portion of domestic B2B revenue
        if (isHybrid && !activity.isExport) {
             const b2bRevenuePortion = (b2bRevenuePercentage ?? 100) / 100;
             const effectiveConsumptionTaxRate = effectiveRate * consumptionTaxProportionInDas;
             const weightedReduction = effectiveConsumptionTaxRate * b2bRevenuePortion;
             rateForDas -= weightedReduction;
        }

        totalDas += revenueForActivity * rateForDas;
        
        if (effectiveAnnex === 'IV') hasAnnexIVActivity = true;
    });

    if (hasAnnexIVActivity) {
        cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig2026);
    }

    if (isHybrid) {
      const insumosGeradoresDeCredito = creditGeneratingExpenses ?? 0;
      
      const totalIvaDebit = domesticActivities.reduce((sum, activity) => {
          const activityB2bRevenue = activity.revenue * ((b2bRevenuePercentage ?? 100) / 100);
          const cnaeInfo = getCnaeData(activity.code);
          const reduction = cnaeInfo?.ivaReduction ?? 0;
          const effectiveIvaRate = fiscalConfig2026.reforma_tributaria.iva_rate * (1 - reduction);
          return sum + (activityB2bRevenue * effectiveIvaRate);
      }, 0);

      const totalIvaCredit = insumosGeradoresDeCredito * fiscalConfig2026.reforma_tributaria.iva_rate;
      ivaTaxes = Math.max(0, totalIvaDebit - totalIvaCredit);
    }
    
    const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        { name: 'DAS (Simples Nacional Remanescente)', value: totalDas },
        { name: 'IVA (IBS/CBS pago por fora)', value: ivaTaxes },
        { name: `CPP (INSS Patronal - p/ Anexo IV)`, value: cppFromAnnexIV },
        { name: "INSS s/ Pró-labore", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
    ];

    const notes = [];
    if (isHybrid) {
      notes.push(`Cenário competitivo para B2B: ${formatPercent((b2bRevenuePercentage ?? 100)/100)} da receita doméstica paga IVA por fora, gerando crédito para o cliente. O DAS é reduzido. Receitas de exportação são imunes ao IVA.`);
    } else {
      notes.push("Regime padrão do Simples. O crédito de IVA para clientes B2B é limitado. Receitas de exportação têm PIS/COFINS/ISS zerados dentro do DAS.");
    }
    if (cppFromAnnexIV > 0) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig2026.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
    }

    let regimeName: TaxDetails2026['regime'] = 'Simples Nacional Tradicional';
    if(proLaboreOverride) {
      regimeName = 'Simples Nacional (Fator R)';
    } else if (isHybrid) {
      regimeName = 'Simples Nacional Híbrido';
    }
    
    const result: TaxDetails2026 = {
        regime: regimeName,
        totalTax, totalMonthlyCost, totalRevenue,
        proLabore: totalProLaboreBruto,
        fatorR,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown: breakdown.filter(item => item.value > 0.001),
        notes,
        partnerTaxes
    };

     if (proLaboreOverride) {
        result.optimizationNote = `Pró-labore ajustado para ${totalProLaboreBruto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} para atingir o Fator R e tributar pelo Anexo III.`;
    }
    return result;
}


export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const lucroPresumido = calculateLucroPresumido(values, true) as TaxDetails2026;
  const lucroPresumidoAtual = calculateLucroPresumido(values, false) as TaxDetails;
  
  let simplesNacionalTradicional = _calculateSimples2026(values, false);
  let simplesNacionalHibrido = _calculateSimples2026(values, true);
  
  const hasAnnexVActivity = values.selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);
  
  let simplesNacionalOtimizado: TaxDetails2026 | null = null;
  
  if (hasAnnexVActivity && (simplesNacionalTradicional.fatorR ?? 0) < fiscalConfig2026.simples_nacional.limite_fator_r) {
      const totalRevenue = values.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + values.exportActivities.reduce((acc, act) => acc + (act.revenue * (values.exchangeRate || 1)), 0);
      const effectiveRbt12 = values.rbt12 > 0 ? values.rbt12 : totalRevenue * 12;
      const currentTotalProLabore = values.proLabores.reduce((acc, p) => acc + p.value, 0);
      const currentTotalPayroll = values.totalSalaryExpense + currentTotalProLabore;
      const effectiveFp12 = values.fp12 > 0 ? values.fp12 : currentTotalPayroll * 12;

      const requiredPayroll = effectiveRbt12 * fiscalConfig2026.simples_nacional.limite_fator_r;
      const additionalProLaboreNeeded = Math.max(0, requiredPayroll - effectiveFp12);
      
      if (additionalProLaboreNeeded > 0) {
          const newTotalProLabore = currentTotalProLabore + (additionalProLaboreNeeded); // The need is annual, we need to distribute it
          const proLaborePerPartner = newTotalProLabore / (values.proLabores.length || 1);
          
          const optimizedProLabores: ProLaboreForm[] = values.proLabores.map(p => ({ 
              ...p, 
              value: proLaborePerPartner,
          }));
          
          if (optimizedProLabores.length === 0) {
            optimizedProLabores.push({value: proLaborePerPartner, hasOtherInssContribution: false, otherContributionSalary: 0})
          }

          // We create an optimized version of the "Traditional" scenario
          const optimizedValues = {
            ...values,
            // We adjust the FP12 to reflect the new annual payroll projection
            fp12: (values.totalSalaryExpense + proLaborePerPartner) * 12
          };

          simplesNacionalOtimizado = _calculateSimples2026(optimizedValues, false, optimizedProLabores);
          
          if (simplesNacionalTradicional.totalMonthlyCost < simplesNacionalOtimizado.totalMonthlyCost) {
            simplesNacionalOtimizado = null; // Don't show if it's more expensive
          }
      }
  }

  // If optimization is better, it replaces the "Traditional" one for recommendation purposes
  // but we still need to show the original "Traditional" one.
  // The logic in tax-results will handle the "Recomendado" badge.
  if(simplesNacionalOtimizado) {
    return {
      simplesNacionalTradicional: { ...simplesNacionalTradicional, regime: 'Simples Nacional Tradicional', order: 2}, // The original one
      simplesNacionalHibrido: { ...simplesNacionalHibrido, order: 3 },
      lucroPresumido: { ...lucroPresumido, order: 1 },
      lucroPresumidoAtual: { ...lucroPresumidoAtual, regime: 'Lucro Presumido (Regras Atuais)', order: 4 },
      simplesNacionalOtimizado: { ...simplesNacionalOtimizado, order: 0 }
    }
  }

  return {
    simplesNacionalTradicional: { ...simplesNacionalTradicional, order: 2 },
    simplesNacionalHibrido: { ...simplesNacionalHibrido, order: 3 },
    lucroPresumido: { ...lucroPresumido, order: 1 },
    lucroPresumidoAtual: { ...lucroPresumidoAtual, regime: 'Lucro Presumido (Regras Atuais)', order: 4 },
    simplesNacionalOtimizado: null
  };
}
