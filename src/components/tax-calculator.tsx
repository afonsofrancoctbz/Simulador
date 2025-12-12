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
    // O hook useTaxCalculator recebe o ano atualizado.
    // Presume-se que o onSubmit retornado por ele já contemple a lógica do ano passado.
    const { form, onSubmit, results, isLoading, error, selectedCity, fatorRProjection } = useTaxCalculator(year);
    const [isCnaeSelectorOpen, setIsCnaeSelectorOpen] = useState(false);
    
    const watchSelectedCnaes = form.watch('selectedCnaes');
    // watchRevenues retorna um objeto onde os valores podem ser undefined
    const watchRevenues = form.watch('revenues') || {}; 

    // EFFECT 1: Monitora Receita de Exportação
    useEffect(() => {
        if (!watchRevenues) return;

        const hasExportRevenue = Object.entries(watchRevenues)
            .filter(([key]) => key.startsWith('export_'))
            // CORREÇÃO: Usamos (value ?? 0) para garantir que seja um número, mesmo se undefined
            .some(([, value]) => (value ?? 0) > 0);
            
        onExportRevenueChange(hasExportRevenue);
    }, [watchRevenues, onExportRevenueChange]);

    // EFFECT 2: Comunica ao pai se tem resultados
    useEffect(() => {
        onResultsChange(results !== null && !isLoading && !error);
    }, [results, isLoading, error, onResultsChange]);

    const previousYear = useRef(year);

    // EFFECT 3: Recálculo Automático ao mudar o Ano
    useEffect(() => {
    // Só executa se o ano mudou de fato
    if (previousYear.current !== year) {
    if (results !== null) {
        const recalculate = async () => {
            // O handleSubmit obtém os valores atuais do formulário e os passa para o onSubmit
        await form.handleSubmit(onSubmit)();
    };
    recalculate();
    }
    // Atualiza o ano anterior após a verificação
        previousYear.current = year;
        }
    }, [year, results, form, onSubmit]);

    const handleConfirmCnaes = (cnaes: CnaeSelection[]) => {
        form.setValue('selectedCnaes', cnaes, { shouldValidate: true, shouldDirty: true });
    };

    const hasHealthCnae = watchSelectedCnaes?.some(c => getCnaeData(c.code)?.category === "Saúde e Bem-estar");
    const hasOdontologyCnae = watchSelectedCnaes?.some(c => getCnaeData(c.code)?.category === "Odontologia");

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