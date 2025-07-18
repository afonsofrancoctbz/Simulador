
"use client";

import { useState, useMemo } from 'react';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { getCnaeData } from '@/lib/cnae-helpers';
import { type CalculationResults, type CalculationResults2026, type TaxFormValues, type CnaeItem, Annex, CnaeData, ProLaboreFormSchema, PlanEnumSchema } from '@/lib/types';
import { formatCurrencyBRL } from "@/lib/utils";
import { getFiscalParameters } from '@/config/fiscal';
import { calculateTaxesOnServer } from '@/ai/flows/calculate-taxes-flow';
import { calculateTaxes2026OnServer } from '@/ai/flows/calculate-taxes-2026-flow';
import { useToast } from '@/hooks/use-toast';
import { CnaeSelector } from './cnae-selector';
import CityInfoRenderer from './city-info-renderer';
import HealthInfoSection from './health-info-section';
import OdontologyInfoSection from './odontology-info-section';
import TaxCalculatorForm, { CalculatorFormSchema } from './tax-calculator-form';
import TaxResults from './tax-results';

type CalculatorFormValues = z.infer<typeof CalculatorFormSchema>;

export default function TaxCalculator({ year }: { year: 2025 | 2026 }) {
  const [results, setResults] = useState<CalculationResults | CalculationResults2026 | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);
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
      selectedPlan: 'expertsEssencial',
    },
  });

  const selectedCnaes = form.watch("selectedCnaes");

  const hasHealthOrVetCnae = useMemo(() => {
    return selectedCnaes.some(code => {
      const cnae = getCnaeData(code);
      return cnae?.category === 'Saúde e Bem-estar' || cnae?.category === 'Veterinária';
    });
  }, [selectedCnaes]);

  const hasOdontologyCnae = useMemo(() => {
    return selectedCnaes.some(code => {
      const cnae = getCnaeData(code);
      return cnae?.category === 'Odontologia';
    });
  }, [selectedCnaes]);

  const handleCnaeConfirm = (codes: string[]) => {
    form.setValue('selectedCnaes', codes, { shouldValidate: true });
    const newRevenues: Record<string, number | undefined> = {};
    const newAnnexes = new Set(codes.map(code => getCnaeData(code)?.annex).filter(Boolean));
    const currentRevenues = form.getValues('revenues');
    for (const key in currentRevenues) {
      const annex = key.split('_')[1] as Annex;
      if (newAnnexes.has(annex)) {
        newRevenues[key] = currentRevenues[key];
      }
    }
    form.setValue('revenues', newRevenues);
  };

  const transformFormToSubmission = (values: CalculatorFormValues): TaxFormValues => {
    const domesticActivities: CnaeItem[] = [];
    const exportActivities: CnaeItem[] = [];

    const cnaesByAnnex: Record<string, string[]> = {};
    values.selectedCnaes.forEach(code => {
      const cnae = getCnaeData(code);
      if (cnae) {
        if (!cnaesByAnnex[cnae.annex]) cnaesByAnnex[cnae.annex] = [];
        cnaesByAnnex[cnae.annex].push(code);
      }
    });

    for (const key in values.revenues) {
      const revenue = values.revenues[key] || 0;
      if (revenue > 0) {
        const [type, annex] = key.split('_');
        const cnaesInGroup = cnaesByAnnex[annex] || [];
        if (cnaesInGroup.length > 0) {
          const revenuePerCnae = revenue / cnaesInGroup.length;
          cnaesInGroup.forEach(code => {
            const activity = { code, revenue: revenuePerCnae };
            if (type === 'domestic') {
              domesticActivities.push(activity);
            } else {
              exportActivities.push(activity);
            }
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
      selectedCnaes: values.selectedCnaes,
      selectedPlan: values.selectedPlan,
      rbt12: values.rbt12 ?? 0,
      fp12: values.fp12 ?? 0,
      domesticActivities,
      exportActivities,
      exportCurrency: values.exportCurrency,
      exchangeRate: values.exportCurrency !== 'BRL' ? (values.exchangeRate ?? 1) : 1,
      totalSalaryExpense: values.totalSalaryExpense,
      proLabores: submissionProLabores,
      numberOfPartners: values.numberOfPartners,
      b2bRevenuePercentage: values.b2bRevenuePercentage,
    };
  }

  async function onSubmit(values: CalculatorFormValues) {
    setIsLoading(true);
    setResults(null);
    setAdvice(null);
    setError(null);
    setSelectedCity(values.city);

    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const submissionValues = transformFormToSubmission(values);

    try {
      if (year === 2025) {
        const calculatedResults = await calculateTaxesOnServer(submissionValues);
        if (!calculatedResults) throw new Error("A API de cálculo não retornou resultados.");
        setResults(calculatedResults);

        const totalRevenue = submissionValues.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + submissionValues.exportActivities.reduce((acc, act) => acc + (act.revenue * submissionValues.exchangeRate), 0);
        if (totalRevenue === 0 && submissionValues.rbt12 === 0) return;

        setIsAdviceLoading(true);
        try {
          if (calculatedResults.simplesNacionalOtimizado) {
            const aiInput: TaxOptimizationInput = {
              activities: [...submissionValues.domesticActivities, ...submissionValues.exportActivities].map(a => `${a.code} (R$ ${a.revenue.toFixed(2)})`).join(', '),
              totalDomesticRevenue: submissionValues.domesticActivities.reduce((acc, act) => acc + act.revenue, 0),
              totalExportRevenue: submissionValues.exportActivities.reduce((acc, act) => acc + (act.revenue * submissionValues.exchangeRate), 0),
              totalSalaryExpense: values.totalSalaryExpense,
              totalProLabore: submissionValues.proLabores.reduce((acc, pl) => acc + pl.value, 0),
              numberOfPartners: values.numberOfPartners,
              simplesNacionalSemFatorRBurden: calculatedResults.simplesNacionalBase.totalMonthlyCost,
              simplesNacionalComFatorRBurden: calculatedResults.simplesNacionalOtimizado.totalMonthlyCost,
              lucroPresumidoTaxBurden: calculatedResults.lucroPresumido.totalMonthlyCost,
            };
            const aiResult = await getTaxOptimizationAdvice(aiInput);
            setAdvice(aiResult.advice);
          }
        } catch (aiError) {
          console.error("Error fetching AI advice:", aiError);
          setAdvice("Não foi possível obter a recomendação da IA no momento.");
        } finally {
          setIsAdviceLoading(false);
        }

      } else { // Year is 2026
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

  return (
    <FormProvider {...form}>
      <TaxCalculatorForm
        year={year}
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={isLoading}
        onCnaeSelectorOpen={() => setCnaeSelectorOpen(true)}
      />

      <CnaeSelector
        open={isCnaeSelectorOpen}
        onOpenChange={setCnaeSelectorOpen}
        onConfirm={handleCnaeConfirm}
        initialSelectedCodes={selectedCnaes}
      />

      <div className="mt-12">
        <CityInfoRenderer city={selectedCity} />
      </div>

      {hasHealthOrVetCnae && (
        <div className="mt-12">
          <HealthInfoSection />
        </div>
      )}

      {hasOdontologyCnae && (
        <div className="mt-12">
          <OdontologyInfoSection />
        </div>
      )}

      <TaxResults
        year={year}
        isLoading={isLoading}
        isAdviceLoading={isAdviceLoading}
        results={results}
        advice={advice}
        error={error}
      />
    </FormProvider>
  );
}
