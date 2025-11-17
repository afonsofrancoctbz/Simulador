
"use client";

import { useEffect, useMemo, useState } from 'react';
import { FormProvider } from "react-hook-form";
import { getCnaeData } from '@/lib/cnae-helpers';
import { useTaxCalculator } from '@/hooks/use-tax-calculator';
import type { Annex, CnaeSelection } from "@/lib/types";
import { CnaeSelector } from './cnae-selector';
import CityInfoRenderer from './city-info-renderer';
import HealthInfoSection from './health-info-section';
import OdontologyInfoSection from './odontology-info-section';
import TaxResults from './tax-results';
import { TaxCalculatorForm } from './tax-calculator-form';
import { MultiStepFormProvider } from './multi-step-form';

export default function TaxCalculator({ year, onExportRevenueChange, onResultsChange }: { year: number, onExportRevenueChange: (show: boolean) => void, onResultsChange: (show: boolean) => void }) {
  const {
    form,
    onSubmit,
    results,
    isLoading,
    error,
    selectedCity,
    fatorRProjection,
  } = useTaxCalculator(year);
  
  const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);
  const selectedCnaes = form.watch("selectedCnaes");
  const revenues = form.watch("revenues");

  useEffect(() => {
    form.setValue('year', year);
  }, [year, form]);

  const handleCnaeConfirm = (cnaes: CnaeSelection[]) => {
      form.setValue('selectedCnaes', cnaes, { shouldValidate: true });
      const newRevenues: Record<string, number | undefined> = {};
      const newAnnexes = new Set(cnaes.map(item => getCnaeData(item.code)?.annex).filter(Boolean));
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
    if (!selectedCnaes) return false;
    return selectedCnaes.some(item => {
      const cnae = getCnaeData(item.code);
      return cnae?.category === 'Saúde e Bem-estar' || cnae?.category === 'Veterinária';
    });
  }, [selectedCnaes]);

  const hasOdontologyCnae = useMemo(() => {
    if (!selectedCnaes) return false;
    return selectedCnaes.some(item => {
      const cnae = getCnaeData(item.code);
      return cnae?.category === 'Odontologia';
    });
  }, [selectedCnaes]);
  
  useEffect(() => {
    const hasExportRevenue = Object.keys(revenues || {}).some(key => key.startsWith('export_') && (revenues[key] ?? 0) > 0);
    onExportRevenueChange(hasExportRevenue);
  }, [revenues, onExportRevenueChange]);

  useEffect(() => {
    onResultsChange(results !== null || error !== null);
  }, [results, error, onResultsChange]);

  return (
    <div className='printable-section'>
        <div className="print-hidden">
             <FormProvider {...form}>
              <MultiStepFormProvider>
                <TaxCalculatorForm
                    year={year}
                    onCnaeSelectorOpen={() => setCnaeSelectorOpen(true)}
                    isLoading={isLoading}
                    onSubmit={form.handleSubmit(onSubmit)}
                />
              </MultiStepFormProvider>
            </FormProvider>
             <CnaeSelector
                open={isCnaeSelectorOpen}
                onOpenChange={setCnaeSelectorOpen}
                onConfirm={handleCnaeConfirm}
                initialSelectedCnaes={selectedCnaes}
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
        </div>

        <div className='mt-8'>
             <TaxResults
                year={year}
                isLoading={isLoading}
                results={results}
                error={error}
                fatorRProjection={isLoading ? null : fatorRProjection}
            />
        </div>
    </div>
  );
}
