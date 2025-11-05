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
import { Loader2 } from "lucide-react";
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

const formSteps = [
    { id: 1, label: 'Empresa', component: FormSectionCompany },
    { id: 2, label: 'Folha e Sócios', component: FormSectionPayroll },
    { id: 3, label: 'Receita Anual', component: FormSectionAnnualRevenue },
    { id: 4, label: 'Atividades e Faturamento Mensal', component: FormSectionRevenue },
    { id: 5, label: 'Plano', component: FormSectionPlan },
];

interface TaxCalculatorFormProps {
    year: 2025 | 2026;
    onCnaeSelectorOpen: () => void;
    isLoading: boolean;
    onSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

export function TaxCalculatorForm({ year, onCnaeSelectorOpen, isLoading, onSubmit }: TaxCalculatorFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const form = useFormContext();

    const ActiveComponent = formSteps[currentStep - 1].component;
    const isLastStep = currentStep === formSteps.length;
    
    const handleNext = async () => {
        let fieldsToValidate: (keyof CalculatorFormValues)[] = [];
        switch(currentStep) {
            case 1: fieldsToValidate = ['city']; break;
            case 2: fieldsToValidate = ['totalSalaryExpense', 'proLabores', 'numberOfPartners']; break;
            case 3: fieldsToValidate = ['rbt12', 'fp12']; break;
            case 4: fieldsToValidate = ['selectedCnaes', 'revenues', 'exportCurrency', 'issRate', 'b2bRevenuePercentage', 'creditGeneratingExpenses']; break;
            case 5: fieldsToValidate = ['selectedPlan']; break;
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid && !isLastStep) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8 text-left max-w-4xl mx-auto">
            <div className="mb-8">
                <ol className="flex items-center w-full">
                    {formSteps.map((step, index) => (
                        <li key={step.id} className={cn("flex w-full items-center", index !== formSteps.length -1 && "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block",
                         step.id < currentStep ? 'after:border-primary' : 'after:border-muted'
                        )}>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(step.id)}
                                className={cn("flex items-center justify-center w-auto h-10 rounded-full shrink-0 px-4 py-2 text-sm font-semibold",
                                 step.id === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
                                 step.id < currentStep && "bg-primary/80 text-primary-foreground/90 hover:bg-primary"
                                )}
                            >
                                {step.id}. {step.label}
                            </button>
                        </li>
                    ))}
                </ol>
            </div>
            
            <ActiveComponent year={year} onCnaeSelectorOpen={onCnaeSelectorOpen} />

            <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10 flex justify-between items-center">
                 <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isLoading}>
                    Anterior
                </Button>
                
                {!isLastStep && (
                    <Button type="button" onClick={handleNext} disabled={isLoading}>
                        Próximo
                    </Button>
                )}

                {isLastStep && (
                    <Button type="submit" disabled={isLoading} className="w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                        {isLoading ? <Loader2 className="animate-spin" /> : null}
                        {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                    </Button>
                )}
            </div>
        </form>
    );
}
