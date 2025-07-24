

"use client";

import { useState } from "react";
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
import { Loader2, Briefcase, Building2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  issRate: z.coerce.number().min(0.02, "O ISS deve ser no mínimo 2%.").max(0.05, "O ISS não pode ser maior que 5%.").optional(),
  totalSalaryExpense: z.coerce.number({ required_error: "Informe o custo com salários." }).min(0, "O valor não pode ser negativo."),
  proLabores: z.array(ProLaboreFormSchema).min(1),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive().int(),
  b2bRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
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

const formSections = [
    { id: 'company', icon: Building2, title: 'Empresa e Folha' },
    { id: 'revenue', icon: Briefcase, title: 'Atividades e Faturamento' },
    { id: 'plan', icon: ListChecks, title: 'Plano Contabilizei' }
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

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] lg:gap-12">
                    <aside className="hidden lg:flex flex-col gap-4 sticky top-24 h-fit">
                        {formSections.map((section, index) => (
                           <div key={section.id} className="flex flex-col">
                             <button
                                type="button"
                                onClick={() => setCurrentStep(index)}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-lg text-left transition-colors",
                                    currentStep === index ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <section.icon className="h-5 w-5" />
                                <span>{section.title}</span>
                            </button>
                             {index < formSections.length - 1 && (
                                <Separator orientation="vertical" className="mx-auto h-4 w-px bg-border my-1"/>
                            )}
                           </div>
                        ))}
                    </aside>

                    <main className="space-y-8">
                        <FormSectionCompany year={year} />
                        <FormSectionRevenue year={year} onCnaeSelectorOpen={() => setCnaeSelectorOpen(true)} />
                        <FormSectionPlan />

                        <div className="bg-card rounded-lg border shadow-lg p-4">
                            <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                                {isLoading ? <Loader2 className="animate-spin" /> : null}
                                {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                            </Button>
                        </div>
                    </main>
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
