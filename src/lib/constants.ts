import { CnaeData } from "./types";

export const MINIMUM_WAGE = 1518.00;

// Tabela Progressiva para o IRPF
export const IRRF_TABLE = [
    { min: 0, max: 2259.20, rate: 0, deduction: 0 },
    { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
    { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
    { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
    { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
];

// Partilha de impostos por faixa - aproximado
const ANEXO_I_DISTR = { PIS: 0.0511, COFINS: 0.2373, IRPJ: 0.055, CSLL: 0.035, ICMS: 0.34, CPP: 0.2816 };
const ANEXO_II_DISTR = { PIS: 0.0511, COFINS: 0.2373, IRPJ: 0.055, CSLL: 0.035, IPI: 0.1, CPP: 0.5216 };
const ANEXO_III_DISTR_FAIXA_1_5 = { PIS: 0.0278, COFINS: 0.1282, IRPJ: 0.04, CSLL: 0.035, ISS: 0.335, CPP: 0.434 };
const ANEXO_III_DISTR_FAIXA_6 = { PIS: 0.0305, COFINS: 0.141, IRPJ: 0.35, CSLL: 0.15, ISS: 0.295, CPP: 0.0335 };
const ANEXO_IV_DISTR = { PIS: 0.046, COFINS: 0.2143, IRPJ: 0.38, CSLL: 0.18, ISS: 0.1797 }; // CPP é PAGO POR FORA
const ANEXO_V_DISTR_FAIXA_1_5 = { PIS: 0.028, COFINS: 0.133, IRPJ: 0.25, CSLL: 0.15, ISS: 0.1505, CPP: 0.2885 };
const ANEXO_V_DISTR_FAIXA_6 = { PIS: 0.0305, COFINS: 0.141, IRPJ: 0.35, CSLL: 0.15, ISS: 0.295, CPP: 0.0335 };

export const SIMPLES_NACIONAL_ANNEX_I = [ // Comércio
    { min: 0, max: 180000, rate: 0.04, deduction: 0, distribution: ANEXO_I_DISTR },
    { min: 180000.01, max: 360000, rate: 0.073, deduction: 5940, distribution: ANEXO_I_DISTR },
    { min: 360000.01, max: 720000, rate: 0.095, deduction: 13860, distribution: ANEXO_I_DISTR },
    { min: 720000.01, max: 1800000, rate: 0.107, deduction: 22500, distribution: ANEXO_I_DISTR },
    { min: 1800000.01, max: 3600000, rate: 0.143, deduction: 87300, distribution: ANEXO_I_DISTR },
    { min: 3600000.01, max: 4800000, rate: 0.19, deduction: 378000, distribution: ANEXO_I_DISTR },
];

export const SIMPLES_NACIONAL_ANNEX_II = [ // Indústria
    { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: ANEXO_II_DISTR },
    { min: 180000.01, max: 360000, rate: 0.078, deduction: 5940, distribution: ANEXO_II_DISTR },
    { min: 360000.01, max: 720000, rate: 0.10, deduction: 13860, distribution: ANEXO_II_DISTR },
    { min: 720000.01, max: 1800000, rate: 0.112, deduction: 22500, distribution: ANEXO_II_DISTR },
    { min: 1800000.01, max: 3600000, rate: 0.147, deduction: 85500, distribution: ANEXO_II_DISTR },
    { min: 3600000.01, max: 4800000, rate: 0.30, deduction: 720000, distribution: ANEXO_II_DISTR },
];

export const SIMPLES_NACIONAL_ANNEX_III = [ // Serviços
    { min: 0, max: 180000, rate: 0.06, deduction: 0, distribution: ANEXO_III_DISTR_FAIXA_1_5 },
    { min: 180000.01, max: 360000, rate: 0.112, deduction: 9360, distribution: ANEXO_III_DISTR_FAIXA_1_5 },
    { min: 360000.01, max: 720000, rate: 0.135, deduction: 17640, distribution: ANEXO_III_DISTR_FAIXA_1_5 },
    { min: 720000.01, max: 1800000, rate: 0.16, deduction: 35640, distribution: ANEXO_III_DISTR_FAIXA_1_5 },
    { min: 1800000.01, max: 3600000, rate: 0.21, deduction: 125640, distribution: ANEXO_III_DISTR_FAIXA_1_5 },
    { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 648000, distribution: ANEXO_III_DISTR_FAIXA_6 },
];

export const SIMPLES_NACIONAL_ANNEX_IV = [ // Serviços
    { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: ANEXO_IV_DISTR },
    { min: 180000.01, max: 360000, rate: 0.09, deduction: 8100, distribution: ANEXO_IV_DISTR },
    { min: 360000.01, max: 720000, rate: 0.102, deduction: 12420, distribution: ANEXO_IV_DISTR },
    { min: 720000.01, max: 1800000, rate: 0.14, deduction: 39780, distribution: ANEXO_IV_DISTR },
    { min: 1800000.01, max: 3600000, rate: 0.22, deduction: 183780, distribution: ANEXO_IV_DISTR },
    { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 828000, distribution: ANEXO_IV_DISTR },
];

export const SIMPLES_NACIONAL_ANNEX_V = [ // Serviços
    { min: 0, max: 180000, rate: 0.155, deduction: 0, distribution: ANEXO_V_DISTR_FAIXA_1_5 },
    { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500, distribution: ANEXO_V_DISTR_FAIXA_1_5 },
    { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900, distribution: ANEXO_V_DISTR_FAIXA_1_5 },
    { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100, distribution: ANEXO_V_DISTR_FAIXA_1_5 },
    { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100, distribution: ANEXO_V_DISTR_FAIXA_1_5 },
    { min: 3600000.01, max: 4800000, rate: 0.305, deduction: 540000, distribution: ANEXO_V_DISTR_FAIXA_6 },
];

export { CNAE_DATA } from './cnaes';
