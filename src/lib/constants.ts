import { CnaeData, FeeBracket } from "./types";

export const MINIMUM_WAGE = 1412.00;
export const INSS_CEILING = 8157.40;
export const PRO_LABORE_INSS_RATE = 0.11;
export const SIMPLIFIED_DEDUCTION_IRRF = 564.80;

// Tabela Progressiva para o IRPF (Vigente a partir de Fev/2024)
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

// Alíquotas 2025
export const SIMPLES_NACIONAL_ANNEX_III = [ // Serviços
    { min: 0, max: 180000, rate: 0.06, deduction: 0, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 180000.01, max: 360000, rate: 0.0821, deduction: 3978, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 360000.01, max: 720000, rate: 0.1026, deduction: 11358, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 720000.01, max: 1800000, rate: 0.1131, deduction: 18918, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 1800000.01, max: 3600000, rate: 0.1140, deduction: 20538, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
    { min: 3600000.01, max: 4800000, rate: 0.1242, deduction: 57258, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.141, PIS: 0.0305, CPP: 0.3285, ISS: 0 } },
];

export const SIMPLES_NACIONAL_ANNEX_IV = [ // Serviços
    { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.188, CSLL: 0.152, COFINS: 0.2143, PIS: 0.0457, ISS: 0.4 } },
    { min: 180000.01, max: 360000, rate: 0.09, deduction: 8100, distribution: { IRPJ: 0.198, CSLL: 0.152, COFINS: 0.2543, PIS: 0.0457, ISS: 0.35 } },
    { min: 360000.01, max: 720000, rate: 0.102, deduction: 12420, distribution: { IRPJ: 0.208, CSLL: 0.152, COFINS: 0.2443, PIS: 0.0457, ISS: 0.35 } },
    { min: 720000.01, max: 1800000, rate: 0.14, deduction: 39780, distribution: { IRPJ: 0.178, CSLL: 0.192, COFINS: 0.2343, PIS: 0.0457, ISS: 0.35 } },
    { min: 1800000.01, max: 3600000, rate: 0.22, deduction: 183780, distribution: { IRPJ: 0.188, CSLL: 0.192, COFINS: 0.2243, PIS: 0.0457, ISS: 0.35 } },
    { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 828000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.415, PIS: 0.085, ISS: 0 } },
];

// Alíquotas 2025
export const SIMPLES_NACIONAL_ANNEX_V = [ // Serviços
    { min: 0, max: 180000, rate: 0.155, deduction: 0, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.1485, PIS: 0.028, CPP: 0.2885, ISS: 0.135 } },
    { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500, distribution: { IRPJ: 0.23, CSLL: 0.15, COFINS: 0.1635, PIS: 0.028, CPP: 0.2885, ISS: 0.14 } },
    { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900, distribution: { IRPJ: 0.21, CSLL: 0.15, COFINS: 0.1785, PIS: 0.028, CPP: 0.2885, ISS: 0.145 } },
    { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100, distribution: { IRPJ: 0.19, CSLL: 0.15, COFINS: 0.1935, PIS: 0.028, CPP: 0.2885, ISS: 0.15 } },
    { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100, distribution: { IRPJ: 0.17, CSLL: 0.15, COFINS: 0.1885, PIS: 0.028, CPP: 0.2885, ISS: 0.175 } },
    { min: 3600000.01, max: 4800000, rate: 0.245, deduction: 116100, distribution: { IRPJ: 0.235, CSLL: 0.155, COFINS: 0.281, PIS: 0.024, CPP: 0.305, ISS: 0 } },
];

export { CNAE_DATA } from './cnaes';

export const CONTABILIZEI_FEES_LUCRO_PRESUMIDO: FeeBracket[] = [
    { label: 'até R$ 25.000', min: 0, max: 25000, plans: { basico: 229, padrao: 289, multibeneficios: 319, expertsEssencial: 459, expertsPro: 719 } },
    { label: 'de R$ 25.000 a R$ 50.000', min: 25000.01, max: 50000, plans: { basico: 318, padrao: 289, multibeneficios: 319, expertsEssencial: 459, expertsPro: 719 } },
    { label: 'de R$ 50.000 a R$ 100.000', min: 50000.01, max: 100000, plans: { basico: 496, padrao: 438, multibeneficios: 468, expertsEssencial: 459, expertsPro: 719 } },
    { label: 'de R$ 100.000 a R$ 150.000', min: 100000.01, max: 150000, plans: { basico: 674, padrao: 616, multibeneficios: 646, expertsEssencial: 459, expertsPro: 719 } },
    { label: 'de R$ 150.000 a R$ 200.000', min: 150000.01, max: 200000, plans: { basico: 763, padrao: 616, multibeneficios: 646, expertsEssencial: 459, expertsPro: 719 } },
    { label: 'de R$ 200.000 a R$ 300.000', min: 200000.01, max: 300000, plans: { basico: 852, padrao: 616, multibeneficios: 646, expertsEssencial: 559, expertsPro: 719 } },
    { label: 'de R$ 300.000 a R$ 500.000', min: 300000.01, max: 500000, plans: { basico: 852, padrao: 616, multibeneficios: 646, expertsEssencial: 659, expertsPro: 899 } },
    { label: 'de R$ 500.000 a R$ 1.000.000', min: 500000.01, max: 1000000, plans: { basico: 852, padrao: 616, multibeneficios: 646, expertsEssencial: 759, expertsPro: 1109 } },
    { label: 'mais de R$ 1.000.000', min: 1000000.01, max: Infinity, plans: { basico: 852, padrao: 912, multibeneficios: 942, expertsEssencial: 959, expertsPro: 1319 } },
];

export const CONTABILIZEI_FEES_SIMPLES_NACIONAL: FeeBracket[] = [
    { label: 'até R$ 25.000', min: 0, max: 25000, plans: { basico: 119, padrao: 179, multibeneficios: 229, expertsEssencial: 389, expertsPro: 649 } },
    { label: 'de R$ 25.000,01 a R$ 50.000', min: 25000.01, max: 50000, plans: { basico: 249, padrao: 179, multibeneficios: 229, expertsEssencial: 389, expertsPro: 649 } },
    { label: 'de R$ 50.000,01 a R$ 100.000', min: 50000.01, max: 100000, plans: { basico: 389, padrao: 329, multibeneficios: 379, expertsEssencial: 389, expertsPro: 649 } },
    { label: 'de R$ 100.000,01 a R$ 150.000', min: 100000.01, max: 150000, plans: { basico: 589, padrao: 519, multibeneficios: 559, expertsEssencial: 389, expertsPro: 649 } },
    { label: 'de R$ 150.000,01 a R$ 200.000', min: 150000.01, max: 200000, plans: { basico: 689, padrao: 519, multibeneficios: 559, expertsEssencial: 389, expertsPro: 649 } },
    { label: 'de R$ 200.000,01 a R$ 300.000', min: 200000.01, max: 300000, plans: { basico: 789, padrao: 519, multibeneficios: 559, expertsEssencial: 489, expertsPro: 649 } },
    { label: 'de R$ 300.000,01 a R$ 500.000', min: 300000.01, max: 500000, plans: { basico: 789, padrao: 519, multibeneficios: 559, expertsEssencial: 589, expertsPro: 829 } },
    { label: 'de R$ 500.000,01 a R$ 1.000.000', min: 500000.01, max: 1000000, plans: { basico: 789, padrao: 519, multibeneficios: 559, expertsEssencial: 689, expertsPro: 1039 } },
    { label: 'mais de R$ 1.000.000', min: 1000000.01, max: Infinity, plans: { basico: 789, padrao: 819, multibeneficios: 859, expertsEssencial: 889, expertsPro: 1249 } },
];
