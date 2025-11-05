

import { getFiscalParameters, type FiscalConfig, type FiscalConfig2026, type FiscalConfig2027 } from '@/config/fiscal';
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

function calculateLucroPresumido(values: TaxFormValues, isPostReform: boolean): TaxDetails | TaxDetails2026 {
    const fiscalConfig = getFiscalParameters(isPostReform ? 2026 : 2025);
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, selectedPlan, b2bRevenuePercentage = 100, creditGeneratingExpenses = 0 } = values;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    
    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
    const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig);

    // IRPJ and CSLL (Unchanged by consumption reform)
    let presumedProfitBase = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))].reduce((sum, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
    }, 0);

    const irpj = presumedProfitBase * fiscalConfig.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicional = Math.max(0, (presumedProfitBase - (fiscalConfig.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL * 1))) * fiscalConfig.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    const csll = presumedProfitBase * fiscalConfig.lucro_presumido_rates.CSLL;
    
    let consumptionTaxes = 0;
    const breakdown = [
        { name: `IRPJ`, value: irpj + irpjAdicional },
        { name: `CSLL`, value: csll }, 
        { name: `CPP (INSS Patronal)`, value: inssPatronal },
        { name: "INSS s/ Pró-labore", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
    ];

    if (isPostReform && 'reforma_tributaria' in fiscalConfig) {
        const config2026 = fiscalConfig as FiscalConfig2026;
        const ivaStandardRate = config2026.reforma_tributaria.iva_rate;
        
        const getEffectiveIvaRate = (code: string) => {
          const cnaeInfo = getCnaeData(code);
          const reduction = cnaeInfo?.ivaReduction ?? 0;
          return ivaStandardRate * (1 - reduction);
        }
        
        const totalIvaDebit = domesticActivities.reduce((sum, activity) => {
            const effectiveIvaRate = getEffectiveIvaRate(activity.code);
            return sum + (activity.revenue * effectiveIvaRate);
        }, 0);

        const creditRate = getEffectiveIvaRate(domesticActivities[0]?.code || exportActivities[0]?.code || '');
        const totalIvaCredit = creditGeneratingExpenses * creditRate;
        
        const totalIvaDue = Math.max(0, totalIvaDebit - totalIvaCredit);

        const cbsRateInIva = (config2026.reforma_tributaria.cbs_rate_test || 0.088) / ivaStandardRate;
        const ibsRateInIva = (config2026.reforma_tributaria.ibs_rate_test || 0.177) / ivaStandardRate;
        
        const cbs = totalIvaDue > 0 ? totalIvaDue * cbsRateInIva : 0;
        const ibs = totalIvaDue > 0 ? totalIvaDue * ibsRateInIva : 0;

        consumptionTaxes = totalIvaDue;
        breakdown.push({ name: `CBS`, value: cbs });
        breakdown.push({ name: `IBS`, value: ibs });
        breakdown.push({ name: `Total IVA (Débito: ${totalIvaDebit.toFixed(2)}, Crédito: ${totalIvaCredit.toFixed(2)})`, value: totalIvaDue });

    } else {
        const pis = domesticRevenue * fiscalConfig.lucro_presumido_rates.PIS;
        const cofins = domesticRevenue * fiscalConfig.lucro_presumido_rates.COFINS;
        const issValue = values.issRate ?? fiscalConfig.lucro_presumido_rates.ISS;
        const iss = domesticRevenue * issValue;
        consumptionTaxes = pis + cofins + iss;
        breakdown.push({ name: `PIS`, value: pis });
        breakdown.push({ name: `COFINS`, value: cofins });
        breakdown.push({ name: `ISS (${(issValue * 100).toFixed(2).replace('.',',')}%)`, value: iss });
    }

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
        regime: regimeName as any,
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


function _calculateSimples2026(values: TaxFormValues, isHybrid: boolean, fatorREffective: number, proLaboreOverride?: ProLaboreForm[]): TaxDetails2026 {
    const fiscalConfig = getFiscalParameters(2027) as FiscalConfig2027;
    const { domesticActivities, exportActivities, exchangeRate, totalSalaryExpense, proLabores, b2bRevenuePercentage = 100, rbt12, selectedPlan, fp12, creditGeneratingExpenses = 0 } = values;
    
    const proLaboresToUse = proLaboreOverride || proLabores;
    const totalProLaboreBruto = proLaboresToUse.reduce((a, p) => a + p.value, 0);
    const totalPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLaboresToUse, fiscalConfig);

    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenue = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenue;
    
    const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;

    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_SIMPLES_NACIONAL, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_SIMPLES_NACIONAL[0].plans[selectedPlan];
    
    let totalDas = 0;
    let cppFromAnnexIV = 0;
    let ivaTaxes = 0;
    let finalAnnex: Annex = 'III'; 

    const allActivities = [...domesticActivities.map(a=>({...a, isExport: false})), ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, isExport: true }))];

    allActivities.forEach(activity => {
        const cnaeInfo = getCnaeData(activity.code);
        if (!cnaeInfo) return;
        
        const revenueForActivity = activity.revenue;
        if(revenueForActivity === 0) return;

        let effectiveAnnex: Annex;
        if (cnaeInfo.requiresFatorR) {
             effectiveAnnex = fatorREffective >= fiscalConfig.simples_nacional.limite_fator_r ? 'III' : 'V';
        } else {
            effectiveAnnex = cnaeInfo.annex;
        }
        finalAnnex = effectiveAnnex;

        const annexTable = fiscalConfig.simples_nacional[effectiveAnnex];
        const bracket = findBracket(annexTable, effectiveRbt12);
        const { rate, deduction, distribution } = bracket;
        const effectiveDasRate = effectiveRbt12 > 0 ? (effectiveRbt12 * rate - deduction) / effectiveRbt12 : rate;

        const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0, CBS = 0, IBS = 0 } = distribution;
        const consumptionTaxProportionInDas = CBS + IBS + (ISS || 0) + (ICMS || 0) + (IPI || 0) + (PIS || 0) + (COFINS || 0);

        let dasRateForActivity = effectiveDasRate;
        
        if (activity.isExport) {
            dasRateForActivity -= effectiveDasRate * consumptionTaxProportionInDas;
        }

        if (isHybrid && !activity.isExport) {
             const b2bRevenuePortion = (b2bRevenuePercentage ?? 100) / 100;
             const dasRevenueForActivity = activity.revenue * (1 - b2bRevenuePortion);
             const dasRateWithoutConsumption = effectiveDasRate * (1 - consumptionTaxProportionInDas);
             totalDas += dasRevenueForActivity * dasRateWithoutConsumption;
        } else {
            totalDas += revenueForActivity * dasRateForActivity;
        }
        
        if (effectiveAnnex === 'IV') cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig);
    });

    if (isHybrid) {
      const config2026 = getFiscalParameters(2026) as FiscalConfig2026;
      const ivaStandardRate = config2026.reforma_tributaria.iva_rate;

      const getEffectiveIvaRate = (code: string) => {
          const cnaeInfo = getCnaeData(code);
          const reduction = cnaeInfo?.ivaReduction ?? 0;
          return ivaStandardRate * (1 - reduction);
      }
      
      const totalIvaDebit = domesticActivities.reduce((sum, activity) => {
          const activityB2bRevenue = activity.revenue * ((b2bRevenuePercentage ?? 100) / 100);
          const effectiveIvaRate = getEffectiveIvaRate(activity.code);
          return sum + (activityB2bRevenue * effectiveIvaRate);
      }, 0);

      const creditRate = getEffectiveIvaRate(domesticActivities[0]?.code || exportActivities[0]?.code || '');
      const totalIvaCredit = creditGeneratingExpenses * creditRate;
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
      notes.push("Regime padrão do Simples. O crédito de IVA para clientes B2B é limitado. Receitas de exportação têm tributos sobre consumo zerados dentro do DAS.");
    }
    if (cppFromAnnexIV > 0) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
    }

    let regimeName: TaxDetails2026['regime'];
    
    if (proLaboreOverride) {
        regimeName = `Simples Nacional (Fator R Otimizado)${isHybrid ? ' Híbrido' : ''}`;
    } else {
        const regimeAnexo = finalAnnex === 'III' ? 'Anexo III' : 'Anexo V';
        const regimeType = isHybrid ? 'Híbrido' : 'Tradicional';
        regimeName = `Simples Nacional ${regimeType} (${regimeAnexo})`;
    }
    
    const result: TaxDetails2026 = {
        regime: regimeName,
        annex: finalAnnex,
        totalTax, totalMonthlyCost, totalRevenue,
        proLabore: totalProLaboreBruto,
        fatorR: fatorREffective,
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
  const { rbt12, totalSalaryExpense, proLabores, fp12, domesticActivities, exportActivities, exchangeRate } = values;

  const totalRevenue = domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + exportActivities.reduce((acc, act) => acc + (act.revenue * (exchangeRate || 1)), 0);
  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + p.value, 0);
  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
  const fatorR_naoOtimizado = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
  
  const simplesNacionalTradicional = _calculateSimples2026(values, false, fatorR_naoOtimizado);
  const simplesNacionalHibrido = _calculateSimples2026(values, true, fatorR_naoOtimizado);

  let simplesNacionalOtimizado: TaxDetails2026 | null = null;
  let simplesNacionalOtimizadoHibrido: TaxDetails2026 | null = null;

  const hasAnnexVActivity = values.selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);

  if (hasAnnexVActivity && totalRevenue > 0) {
      
      const currentTotalProLabore = values.proLabores.reduce((acc, p) => acc + p.value, 0);
      const currentPayroll = values.totalSalaryExpense + currentTotalProLabore;
      
      const fiscalConfig = getFiscalParameters(2027) as FiscalConfig2027; // Use future config for Fator R target
      const requiredPayroll = totalRevenue * fiscalConfig.simples_nacional.limite_fator_r;
      const additionalProLaboreNeeded = Math.max(0, requiredPayroll - currentPayroll);
      
      if (additionalProLaboreNeeded > 0 || fatorR_naoOtimizado >= fiscalConfig.simples_nacional.limite_fator_r) {
          const proLaboreValue = (fatorR_naoOtimizado >= fiscalConfig.simples_nacional.limite_fator_r) ? totalProLaboreBruto : (totalProLaboreBruto + additionalProLaboreNeeded);

          const optimizedProLabores: ProLaboreForm[] = values.proLabores.length > 0
              ? values.proLabores.map(p => ({ 
                  ...p, 
                  value: proLaboreValue / values.proLabores.length,
                }))
              : [{ value: proLaboreValue, hasOtherInssContribution: false, otherContributionSalary: 0 }];

          const optimizedValues = { ...values, proLabores: optimizedProLabores };
          const fatorR_Otimizado = (fatorR_naoOtimizado >= fiscalConfig.simples_nacional.limite_fator_r) ? fatorR_naoOtimizado : fiscalConfig.simples_nacional.limite_fator_r;

          simplesNacionalOtimizado = _calculateSimples2026(optimizedValues, false, fatorR_Otimizado, optimizedProLabores);
          simplesNacionalOtimizadoHibrido = _calculateSimples2026(optimizedValues, true, fatorR_Otimizado, optimizedProLabores);

          // Do not show optimized scenarios if they are more expensive
          if (simplesNacionalOtimizado && simplesNacionalTradicional && simplesNacionalOtimizado.totalMonthlyCost > simplesNacionalTradicional.totalMonthlyCost) {
            simplesNacionalOtimizado = null;
          }
          if (simplesNacionalOtimizadoHibrido && simplesNacionalHibrido && simplesNacionalOtimizadoHibrido.totalMonthlyCost > simplesNacionalHibrido.totalMonthlyCost) {
            simplesNacionalOtimizadoHibrido = null;
          }
      }
  }
  
  const lucroPresumido = calculateLucroPresumido(values, true) as TaxDetails2026;
  const lucroPresumidoAtual = calculateLucroPresumido(values, false) as TaxDetails;

  return {
    simplesNacionalTradicional: {...simplesNacionalTradicional, order: simplesNacionalOtimizado ? 2 : 1},
    simplesNacionalHibrido: {...simplesNacionalHibrido, order: simplesNacionalOtimizadoHibrido ? 3 : 2},
    lucroPresumido: { ...lucroPresumido, order: 4 },
    lucroPresumidoAtual: { ...lucroPresumidoAtual, order: 5 },
    simplesNacionalOtimizado: simplesNacionalOtimizado ? { ...simplesNacionalOtimizado, order: 0 } : null,
    simplesNacionalOtimizadoHibrido: simplesNacionalOtimizadoHibrido ? { ...simplesNacionalOtimizadoHibrido, order: 1 } : null,
  };
}
