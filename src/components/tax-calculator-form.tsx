

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
import { Loader2 } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";


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
    onSubmit: (values: CalculatorFormValues) => void;
    isLoading: boolean;
}


const STEPS = [
    { id: 'company', label: 'Empresa', component: (props: any) => <FormSectionCompany {...props} /> },
    { id: 'payroll', label: 'Folha e Sócios', component: (props: any) => <FormSectionPayroll {...props} /> },
    { id: 'annual-revenue', label: 'Receita Anual', component: (props: any) => <FormSectionAnnualRevenue {...props} /> },
    { id: 'monthly-revenue', label: 'Receita Mensal', component: (props: any) => <FormSectionRevenue {...props} /> },
    { id: 'plan', label: 'Plano', component: (props: any) => <FormSectionPlan {...props} /> },
];

export default function TaxCalculatorForm({ year, onSubmit, isLoading }: TaxCalculatorFormProps) {
    const form = useFormContext<CalculatorFormValues>();
    const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const selectedCnaes = form.watch("selectedCnaes");
    
    const handleCnaeConfirm = (codes: string[]) => {
        form.setValue('selectedCnaes', codes, { shouldValidate: true });
        const newRevenues: Record<string, number | undefined> = {};
        const newAnnexes = new Set(codes.map(code => getCnaeData(code)?.annex).filter(Boolean));
        const currentRevenues = form.getValues('revenues');

        for (const key in currentRevenues) {
            const [type, annex] = key.split('_') as [string, Annex];
            if (newAnnexes.has(annex)) {
                newRevenues[key] = currentRevenues[key];
            }
        }
        form.setValue('revenues', newRevenues);
    };

    const CurrentStepComponent = STEPS[currentStep].component;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left max-w-7xl mx-auto">
                <div className="mb-8 px-4 print-hidden">
                    <div className="flex items-center justify-center">
                        {STEPS.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(index)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            currentStep === index
                                                ? 'bg-primary border-primary text-primary-foreground'
                                                : currentStep > index 
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-muted border-border text-muted-foreground'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                    <p className={`mt-2 text-xs text-center font-semibold ${currentStep === index ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</p>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mt-5 ${currentStep > index ? 'bg-primary' : 'bg-border'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <CurrentStepComponent year={year} onCnaeSelectorOpen={() => setCnaeSelectorOpen(true)} />

                <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10 flex justify-between items-center">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isLoading}>
                        Anterior
                    </Button>
                    {currentStep < STEPS.length - 1 ? (
                        <Button type="button" onClick={nextStep}>
                            Próximo
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? <Loader2 className="animate-spin" /> : null}
                            {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                        </Button>
                    )}
                </div>
            </form>
            <CnaeSelector
                open={isCnaeSelectorOpen}
                onOpenChange={setCnaeSelectorOpen}
                onConfirm={handleCnaeConfirm}
                initialSelectedCodes={selectedCnaes}
            />
        </>
    );
}
