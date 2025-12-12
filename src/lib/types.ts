

import { z } from "zod";

// =================================================================================
// CNAE AND ACTIVITY SCHEMAS
// =================================================================================

// Schema for a selected CNAE, which might include a user's choice of cClass
export const CnaeSelectionSchema = z.object({
  code: z.string(),
  cClassTrib: z.string().optional(),
  domesticRevenue: z.coerce.number().min(0, "O faturamento deve ser positivo.").optional(),
  exportRevenue: z.coerce.number().min(0, "O faturamento deve ser positivo.").optional(),
});
export type CnaeSelection = z.infer<typeof CnaeSelectionSchema>;

// Schema for an individual CNAE item with revenue, used in calculations
export const CnaeItemSchema = z.object({
  code: z.string(),
  revenue: z.coerce.number().min(0, "O faturamento deve ser maior que zero.").or(z.literal(0)),
  cClassTrib: z.string().optional(),
});
export type CnaeItem = z.infer<typeof CnaeItemSchema>;


// =================================================================================
// FORM AND INPUT SCHEMAS
// =================================================================================

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


// =================================================================================
// CALCULATION RESULT SCHEMAS
// =================================================================================

// Schema for the breakdown of taxes in the results
export const TaxBreakdownItemSchema = z.object({
    name: z.string(),
    value: z.number(),
    rate: z.number().optional(),
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


// Schema for the details of a single tax scenario (2025)
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


// Schemas for 2026 and beyond (Post-Reform)
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


// =================================================================================
// DATA AND CONFIGURATION INTERFACES/TYPES
// =================================================================================

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
}

export interface FeeBracket {
    label: string;
    min: number;
    max: number;
    plans: {
        [key in Plan]: number;
    }
}


// =================================================================================
// PGDAS and Fator R ANALYSIS SCHEMAS
// =================================================================================

export const MonthlyDataSchema = z.object({
  mes: z.string().describe("Formato MM/AAAA"),
  receita: z.number().min(0, 'Receita não pode ser negativa').describe("Valor monetário da receita"),
  folha: z.number().min(0, 'Folha não pode ser negativa').describe("Valor monetário da folha/pró-labore"),
});
export type MonthlyData = z.infer<typeof MonthlyDataSchema>;

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

export const FatorRResponseSchema = z.object({
  fatorR_Atual: z.number(),
  isEnquadradoAgora: z.boolean(),
  mesesParaEnquadramento: z.number(),
  statusMensagem: z.enum(['success', 'warning', 'info', 'error']),
  textoMensagem: z.string(),
});
export type FatorRResponse = z.infer<typeof FatorRResponseSchema>;

export const DadosMensaisSchema = z.object({
  mes: z.string(),
  receita: z.number(),
  folha: z.number(),
});
export type DadosMensais = z.infer<typeof DadosMensaisSchema>;

export const SituacaoAtualSchema = z.object({
  rbt12: z.number(),
  folha12: z.number(),
  fatorR: z.number(),
  anexo: z.enum(['III', 'V']),
  custoMensalAtual: z.number(),
  aliquotaAtual: z.number(),
  receitaMensal: z.number(),
  folhaMensal: z.number(),
});
export type SituacaoAtual = z.infer<typeof SituacaoAtualSchema>;


export const AnaliseGapSchema = z.object({
  folhaNecessaria: z.number(),
  diferencaTotal: z.number(),
  percentualAumento: z.number(),
  viavel: z.boolean(),
  mensagemViabilidade: z.string().optional(),
});

export const PlanoAdequacaoSchema = z.object({
  mesesParaAdequacao: z.number(),
  aumentoMensalNecessario: z.number(),
  folhaBaseAtual: z.number(),
  folhaTotalMensal: z.number(),
  custoComEncargos: z.number(),
});

export const ProjecaoMesSchema = z.object({
  mes: z.number(),
  mesReferencia: z.string(),
  mesApuracao: z.string(),
  folhaBase: z.number(),
  aumentoAplicado: z.number(),
  folhaTotal: z.number(),
  folhaAcumulada12m: z.number(),
  fatorRProjetado: z.number(),
  anexoProjetado: z.enum(['III', 'V']),
  economiaEstimada: z.number(),
  custoAdequacao: z.number(),
});
export type ProjecaoMes = z.infer<typeof ProjecaoMesSchema>;

export const ROISchema = z.object({
  custoMensalAdequacao: z.number(),
  economiaMensal: z.number(),
  economiaAnual: z.number(),
  paybackMeses: z.number(),
  investimentoTotal: z.number(),
  retornoTotal12Meses: z.number(),
});

export const AnaliseCompletaSchema = z.object({
  situacaoAtual: SituacaoAtualSchema,
  analiseGap: AnaliseGapSchema,
  planoAdequacao: PlanoAdequacaoSchema,
  projecao: z.array(ProjecaoMesSchema),
  roi: ROISchema,
  recomendacoes: z.array(z.string()),
  jaOtimizado: z.boolean(),
});
export type AnaliseCompleta = z.infer<typeof AnaliseCompletaSchema>;


// =================================================================================
// TAX REFORM (2026+) SPECIFIC INTERFACES
// =================================================================================

export interface ActivityWithReduction extends CnaeItem {
  nbsDescription?: string;
  cClassTribDescription?: string;
  appliedReduction?: {
    ibs: number;
    cbs: number;
  };
}

export function activityToItem(activity: ActivityWithReduction): CnaeItem {
  return {
    code: activity.code,
    revenue: activity.revenue,
    cClassTrib: activity.cClassTrib,
  };
}

    