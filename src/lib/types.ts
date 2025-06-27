export interface TaxFormValues {
    monthlyRevenueDomestic: number;
    monthlyRevenueExport: number;
    totalSalaryExpense: number;
    proLaborePartners: number;
    businessActivityCNAE: string;
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
}

export interface CalculationResults {
    simplesNacional: TaxDetails;
    lucroPresumido: TaxDetails;
}
