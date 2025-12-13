// src/lib/calculations-2026.ts
import { getFiscalParametersPostReform } from '@/config/fiscal';
import {
  CONTABILIZEI_FEES_LUCRO_PRESUMIDO,
  CONTABILIZEI_FEES_SIMPLES_NACIONAL,
} from './cnae-helpers';
import {
  type CalculationResults2026,
  type TaxFormValues,
  type TaxDetails2026,
  type Annex,
  type TaxDetails,
  type ProLaboreForm,
} from './types';
import { formatPercent, findBracket, findFeeBracket, formatCurrencyBRL } from './utils';
import { getCnaeData } from './cnae-helpers';
import { _calculatePartnerTaxes, _calculateCpp } from './calculations';
import { getIvaReductionByCnae } from './cnae-reductions-2026';

/**
 * Função corrigida para obter redução de IVA
 * Agora busca corretamente por CNAE + cClassTrib (NBS code removido pois não é utilizado na assinatura atual)
 */
function getIvaReduction(
  cnaeCode: string,
  cClassTrib?: string
): { reducaoIBS: number; reducaoCBS: number } {
  // CORREÇÃO: Removido o argumento do meio (nbsCode) que causava o erro
  return getIvaReductionByCnae(cnaeCode, cClassTrib);
}

function calculateLucroPresumido(values: TaxFormValues, isCurrentRules: boolean): TaxDetails | TaxDetails2026 {
    const year = values.year || 2026;
    const fiscalConfig = getFiscalParametersPostReform(year);

    const { 
        domesticActivities = [], 
        exportActivities = [], 
        exchangeRate = 1, // CORREÇÃO: Valor padrão para evitar 'undefined'
        totalSalaryExpense, 
        proLabores, 
        selectedPlan, 
        creditGeneratingExpenses = 0 
    } = values;
    
    const totalProLaboreBruto = proLabores.reduce((a, p) => a + p.value, 0);
    
    const domesticRevenue = domesticActivities.reduce((sum, act) => sum + act.revenue, 0);
    const exportRevenueBRL = exportActivities.reduce((sum, act) => sum + (act.revenue * exchangeRate), 0);
    const totalRevenue = domesticRevenue + exportRevenueBRL;
    const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

    const { partnerTaxes, totalINSSRetido, totalIRRFRetido } = _calculatePartnerTaxes(proLabores, fiscalConfig);
    const cppRate = fiscalConfig.aliquotas_cpp_patronal.base;
    const inssPatronal = _calculateCpp(monthlyPayroll, fiscalConfig);

    // Cálculo da base presumida
    let presumedProfitBase = [...domesticActivities, ...exportActivities.map(a => ({...a, revenue: a.revenue * exchangeRate}))].reduce((sum, activity) => {
        const cnaeInfo = getCnaeData(activity.code);
        return sum + (activity.revenue * (cnaeInfo?.presumedProfitRateIRPJ ?? 0.32));
    }, 0);

    const irpjRate = fiscalConfig.lucro_presumido_rates.IRPJ_BASE;
    const irpjAdicionalRate = fiscalConfig.lucro_presumido_rates.IRPJ_ADICIONAL_BASE;
    const irpj = presumedProfitBase * irpjRate;
    const irpjAdicional = Math.max(0, (presumedProfitBase - (fiscalConfig.lucro_presumido_rates.LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL * 1))) * irpjAdicionalRate;
    
    const csllRate = fiscalConfig.lucro_presumido_rates.CSLL;
    const csll = presumedProfitBase * csllRate;
    
    let consumptionTaxes = 0;
    const breakdown = [
        { name: `IRPJ`, value: irpj + irpjAdicional, rate: irpjRate },
        { name: `CSLL`, value: csll, rate: csllRate }, 
        { name: `CPP (INSS Patronal)`, value: inssPatronal, rate: cppRate },
        { name: "INSS s/ Pró-labore", value: totalINSSRetido, rate: fiscalConfig.aliquota_inss_prolabore },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido },
    ];
    
    const notes: string[] = [];
    const configTransition = 'reforma_tributaria' in fiscalConfig ? fiscalConfig.reforma_tributaria : null;

    if (isCurrentRules || !configTransition) {
        // PRÉ-REFORMA: PIS, COFINS e ISS cumulativos
        const pisRate = fiscalConfig.lucro_presumido_rates.PIS;
        const pis = domesticRevenue * pisRate;
        
        const cofinsRate = fiscalConfig.lucro_presumido_rates.COFINS;
        const cofins = domesticRevenue * cofinsRate;

        const issRateAsDecimal = (values.issRate ?? 5) / 100;
        const iss = domesticRevenue * issRateAsDecimal;
        consumptionTaxes = pis + cofins + iss;
        
        if (pis > 0) breakdown.push({ name: `PIS`, value: pis, rate: pisRate });
        if (cofins > 0) breakdown.push({ name: `COFINS`, value: cofins, rate: cofinsRate });
        if (iss > 0) breakdown.push({ name: `ISS`, value: iss, rate: issRateAsDecimal });
        notes.push("Cálculo pré-reforma: PIS, COFINS e ISS cumulativos. Receitas de exportação são isentas.");
    } else {
        // PÓS-REFORMA: Transição com IBS/CBS
        const pisRate = fiscalConfig.lucro_presumido_rates.PIS;
        const cofinsRate = fiscalConfig.lucro_presumido_rates.COFINS;
        const issRateAsDecimal = (values.issRate ?? 5) / 100;
        
        // Impostos antigos (reduzidos gradualmente)
        const pis = domesticRevenue * pisRate * configTransition.pis_cofins_multiplier;
        const cofins = domesticRevenue * cofinsRate * configTransition.pis_cofins_multiplier;
        if (pis > 0) breakdown.push({ name: `PIS`, value: pis, rate: pisRate * configTransition.pis_cofins_multiplier });
        if (cofins > 0) breakdown.push({ name: `COFINS`, value: cofins, rate: cofinsRate * configTransition.pis_cofins_multiplier });

        const iss = domesticRevenue * issRateAsDecimal * configTransition.iss_icms_multiplier;
        if (iss > 0) breakdown.push({ name: `ISS`, value: iss, rate: issRateAsDecimal * configTransition.iss_icms_multiplier });
        
        const oldTaxesCost = pis + cofins + iss;
        
        // NOVOS IMPOSTOS: CBS e IBS com redução por CNAE
        const baseCbsRate = configTransition.cbs_aliquota_padrao;
        const baseIbsRate = configTransition.ibs_aliquota_padrao;

        let totalIbsDebit = 0;
        let totalCbsDebit = 0;
        let totalCbsCredit = 0;
        let totalIbsCredit = 0;
        
        // Calcular débito com redução específica por atividade
        domesticActivities.forEach(activity => {
            const reduction = getIvaReduction(
                activity.code,
                activity.cClassTrib
            );
            
            const reducaoIBSDecimal = reduction.reducaoIBS / 100;
            const reducaoCBSDecimal = reduction.reducaoCBS / 100;
            
            totalCbsDebit += activity.revenue * (baseCbsRate * (1 - reducaoCBSDecimal));
            totalIbsDebit += activity.revenue * (baseIbsRate * (1 - reducaoIBSDecimal));
        });
        
        // Calcular crédito (usa a redução da primeira atividade)
        if (creditGeneratingExpenses > 0 && domesticActivities.length > 0) {
             const firstActivity = domesticActivities[0];
             const reduction = getIvaReduction(
                 firstActivity.code,
                 firstActivity.cClassTrib
             );
             
             const reducaoIBSDecimal = reduction.reducaoIBS / 100;
             const reducaoCBSDecimal = reduction.reducaoCBS / 100;
             
             totalCbsCredit = creditGeneratingExpenses * (baseCbsRate * (1 - reducaoCBSDecimal));
             totalIbsCredit = creditGeneratingExpenses * (baseIbsRate * (1 - reducaoIBSDecimal));
        }
        
        const cbsFinal = Math.max(0, totalCbsDebit - totalCbsCredit);
        const ibsFinal = Math.max(0, totalIbsDebit - totalIbsCredit);

        if (year === 2026) {
            notes.push(`IVA de Teste (2026): O valor de CBS/IBS (${formatCurrencyBRL(cbsFinal + ibsFinal)}) é informativo e compensável com PIS/COFINS, não representando custo adicional de caixa.`);
            if (cbsFinal > 0) breakdown.push({ name: `CBS (Teste/Compensável)`, value: cbsFinal, rate: baseCbsRate });
            if (ibsFinal > 0) breakdown.push({ name: `IBS (Teste/Compensável)`, value: ibsFinal, rate: baseIbsRate });
            consumptionTaxes = oldTaxesCost;
        } else {
            consumptionTaxes = oldTaxesCost + cbsFinal + ibsFinal;
            if (cbsFinal > 0) breakdown.push({ name: `CBS (Líquida)`, value: cbsFinal, rate: baseCbsRate });
            if (ibsFinal > 0) breakdown.push({ name: `IBS (Líquido)`, value: ibsFinal, rate: baseIbsRate });
            
            if (year > 2026 && year < 2033) {
              notes.push(`Cálculo em transição: PIS/COFINS reduzidos gradualmente. ISS sendo substituído pelo IBS. Reduções aplicadas conforme atividade.`);
            } else if (year >= 2033) {
              notes.push(`IVA Pleno: PIS, COFINS e ISS extintos. Tributação via CBS e IBS com crédito amplo e reduções setoriais.`);
            }
        }
    }

    const companyRevenueTaxes = irpj + irpjAdicional + csll + consumptionTaxes;
    const totalTax = companyRevenueTaxes + inssPatronal + totalINSSRetido + totalIRRFRetido;
    
    const feeBracket = findFeeBracket(CONTABILIZEI_FEES_LUCRO_PRESUMIDO, totalRevenue);
    const fee = feeBracket?.plans[selectedPlan] ?? CONTABILIZEI_FEES_LUCRO_PRESUMIDO[0].plans[selectedPlan];
    const totalMonthlyCost = totalTax + fee;

    const regimeName: TaxDetails['regime'] | TaxDetails2026['regime'] = isCurrentRules 
        ? 'Lucro Presumido (Regras Atuais)' 
        : 'Lucro Presumido';

    const result: TaxDetails | TaxDetails2026 = {
        regime: regimeName as any,
        totalTax,
        totalMonthlyCost,
        totalRevenue,
        domesticRevenue,
        exportRevenue: exportRevenueBRL,
        proLabore: totalProLaboreBruto,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown: breakdown.filter(i => i.value > 0.001),
        notes,
        partnerTaxes,
    };
    return result;
}

function _calculateSimples2026(
    values: TaxFormValues, 
    isHybrid: boolean, 
    fatorREffective: number, 
    proLaboreOverride?: ProLaboreForm[]
): TaxDetails2026 {
    const year = values.year || 2026;
    const fiscalConfig = getFiscalParametersPostReform(year);
    const { 
        domesticActivities = [], 
        exportActivities = [], 
        exchangeRate = 1, // CORREÇÃO: Valor padrão para evitar 'undefined'
        totalSalaryExpense, 
        proLabores, 
        b2bRevenuePercentage = 100, 
        rbt12, 
        selectedPlan, 
        creditGeneratingExpenses = 0 
    } = values;
    
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
    const cppRate = fiscalConfig.aliquotas_cpp_patronal.base;

    const allActivities = [
        ...domesticActivities.map(a => ({...a, isExport: false})), 
        ...exportActivities.map(a => ({ ...a, revenue: a.revenue * exchangeRate, isExport: true }))
    ];

    // Calcular DAS
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
        const consumptionTaxProportionInDas = CBS + IBS + PIS + COFINS + ISS + ICMS + IPI;

        let dasRateForActivity = effectiveDasRate;
        
        if (isHybrid && !activity.isExport && year >= 2027) {
            dasRateForActivity *= (1 - consumptionTaxProportionInDas);
        } else if (activity.isExport) {
            dasRateForActivity -= effectiveDasRate * (PIS + COFINS + ISS + ICMS + IPI + CBS + IBS);
        } 
        totalDas += revenueForActivity * dasRateForActivity;
        
        if (effectiveAnnex === 'IV') cppFromAnnexIV = _calculateCpp(totalPayroll, fiscalConfig);
    });

    // Calcular IVA por fora (apenas no Simples Híbrido a partir de 2027)
    if (isHybrid && year >= 2027) {
      const config2026 = getFiscalParametersPostReform(year); // Use o ano da simulação
      
      // CORREÇÃO: Usamos o operador de coalescência nula (??) para garantir um valor numérico
      const baseCbsRate = config2026.reforma_tributaria?.cbs_aliquota_padrao ?? 0;
      const baseIbsRate = config2026.reforma_tributaria?.ibs_aliquota_padrao ?? 0;

      let totalIbsDebit = 0;
      let totalCbsDebit = 0;
      let totalCbsCredit = 0;
      let totalIbsCredit = 0;

      const b2bRevenuePortion = (b2bRevenuePercentage ?? 100) / 100;
      
      domesticActivities.forEach(activity => {
          if(activity.revenue > 0) {
            const reduction = getIvaReduction(
                activity.code,
                activity.cClassTrib
            );
            
            const reducaoIBSDecimal = reduction.reducaoIBS / 100;
            const reducaoCBSDecimal = reduction.reducaoCBS / 100;
            
            const activityB2bRevenue = activity.revenue * b2bRevenuePortion;
            
            totalCbsDebit += activityB2bRevenue * (baseCbsRate * (1 - reducaoCBSDecimal));
            totalIbsDebit += activityB2bRevenue * (baseIbsRate * (1 - reducaoIBSDecimal));
          }
      });
      
      if (creditGeneratingExpenses > 0 && domesticActivities.length > 0) {
        const firstActivity = domesticActivities[0];
        const reduction = getIvaReduction(
            firstActivity.code,
            firstActivity.cClassTrib
        );
        
        const reducaoIBSDecimal = reduction.reducaoIBS / 100;
        const reducaoCBSDecimal = reduction.reducaoCBS / 100;
        
        totalCbsCredit = creditGeneratingExpenses * (baseCbsRate * (1 - reducaoCBSDecimal));
        totalIbsCredit = creditGeneratingExpenses * (baseIbsRate * (1 - reducaoIBSDecimal));
      }

      const finalIbs = Math.max(0, totalIbsDebit - totalIbsCredit);
      const finalCbs = Math.max(0, totalCbsDebit - totalCbsCredit);
      
      ivaTaxes = finalIbs + finalCbs;
    }
    
    const totalTax = totalDas + ivaTaxes + cppFromAnnexIV + totalINSSRetido + totalIRRFRetido;
    const totalMonthlyCost = totalTax + fee;

    const breakdown = [
        { name: 'DAS (Simples Nacional)', value: totalDas, rate: totalRevenue > 0 ? totalDas / totalRevenue : 0 },
        { name: 'IVA (IBS/CBS pago por fora)', value: ivaTaxes },
        { name: `CPP (INSS Patronal)`, value: cppFromAnnexIV, rate: cppRate },
        { name: "INSS s/ Pró-labore", value: totalINSSRetido, rate: fiscalConfig.aliquota_inss_prolabore },
        { name: "IRRF s/ Pró-labore", value: totalIRRFRetido }
    ].filter(item => item.value > 0.001);

    const notes: string[] = [];
    if (isHybrid) {
      if (year < 2027) {
        notes.push(`SN Híbrido não aplicável em ${year}. O regime opcional inicia em 2027.`);
      } else {
        notes.push(`Cenário B2B: ${formatPercent((b2bRevenuePercentage ?? 100)/100)} da receita paga IVA por fora, gerando crédito para clientes. Reduções setoriais aplicadas.`);
      }
    } else {
        if(year >= 2027) {
            notes.push("Regime padrão do Simples. Crédito de IVA limitado para clientes. Exportações com tributos zerados no DAS.");
        } else {
             notes.push("Empresas do SN dispensadas da fase de testes do IVA em 2026.");
        }
    }
    if (cppFromAnnexIV > 0) {
      notes.push(`Anexo IV: CPP (${formatPercent(cppRate)}) calculada sobre a folha.`);
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
        totalTax, 
        totalMonthlyCost, 
        totalRevenue,
        domesticRevenue,
        exportRevenue,
        proLabore: totalProLaboreBruto,
        fatorR: fatorREffective,
        effectiveRate: totalRevenue > 0 ? totalMonthlyCost / totalRevenue : 0,
        contabilizeiFee: fee,
        breakdown,
        notes,
        partnerTaxes
    };

     if (proLaboreOverride) {
        result.optimizationNote = `Pró-labore ajustado para ${totalProLaboreBruto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} visando Anexo III.`;
    }
    return result;
}

export function calculateTaxes2026(values: TaxFormValues): CalculationResults2026 {
  const { 
      rbt12, 
      totalSalaryExpense, 
      proLabores, 
      fp12, 
      domesticActivities = [], 
      exportActivities = [], 
      exchangeRate, 
      year = 2026 
  } = values;
  
  const fiscalConfig = getFiscalParametersPostReform(year);

  const totalRevenue = domesticActivities.reduce((acc, act) => acc + act.revenue, 0) 
      + exportActivities.reduce((acc, act) => acc + (act.revenue * (exchangeRate || 1)), 0);
  const totalProLaboreBruto = proLabores.reduce((acc, p) => acc + p.value, 0);
  const monthlyPayroll = totalSalaryExpense + totalProLaboreBruto;

  const effectiveRbt12 = rbt12 > 0 ? rbt12 : totalRevenue * 12;
  const effectiveFp12 = fp12 > 0 ? fp12 : monthlyPayroll * 12;
  const fatorR_naoOtimizado = effectiveRbt12 > 0 ? effectiveFp12 / effectiveRbt12 : 0;
  
  const simplesNacionalTradicional = _calculateSimples2026(values, false, fatorR_naoOtimizado);
  const simplesNacionalHibrido = year >= 2027 ? _calculateSimples2026(values, true, fatorR_naoOtimizado) : null;

  let simplesNacionalOtimizado: TaxDetails2026 | null = null;
  let simplesNacionalOtimizadoHibrido: TaxDetails2026 | null = null;

  const hasAnnexVActivity = values.selectedCnaes.some(item => getCnaeData(item.code)?.requiresFatorR);
  
  // FIX: This entire block should only run if optimization is possible and needed.
  if (hasAnnexVActivity && totalRevenue > 0 && fatorR_naoOtimizado < fiscalConfig.simples_nacional.limite_fator_r) {
      const limiteFatorR = fiscalConfig.simples_nacional.limite_fator_r;
      const requiredAnnualPayroll = effectiveRbt12 * limiteFatorR;
      const additionalAnnualPayrollNeeded = requiredAnnualPayroll - effectiveFp12;
      
      if (additionalAnnualPayrollNeeded > 0) {
          const proLaboresCopy: ProLaboreForm[] = JSON.parse(JSON.stringify(values.proLabores));
          const additionalMonthlyProLaboreNeeded = additionalAnnualPayrollNeeded / 12;

          let minValue = Infinity;
          let minCount = 0;
          
          proLaboresCopy.forEach(p => {
            if (p.value < minValue) {
                minValue = p.value;
                minCount = 1;
            } else if (p.value === minValue) {
                minCount++;
            }
          });
          
          if(minCount > 0) {
            const addPerPartner = additionalMonthlyProLaboreNeeded / minCount;
            proLaboresCopy.forEach(p => {
               if (p.value === minValue) p.value += addPerPartner;
            });
             const optimizedValues = { ...values, proLabores: proLaboresCopy };
            simplesNacionalOtimizado = _calculateSimples2026(optimizedValues, false, limiteFatorR, proLaboresCopy);
            if (year >= 2027) {
              simplesNacionalOtimizadoHibrido = _calculateSimples2026(optimizedValues, true, limiteFatorR, proLaboresCopy);
            }
          }
      }
  } else if (hasAnnexVActivity && fatorR_naoOtimizado >= fiscalConfig.simples_nacional.limite_fator_r) {
    simplesNacionalOtimizado = { 
        ...simplesNacionalTradicional, 
        regime: 'Simples Nacional (Fator R Otimizado)', 
        optimizationNote: `Fator R atual: ${formatPercent(fatorR_naoOtimizado)}. Já no Anexo III.` 
    };
    if (year >= 2027 && simplesNacionalHibrido) {
        simplesNacionalOtimizadoHibrido = { 
            ...simplesNacionalHibrido, 
            regime: 'Simples Nacional (Fator R Otimizado) Híbrido', 
            optimizationNote: `Fator R atual: ${formatPercent(fatorR_naoOtimizado)}. Já no Anexo III.` 
        };
    }
  }
  
  const lucroPresumido = calculateLucroPresumido(values, false) as TaxDetails2026;
  const lucroPresumidoAtual = calculateLucroPresumido(values, true) as TaxDetails;

  return {
    simplesNacionalTradicional: {...simplesNacionalTradicional, order: simplesNacionalOtimizado ? 2 : 1},
    simplesNacionalHibrido: year >= 2027 ? (simplesNacionalHibrido ? {...simplesNacionalHibrido, order: simplesNacionalOtimizadoHibrido ? 3 : 2} : null) : null,
    lucroPresumido: { ...lucroPresumido, order: 4 },
    lucroPresumidoAtual: { ...lucroPresumidoAtual, order: 5 },
    simplesNacionalOtimizado: simplesNacionalOtimizado ? { ...simplesNacionalOtimizado, order: 0 } : null,
    simplesNacionalOtimizadoHibrido: year >= 2027 ? (simplesNacionalOtimizadoHibrido ? { ...simplesNacionalOtimizadoHibrido, order: 1 } : null) : null,
  };
}