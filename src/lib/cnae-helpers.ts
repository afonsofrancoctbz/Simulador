import { CNAE_DATA_RAW } from './cnaes-raw';
import type { CnaeData, FeeBracket, Plan } from './types';
import { CNAE_LC116_RELATIONSHIP } from './cnae-data-2026';

function getUnifiedCnaeData(): CnaeData[] {
  const cnaeMap = new Map<string, CnaeData>();

  CNAE_DATA_RAW.forEach(cnae => {
    cnaeMap.set(cnae.code, cnae);
  });

  CNAE_LC116_RELATIONSHIP.forEach(rel => {
    const numericCode = rel.cnae;
    const formattedCode = `${numericCode.slice(0, 4)}-${numericCode.slice(4, 5)}/${numericCode.slice(5, 7)}`;
    
    if (!cnaeMap.has(formattedCode)) {
      cnaeMap.set(formattedCode, {
        code: formattedCode,
        description: rel.descriptionLC116 || 'Descrição não disponível',
        annex: 'V',
        category: 'Outras Atividades',
      });
    }
  });

  return Array.from(cnaeMap.values());
}

export const UNIFIED_CNAE_DATA = getUnifiedCnaeData();

export function getCnaeData(code: string): CnaeData | undefined {
  return UNIFIED_CNAE_DATA.find(c => c.code === code);
}

export function getCnaeOptions(cnaeCode: string) {
    const numericCode = cnaeCode.replace(/\D/g, '');
    return CNAE_LC116_RELATIONSHIP.filter(rel => rel.cnae === numericCode);
};

export const CONTABILIZEI_FEES_SIMPLES_NACIONAL: FeeBracket[] = [
    { min: 0, max: 25000, plans: { basico: 139, padrao: 195, multibeneficios: 225, expertsEssencial: 369 } },
    { min: 25000.01, max: 50000, plans: { basico: 228, padrao: 195, multibeneficios: 225, expertsEssencial: 369 } },
    { min: 50000.01, max: 100000, plans: { basico: 406, padrao: 344, multibeneficios: 381, expertsEssencial: 369 } },
    { min: 100000.01, max: 150000, plans: { basico: 584, padrao: 522, multibeneficios: 568, expertsEssencial: 369 } },
    { min: 150000.01, max: 200000, plans: { basico: 673, padrao: 522, multibeneficios: 568, expertsEssencial: 369 } },
    { min: 200000.01, max: 300000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 469 } },
    { min: 300000.01, max: 500000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 569 } },
    { min: 500000.01, max: 1000000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 669 } },
    { min: 1000000.01, max: Infinity, plans: { basico: 762, padrao: 818, multibeneficios: 879, expertsEssencial: 869 } },
];

export const CONTABILIZEI_FEES_LUCRO_PRESUMIDO: FeeBracket[] = [
    { min: 0, max: 25000, plans: { basico: 139, padrao: 195, multibeneficios: 225, expertsEssencial: 369 } },
    { min: 25000.01, max: 50000, plans: { basico: 228, padrao: 195, multibeneficios: 225, expertsEssencial: 369 } },
    { min: 50000.01, max: 100000, plans: { basico: 406, padrao: 344, multibeneficios: 381, expertsEssencial: 369 } },
    { min: 100000.01, max: 150000, plans: { basico: 584, padrao: 522, multibeneficios: 568, expertsEssencial: 369 } },
    { min: 150000.01, max: 200000, plans: { basico: 673, padrao: 522, multibeneficios: 568, expertsEssencial: 369 } },
    { min: 200000.01, max: 300000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 469 } },
    { min: 300000.01, max: 500000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 569 } },
    { min: 500000.01, max: 1000000, plans: { basico: 762, padrao: 522, multibeneficios: 568, expertsEssencial: 669 } },
    { min: 1000000.01, max: Infinity, plans: { basico: 762, padrao: 818, multibeneficios: 879, expertsEssencial: 869 } },
];
