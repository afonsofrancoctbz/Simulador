import { CnaeData, FeeBracket } from "./types";

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
    { label: 'até R$ 25.000', min: 0, max: 25000, plans: { basico: 139, padrao: 195, multibeneficios: 225, expertsEssencial: 369, expertsPro: 649 } },
    { label: 'de R$ 25.000,01 a R$ 50.000', min: 25000.01, max: 50000, plans: { basico: 228, padrao: 195, multibeneficios: 225, expertsEssencial: 369, expertsPro: 649 } },
    { label: 'de R$ 50.000,01 a R$ 100.000', min: 50000.01, max: 100000, plans: { basico: 406, padrao: 344, multibeneficios: 381, expertsEssencial: 369, expertsPro: 649 } },
    { label: 'de R$ 100.000,01 a R$ 150.000', min: 100000.01, max: 150000, plans: { basico: 584, padrao: 522, multibeneficios: 568, expertsEssencial: 369, expertsPro: 649 } },
    { label: 'de R$ 150.000,01 a R$ 200.000', min: 150000.01, max: 200000, plans: { basico: 673, padrao: 522, multibeneficios: 568, expertsEssencial: 369, expertsPro: 649 } },
    { label: 'de R$ 200.000,01 a R$ 300.000', min: 200000.01, max: 300000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 469, expertsPro: 649 } },
    { label: 'de R$ 300.000,01 a R$ 500.000', min: 300000.01, max: 500000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 569, expertsPro: 829 } },
    { label: 'de R$ 500.000,01 a R$ 1.000.000', min: 500000.01, max: 1000000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 669, expertsPro: 1039 } },
    { label: 'mais de R$ 1.000.000', min: 1000000.01, max: Infinity, plans: { basico: 762, padrao: 818, multibeneficios: 879, expertsEssencial: 869, expertsPro: 1249 } },
];
