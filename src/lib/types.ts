
import { z } from "zod";
import { FISCAL_CONFIG_2025 } from "@/config/fiscal";
import { formatCurrencyBRL } from "./utils";

const MINIMUM_WAGE = FISCAL_CONFIG_2025.salario_minimo;


// Schema for an individual CNAE item
export const CnaeItemSchema = z.object({
  code: z.string(),
  revenue: z.coerce.number().positive({ message: "O faturamento deve ser maior que zero." }).or(z.literal(0)),
});
export type CnaeItem = z.infer<typeof CnaeItemSchema>;

// Schema for an individual pro-labore input from the form
export const ProLaboreFormSchema = z.object({
  value: z.coerce.number().min(0, "O valor deve ser positivo.").refine(val => val === 0 || val >= MINIMUM_WAGE, {
    message: `O pró-labore não pode ser inferior a ${formatCurrencyBRL(MINIMUM_WAGE)}.`,
  }),
  hasOtherInssContribution: z.boolean().default(false),
  otherContributionSalary: z.coerce.number().min(0, "O valor deve ser positivo.").optional(),
}).superRefine((data, ctx) => {
    if (data.hasOtherInssContribution && (data.otherContributionSalary === undefined || data.otherContributionSalary <= 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Informe um valor de contribuição positivo.',
            path: ['otherContributionSalary'],
        });
    }
});
export type ProLaboreForm = z.infer<typeof ProLaboreFormSchema>;

export const PlanEnumSchema = z.enum(['basico', 'padrao', 'multibeneficios', 'expertsEssencial']);
export type Plan = z.infer<typeof PlanEnumSchema>;


// Schema for the main form input passed to calculation functions
export const TaxFormValuesSchema = z.object({
  selectedCnaes: z.array(z.string()),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo."),
  fp12: z.coerce.number().min(0, "O valor deve ser positivo."),
  domesticActivities: z.array(CnaeItemSchema),
  exportActivities: z.array(CnaeItemSchema),
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number(),
  totalSalaryExpense: z.coerce.number().min(0, "O valor deve ser positivo."),
  proLabores: z.array(ProLaboreFormSchema),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive(),
  b2bRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
  selectedPlan: PlanEnumSchema.default('expertsEssencial'),
});
export type TaxFormValues = z.infer<typeof TaxFormValuesSchema>;


// Schema for the breakdown of taxes in the results
export const TaxBreakdownItemSchema = z.object({
    name: z.string(),
    value: z.number(),
});
export type TaxBreakdownItem = z.infer<typeof TaxBreakdownItemSchema>;

// Schema for individual partner tax details in results
export const PartnerTaxDetailsSchema = z.object({
    proLaboreBruto: z.number(),
    inss: z.number(),
    irrf: z.number(),
    proLaboreLiquido: z.number(),
});
export type PartnerTaxDetails = z.infer<typeof PartnerTaxDetailsSchema>;


// Schema for the details of a single tax scenario
export const TaxDetailsSchema = z.object({
    regime: z.enum([
      "Simples Nacional", 
      "Lucro Presumido",
      "Simples Nacional Híbrido",
      "Simples Nacional Tradicional"
    ]),
    totalTax: z.number(),
    totalMonthlyCost: z.number(),
    totalRevenue: z.number(),
    proLabore: z.number(),
    fatorR: z.number().optional(),
    effectiveRate: z.number(),
    effectiveDasRate: z.number().optional(),
    contabilizeiFee: z.number(),
    breakdown: z.array(TaxBreakdownItemSchema),
    notes: z.array(z.string()).optional(),
    annex: z.string().optional(),
    annualSavings: z.number().optional(),
    optimizationNote: z.string().optional(),
    partnerTaxes: z.array(PartnerTaxDetailsSchema),
    netProfit: z.number().optional(),
    order: z.number().optional(),
});
export type TaxDetails = z.infer<typeof TaxDetailsSchema>;


// Schemas for 2026 results
export const TaxDetails2026Schema = TaxDetailsSchema.extend({});
export type TaxDetails2026 = z.infer<typeof TaxDetails2026Schema>;

export const CalculationResults2026Schema = z.object({
    simplesNacionalTradicional: TaxDetails2026Schema,
    simplesNacionalHibrido: TaxDetails2026Schema,
    lucroPresumido: TaxDetails2026Schema,
});
export type CalculationResults2026 = z.infer<typeof CalculationResults2026Schema>;


export const CalculationResultsSchema = z.object({
  simplesNacionalOtimizado: TaxDetailsSchema.nullable(),
  simplesNacionalBase: TaxDetailsSchema,
  lucroPresumido: TaxDetailsSchema,
});
export type CalculationResults = z.infer<typeof CalculationResultsSchema>;


export type Annex = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface CnaeData {
  code: string;
  description: string;
  annex: Annex;
  category: string;
  requiresFatorR?: boolean;
  presumedProfitRate: number;
  isRegulated?: boolean;
  notes?: string;
  ivaReduction?: number;
}

export interface FeeBracket {
    label: string;
    min: number;
    max: number;
    plans: {
        [key in Plan]: number;
    }
}
    
