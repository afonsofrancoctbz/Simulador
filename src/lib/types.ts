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
  municipalISSRate: number;
}

export interface TaxDetails {
  regime: 'Simples Nacional' | 'Lucro Presumido';
  totalTax: number;
  totalMonthlyCost: number;
  breakdown: {
    name: string;
    value: number;
  }[];
  notes?: string[];
}

export interface CalculationResults {
  simplesNacional: TaxDetails;
  lucroPresumido: TaxDetails;
}

export type Annex = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface CnaeData {
  code: string;
  description: string;
  annex: Annex;
  requiresFatorR?: boolean;
  presumedProfitRate: number;
  isRegulated?: boolean;
}
