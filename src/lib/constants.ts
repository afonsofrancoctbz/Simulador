// Tabela Progressiva para o IRPF
export const IRRF_TABLE = [
    { min: 0, max: 2259.20, rate: 0, deduction: 0 },
    { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
    { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
    { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
    { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
];

// Tabelas do Simples Nacional (Anexos para Serviços)
// RBT12: Receita Bruta em 12 meses
// Alíquota e Parcela a Deduzir do Valor Recolhido

export const SIMPLES_NACIONAL_ANNEX_III = [
    { min: 0, max: 180000, rate: 0.06, deduction: 0, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 180000.01, max: 360000, rate: 0.112, deduction: 9360, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 360000.01, max: 720000, rate: 0.135, deduction: 17640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 720000.01, max: 1800000, rate: 0.16, deduction: 35640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 1800000.01, max: 3600000, rate: 0.21, deduction: 125640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 648000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.141, PIS: 0.0305, CPP: 0.295, ISS: 0.0335 } },
];

export const SIMPLES_NACIONAL_ANNEX_V = [
    { min: 0, max: 180000, rate: 0.155, deduction: 0, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.133, PIS: 0.028, CPP: 0.2885, ISS: 0.1505 } },
    { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.133, PIS: 0.028, CPP: 0.2885, ISS: 0.1505 } },
    { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.133, PIS: 0.028, CPP: 0.2885, ISS: 0.1505 } },
    { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.133, PIS: 0.028, CPP: 0.2885, ISS: 0.1505 } },
    { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.133, PIS: 0.028, CPP: 0.2885, ISS: 0.1505 } },
    { min: 3600000.01, max: 4800000, rate: 0.305, deduction: 540000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.141, PIS: 0.0305, CPP: 0.295, ISS: 0.0335 } },
];
