"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { CIDADES_ATENDIDAS } from '@/lib/cities';
import { PlanEnumSchema, ProLaboreFormSchema, CnaeSelectionSchema } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { FormSectionCompany } from "./form-section-company";
import { FormSectionPlan } from "./form-section-plan";
import { Loader2 } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";
import { MultiStepForm, useMultiStepForm } from "./multi-step-form";
import { FormSectionRevenueAndCnae } from "./form-section-revenue-and-cnae";

export const CalculatorFormSchema = z.object({
  city: z.string().optional().refine(val => !val || CIDADES_ATENDIDAS.includes(val), {
    message: "Por favor, selecione uma cidade válida da lista."
  }),
  selectedCnaes: z.array(CnaeSelectionSchema).min(1, "Selecione ao menos uma atividade (CNAE)."),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  fp12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),

  exportCurrency: z.string(),
  exchangeRate: z.coerce.number().optional(),
  issRate: z.coerce.number({invalid_type_error: "A alíquota de ISS deve ser um número."})
              .min(2, "A alíquota de ISS deve ser no mínimo 2%.")
              .max(5, "A alíquota de ISS não pode ser maior que 5%.")
              .optional(),
  totalSalaryExpense: z.coerce.number({ required_error: "Informe o custo com salários." }).min(0, "O valor não pode ser negativo."),
  proLabores: z.array(ProLaboreFormSchema).min(1),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive().int(),
  b2bRevenuePercentage: z.coerce.number().min(0, "O percentual deve ser no mínimo 0.").max(100, "O percentual não pode ser maior que 100.").optional().default(50),
  creditGeneratingExpenses: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  selectedPlan: PlanEnumSchema.default('expertsEssencial'),
  year: z.number().optional(),
}).refine(data => {
    const totalRevenue = data.selectedCnaes.reduce((acc, cnae) => acc + (cnae.domesticRevenue || 0) + (cnae.exportRevenue || 0), 0);
    const totalProLabore = data.proLabores.reduce((acc, pl) => acc + (pl.value || 0), 0);
    
    // Permite o cálculo se houver RBT12 (empresa existente) ou pró-labore (retirada sem faturamento).
    if ((data.rbt12 ?? 0) > 0 || totalProLabore > 0) {
        return true;
    }

    // Se não, exige que haja faturamento nos CNAEs.
    return totalRevenue > 0;
}, {
    message: "Informe ao menos um valor de faturamento, pró-labore ou receita bruta (RBT12) para calcular.",
    path: ["selectedCnaes"],
});

export type CalculatorFormValues = z.infer<typeof CalculatorFormSchema>;

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