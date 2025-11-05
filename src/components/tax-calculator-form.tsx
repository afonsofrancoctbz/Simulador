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
    { id: 4, name: 'Receita Mensal', component: FormSectionRevenue },
    { id: 5, name: 'Plano', component: FormSectionPlan },
];

const validationSteps = [
    ['city'],
    ['totalSalaryExpense', 'proLabores', 'numberOfPartners'],
    ['rbt12', 'fp12'],
    ['selectedCnaes', 'revenues', 'exportCurrency', 'exchangeRate', 'issRate', 'b2bRevenuePercentage', 'creditGeneratingExpenses'],
    ['selectedPlan']
];

export function TaxCalculatorForm({ year, onCnaeSelectorOpen, isLoading, onSubmit }: TaxCalculatorFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const form = useFormContext<CalculatorFormValues>();

    const handleNext = async () => {
        const fieldsToValidate = validationSteps[currentStep];
        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const CurrentComponent = steps[currentStep].component;

    return (
        <form onSubmit={onSubmit} className="space-y-8 text-left max-w-4xl mx-auto">
            {/* Stepper */}
            <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-12">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                    currentStep === index
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : currentStep > index ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"
                                )}
                            >
                                {step.id}
                            </div>
                            <p className={cn("text-xs md:text-sm mt-2 text-center", currentStep === index ? "font-bold text-primary" : "text-muted-foreground")}>
                                {step.name}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={cn("flex-1 h-0.5 mt-[-1rem]", currentStep > index ? "bg-primary/30" : "bg-border")}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="min-h-[450px]">
                <CurrentComponent year={year} onCnaeSelectorOpen={onCnaeSelectorOpen} />
            </div>

            <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10 flex justify-between items-center">
                {currentStep > 0 ? (
                    <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                        Anterior
                    </Button>
                ) : <div />}

                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} disabled={isLoading}>
                        Próximo
                    </Button>
                ) : (
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading ? <Loader2 className="animate-spin" /> : null}
                        {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                    </Button>
                )}
            </div>
        </form>
    );
}
