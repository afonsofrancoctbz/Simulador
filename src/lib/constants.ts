import { FeeBracket } from "./types";
import { CNAE_DATA_RAW } from './cnaes-raw';
import { type CnaeData } from './types';


// This allows augmenting CNAE data with calculated fields if needed in the future
export const CNAE_DATA: CnaeData[] = CNAE_DATA_RAW;


export const CONTABILIZEI_FEES_LUCRO_PRESUMIDO: FeeBracket[] = [
    { label: 'até R$ 25.000', min: 0, max: 25000, plans: { basico: 239, padrao: 295, multibeneficios: 325, expertsEssencial: 459 } },
    { label: 'de R$ 25.000 a R$ 50.000', min: 25000.01, max: 50000, plans: { basico: 328, padrao: 295, multibeneficios: 325, expertsEssencial: 459 } },
    { label: 'de R$ 50.000 a R$ 100.000', min: 50000.01, max: 100000, plans: { basico: 506, padrao: 444, multibeneficios: 479, expertsEssencial: 459 } },
    { label: 'de R$ 100.000 a R$ 150.000', min: 100000.01, max: 150000, plans: { basico: 684, padrao: 622, multibeneficios: 663, expertsEssencial: 459 } },
    { label: 'de R$ 150.000 a R$ 200.000', min: 150000.01, max: 200000, plans: { basico: 773, padrao: 622, multibeneficios: 663, expertsEssencial: 459 } },
    { label: 'de R$ 200.000 a R$ 300.000', min: 200000.01, max: 300000, plans: { basico: 862, padrao: 622, multibeneficios: 663, expertsEssencial: 559 } },
    { label: 'de R$ 300.000 a R$ 500.000', min: 300000.01, max: 500000, plans: { basico: 862, padrao: 622, multibeneficios: 663, expertsEssencial: 659 } },
    { label: 'de R$ 500.000 a R$ 1.000.000', min: 500000.01, max: 1000000, plans: { basico: 862, padrao: 622, multibeneficios: 663, expertsEssencial: 759 } },
    { label: 'mais de R$ 1.000.000', min: 1000000.01, max: Infinity, plans: { basico: 862, padrao: 918, multibeneficios: 969, expertsEssencial: 959 } },
];

export const CONTABILIZEI_FEES_SIMPLES_NACIONAL: FeeBracket[] = [
    { label: 'até R$ 25.000', min: 0, max: 25000, plans: { basico: 139, padrao: 195, multibeneficios: 225, expertsEssencial: 369 } },
    { label: 'de R$ 25.000,01 a R$ 50.000', min: 25000.01, max: 50000, plans: { basico: 228, padrao: 195, multibeneficios: 225, expertsEssencial: 369 } },
    { label: 'de R$ 50.000,01 a R$ 100.000', min: 50000.01, max: 100000, plans: { basico: 406, padrao: 344, multibeneficios: 381, expertsEssencial: 369 } },
    { label: 'de R$ 100.000,01 a R$ 150.000', min: 100000.01, max: 150000, plans: { basico: 584, padrao: 522, multibeneficios: 568, expertsEssencial: 369 } },
    { label: 'de R$ 150.000,01 a R$ 200.000', min: 150000.01, max: 200000, plans: { basico: 673, padrao: 522, multibeneficios: 568, expertsEssencial: 369 } },
    { label: 'de R$ 200.000,01 a R$ 300.000', min: 200000.01, max: 300000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 469 } },
    { label: 'de R$ 300.000,01 a R$ 500.000', min: 300000.01, max: 500000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 569 } },
    { label: 'de R$ 500.000,01 a R$ 1.000.000', min: 500000.01, max: 1000000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 669 } },
    { label: 'mais de R$ 1.000.000', min: 1000000.01, max: Infinity, plans: { basico: 762, padrao: 818, multibeneficios: 879, expertsEssencial: 869 } },
];
