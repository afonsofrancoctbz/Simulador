

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
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function TaxCalculatorForm({ year, onSubmit, isLoading }: TaxCalculatorFormProps) {
    const form = useFormContext<CalculatorFormValues>();
    const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);

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
                <Tabs defaultValue="company" className="w-full">
                    <div className="flex justify-center">
                        <TabsList className="flex w-full mb-8">
                            <TabsTrigger value="company">1. Empresa</TabsTrigger>
                            <TabsTrigger value="payroll">2. Folha e Sócios</TabsTrigger>
                            <TabsTrigger value="annual-revenue">3. Receita Anual</TabsTrigger>
                            <TabsTrigger value="monthly-revenue">4. Atividades e Faturamento Mensal</TabsTrigger>
                            <TabsTrigger value="plan">5. Plano</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="company">
                         <FormSectionCompany />
                    </TabsContent>
                     <TabsContent value="payroll">
                         <FormSectionPayroll year={year} />
                    </TabsContent>
                    <TabsContent value="annual-revenue">
                        <FormSectionAnnualRevenue />
                    </TabsContent>
                    <TabsContent value="monthly-revenue">
                        <FormSectionRevenue year={year} onCnaeSelectorOpen={() => setCnaeSelectorOpen(true)} />
                    </TabsContent>
                    <TabsContent value="plan">
                        <FormSectionPlan />
                    </TabsContent>
                </Tabs>

                <div className="bg-card rounded-lg border shadow-lg p-4">
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading ? <Loader2 className="animate-spin" /> : null}
                        {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                    </Button>
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
