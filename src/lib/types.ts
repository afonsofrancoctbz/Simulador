import { z } from "zod";

// Schema for a selected CNAE, which might include a user's choice of cClass
export const CnaeSelectionSchema = z.object({
  code: z.string(),
  cClass: z.string().optional(),
});
export type CnaeSelection = z.infer<typeof CnaeSelectionSchema>;

// Schema for an individual CNAE item with revenue
export const CnaeItemSchema = z.object({
  code: z.string(),
  revenue: z.coerce.number().min(0, "O faturamento deve ser maior que zero.").or(z.literal(0)),
  cClass: z.string().optional(),
});
export type CnaeItem = z.infer<typeof CnaeItemSchema>;


// Schema for an individual pro-labore input from the form
export const ProLaboreFormSchema = z.object({
  value: z.coerce.number().min(0, "O valor deve ser positivo."),
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


// Schema for the main form input passed from the frontend to the Genkit flow
export const TaxFormValuesSchema = z.object({
  year: z.number().optional(),
  selectedCnaes: z.array(CnaeSelectionSchema),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo."),
  fp12: z.coerce.number().min(0, "O valor deve ser positivo."),
  revenues: z.record(z.string(), z.coerce.number().min(0).optional()),
  domesticActivities: z.array(CnaeItemSchema).optional(),
  exportActivities: z.array(CnaeItemSchema).optional(),
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number().optional(),
  issRate: z.coerce.number().min(0).max(5).optional(),
  totalSalaryExpense: z.coerce.number().min(0, "O valor deve ser positivo."),
  proLabores: z.array(ProLaboreFormSchema),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive(),
  b2bRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
  creditGeneratingExpenses: z.coerce.number().min(0, "O valor deve ser positivo.").optional(),
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
      "Simples Nacional (Otimizado)",
      "Lucro Presumido (Regras Atuais)",
    ]),
    totalTax: z.number(),
    totalMonthlyCost: z.number(),
    totalRevenue: z.number(),
    domesticRevenue: z.number().optional(),
    exportRevenue: z.number().optional(),
    proLabore: z.number(),
    fatorR: z.number().optional(),
    effectiveRate: z.number().optional(),
    effectiveDasRate: z.number().optional(),
    contabilizeiFee: z.number(),
    breakdown: z.array(TaxBreakdownItemSchema),
    notes: z.array(z.string()),
    annex: z.string().optional(),
    optimizationNote: z.string().optional(),
    partnerTaxes: z.array(PartnerTaxDetailsSchema),
    order: z.number().optional(),
});
export type TaxDetails = z.infer<typeof TaxDetailsSchema>;

export const CalculationResultsSchema = z.object({
  simplesNacionalOtimizado: TaxDetailsSchema.nullable(),
  simplesNacionalBase: TaxDetailsSchema,
  lucroPresumido: TaxDetailsSchema,
});
export type CalculationResults = z.infer<typeof CalculationResultsSchema>;


// Schemas for 2026 and beyond
export const TaxDetails2026Schema = TaxDetailsSchema.extend({
  regime: z.enum([
    'Lucro Presumido',
    'Lucro Presumido (Regras Atuais)',
    'Simples Nacional Tradicional (Anexo V)',
    'Simples Nacional Híbrido (Anexo V)',
    'Simples Nacional Tradicional (Anexo III)',
    'Simples Nacional Híbrido (Anexo III)',
    'Simples Nacional (Fator R Otimizado)',
    'Simples Nacional (Fator R Otimizado) Híbrido'
  ]),
});
export type TaxDetails2026 = z.infer<typeof TaxDetails2026Schema>;

export const CalculationResults2026Schema = z.object({
  lucroPresumido: TaxDetails2026Schema.nullable(),
  lucroPresumidoAtual: TaxDetailsSchema.nullable(),
  simplesNacionalTradicional: TaxDetails2026Schema.nullable(),
  simplesNacionalHibrido: TaxDetails2026Schema.nullable(),
  simplesNacionalOtimizado: TaxDetails2026Schema.nullable(),
  simplesNacionalOtimizadoHibrido: TaxDetails2026Schema.nullable(),
});
export type CalculationResults2026 = z.infer<typeof CalculationResults2026Schema>;


export type Annex = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface CnaeData {
  code: string;
  description: string;
  annex: Annex;
  category: string;
  requiresFatorR?: boolean;
  presumedProfitRateIRPJ?: number;
  presumedProfitRateCSLL?: number;
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

/**
 * Schema para os dados mensais da janela móvel (12 meses)
 */
export const MonthlyDataSchema = z.object({
  mes: z.string().describe("Formato MM/AAAA"),
  receita: z.number().min(0, 'Receita não pode ser negativa').describe("Valor monetário da receita"),
  folha: z.number().min(0, 'Folha não pode ser negativa').describe("Valor monetário da folha/pró-labore"),
});
export type MonthlyData = z.infer<typeof MonthlyDataSchema>;


/**
 * Schema Zod para validação dos dados extraídos do PGDAS-D
 */
export const PgdasDataSchema = z.object({
  competencias: z.array(MonthlyDataSchema).describe("Lista extraída das tabelas '2.2 Receitas Brutas Anteriores' e '2.3 Folha de Salários'"),
  totalRBT12: z
    .number()
    .min(0, 'RBT12 deve ser um valor positivo')
    .describe('Receita Bruta Total acumulada nos últimos 12 meses'),
  
  totalFolha12: z
    .number()
    .min(0, 'Folha de Salários não pode ser negativa')
    .describe('Total da Folha de Salários dos últimos 12 meses'),
  
  periodoApuracao: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Período deve estar no formato MM/YYYY')
    .describe('Período de Apuração (ex: 08/2025)'),
  
  fatorR: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Fator R calculado (Folha / Receita)'),
  
  anexo: z
    .enum(['III', 'V'])
    .optional()
    .describe('Anexo do Simples Nacional aplicado'),
});
export type PgdasData = z.infer<typeof PgdasDataSchema>;


/**
 * Schema para análise do Fator R com plano de adequação
 */
export const FatorRAnalysisSchema = z.object({
  fatorRAtual: z.number().min(0).max(1),
  anexoAtual: z.enum(['III', 'V']),
  rbt12Atual: z.number().min(0),
  folha12Atual: z.number().min(0),
  
  folhaNecessaria: z.number().min(0).describe('Folha necessária para atingir 28%'),
  diferenca: z.number().min(0).describe('Diferença para atingir o Fator R de 28%'),
  
  mesesParaAdequacao: z.number().int().min(1).max(12),
  aumentoMensalNecessario: z.number().min(0),
  folhaBaseAtual: z.number().min(0),
  folhaTotalMensal: z.number().min(0).describe('Folha base + aumento'),
  
  economiaMensal: z.number().optional().describe('Economia tributária estimada após adequação'),
  custoAdequacao: z.number().optional().describe('Custo total dos encargos sobre o aumento'),
  paybackMeses: z.number().optional().describe('Tempo de retorno do investimento em meses'),
});
export type FatorRAnalysis = z.infer<typeof FatorRAnalysisSchema>;


/**
 * Schema para a projeção mês a mês da adequação
 */
export const ProjectionMonthSchema = z.object({
  mesFolha: z.string().regex(/^\d{2}\/\d{4}$/),
  mesApuracao: z.string().regex(/^\d{2}\/\d{4}$/),
  folhaBase: z.number(),
  aumento: z.number(),
  folhaTotal: z.number(),
  folhaAcumulada12m: z.number(),
  fatorRProjetado: z.number(),
  anexoProjetado: z.enum(['III', 'V']),
  economiaEstimada: z.number().optional(),
});
export type ProjectionMonth = z.infer<typeof ProjectionMonthSchema>;


/**
 * Schema completo do relatório de análise para migração
 */
export const MigrationReportSchema = z.object({
  pgdasData: PgdasDataSchema,
  analysis: FatorRAnalysisSchema,
  projection: z.array(ProjectionMonthSchema),
  recommendations: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date()),
});
export type MigrationReport = z.infer<typeof MigrationReportSchema>;
