

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
