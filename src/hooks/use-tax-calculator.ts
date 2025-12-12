"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { getFiscalParameters } from '@/config/fiscal';
import { calculateTaxesOnServer } from '@/ai/flows/calculate-taxes-flow';
import { calculateTaxes2026OnServer } from '@/ai/flows/calculate-taxes-2026-flow';
import { calculateFatorRProjection, type FatorRResponse } from '@/ai/flows/fator-r-projection-flow';
import { getCnaeData } from '@/lib/cnae-helpers';
import type { CalculationResults, CalculationResults2026, TaxFormValues, CnaeItem, Annex } from '@/lib/types';
import { CalculatorFormSchema, type CalculatorFormValues } from '@/components/tax-calculator-form';
import { useDebounce } from 'react-use';

export function useTaxCalculator(year: number) {
    const [results, setResults] = useState<CalculationResults | CalculationResults2026 | null>(null);
    const [fatorRProjection, setFatorRProjection] = useState<FatorRResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();
    const fiscalConfig = getFiscalParameters(year as 2025 | 2026);

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(CalculatorFormSchema),
        defaultValues: {
            city: undefined,
            selectedCnaes: [],
            rbt12: 0,
            fp12: 0,
            exportCurrency: 'BRL',
            exchangeRate: 1,
            issRate: 5,
            totalSalaryExpense: 0,
            proLabores: [{ value: fiscalConfig.salario_minimo, hasOtherInssContribution: false, otherContributionSalary: 0 }],
            numberOfPartners: 1,
            b2bRevenuePercentage: 50,
            creditGeneratingExpenses: 0,
            selectedPlan: 'expertsEssencial',
            year,
        },
    });

    const { watch, getValues } = form;

    const watchedRbt12 = watch("rbt12");
    const watchedFp12 = watch("fp12");
    const watchedCnaes = watch("selectedCnaes");

    useDebounce(() => {
        const fetchFatorRProjection = async () => {
            const { rbt12, fp12, selectedCnaes, exportCurrency, exchangeRate, proLabores, totalSalaryExpense } = getValues();
            const RBT12_atual = rbt12 ?? 0;
            
            const totalProLaboreMensal = proLabores.reduce((sum, p) => sum + p.value, 0);
            const folhaMensal = totalSalaryExpense + totalProLaboreMensal;
            const FS12_atual = fp12 > 0 ? fp12 : folhaMensal * 12;
            
            const domesticRevenue = selectedCnaes.reduce((sum, cnae) => sum + (cnae.domesticRevenue || 0), 0);
            const exportRevenueVal = selectedCnaes.reduce((sum, cnae) => sum + (cnae.exportRevenue || 0), 0);
            const effectiveExchangeRate = exportCurrency !== 'BRL' ? (exchangeRate || 1) : 1;
            const receitaMensalProjetada = domesticRevenue + (exportRevenueVal * effectiveExchangeRate);

            const hasAnnexVActivity = selectedCnaes.some(item => getCnaeData(item.code)?.requiresFatorR);

            if (hasAnnexVActivity && RBT12_atual > 0 && receitaMensalProjetada > 0) {
                try {
                    const projection = await calculateFatorRProjection({ RBT12_atual, FS12_atual, receitaMensalProjetada });
                    setFatorRProjection(projection);
                } catch (e) {
                    console.error("Erro ao calcular projeção do Fator R:", e);
                    setFatorRProjection(null);
                }
            } else {
                setFatorRProjection(null);
            }
        };
        fetchFatorRProjection();
    }, 500, [watchedRbt12, watchedFp12, watchedCnaes, getValues]);


    const transformFormToSubmission = (values: CalculatorFormValues): TaxFormValues => {
        const domesticActivities: CnaeItem[] = values.selectedCnaes
            .filter(cnae => cnae.domesticRevenue && cnae.domesticRevenue > 0)
            .map(cnae => ({
                code: cnae.code,
                revenue: cnae.domesticRevenue!,
                cClassTrib: cnae.cClassTrib
            }));

        const exportActivities: CnaeItem[] = values.selectedCnaes
            .filter(cnae => cnae.exportRevenue && cnae.exportRevenue > 0)
            .map(cnae => ({
                code: cnae.code,
                revenue: cnae.exportRevenue!,
                cClassTrib: cnae.cClassTrib
            }));


        const submissionProLabores = values.proLabores.map(p => ({
            ...p,
            value: p.value || fiscalConfig.salario_minimo,
            otherContributionSalary: p.hasOtherInssContribution ? (p.otherContributionSalary || 0) : 0,
        }));

        return {
            year,
            selectedCnaes: values.selectedCnaes,
            selectedPlan: values.selectedPlan,
            rbt12: values.rbt12 ?? 0,
            fp12: values.fp12 ?? 0,
            issRate: values.issRate, 
            domesticActivities,
            exportActivities,
            exportCurrency: values.exportCurrency,
            exchangeRate: values.exportCurrency !== 'BRL' ? (values.exchangeRate ?? 1) : 1,
            totalSalaryExpense: values.totalSalaryExpense,
            proLabores: submissionProLabores,
            numberOfPartners: values.numberOfPartners,
            b2bRevenuePercentage: values.b2bRevenuePercentage,
            creditGeneratingExpenses: values.creditGeneratingExpenses,
        };
    };

    async function onSubmit(values: CalculatorFormValues) {
        
        const isValid = await form.trigger();
        if (!isValid) {
            toast({
                title: "Formulário Inválido",
                description: "Por favor, corrija os erros antes de continuar.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setResults(null);
        setError(null);
        setSelectedCity(values.city);

        // CORREÇÃO: Garantir que o ano de cálculo nunca seja undefined
        const calculationYear = values.year ?? year;

        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        const submissionValues = transformFormToSubmission(values);

        try {
            let finalSubmissionValues = submissionValues;

            // Se estamos em 2026+ e temos uma projeção de Fator R que sugere um novo valor de pró-labore...
            if (calculationYear >= 2026 && fatorRProjection && fatorRProjection.proLaboreSugerido > 0) {
                 const proLaboreOriginalTotal = submissionValues.proLabores.reduce((acc, p) => acc + p.value, 0);
                
                // ...e o valor sugerido é diferente do original, ajustamos o valor para o cálculo.
                if (Math.abs(fatorRProjection.proLaboreSugerido - proLaboreOriginalTotal) > 1) {
                    finalSubmissionValues = {
                        ...submissionValues,
                        // A API 2026+ já espera o valor total no campo `proLabore`
                        proLabore: fatorRProjection.proLaboreSugerido
                    };
                }
            }


            if (calculationYear <= 2025) {
                const calculatedResults = await calculateTaxesOnServer(finalSubmissionValues);
                if (!calculatedResults) throw new Error("A API de cálculo não retornou resultados.");
                setResults(calculatedResults);

            } else { 
                // Passamos o valor final, que pode ter sido ajustado pelo Fator R.
                const calculatedResults = await calculateTaxes2026OnServer(finalSubmissionValues);
                if (!calculatedResults) throw new Error("A API de cálculo para 2026 não retornou resultados.");
                setResults(calculatedResults);
            }
        } catch (e) {
            console.error(`Erro ao calcular impostos (${calculationYear}):`, e);
            const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
            setError(`Falha no cálculo. Por favor, verifique os dados e tente novamente. Detalhe: ${errorMessage}`);
            toast({
                title: `Erro no Cálculo (${calculationYear})`,
                description: "Não foi possível completar o cálculo. Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return {
        form,
        onSubmit,
        results,
        fatorRProjection,
        isLoading,
        error,
        selectedCity
    };
}