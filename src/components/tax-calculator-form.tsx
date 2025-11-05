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
import { Loader2, Check } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";
import { cn } from "@/lib/utils";

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
    { id: 1, name: 'Empresa', component: FormSectionCompany },
    { id: 2, name: 'Folha e Sócios', component: FormSectionPayroll },
    { id: 3, name: 'Receita Anual', component: FormSectionAnnualRevenue },
    { id: 4, name: 'Faturamento Mensal', component: FormSectionRevenue },
    { id: 5, name: 'Plano', component: FormSectionPlan },
];

const Stepper = ({ currentStep }: { currentStep: number }) => {
    return (
        <nav aria-label="Progress" className="mb-8">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                {steps.map((step) => (
                    <li key={step.name} className="md:flex-1">
                        {currentStep > step.id ? (
                            <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-primary transition-colors ">{`Passo ${step.id}`}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </div>
                        ) : currentStep === step.id ? (
                            <div className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                                <span className="text-sm font-medium text-primary">{`Passo ${step.id}`}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </div>
                        ) : (
                            <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-gray-500 transition-colors">{`Passo ${step.id}`}</span>
                                <span className="text-sm font-medium">{step.name}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export function TaxCalculatorForm({ year, onCnaeSelectorOpen, isLoading, onSubmit }: TaxCalculatorFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const form = useFormContext();

    const nextStep = async () => {
        let fieldsToValidate: (keyof CalculatorFormValues)[] = [];
        switch(currentStep) {
            case 1: fieldsToValidate = ['city']; break;
            case 2: fieldsToValidate = ['totalSalaryExpense', 'proLabores', 'numberOfPartners']; break;
            case 3: fieldsToValidate = ['rbt12', 'fp12']; break;
            case 4: fieldsToValidate = ['selectedCnaes', 'revenues', 'issRate']; break;
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) {
            setCurrentStep(s => s + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(s => s - 1);
    };

    const CurrentFormComponent = steps[currentStep - 1].component;
    const formProps = steps[currentStep-1].id === 4 ? { year, onCnaeSelectorOpen } : { year };

    return (
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto space-y-8">
            <Stepper currentStep={currentStep} />
            
            <CurrentFormComponent {...formProps} />
            
            <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10">
                <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
                        Anterior
                    </Button>

                    {currentStep < steps.length ? (
                         <Button type="button" variant="default" onClick={nextStep} disabled={isLoading}>
                             Próximo
                         </Button>
                    ) : (
                        <Button type="submit" size="lg" disabled={isLoading} className="text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? <Loader2 className="animate-spin" /> : null}
                            {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
