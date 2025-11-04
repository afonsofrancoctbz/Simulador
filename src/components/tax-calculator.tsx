

"use client";

import { useEffect, useMemo, useState } from 'react';
import { FormProvider } from "react-hook-form";
import { getCnaeData } from '@/lib/cnae-helpers';
import { useTaxCalculator } from '@/hooks/use-tax-calculator';
import { z } from "zod";
import { CIDADES_ATENDIDAS } from '@/lib/cities';
import { PlanEnumSchema, ProLaboreFormSchema } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { FormSectionCompany } from "./form-section-company";
import { FormSectionRevenue } from "./form-section-revenue";
import { FormSectionPlan } from "./form-section-plan";
import { CnaeSelector } from './cnae-selector';
import type { Annex } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";
import CityInfoRenderer from './city-info-renderer';
import HealthInfoSection from './health-info-section';
import OdontologyInfoSection from './odontology-info-section';
import TaxResults from './tax-results';
import type { CalculatorFormValues } from './tax-calculator-form';


export default function TaxCalculator({ year, onExportRevenueChange, onResultsChange }: { year: 2025 | 2026, onExportRevenueChange: (show: boolean) => void, onResultsChange: (show: boolean) => void }) {
  const {
    form,
    onSubmit,
    results,
    isLoading,
    error,
    selectedCity,
  } = useTaxCalculator(year);
  
  const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);
  const selectedCnaes = form.watch("selectedCnaes");
  const revenues = form.watch("revenues");

  const handleCnaeConfirm = (codes: string[]) => {
      form.setValue('selectedCnaes', codes, { shouldValidate: true });
      const newRevenues: Record<string, number | undefined> = {};
      const newAnnexes = new Set(codes.map(code => getCnaeData(code)?.annex).filter(Boolean));
      const currentRevenues = form.getValues('revenues');

      for (const key in currentRevenues) {
          const [type, annex] = key.split('_') as [string, Annex];
          if (newAnnexes.has(annex)) {
              newRevenues[key] = currentRevenues[key];
          }
      }
      form.setValue('revenues', newRevenues);
  };

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
  
  useEffect(() => {
    const hasExportRevenue = Object.keys(revenues).some(key => key.startsWith('export_') && (revenues[key] ?? 0) > 0);
    onExportRevenueChange(hasExportRevenue);
  }, [revenues, onExportRevenueChange]);

  useEffect(() => {
    onResultsChange(results !== null || error !== null);
  }, [results, error, onResultsChange]);

  return (
    <div className='printable-section'>
        <div className="print-hidden">
             <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left max-w-7xl mx-auto">
                    
                    <FormSectionCompany />
                    <FormSectionPayroll year={year} />
                    <FormSectionAnnualRevenue />
                    <FormSectionRevenue year={year} onCnaeSelectorOpen={() => setCnaeSelectorOpen(true)} />
                    <FormSectionPlan />

                    <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10">
                        <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? <Loader2 className="animate-spin" /> : null}
                            {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                        </Button>
                    </div>
                </form>
                 <CnaeSelector
                    open={isCnaeSelectorOpen}
                    onOpenChange={setCnaeSelectorOpen}
                    onConfirm={handleCnaeConfirm}
                    initialSelectedCodes={selectedCnaes}
                />
            </FormProvider>

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
        </div>

        <div className='mt-8'>
             <TaxResults
                year={year}
                isLoading={isLoading}
                results={results}
                error={error}
            />
        </div>
    </div>
  );
}
