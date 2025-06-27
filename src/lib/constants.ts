import { CnaeData } from "./types";

export const MINIMUM_WAGE = 1518.00;
export const SIMPLIFIED_DEDUCTION_IRRF = 564.80;

// Tabela Progressiva para o IRPF
export const IRRF_TABLE = [
    { min: 0, max: 2259.20, rate: 0, deduction: 0 },
    { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
    { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
    { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
    { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
];

// Tabelas do Simples Nacional com partilha de impostos por faixa
export const SIMPLES_NACIONAL_ANNEX_I = [ // Comércio
    { min: 0, max: 180000, rate: 0.04, deduction: 0, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.415, ICMS: 0.34 } },
    { min: 180000.01, max: 360000, rate: 0.073, deduction: 5940, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.415, ICMS: 0.34 } },
    { min: 360000.01, max: 720000, rate: 0.095, deduction: 13860, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
    { min: 720000.01, max: 1800000, rate: 0.107, deduction: 22500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
    { min: 1800000.01, max: 3600000, rate: 0.143, deduction: 87300, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
    { min: 3600000.01, max: 4800000, rate: 0.19, deduction: 378000, distribution: { IRPJ: 0.135, CSLL: 0.10, COFINS: 0.2827, PIS: 0.0613, CPP: 0.421, ICMS: 0 } },
];

export const SIMPLES_NACIONAL_ANNEX_II = [ // Indústria
    { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
    { min: 180000.01, max: 360000, rate: 0.078, deduction: 5940, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
    { min: 360000.01, max: 720000, rate: 0.10, deduction: 13860, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
    { min: 720000.01, max: 1800000, rate: 0.112, deduction: 22500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
    { min: 1800000.01, max: 3600000, rate: 0.147, deduction: 85500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
    { min: 3600000.01, max: 4800000, rate: 0.30, deduction: 720000, distribution: { IRPJ: 0.085, CSLL: 0.075, COFINS: 0.2274, PIS: 0.0276, CPP: 0.235, ICMS: 0, IPI: 0.35 } },
];

export const SIMPLES_NACIONAL_ANNEX_III = [ // Serviços
    { min: 0, max: 180000, rate: 0.06, deduction: 0, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 180000.01, max: 360000, rate: 0.112, deduction: 9360, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 360000.01, max: 720000, rate: 0.135, deduction: 17640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 720000.01, max: 1800000, rate: 0.16, deduction: 35640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 1800000.01, max: 3600000, rate: 0.21, deduction: 125640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 648000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.141, PIS: 0.0305, CPP: 0.295, ISS: 0 } },
];

export const SIMPLES_NACIONAL_ANNEX_IV = [ // Serviços
    { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.188, CSLL: 0.152, COFINS: 0.2143, PIS: 0.0457, ISS: 0.4 } },
    { min: 180000.01, max: 360000, rate: 0.09, deduction: 8100, distribution: { IRPJ: 0.198, CSLL: 0.152, COFINS: 0.2543, PIS: 0.0457, ISS: 0.35 } },
    { min: 360000.01, max: 720000, rate: 0.102, deduction: 12420, distribution: { IRPJ: 0.208, CSLL: 0.152, COFINS: 0.2443, PIS: 0.0457, ISS: 0.35 } },
    { min: 720000.01, max: 1800000, rate: 0.14, deduction: 39780, distribution: { IRPJ: 0.178, CSLL: 0.192, COFINS: 0.2343, PIS: 0.0457, ISS: 0.35 } },
    { min: 1800000.01, max: 3600000, rate: 0.22, deduction: 183780, distribution: { IRPJ: 0.188, CSLL: 0.192, COFINS: 0.2243, PIS: 0.0457, ISS: 0.35 } },
    { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 828000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.415, PIS: 0.085, ISS: 0 } },
];

export const SIMPLES_NACIONAL_ANNEX_V = [ // Serviços
    { min: 0, max: 180000, rate: 0.155, deduction: 0, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.1485, PIS: 0.028, CPP: 0.2885, ISS: 0.135 } },
    { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500, distribution: { IRPJ: 0.23, CSLL: 0.15, COFINS: 0.1635, PIS: 0.028, CPP: 0.2885, ISS: 0.14 } },
    { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900, distribution: { IRPJ: 0.21, CSLL: 0.15, COFINS: 0.1785, PIS: 0.028, CPP: 0.2885, ISS: 0.145 } },
    { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100, distribution: { IRPJ: 0.19, CSLL: 0.15, COFINS: 0.1935, PIS: 0.028, CPP: 0.2885, ISS: 0.15 } },
    { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100, distribution: { IRPJ: 0.17, CSLL: 0.15, COFINS: 0.1885, PIS: 0.028, CPP: 0.2885, ISS: 0.175 } },
    { min: 3600000.01, max: 4800000, rate: 0.305, deduction: 540000, distribution: { IRPJ: 0.235, CSLL: 0.155, COFINS: 0.281, PIS: 0.024, CPP: 0.305, ISS: 0 } },
];

export { CNAE_DATA } from './cnaes';
