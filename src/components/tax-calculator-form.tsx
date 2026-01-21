"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormSectionCompany } from "./form-section-company";
import { FormSectionPlan } from "./form-section-plan";
import { Loader2 } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";
import { MultiStepForm, useMultiStepForm } from "./multi-step-form";
import { FormSectionRevenueAndCnae } from "./form-section-revenue-and-cnae";
import type { CalculatorFormValues } from "@/lib/types";

interface TaxCalculatorFormProps {
    year: number;
    onCnaeSelectorOpen: () => void;
    isLoading: boolean;
    onSubmit: (values: CalculatorFormValues) => void;
}

export function TaxCalculatorForm({ year, onCnaeSelectorOpen, isLoading, onSubmit }: TaxCalculatorFormProps) {
    const form = useFormContext<CalculatorFormValues>();
    const { currentStep, steps, goToStep } = useMultiStepForm();

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
            <MultiStepForm currentStep={currentStep} steps={steps} onStepClick={goToStep} />

            <div className={currentStep === 1 ? 'block' : 'hidden'}><FormSectionCompany /></div>
            <div className={currentStep === 2 ? 'block' : 'hidden'}><FormSectionPayroll year={year as 2025 | 2026} /></div>
            <div className={currentStep === 3 ? 'block' : 'hidden'}><FormSectionAnnualRevenue /></div>
            <div className={currentStep === 4 ? 'block' : 'hidden'}><FormSectionRevenueAndCnae year={year} onCnaeSelectorOpen={onCnaeSelectorOpen} /></div>
            <div className={currentStep === 5 ? 'block' : 'hidden'}><FormSectionPlan /></div>

            <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10">
                <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                    {isLoading ? <Loader2 className="animate-spin" /> : null}
                    {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                </Button>
            </div>
        </form>
    );
}

    