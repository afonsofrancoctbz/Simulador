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
  // DEPRECATED: defaultReduction was removed to enforce explicit NBS selection and ensure tax calculation correctness.
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

// REMOVED: The logic for `defaultReduction` has been removed.
// Tax reductions must now be determined by explicit user selection of an NBS code to ensure legal compliance.

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
 * REFINED: Gets the IVA reduction percentages strictly based on CNAE and a selected NBS code.
 * This function is optimized for the calculation engine, returning only the final numbers.
 * For UI purposes, use `getSpecificNbsReduction` to get detailed data.
 * @param cnaeCode The CNAE code for the activity.
 * @param nbsCode The explicitly selected NBS code.
 * @returns An object with IBS and CBS reduction percentages. Returns {0, 0} if criteria are not met, with audit logs.
 */
export function getIvaReductionByCnae(
  cnaeCode: string,
  cClassTribCode?: string | null
): { reducaoIBS: number; reducaoCBS: number } {
  const numericCnae = String(cnaeCode || '').replace(/\D/g, '');
  const cnaeData = CNAE_REDUCTIONS_DATABASE[numericCnae];

  if (!cnaeData) {
    console.warn(`[AUDIT] getIvaReductionByCnae: CNAE code '${numericCnae}' not found in reductions database. Returning zero reduction.`);
    return { reducaoIBS: 0, reducaoCBS: 0 };
  }

  if (cClassTribCode) {
    const specificReduction = cnaeData.reducoes.find(r => r.cClassTrib === cClassTribCode);
    if (specificReduction) {
        return {
            reducaoIBS: specificReduction.reducaoIBS,
            reducaoCBS: specificReduction.reducaoCBS,
        };
    }
     console.warn(`[AUDIT] getIvaReductionByCnae: NBS class '${cClassTribCode}' not found for CNAE '${numericCnae}'. Returning zero reduction.`);
  }

  // If there's only one option, it's safe to use it as the default
  if (cnaeData.reducoes.length === 1) {
    return {
      reducaoIBS: cnaeData.reducoes[0].reducaoIBS,
      reducaoCBS: cnaeData.reducoes[0].reducaoCBS,
    };
  }
  
  console.warn(`[AUDIT] getIvaReductionByCnae: Ambiguous call for CNAE '${numericCnae}' with ${cnaeData.reducoes.length} options and no cClassTrib provided. Returning zero reduction.`);
  return { reducaoIBS: 0, reducaoCBS: 0 };
}


/**
 * Lists all available NBS options (and their associated tax classes/reductions) for a given CNAE.
 * This is essential for populating the mandatory NBS selector in the UI.
 * @param cnaeCode The CNAE code to look up.
 * @returns An array of CnaeRelationship2026 objects, each representing a valid NBS choice.
 */
export function getNBSOptionsByCnae(cnaeCode: string): CnaeRelationship2026[] {
  const numericCode = String(cnaeCode || '').replace(/\D/g, '');
  return CNAE_LC116_RELATIONSHIP.filter(rel => rel.cnae === numericCode);
}
