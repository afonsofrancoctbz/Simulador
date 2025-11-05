"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { CIDADES_ATENDIDAS } from '@/lib/cities';
import { PlanEnumSchema, ProLaboreFormSchema } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { FormSectionCompany } from "./form-section-company";
import { FormSectionRevenue } from "./form-section-revenue";
import { FormSectionPlan } from "./form-section-plan";
import { CnaeSelector } from './cnae-selector';
import { getCnaeData } from "@/lib/cnae-helpers";
import type { Annex } from "@/lib/types";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";


export const CalculatorFormSchema = z.object({
  city: z.string().optional().refine(val => !val || CIDADES_ATENDIDAS.includes(val), {
    message: "Por favor, selecione uma cidade válida da lista."
  }),
  selectedCnaes: z.array(z.string()).min(1, "Selecione ao menos uma atividade (CNAE)."),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  fp12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  revenues: z.record(z.string(), z.coerce.number().min(0).optional()),
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number().optional(),
  issRate: z.coerce.number().min(2, "O ISS deve ser no mínimo 2%.").max(5, "O ISS não pode ser maior que 5%.").optional(),
  totalSalaryExpense: z.coerce.number({ required_error: "Informe o custo com salários." }).min(0, "O valor não pode ser negativo."),
  proLabores: z.array(ProLaboreFormSchema).min(1),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive().int(),
  b2bRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
  creditGeneratingExpenses: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  selectedPlan: PlanEnumSchema.default('expertsEssencial'),
}).refine(data => {
    const totalRevenue = Object.values(data.revenues || {}).reduce((acc, revenue) => acc + (revenue || 0), 0);
    const totalProLabore = data.proLabores.reduce((acc, pl) => acc + (pl.value || 0), 0);
    return totalRevenue > 0 || totalProLabore > 0 || (data.rbt12 ?? 0) > 0 || data.selectedCnaes.length > 0;
}, {
    message: "Informe ao menos um valor de faturamento para calcular.",
    path: ["revenues"],
});

export type CalculatorFormValues = z.infer<typeof CalculatorFormSchema>;

interface TaxCalculatorFormProps {
    year: 2025 | 2026;
    onCnaeSelectorOpen: () => void;
    isLoading: boolean;
    onSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

const steps = [
    { id: 1, name: 'Empresa' },
    { id: 2, name: 'Folha e Sócios' },
    { id: 3, name: 'Receita Anual' },
    { id: 4, name: 'Atividades e Faturamento Mensal' },
    { id: 5, name: 'Plano' }
];

export function TaxCalculatorForm({ year, onCnaeSelectorOpen, isLoading, onSubmit }: TaxCalculatorFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    
    const form = useFormContext();

    const nextStep = () => setCurrentStep(prev => Math.min(steps.length, prev + 1));
    const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

    return (
        <form onSubmit={onSubmit} className="space-y-8 text-left max-w-4xl mx-auto">
            <div className="mb-8">
                 <Tabs value={String(currentStep)} className="w-full">
                    <TabsList>
                        {steps.map(step => (
                            <TabsTrigger key={step.id} value={String(step.id)} onClick={() => setCurrentStep(step.id)}>
                               {step.id}. {step.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {currentStep === 1 && <FormSectionCompany />}
            {currentStep === 2 && <FormSectionPayroll year={year} />}
            {currentStep === 3 && <FormSectionAnnualRevenue />}
            {currentStep === 4 && <FormSectionRevenue year={year} onCnaeSelectorOpen={onCnaeSelectorOpen} />}
            {currentStep === 5 && <FormSectionPlan />}

            <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10">
                <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading} className="text-base py-6 px-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>
                    
                    {currentStep < steps.length ? (
                        <Button type="button" variant="default" onClick={nextStep} disabled={isLoading} className="text-base py-6 px-6">
                            Próximo <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="submit" size="lg" disabled={isLoading} className="text-lg bg-accent text-accent-foreground hover:bg-accent/90 py-7 px-8">
                            {isLoading ? <Loader2 className="animate-spin" /> : null}
                            {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}