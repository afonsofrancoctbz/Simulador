import { IRRF_TABLE, SIMPLES_NACIONAL_ANNEX_III, SIMPLES_NACIONAL_ANNEX_V } from './constants';
import { type CalculationResults, type TaxFormValues, type TaxDetails } from './types';

function formatName(name: string) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function findBracket(table: any[], value: number) {
    return table.find(bracket => value > bracket.min && value <= bracket.max) || table[table.length - 1];
}

function calculateProLaboreTaxes(proLabore: number) {
    const INSS_RATE = 0.11;
    const INSS_CEILING = 7786.02;

    const inssOnProLabore = Math.min(proLabore, INSS_CEILING) * INSS_RATE;

    const irrfCalculationBase = proLabore - inssOnProLabore;
    const irrfBracket = findBracket(IRRF_TABLE, irrfCalculationBase);
    const irrf = irrfCalculationBase * irrfBracket.rate - irrfBracket.deduction;

    return { inssOnProLabore, irrf };
}

function calculateSimplesNacional(values: TaxFormValues): TaxDetails {
    const { monthlyRevenueDomestic, monthlyRevenueExport, totalSalaryExpense, proLaborePartners } = values;

    const totalMonthlyRevenue = monthlyRevenueDomestic + monthlyRevenueExport;
    const rbt12 = totalMonthlyRevenue * 12; // Simplified RBT12
    const payroll12 = (totalSalaryExpense + proLaborePartners) * 12;

    const fatorR = rbt12 > 0 ? payroll12 / rbt12 : 0;

    // Simplified CNAE logic: assume services that fall under Annex III or V based on Fator R
    const isAnnexV = fatorR < 0.28;
    const annex = isAnnexV ? SIMPLES_NACIONAL_ANNEX_V : SIMPLES_NACIONAL_ANNEX_III;

    const bracket = findBracket(annex, rbt12);
    const effectiveRate = ((rbt12 * bracket.rate - bracket.deduction) / rbt12);

    // Calculate tax on domestic revenue
    const dasOnDomestic = monthlyRevenueDomestic * effectiveRate;
    
    // Calculate tax on export revenue (exempt from some taxes)
    const exportExemptionRate = bracket.distribution.COFINS + bracket.distribution.PIS + bracket.distribution.ISS;
    const effectiveRateForExport = Math.max(0, effectiveRate - exportExemptionRate);
    const dasOnExport = monthlyRevenueExport * effectiveRateForExport;

    const totalDas = dasOnDomestic + dasOnExport;

    const proLaboreTaxes = calculateProLaboreTaxes(proLaborePartners);

    // INSS on payroll (CPP) is included in DAS for Annex III/V.
    const totalTax = totalDas + proLaboreTaxes.inssOnProLabore + proLaboreTaxes.irrf;
    const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners;

    return {
        regime: 'Simples Nacional',
        totalTax: totalTax,
        totalMonthlyCost: totalMonthlyCost,
        breakdown: [
            { name: "DAS (Imposto Unificado)", value: totalDas },
            { name: "INSS sobre Pró-labore", value: proLaboreTaxes.inssOnProLabore },
            { name: "IRRF sobre Pró-labore", value: proLaboreTaxes.irrf },
        ]
    };
}

function calculateLucroPresumido(values: TaxFormValues): TaxDetails {
    const { monthlyRevenueDomestic, monthlyRevenueExport, totalSalaryExpense, proLaborePartners, municipalISSRate } = values;

    const totalMonthlyRevenue = monthlyRevenueDomestic + monthlyRevenueExport;
    
    // Presumption base for IRPJ/CSLL (assuming 32% for services)
    const PRESUMPTION_RATE_IRPJ = 0.32;
    const PRESUMPTION_RATE_CSLL = 0.32;
    
    const profitBaseIRPJ = totalMonthlyRevenue * PRESUMPTION_RATE_IRPJ;
    const profitBaseCSLL = totalMonthlyRevenue * PRESUMPTION_RATE_CSLL;

    // IRPJ
    const IRPJ_RATE = 0.15;
    const IRPJ_ADDITIONAL_RATE = 0.10;
    const IRPJ_ADDITIONAL_THRESHOLD = 20000;
    let irpj = profitBaseIRPJ * IRPJ_RATE;
    if (profitBaseIRPJ > IRPJ_ADDITIONAL_THRESHOLD) {
        irpj += (profitBaseIRPJ - IRPJ_ADDITIONAL_THRESHOLD) * IRPJ_ADDITIONAL_RATE;
    }

    // CSLL
    const CSLL_RATE = 0.09;
    const csll = profitBaseCSLL * CSLL_RATE;

    // PIS/COFINS (on domestic revenue only)
    const PIS_RATE = 0.0065;
    const COFINS_RATE = 0.03;
    const pis = monthlyRevenueDomestic * PIS_RATE;
    const cofins = monthlyRevenueDomestic * COFINS_RATE;

    // ISS (on domestic revenue only)
    const iss = monthlyRevenueDomestic * (municipalISSRate / 100);

    // INSS on payroll
    const INSS_PATRONAL_RATE = 0.20; // 20%
    const RAT_RATE = 0.03; // Assumed 3%
    const TERCEIROS_RATE = 0.058; // Assumed 5.8%
    const totalPayroll = totalSalaryExpense + proLaborePartners;
    const inssPatronal = totalPayroll * (INSS_PATRONAL_RATE + RAT_RATE + TERCEIROS_RATE);
    
    const proLaboreTaxes = calculateProLaboreTaxes(proLaborePartners);

    const totalTax = irpj + csll + pis + cofins + iss + inssPatronal + proLaboreTaxes.inssOnProLabore + proLaboreTaxes.irrf;
    const totalMonthlyCost = totalTax + totalSalaryExpense + proLaborePartners;

    return {
        regime: 'Lucro Presumido',
        totalTax: totalTax,
        totalMonthlyCost: totalMonthlyCost,
        breakdown: [
            { name: "PIS", value: pis },
            { name: "COFINS", value: cofins },
            { name: "ISS", value: iss },
            { name: "IRPJ", value: irpj },
            { name: "CSLL", value: csll },
            { name: "INSS Patronal (Folha)", value: inssPatronal },
            { name: "INSS sobre Pró-labore", value: proLaboreTaxes.inssOnProLabore },
            { name: "IRRF sobre Pró-labore", value: proLaboreTaxes.irrf },
        ]
    };
}

export function calculateTaxes(values: TaxFormValues): CalculationResults {
    const simplesNacional = calculateSimplesNacional(values);
    const lucroPresumido = calculateLucroPresumido(values);

    return {
        simplesNacional,
        lucroPresumido,
    };
}
