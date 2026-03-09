"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { getFiscalParameters } from '@/config/fiscal';
import { calculateTaxes } from '@/lib/calculations';
import { calculateTaxes2026 } from '@/lib/calculations-2026';
import { calculateFatorRProjectionLocal } from '@/lib/fator-r-projection-logic';
import { getCnaeData } from '@/lib/cnae-helpers';
import type { CalculationResults, CalculationResults2026, TaxFormValues, CnaeItem } from '@/lib/types';
import { CalculatorFormSchema, type CalculatorFormValues } from '@/lib/types';
import { useDebounce } from 'react-use';
import { getNBSOptionsByCnae } from '@/lib/cnae-reductions-2026';
import type { CnaeRelationship2026 } from '@/lib/cnae-data-2026';

export function useTaxCalculator(year: number) {
    const [results, setResults] = useState<CalculationResults | CalculationResults2026 | null>(null);
    const [fatorRProjection, setFatorRProjection] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [nbsOptions, setNbsOptions] = useState<Record<string, CnaeRelationship2026[]>>({});

    const { toast } = useToast();
    const fiscalConfig = getFiscalParameters(year as 2025 | 2026);

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(CalculatorFormSchema),
        defaultValues: {
            city: undefined,
            companyStage: 'new', // Valor padrão forçado para evitar erros de renderização
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

    const { watch, getValues, setValue } = form;

    const watchedRbt12 = watch("rbt12");
    const watchedFp12 = watch("fp12");
    const watchedCnaes = watch("selectedCnaes");
    const watchedExportCurrency = watch('exportCurrency');

    const [debouncedCurrency, setDebouncedCurrency] = useState(watchedExportCurrency);
    useDebounce(() => {
        setDebouncedCurrency(watchedExportCurrency);
    }, 500, [watchedExportCurrency]);


    useEffect(() => {
        const updateNbsOptions = async () => {
            const cnaes = getValues('selectedCnaes');
            const newNbsOptions: Record<string, CnaeRelationship2026[]> = {};
            for (const [index, cnae] of cnaes.entries()) {
                if (cnae.code) {
                    const options = getNBSOptionsByCnae(cnae.code);
                    newNbsOptions[cnae.code] = options;
                    if (options.length === 1 && cnae.nbsCode !== options[0].nbs) {
                        setValue(`selectedCnaes.${index}.nbsCode`, options[0].nbs, { shouldValidate: true, shouldDirty: true });
                    }
                }
            }
            setNbsOptions(newNbsOptions);
        };
        updateNbsOptions();
    }, [watchedCnaes, getValues, setValue]);

    useDebounce(() => {
        const fetchFatorRProjection = () => {
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
                const projection = calculateFatorRProjectionLocal({ RBT12_atual, FS12_atual, receitaMensalProjetada });
                setFatorRProjection(projection);
            } else {
                setFatorRProjection(null);
            }
        };
        fetchFatorRProjection();
    }, 500, [watchedRbt12, watchedFp12, watchedCnaes, getValues]);


    useEffect(() => {
        const fetchBCBRate = async (date: Date): Promise<number | null> => {
            const currency = debouncedCurrency;
            if (!currency || currency === 'BRL') return 1;

            const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
            const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${currency}'&@dataCotacao='${formattedDate}'&$top=1&$format=json`;

            try {
                const response = await fetch(url);
                if (!response.ok) return null;
                const data = await response.json();
                const rate = data?.value?.[0]?.cotacaoCompra;
                return rate ?? null;
            } catch (error) {
                return null;
            }
        };

        const getRate = async () => {
            if (!debouncedCurrency || debouncedCurrency === 'BRL') {
                setValue('exchangeRate', 1);
                return;
            }

            let rate = await fetchBCBRate(new Date());
            if (rate === null) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                rate = await fetchBCBRate(yesterday);
            }

            setValue('exchangeRate', rate ?? 1);
        };

        getRate();
    }, [debouncedCurrency, setValue]);


    const transformFormToSubmission = (values: CalculatorFormValues): TaxFormValues => {
        const domesticActivities: CnaeItem[] = values.selectedCnaes
            .filter(cnae => cnae.domesticRevenue && cnae.domesticRevenue > 0)
            .map(cnae => ({
                code: cnae.code,
                revenue: cnae.domesticRevenue!,
                cClassTrib: cnae.cClassTrib,
                nbsCode: cnae.nbsCode,
            }));

        const exportActivities: CnaeItem[] = values.selectedCnaes
            .filter(cnae => cnae.exportRevenue && cnae.exportRevenue > 0)
            .map(cnae => ({
                code: cnae.code,
                revenue: cnae.exportRevenue!,
                cClassTrib: cnae.cClassTrib,
                 nbsCode: cnae.nbsCode,
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
        if (!isValid) return;
        
        if (year >= 2026) {
          for (const cnae of values.selectedCnaes) {
              const options = nbsOptions[cnae.code];
              if (options && options.length > 1 && !cnae.nbsCode) {
                  toast({
                      title: "Seleção Pendente",
                      description: `Defina o tipo de serviço para ${cnae.code}.`,
                      variant: "destructive",
                  });
                  return;
              }
          }
        }

        setIsLoading(true);
        setResults(null);
        setError(null);
        setSelectedCity(values.city);

        const calculationYear = values.year ?? year;
        const submissionValues = transformFormToSubmission(values);

        try {
            if (calculationYear <= 2025) {
                // Cálculo 2025 movido para local (Client-side)
                const calculatedResults = calculateTaxes(submissionValues);
                setResults(calculatedResults);
            } else { 
                const calculatedResults = calculateTaxes2026(submissionValues);
                setResults(calculatedResults);
            }
        } catch (e) {
            setError(`Falha no cálculo local.`);
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
        selectedCity,
        nbsOptions
    };
}
