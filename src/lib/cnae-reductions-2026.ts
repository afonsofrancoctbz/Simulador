// src/lib/cnae-reductions-2026.ts
import { CNAE_CLASSES_2026_MAP, CNAE_LC116_RELATIONSHIP, type CnaeRelationship2026 } from './cnae-data-2026';

export interface NBSReduction {
  nbs: string;
  descricao: string;
  cClassTrib: string;
  reducaoIBS: number; // Percentual: 60 = 60%
  reducaoCBS: number; // Percentual: 60 = 60%
}

export interface CNAEReductionData {
  cnae: string;
  descricao: string;
  reducoes: NBSReduction[];
  defaultReduction?: {
    ibs: number;
    cbs: number;
  };
}

// Criar a base de dados a partir da relação
const cnaeReductionsDatabase: Record<string, CNAEReductionData> = {};

CNAE_LC116_RELATIONSHIP.forEach(item => {
  const cnae = item.cnae;
  
  if (!cnaeReductionsDatabase[cnae]) {
    const cnaeInfo = CNAE_LC116_RELATIONSHIP.find(c => c.cnae === cnae); // Apenas para pegar a descrição
    cnaeReductionsDatabase[cnae] = {
      cnae: cnae,
      descricao: cnaeInfo?.descriptionLC116 || 'Descrição não encontrada',
      reducoes: [],
    };
  }

  const cClassInfo = CNAE_CLASSES_2026_MAP[item.cClassTrib];
  if (cClassInfo) {
    cnaeReductionsDatabase[cnae].reducoes.push({
      nbs: item.nbs,
      descricao: item.nbsDescription,
      cClassTrib: item.cClassTrib,
      reducaoIBS: cClassInfo.ibsReduction,
      reducaoCBS: cClassInfo.cbsReduction,
    });
  }
});

// Definir a redução padrão como a mais favorável para cada CNAE
Object.values(cnaeReductionsDatabase).forEach(cnaeData => {
  if (cnaeData.reducoes.length > 0) {
    const bestReduction = cnaeData.reducoes.reduce((best, current) => {
      const currentTotal = current.reducaoIBS + current.reducaoCBS;
      const bestTotal = best.reducaoIBS + best.reducaoCBS;
      return currentTotal > bestTotal ? current : best;
    });
    cnaeData.defaultReduction = {
      ibs: bestReduction.reducaoIBS,
      cbs: bestReduction.reducaoCBS,
    };
  } else {
     cnaeData.defaultReduction = { ibs: 0, cbs: 0 };
  }
});

export const CNAE_REDUCTIONS_DATABASE: Record<string, CNAEReductionData> = cnaeReductionsDatabase;


/**
 * Busca a redução de IVA para um CNAE específico
 */
export function getIvaReductionByCnae(
  cnaeCode: string,
  cClassTrib?: string
): { reducaoIBS: number; reducaoCBS: number } {
  const cnaeData = CNAE_REDUCTIONS_DATABASE[cnaeCode.replace(/\D/g, '')];

  if (!cnaeData) {
    return { reducaoIBS: 0, reducaoCBS: 0 };
  }

  if (cClassTrib) {
    const specificReduction = cnaeData.reducoes.find(r => r.cClassTrib === cClassTrib);
    if (specificReduction) {
      return {
        reducaoIBS: specificReduction.reducaoIBS,
        reducaoCBS: specificReduction.reducaoCBS,
      };
    }
  }

  return {
    reducaoIBS: cnaeData.defaultReduction?.ibs ?? 0,
    reducaoCBS: cnaeData.defaultReduction?.cbs ?? 0,
  };
}

/**
 * Lista todas as opções de NBS disponíveis para um CNAE
 */
export function getNBSOptionsByCnae(cnaeCode: string): CnaeRelationship2026[] {
  const numericCode = cnaeCode.replace(/\D/g, '');
  return CNAE_LC116_RELATIONSHIP.filter(rel => rel.cnae === numericCode);
}
