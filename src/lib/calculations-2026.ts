
import { getFiscalParameters, type FiscalConfig, type FiscalConfigPostReform } from '@/config/fiscal';
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
import { formatPercent, findBracket, findFeeBracket, formatCurrencyBRL } from './utils';
import { getCnaeData } from './cnae-helpers';
import { _calculatePartnerTaxes, _calculateCpp } from './calculations';
import { CNAE_CLASSES_2026, CNAE_LC116_RELATIONSHIP } from './cnae-data-2026';

function calculateLucroPresumido(values: TaxFormValues, isPostReform: boolean): TaxDetails | TaxDetails2026 {
    const year = values.year || (isPostReform ? 2026 : 2025);
    const fiscalConfig = getFiscalParameters(year) as FiscalConfigPostReform;

    const { domesticActivities = [], exportActivities = [], exchangeRate, totalSalaryExpense, proLabores, selectedPlan, b2bRevenuePercentage = 100, creditGeneratingExpenses = 0, selectedCnaes } = values;
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    
    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
    const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig);

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
    
    const notes = [];

    // Lógica de transição para impostos de consumo
    if (isPostReform && 'reforma_tributaria' in fiscalConfig) {
        const configTransition = fiscalConfig.reforma_tributaria;

        // PIS/COFINS (pré-reforma) - continuam existindo de 2026-2028
        const pis = domesticRevenue * fiscalConfig.lucro_presumido_rates.PIS * configTransition.pis_cofins_multiplier;
        const cofins = domesticRevenue * fiscalConfig.lucro_presumido_rates.COFINS * configTransition.pis_cofins_multiplier;
        if (pis > 0) breakdown.push({ name: `PIS (0,65%)`, value: pis });
        if (cofins > 0) breakdown.push({ name: `COFINS (3,00%)`, value: cofins });

        // ISS (pré-reforma)
        const issValue = values.issRate ?? fiscalConfig.lucro_presumido_rates.ISS;
        const iss = domesticRevenue * issValue * configTransition.iss_icms_multiplier;
        if (iss > 0) breakdown.push({ name: `ISS (${(issValue * 100).toFixed(2).replace('.',',')}%)`, value: iss });

        consumptionTaxes += pis + cofins + iss;

        // CBS/IBS (pós-reforma)
        const baseCbsRate = configTransition.cbs_aliquota_padrao;
        const baseIbsRate = configTransition.ibs_aliquota_padrao;

        let totalIbsDebit = 0;
        let totalCbsDebit = 0;
        let weightedIbsReduction = 0;
        let weightedCbsReduction = 0;

        domesticActivities.forEach(activity => {
            const selectedCnae = selectedCnaes.find(sc => sc.code === activity.code);
            const relationship = CNAE_LC116_RELATIONSHIP.find(r => r.cnae === activity.code.replace(/\D/g, '') && (!selectedCnae?.cClass || r.cClassTrib === selectedCnae.cClass));
            const cClass = CNAE_CLASSES_2026.find(c => c.cClass === (relationship?.cClassTrib || '000001'));
            
            const ibsReduction = (cClass?.ibsReduction ?? 0) / 100;
            const cbsReduction = (cClass?.cbsReduction ?? 0) / 100;
            
            totalIbsDebit += activity.revenue * (baseIbsRate * (1 - ibsReduction));
            totalCbsDebit += activity.revenue * (baseCbsRate * (1 - cbsReduction));
            
            if (totalRevenue > 0) {
              weightedIbsReduction += (activity.revenue / totalRevenue) * ibsReduction;
              weightedCbsReduction += (activity.revenue / totalRevenue) * cbsReduction;
            }
        });
        
        const totalCreditIbs = creditGeneratingExpenses * (baseIbsRate * (1 - weightedIbsReduction));
        const totalCreditCbs = creditGeneratingExpenses * (baseCbsRate * (1 - weightedCbsReduction));
        
        const cbsFinal = Math.max(0, totalCbsDebit - totalCreditCbs);
        const ibsFinal = Math.max(0, totalIbsDebit - totalCreditIbs);
        
        if (year === 2026) {
          notes.push(`IVA de Teste (2026): O valor de CBS/IBS (${formatCurrencyBRL(cbsFinal + ibsFinal)}) é apenas informativo e pode ser compensado com PIS/COFINS, não representando custo adicional neste ano.`);
          if (cbsFinal > 0) breakdown.push({ name: `CBS (Teste - ${formatPercent(baseCbsRate)})`, value: cbsFinal });
          if (ibsFinal > 0) breakdown.push({ name: `IBS (Teste - ${formatPercent(baseIbsRate)})`, value: ibsFinal });
        } else {
            consumptionTaxes += cbsFinal + ibsFinal;
            if (cbsFinal > 0) breakdown.push({ name: `CBS`, value: cbsFinal });
            if (ibsFinal > 0) breakdown.push({ name: `IBS`, value: ibsFinal });
            if (year > 2026 && year < 2033) {
              notes.push(`Cálculo em transição: PIS/COFINS são substituídos por CBS. ISS é gradualmente substituído por IBS. Alíquota do IVA pode ter redução dependendo da atividade. Créditos de insumos foram considerados.`);
            } else if (year >= 2033) {
              notes.push(`Cálculo com IVA Pleno: PIS, COFINS e ISS foram extintos. A tributação de consumo é feita via CBS e IBS, com crédito amplo sobre as aquisições.`);
            }
        }

    } else { // Pré-reforma Pura (Cenário "Regras Atuais")
        const pis = domesticRevenue * fiscalConfig.lucro_presumido_rates.PIS;
        const cofins = domesticRevenue * fiscalConfig.lucro_presumido_rates.COFINS;
        const issValue = values.issRate ?? fiscalConfig.lucro_presumido_rates.ISS;
        const iss = domesticRevenue * issValue;
        consumptionTaxes = pis + cofins + iss;
        if (pis > 0) breakdown.push({ name: `PIS`, value: pis });
        if (cofins > 0) breakdown.push({ name: `COFINS`, value: cofins });
        if (iss > 0) breakdown.push({ name: `ISS (${(issValue * 100).toFixed(2).replace('.',',')}%)`, value: iss });
        notes.push("Cálculo pré-reforma: PIS, COFINS e ISS cumulativos. Receitas de exportação são isentas de PIS/COFINS/ISS.");
    }

    const companyRevenueTaxes = irpj + irpjAdicional + csll + consumptionTaxes;
    const totalTax = companyRevenueTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
    
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];
    const totalMonthlyCost = totalTax + fee;

    let regimeName: TaxDetails['regime'] | TaxDetails2026['regime'] = 'Lucro Presumido';
    if(isPostReform) {
      regimeName = `Lucro Presumido`;
    } else {
      regimeName = 'Lucro Presumido (Regras Atuais)';
    }

    const result: TaxDetails | TaxDetails2026 = {
        regime: regimeName as any,
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        domesticRevenue,
        exportRevenue: exportRevenueBRL,
        proLabore: totalProLaboreBruto,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown: breakdown.filter(i => i.value > 0.001),
        notes,
        partnerTaxes,
    };
    return result;
}


function _calculateSimples2026(values: TaxFormValues, isHybrid: boolean, fatorREffective: number, proLaboreOverride?: ProLaboreForm[]): TaxDetails2026 {
    const fiscalConfig = getFiscalParameters(values.year || 2026) as FiscalConfigPostReform;
    const { domesticActivities = [], exportActivities = [], exchangeRate, totalSalaryExpense, proLabores, b2bRevenuePercentage = 100, rbt12, selectedPlan, fp12, creditGeneratingExpenses = 0, selectedCnaes, year = 2026 } = values;
    
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
        
        if (isHybrid && !activity.isExport) {
            dasRateForActivity *= (1 - consumptionTaxProportionInDas);
        } else if (activity.isExport) {
            dasRateForActivity -= effectiveDasRate * (PIS + COFINS + (ISS || 0) + (ICMS || 0) + (IPI || 0) + CBS + IBS);
        } 
        totalDas += revenueForActivity * dasRateForActivity;
        
        if (effectiveAnnex === 'IV') cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig);
    });

    if (isHybrid) {
      const config2026 = getFiscalParameters(values.year || 2026) as FiscalConfigPostReform;
      const baseCbsRate = config2026.reforma_tributaria.cbs_aliquota_padrao;
      const baseIbsRate = config2026.reforma_tributaria.ibs_aliquota_padrao;

      let totalIbsDebit = 0;
      let totalCbsDebit = 0;
      let weightedIbsReduction = 0;
      let weightedCbsReduction = 0;

      const b2bRevenuePortion = (b2bRevenuePercentage ?? 100) / 100;
      
      domesticActivities.forEach(activity => {
          if(activity.revenue > 0) {
            const selectedCnae = selectedCnaes.find(sc => sc.code === activity.code);
            const relationship = CNAE_LC116_RELATIONSHIP.find(r => r.cnae === activity.code.replace(/\D/g, '') && (!selectedCnae?.cClass || r.cClassTrib === selectedCnae.cClass));
            const cClass = CNAE_CLASSES_2026.find(c => c.cClass === (relationship?.cClassTrib || '000001'));

            const ibsReduction = (cClass?.ibsReduction ?? 0) / 100;
            const cbsReduction = (cClass?.cbsReduction ?? 0) / 100;

            const activityB2bRevenue = activity.revenue * b2bRevenuePortion;

            totalIbsDebit += activityB2bRevenue * (baseIbsRate * (1 - ibsReduction));
            totalCbsDebit += activityB2bRevenue * (baseCbsRate * (1 - cbsReduction));
            
            if (totalRevenue > 0) {
              weightedIbsReduction += (activity.revenue / totalRevenue) * ibsReduction;
              weightedCbsReduction += (activity.revenue / totalRevenue) * cbsReduction;
            }
          }
      });
      
      const totalCreditIbs = creditGeneratingExpenses * (baseIbsRate * (1-weightedIbsReduction));
      const totalCreditCbs = creditGeneratingExpenses * (baseCbsRate * (1-weightedCbsReduction));

      const finalIbs = Math.max(0, totalIbsDebit - totalCreditIbs);
      const finalCbs = Math.max(0, totalCbsDebit - totalCreditCbs);
      
      ivaTaxes = (finalIbs || 0) + (finalCbs || 0);
    }
    
    const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        { name: 'DAS (Simples Nacional Remanescente)', value: totalDas },
        { name: 'IVA (IBS/CBS pago por fora)', value: ivaTaxes },
        { name: `CPP (INSS Patronal - p/ Anexo IV)`, value: cppFromAnnexIV },
        { name: "INSS s/ Pró-labore", value: totalINSSRetido },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
    ].filter(item => item.value > 0.001);

    const notes = [];
    if (isHybrid) {
      if (year < 2027) {
        notes.push(`SN Híbrido não aplicável em ${year}. O regime opcional de apuração do IVA por fora do Simples Nacional inicia em 2027.`);
      } else {
        notes.push(`Cenário competitivo para B2B: ${formatPercent((b2bRevenuePercentage ?? 100)/100)} da receita doméstica paga IVA por fora, gerando crédito para o cliente. O DAS é reduzido. Receitas de exportação são imunes ao IVA.`);
      }
    } else {
      notes.push("Regime padrão do Simples. O crédito de IVA para clientes B2B é limitado. Receitas de exportação têm tributos sobre consumo zerados dentro do DAS.");
    }
    if (cppFromAnnexIV > 0) {
      notes.push(`Atividades do Anexo IV pagam a CPP (INSS Patronal de ${formatPercent(fiscalConfig.aliquotas_cpp_patronal.base)}) sobre a folha, fora do DAS.`);
    }

    let regimeName: TaxDetails2026['regime'];
    
    if (proLaboreOverride) {
        regimeName = isHybrid ? 'Simples Nacional (Fator R Otimizado) Híbrido' : 'Simples Nacional (Fator R Otimizado)';
    } else {
        const regimeAnexo = finalAnnex === 'III' ? 'Anexo III' : 'Anexo V';
        regimeName = isHybrid ? `Simples Nacional Híbrido (${regimeAnexo})` : `Simples Nacional Tradicional (${regimeAnexo})`;
    }
    
    const result: TaxDetails2026 = {
        regime: regimeName,
        annex: finalAnnex,
        totalTax, totalMonthlyCost, totalRevenue,
        domesticRevenue,
        exportRevenue,
        proLabore: totalProLaboreBruto,
        fatorR: fatorREffective,
        effectiveRate: totalRevenue > 0 ? totalTax / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown,
        notes,
        partnerTaxes
    };

     if (proLaboreOverride) {
        result.optimizationNote = `Para buscar o Anexo III, o pró-labore total foi ajustado para ${totalProLaboreBruto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}.`;
    }
    return result;
}


export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const { rbt12, totalSalaryExpense, proLabores, fp12, domesticActivities = [], exportActivities = [], exchangeRate, year = 2026 } = values;

  const totalRevenue = domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + exportActivities.reduce((acc, act) => acc + (act.revenue * (exchangeRate || 1)), 0);
  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + p.value, 0);
  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
  const fatorR_naoOtimizado = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
  
  const simplesNacionalTradicional = _calculateSimples2026(values, false, fatorR_naoOtimizado);
  
  // The hybrid scenario is only an option from 2027 onwards
  const simplesNacionalHibrido = year >= 2027 ? _calculateSimples2026(values, true, fatorR_naoOtimizado) : null;


  let simplesNacionalOtimizado: TaxDetails2026 | null = null;
  let simplesNacionalOtimizadoHibrido: TaxDetails2026 | null = null;

  const hasAnnexVActivity = values.selectedCnaes.some(item => getCnaeData(item.code)?.requiresFatorR);
  
  if (hasAnnexVActivity && totalRevenue > 0) {
      const fiscalConfig = getFiscalParameters(values.year || 2026) as FiscalConfigPostReform;
      const limiteFatorR = fiscalConfig.simples_nacional.limite_fator_r;
      
      const currentTotalProLabore = values.proLabores.reduce((acc, p) => acc + p.value, 0);
      const currentPayroll = values.totalSalaryExpense + currentTotalProLabore;
      
      const requiredAnnualPayroll = (rbt12 > 0 ? rbt12 : totalRevenue * 12) * limiteFatorR;
      const currentAnnualPayroll = (fp12 > 0 ? fp12 : currentPayroll * 12);
      const additionalAnnualPayrollNeeded = requiredAnnualPayroll - currentAnnualPayroll;
      
      if (fatorR_naoOtimizado < limiteFatorR && additionalAnnualPayrollNeeded > 0) {
          const proLaboresCopy: ProLaboreForm[] = JSON.parse(JSON.stringify(values.proLabores));
          const additionalMonthlyProLaboreNeeded = Math.max(0, additionalAnnualPayrollNeeded / 12);

          let minProLaboreValue = Infinity;
          let minProLaborePartnersCount = 0;
          
          proLaboresCopy.forEach(p => {
            if (p.value < minProLaboreValue) {
                minProLaboreValue = p.value;
                minProLaborePartnersCount = 1;
            } else if (p.value === minProLaboreValue) {
                minProLaborePartnersCount++;
            }
          });
          
          const valueToAddPerPartner = additionalMonthlyProLaboreNeeded / minProLaborePartnersCount;
          
          proLaboresCopy.forEach(p => {
              if (p.value === minProLaboreValue) {
                  p.value += valueToAddPerPartner;
              }
          });
          
          const optimizedValues = { ...values, proLabores: proLaboresCopy };
          
          simplesNacionalOtimizado = _calculateSimples2026(optimizedValues, false, limiteFatorR, proLaboresCopy);
          if (year >= 2027) {
            simplesNacionalOtimizadoHibrido = _calculateSimples2026(optimizedValues, true, limiteFatorR, proLaboresCopy);
          }
      } else if (fatorR_naoOtimizado >= limiteFatorR) {
        simplesNacionalOtimizado = { ...simplesNacionalTradicional, regime: 'Simples Nacional (Fator R Otimizado)', optimizationNote: `Sua empresa já atinge o Fator R de ${formatPercent(fatorR_naoOtimizado)} e se beneficia do Anexo III.` };
        if (year >= 2027 && simplesNacionalHibrido) {
            simplesNacionalOtimizadoHibrido = { ...simplesNacionalHibrido, regime: 'Simples Nacional (Fator R Otimizado) Híbrido', optimizationNote: `Sua empresa já atinge o Fator R de ${formatPercent(fatorR_naoOtimizado)} e se beneficia do Anexo III.` };
        }
      }
  }
  
  const lucroPresumido = calculateLucroPresumido(values, true) as TaxDetails2026;
  const lucroPresumidoAtual = calculateLucroPresumido(values, false) as TaxDetails;

  return {
    simplesNacionalTradicional: {...simplesNacionalTradicional, order: simplesNacionalOtimizado ? 2 : 1},
    simplesNacionalHibrido: year >= 2027 ? (simplesNacionalHibrido ? {...simplesNacionalHibrido, order: simplesNacionalOtimizadoHibrido ? 3 : 2} : null) : null,
    lucroPresumido: { ...lucroPresumido, order: 4 },
    lucroPresumidoAtual: { ...lucroPresumidoAtual, order: 5 },
    simplesNacionalOtimizado: simplesNacionalOtimizado ? { ...simplesNacionalOtimizado, order: 0 } : null,
    simplesNacionalOtimizadoHibrido: year >= 2027 ? (simplesNacionalOtimizadoHibrido ? { ...simplesNacionalOtimizadoHibrido, order: 1 } : null) : null,
  };
}
