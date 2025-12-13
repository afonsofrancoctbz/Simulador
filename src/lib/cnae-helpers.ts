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
    { min: 0, max: 0, plans: { expertsEssencial: 139, expertsPremium: 289 } },
    { min: 0.01, max: 15000, plans: { expertsEssencial: 139, expertsPremium: 289 } },
    { min: 15000.01, max: 30000, plans: { expertsEssencial: 299, expertsPremium: 449 } },
    { min: 30000.01, max: 60000, plans: { expertsEssencial: 449, expertsPremium: 589 } },
    { min: 60000.01, max: 100000, plans: { expertsEssencial: 589, expertsPremium: 729 } },
    { min: 100000.01, max: 250000, plans: { expertsEssencial: 729, expertsPremium: 889 } },
    { min: 250000.01, max: Infinity, plans: { expertsEssencial: 889, expertsPremium: 1289 } },
];

export const CONTABILIZEI_FEES_LUCRO_PRESUMIDO: FeeBracket[] = [
    { min: 0, max: 0, plans: { expertsEssencial: 489, expertsPremium: 689 } },
    { min: 0.01, max: 15000, plans: { expertsEssencial: 489, expertsPremium: 689 } },
    { min: 15000.01, max: 30000, plans: { expertsEssencial: 689, expertsPremium: 889 } },
    { min: 30000.01, max: 60000, plans: { expertsEssencial: 889, expertsPremium: 1089 } },
    { min: 60000.01, max: 100000, plans: { expertsEssencial: 1089, expertsPremium: 1289 } },
    { min: 100000.01, max: 250000, plans: { expertsEssencial: 1289, expertsPremium: 1489 } },
    { min: 250000.01, max: Infinity, plans: { expertsEssencial: 1489, expertsPremium: 1689 } },
];