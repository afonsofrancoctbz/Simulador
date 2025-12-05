"use client";

import { useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTaxCalculator } from '@/hooks/use-tax-calculator';
import TaxResults from '@/components/tax-results';
import { CnaeSelector } from './cnae-selector';
import type { CnaeSelection } from '@/lib/types';
import CityInfoRenderer from './city-info-renderer';
import { MultiStepFormProvider } from './multi-step-form';
import { TaxCalculatorForm } from './tax-calculator-form';
import OdontologyInfoSection from './odontology-info-section';
import HealthInfoSection from './health-info-section';
import { getCnaeData } from '@/lib/cnae-helpers';
import TaxReformInfoSection from './tax-reform-info-section';

interface TaxCalculatorProps {
    year: number;
    onExportRevenueChange: (show: boolean) => void;
    onResultsChange: (hasResults: boolean) => void;
    onYearChange?: (year: number) => void;
}

export default function TaxCalculator({ year, onExportRevenueChange, onResultsChange, onYearChange }: TaxCalculatorProps) {
    const { form, onSubmit, results, isLoading, error, selectedCity, fatorRProjection } = useTaxCalculator(year);
    const [isCnaeSelectorOpen, setIsCnaeSelectorOpen] = useState(false);
    
    const watchSelectedCnaes = form.watch('selectedCnaes');
    const watchRevenues = form.watch('revenues');

    useEffect(() => {
        const hasExportRevenue = Object.entries(watchRevenues)
            .filter(([key]) => key.startsWith('export_'))
            .some(([, value]) => value > 0);
        onExportRevenueChange(hasExportRevenue);
    }, [watchRevenues, onExportRevenueChange]);

    useEffect(() => {
        onResultsChange(results !== null && !isLoading && !error);
    }, [results, isLoading, error, onResultsChange]);

    const handleConfirmCnaes = (cnaes: CnaeSelection[]) => {
        form.setValue('selectedCnaes', cnaes, { shouldValidate: true, shouldDirty: true });
        // After selecting, let's move to the next logical step if they were at step 1
        // This is a UX improvement
    };

    const hasHealthCnae = watchSelectedCnaes.some(c => getCnaeData(c.code)?.category === "Saúde e Bem-estar");
    const hasOdontologyCnae = watchSelectedCnaes.some(c => getCnaeData(c.code)?.category === "Odontologia");

    return (
        <>
            <FormProvider {...form}>
                 <MultiStepFormProvider>
                    <TaxCalculatorForm 
                        year={year}
                        onCnaeSelectorOpen={() => setIsCnaeSelectorOpen(true)}
                        isLoading={isLoading}
                        onSubmit={onSubmit}
                    />
                 </MultiStepFormProvider>
            </FormProvider>

            {selectedCity && (
                <section className='mt-12'>
                    <CityInfoRenderer city={selectedCity} />
                </section>
            )}

            {hasOdontologyCnae && (
                <section className='mt-12'>
                    <OdontologyInfoSection />
                </section>
            )}

            {hasHealthCnae && !hasOdontologyCnae && (
                 <section className='mt-12'>
                    <HealthInfoSection />
                </section>
            )}

            {year >= 2026 && (
                <section className='mt-12'>
                    <TaxReformInfoSection />
                </section>
            )}

            <CnaeSelector
                open={isCnaeSelectorOpen}
                onOpenChange={setIsCnaeSelectorOpen}
                onConfirm={handleConfirmCnaes}
                initialSelectedCnaes={form.getValues('selectedCnaes')}
            />
            
            <div id="results-container">
                 <TaxResults 
                    year={year}
                    isLoading={isLoading} 
                    results={results} 
                    error={error}
                    fatorRProjection={fatorRProjection}
                    formValues={form.getValues()}
                    onYearChange={onYearChange}
                />
            </div>
        </>
    );
}
