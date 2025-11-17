
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
    const fiscalConfig = getFiscalParameters(year);

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(CalculatorFormSchema),
        defaultValues: {
            city: undefined,
            selectedCnaes: [],
            rbt12: 0,
            fp12: 0,
            revenues: {},
            exportCurrency: 'BRL',
            exchangeRate: 1,
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
    const watchedRevenues = watch("revenues");
    const watchedCnaes = watch("selectedCnaes");

    useDebounce(() => {
        const fetchFatorRProjection = async () => {
            const { rbt12, fp12, revenues, selectedCnaes, exportCurrency, exchangeRate } = getValues();
            const RBT12_atual = rbt12 ?? 0;
            const FS12_atual = fp12 ?? 0;
            
            const domesticRevenue = Object.keys(revenues || {}).filter(k => k.startsWith('domestic_')).reduce((sum, k) => sum + (revenues![k] || 0), 0);
            const exportRevenueVal = Object.keys(revenues || {}).filter(k => k.startsWith('export_')).reduce((sum, k) => sum + (revenues![k] || 0), 0);
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
    }, 500, [watchedRbt12, watchedFp12, watchedRevenues, watchedCnaes, getValues]);


    const transformFormToSubmission = (values: CalculatorFormValues): TaxFormValues => {
        const domesticActivities: CnaeItem[] = [];
        const exportActivities: CnaeItem[] = [];

        // 1. Group selected CNAEs by their effective annex
        const cnaesByAnnex: Record<string, { code: string, cClass?: string }[]> = {};
        values.selectedCnaes.forEach(item => {
            const cnae = getCnaeData(item.code);
            if (cnae) {
                // For this transformation, we use the base annex. Fator R logic will be applied in the backend.
                const annex = cnae.annex;
                if (!cnaesByAnnex[annex]) cnaesByAnnex[annex] = [];
                cnaesByAnnex[annex].push({ code: item.code, cClass: item.cClass });
            }
        });

        // 2. Distribute domestic revenue among CNAEs of the same annex
        for (const key in values.revenues) {
            if (key.startsWith('domestic_')) {
                const annex = key.split('_')[1] as Annex;
                const revenue = values.revenues[key] || 0;
                const cnaesInAnnex = cnaesByAnnex[annex];

                if (revenue > 0 && cnaesInAnnex && cnaesInAnnex.length > 0) {
                    const revenuePerCnae = revenue / cnaesInAnnex.length;
                    cnaesInAnnex.forEach(cnaeItem => {
                        domesticActivities.push({ code: cnaeItem.code, revenue: revenuePerCnae, cClass: cnaeItem.cClass });
                    });
                }
            }
        }
        
        // 3. Distribute export revenue among CNAEs of the same annex
        for (const key in values.revenues) {
             if (key.startsWith('export_')) {
                const annex = key.split('_')[1] as Annex;
                const revenue = values.revenues[key] || 0;
                const cnaesInAnnex = cnaesByAnnex[annex];

                if (revenue > 0 && cnaesInAnnex && cnaesInAnnex.length > 0) {
                    const revenuePerCnae = revenue / cnaesInAnnex.length;
                    cnaesInAnnex.forEach(cnaeItem => {
                        exportActivities.push({ code: cnaeItem.code, revenue: revenuePerCnae, cClass: cnaeItem.cClass });
                    });
                }
            }
        }


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
            issRate: (values.issRate ?? 5) / 100, // Convert percentage to decimal
            revenues: values.revenues, // Correctly include the revenues object
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
        
        // We use getValues() here to ensure we get the latest form state at the time of submission.
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

        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        const submissionValues = transformFormToSubmission(values);

        try {
            if (year <= 2025) {
                const calculatedResults = await calculateTaxesOnServer(submissionValues);
                if (!calculatedResults) throw new Error("A API de cálculo não retornou resultados.");
                setResults(calculatedResults);

            } else { // Year is 2026 or later
                const calculatedResults = await calculateTaxes2026OnServer(submissionValues);
                if (!calculatedResults) throw new Error("A API de cálculo para 2026 não retornou resultados.");
                setResults(calculatedResults);
            }
        } catch (e) {
            console.error(`Erro ao calcular impostos (${year}):`, e);
            const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
            setError(`Falha no cálculo. Por favor, verifique os dados e tente novamente. Detalhe: ${errorMessage}`);
            toast({
                title: `Erro no Cálculo (${year})`,
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
