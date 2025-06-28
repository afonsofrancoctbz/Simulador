import { z } from "zod";

// Schema for an individual CNAE item
export const CnaeItemSchema = z.object({
  code: z.string(),
  revenue: z.coerce.number().positive({ message: "O faturamento deve ser maior que zero." }).or(z.literal(0)),
});
export type CnaeItem = z.infer<typeof CnaeItemSchema>;

// Schema for the main form input
export const TaxFormValuesSchema = z.object({
  domesticActivities: z.array(CnaeItemSchema),
  exportActivities: z.array(CnaeItemSchema),
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number(),
  totalSalaryExpense: z.coerce.number().min(0, "O valor deve ser positivo."),
  proLaborePerPartner: z.coerce.number().min(0, "O valor deve ser positivo."),
  otherINSSSourcesPerPartner: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1."),
});
export type TaxFormValues = z.infer<typeof TaxFormValuesSchema>;


// Schema for the breakdown of taxes in the results
export const TaxBreakdownItemSchema = z.object({
    name: z.string(),
    value: z.number(),
});
export type TaxBreakdownItem = z.infer<typeof TaxBreakdownItemSchema>;

// Schema for the details of a single tax scenario
export const TaxDetailsSchema = z.object({
    regime: z.string(),
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
    partnerTaxes: z.object({ inss: z.number(), irrf: z.number() })
});
export type TaxDetails = z.infer<typeof TaxDetailsSchema>;


// Schema for the final calculation results
export const CalculationResultsSchema = z.object({
    simplesNacionalComFatorR: TaxDetailsSchema,
    simplesNacionalSemFatorR: TaxDetailsSchema,
    lucroPresumido: TaxDetailsSchema,
});
export type CalculationResults = z.infer<typeof CalculationResultsSchema>;


export type Annex = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface CnaeData {
  code: string;
  description: string;
  annex: Annex;
  category?: string;
  requiresFatorR?: boolean;
  presumedProfitRate: number;
  isRegulated?: boolean;
  notes?: string;
}

export interface FeeBracket {
    label: string;
    min: number;
    max: number;
    plans: {
        basico: number;
        padrao: number;
        multibeneficios: number;
        expertsEssencial: number;
        expertsPro: number;
    }
}

export interface ProLaboreInput {
  valorProLaboreBruto: number;
  outrasFontesRendaINSS?: number; // Soma de outras remunerações (ex: salário CLT)
  configuracaoFiscal: any; // Objeto com os parâmetros do ano (tabelas, tetos)
}

export interface ProLaboreOutput {
  valorBruto: number;
  baseCalculoINSS: number;
  aliquotaEfetivaINSS: number;
  valorINSSCalculado: number;
  baseCalculoIRRF: number;
  valorIRRFCalculado: number;
  valorLiquido: number; // Bruto - INSS - IRRF
}
