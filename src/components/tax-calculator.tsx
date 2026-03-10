"use client";

import { useState, useEffect, useRef } from 'react';
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

    useEffect(() => {
        if (!watchSelectedCnaes) return;
        const hasExportRevenue = watchSelectedCnaes.some((cnae: CnaeSelection) => (cnae.exportRevenue ?? 0) > 0);
        onExportRevenueChange(hasExportRevenue);
    }, [watchSelectedCnaes, onExportRevenueChange]);

    useEffect(() => {
        onResultsChange(results !== null && !isLoading && !error);
    }, [results, isLoading, error, onResultsChange]);

    const previousYear = useRef(year);

    useEffect(() => {
    if (previousYear.current !== year) {
    if (results !== null) {
        const recalculate = async () => {
        await form.handleSubmit(onSubmit)();
    };
    recalculate();
    }
        previousYear.current = year;
        }
    }, [year, results, form, onSubmit]);

    const handleConfirmCnaes = (cnaes: CnaeSelection[]) => {
        const currentCnaes = form.getValues('selectedCnaes') || [];
        const newCnaes = cnaes.map(cnae => {
            const existing = currentCnaes.find(ec => ec.code === cnae.code);
            return existing || cnae;
        });
        form.setValue('selectedCnaes', newCnaes, { shouldValidate: true, shouldDirty: true });
    };

    const hasHealthCnae = watchSelectedCnaes?.some(c => getCnaeData(c.code)?.category === "Saúde e Bem-estar");
    const hasOdontologyCnae = watchSelectedCnaes?.some(c => getCnaeData(c.code)?.category === "Odontologia");

    return (
        <div>
            {/* Esta div esconde o formulário, modais e informações na hora da impressão */}
            <div className="print-hidden">
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
            </div>
            
            {/* O TaxResults fica FORA da div print-hidden para poder acionar a impressão */}
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
        </div>
    );
}