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
    // Evita duplicatas de NBS
    if (!cnaeReductionsDatabase[cnae].reducoes.some(r => r.nbs === item.nbs)) {
        cnaeReductionsDatabase[cnae].reducoes.push({
            nbs: item.nbs,
            descricao: item.nbsDescription,
            cClassTrib: item.cClassTrib,
            reducaoIBS: cClassInfo.ibsReduction,
            reducaoCBS: cClassInfo.cbsReduction,
        });
    }
  }
});


export const CNAE_REDUCTIONS_DATABASE: Record<string, CNAEReductionData> = cnaeReductionsDatabase;


/**
 * Finds the specific NBS reduction data for a given CNAE and NBS code.
 * This is a detailed lookup ideal for displaying rich information in the UI.
 * @param cnaeCode The CNAE code.
 * @param nbsCode The NBS code selected by the user.
 * @returns The full NBSReduction object if found, otherwise null.
 */
export function getSpecificNbsReduction(
  cnaeCode: string,
  nbsCode: string | null | undefined,
): NBSReduction | null {
  if (!cnaeCode || !nbsCode) {
    return null;
  }

  const numericCnae = String(cnaeCode).replace(/\D/g, '');
  const cnaeData = CNAE_REDUCTIONS_DATABASE[numericCnae];

  if (!cnaeData) {
    return null;
  }

  const specificReduction = cnaeData.reducoes.find(r => r.nbs === nbsCode);
  return specificReduction || null;
}

/**
 * FINAL CORRECTED VERSION: Gets IVA reduction by performing a direct lookup.
 * This function is the single source of truth for tax reduction calculation.
 * @param cnaeCode The CNAE code for the activity.
 * @param nbsCode The explicitly selected NBS code.
 * @returns An object with IBS and CBS reduction percentages. Returns {0, 0} ONLY if the lookup fails.
 */
export function getIvaReductionByCnae(
  cnaeCode: string,
  nbsCode?: string | null
): { reducaoIBS: number; reducaoCBS: number } {
  if (!cnaeCode || !nbsCode) {
    // Add defensive logging as requested
    if (process.env.NODE_ENV !== 'production' && cnaeCode) {
      console.warn(`[AUDIT] getIvaReductionByCnae called for CNAE '${cnaeCode}' without a valid nbsCode. Returning 0% reduction.`);
    }
    return { reducaoIBS: 0, reducaoCBS: 0 };
  }

  const numericCnae = String(cnaeCode).replace(/\D/g, '');

  // Direct lookup in the authoritative data source
  const relationship = CNAE_LC116_RELATIONSHIP.find(
    rel => rel.cnae === numericCnae && rel.nbs === nbsCode
  );
  
  if (!relationship) {
    console.warn(`[AUDIT] getIvaReductionByCnae: No relationship found for CNAE '${numericCnae}' and NBS '${nbsCode}'.`);
    return { reducaoIBS: 0, reducaoCBS: 0 };
  }

  const cClassInfo = CNAE_CLASSES_2026_MAP[relationship.cClassTrib];

  if (!cClassInfo) {
    console.warn(`[AUDIT] getIvaReductionByCnae: cClass '${relationship.cClassTrib}' not found in map for CNAE/NBS.`);
    return { reducaoIBS: 0, reducaoCBS: 0 };
  }

  return {
    reducaoIBS: cClassInfo.ibsReduction,
    reducaoCBS: cClassInfo.cbsReduction,
  };
}


/**
 * Lists all available NBS options (and their associated tax classes/reductions) for a given CNAE.
 * This is essential for populating the mandatory NBS selector in the UI.
 * @param cnaeCode The CNAE code to look up.
 * @returns An array of CnaeRelationship2026 objects, each representing a valid NBS choice.
 */
export function getNBSOptionsByCnae(cnaeCode: string): CnaeRelationship2026[] {
  const numericCode = String(cnaeCode || '').replace(/\D/g, '');
  const uniqueNbsCodes = new Set<string>();
  const uniqueOptions: CnaeRelationship2026[] = [];

  const relationships = CNAE_LC116_RELATIONSHIP.filter(rel => rel.cnae === numericCode);

  for (const rel of relationships) {
      if (!uniqueNbsCodes.has(rel.nbs)) {
          uniqueNbsCodes.add(rel.nbs);
          uniqueOptions.push(rel);
      }
  }

  return uniqueOptions;
}


    