
export interface CnaeItem {
  code: string;
  revenue: number;
}

export interface TaxFormValues {
  domesticActivities: CnaeItem[];
  exportActivities: CnaeItem[];
  exportCurrency: string;
  exchangeRate: number;
  totalSalaryExpense: number;
  proLaborePartners: number;
  numberOfPartners: number;
}

export interface TaxDetails {
  regime: string;
  totalTax: number;
  totalMonthlyCost: number;
  totalRevenue: number;
  proLabore: number;
  fatorR?: number;
  effectiveRate: number;
  contabilizeiFee: number;
  breakdown: {
    name: string;
    value: number;
    rate?: number;
  }[];
  notes?: string[];
  annex?: string;
  annualSavings?: number;
  explanation: string;
  optimizationNote?: string;
}

export interface CalculationResults {
  simplesNacionalComFatorR: TaxDetails;
  simplesNacionalSemFatorR: TaxDetails;
  lucroPresumido: TaxDetails;
}


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
