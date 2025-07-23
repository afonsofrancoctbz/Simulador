

"use client";

import { useEffect, useMemo } from 'react';
import { FormProvider, useFormContext } from "react-hook-form";
import { getCnaeData } from '@/lib/cnae-helpers';
import { useTaxCalculator } from '@/hooks/use-tax-calculator';

import CityInfoRenderer from './city-info-renderer';
import HealthInfoSection from './health-info-section';
import OdontologyInfoSection from './odontology-info-section';
import TaxCalculatorForm from './tax-calculator-form';
import TaxResults from './tax-results';
import type { CalculatorFormValues } from './tax-calculator-form';


export default function TaxCalculator({ year, onExportRevenueChange, onResultsChange }: { year: 2025 | 2026, onExportRevenueChange: (show: boolean) => void, onResultsChange: (show: boolean) => void }) {
  const {
    form,
    onSubmit,
    results,
    advice,
    isLoading,
    isAdviceLoading,
    error,
    selectedCity,
  } = useTaxCalculator(year);
  
  const selectedCnaes = form.watch("selectedCnaes");
  const revenues = form.watch("revenues");

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
    const hasExportRevenue = Object.keys(revenues).some(key => key.startsWith('export_') && revenues[key] > 0);
    onExportRevenueChange(hasExportRevenue);
  }, [revenues, onExportRevenueChange]);

  useEffect(() => {
    onResultsChange(results !== null || error !== null);
  }, [results, error, onResultsChange]);

  return (
    <FormProvider {...form}>
      <TaxCalculatorForm
        year={year}
        onSubmit={onSubmit}
        isLoading={isLoading}
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
