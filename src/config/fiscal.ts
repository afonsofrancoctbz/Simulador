// types.ts
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  deduction: number;
}

export interface SimplesDistribution {
  IRPJ: number;
  CSLL: number;
  COFINS: number;
  PIS: number;
  CPP: number;
  ICMS?: number;
  ISS?: number; 
  IPI?: number;
  CBS?: number;
  IBS?: number;
  [key: string]: number | undefined; 
}

export interface SimplesBracket extends TaxBracket {
  distribution: SimplesDistribution;
}

export interface FiscalConfig {
  ano_vigencia: number;
  salario_minimo: number;
  teto_inss: number;
  aliquota_inss_prolabore: number;
  tabela_inss_clt_progressiva: TaxBracket[];
  tabela_irrf: TaxBracket[];
  simples_nacional: {
    limite_fator_r: number;
    I: SimplesBracket[];
    II: SimplesBracket[];
    III: SimplesBracket[];
    IV: SimplesBracket[];
    V: SimplesBracket[];
  };
  lucro_presumido_rates: {
    PIS: number;
    COFINS: number;
    ISS: number;
    IRPJ_BASE: number;
    IRPJ_ADICIONAL_BASE: number;
    CSLL: number;
    LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL: number;
  };
  aliquotas_cpp_patronal: {
    base: number;
    rat: number;
    terceiros: number;
    total: number;
  };
  reforma_tributaria?: {
      cbs_aliquota_padrao: number;
      ibs_aliquota_padrao: number;
      pis_cofins_multiplier: number;
      iss_icms_multiplier: number;
  };
  deducao_simplificada_irrf?: number;
  deducao_dependente_irrf?: number;
  [key: string]: any;
}

// --- CONFIGURAÇÕES OFICIAIS (AUDITADAS) ---

const FISCAL_CONFIG_2025: FiscalConfig = {
  ano_vigencia: 2025,
  salario_minimo: 1518.00,
  teto_inss: 8157.41,
  aliquota_inss_prolabore: 0.11,
  
  tabela_inss_clt_progressiva: [
      { min: 0, max: 1518.00, rate: 0.075, deduction: 0 },
      { min: 1518.01, max: 2793.88, rate: 0.09, deduction: 22.77 },
      { min: 2793.89, max: 4190.83, rate: 0.12, deduction: 106.59 },
      { min: 4190.84, max: 8157.41, rate: 0.14, deduction: 190.40 },
  ],
  tabela_irrf: [
      { min: 0, max: 2259.20, rate: 0, deduction: 0 },
      { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
      { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
      { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
      { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
  ],
  deducao_simplificada_irrf: 564.80,

  lucro_presumido_rates: {
    PIS: 0.0065,
    COFINS: 0.03,
    ISS: 0.05,
    IRPJ_BASE: 0.15,
    IRPJ_ADICIONAL_BASE: 0.10,
    CSLL: 0.09,
    LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL: 20000,
  },
  aliquotas_cpp_patronal: {
    base: 0.20,
    rat: 0.01,
    terceiros: 0,
    total: 0.21,
  },

  // AUDITORIA SIMPLES NACIONAL (Valores nominais e deduções conferidos)
  simples_nacional: {
    limite_fator_r: 0.28,
    
    I: [ // Comércio
        { min: 0, max: 180000, rate: 0.04, deduction: 0, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.415, ICMS: 0.34 } },
        { min: 180000.01, max: 360000, rate: 0.073, deduction: 5940, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.415, ICMS: 0.34 } },
        { min: 360000.01, max: 720000, rate: 0.095, deduction: 13860, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { min: 720000.01, max: 1800000, rate: 0.107, deduction: 22500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { min: 1800000.01, max: 3600000, rate: 0.143, deduction: 87300, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { min: 3600000.01, max: 4800000, rate: 0.19, deduction: 378000, distribution: { IRPJ: 0.135, CSLL: 0.10, COFINS: 0.2827, PIS: 0.0613, CPP: 0, ICMS: 0.421 } },
    ],
    
    II: [ // Indústria
        { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 180000.01, max: 360000, rate: 0.078, deduction: 5940, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 360000.01, max: 720000, rate: 0.10, deduction: 13860, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 720000.01, max: 1800000, rate: 0.112, deduction: 22500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 1800000.01, max: 3600000, rate: 0.147, deduction: 85500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 3600000.01, max: 4800000, rate: 0.30, deduction: 720000, distribution: { IRPJ: 0.085, CSLL: 0.075, COFINS: 0.2274, PIS: 0.0276, CPP: 0, ICMS: 0, IPI: 0.35 } },
    ],
    
    III: [ // Serviços (Locação, Manutenção, etc.)
        { min: 0, max: 180000, rate: 0.06, deduction: 0, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
        { min: 180000.01, max: 360000, rate: 0.112, deduction: 9360, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1405, PIS: 0.0305, CPP: 0.434, ISS: 0.320 } },
        { min: 360000.01, max: 720000, rate: 0.135, deduction: 17640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1364, PIS: 0.0296, CPP: 0.434, ISS: 0.325 } },
        { min: 720000.01, max: 1800000, rate: 0.16, deduction: 35640, distribution: { IRPJ: 0.04, CSLL: 0.04, COFINS: 0.1409, PIS: 0.0306, CPP: 0.434, ISS: 0.3145 } },
        { min: 1800000.01, max: 3600000, rate: 0.21, deduction: 125640, distribution: { IRPJ: 0.04, CSLL: 0.04, COFINS: 0.1356, PIS: 0.0294, CPP: 0.445, ISS: 0.310 } },
        { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 648000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.1603, PIS: 0.0347, CPP: 0.295, ISS: 0 } },
    ],
    
    IV: [ // Serviços (Advocacia, Construção, etc.) - CPP a parte
        { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.188, CSLL: 0.152, COFINS: 0.2043, PIS: 0.0457, ISS: 0.41, CPP: 0 } },
        { min: 180000.01, max: 360000, rate: 0.09, deduction: 8100, distribution: { IRPJ: 0.198, CSLL: 0.152, COFINS: 0.2143, PIS: 0.0457, ISS: 0.39, CPP: 0 } },
        { min: 360000.01, max: 720000, rate: 0.102, deduction: 12420, distribution: { IRPJ: 0.208, CSLL: 0.152, COFINS: 0.2243, PIS: 0.0457, ISS: 0.37, CPP: 0 } },
        { min: 720000.01, max: 1800000, rate: 0.14, deduction: 39780, distribution: { IRPJ: 0.178, CSLL: 0.192, COFINS: 0.2343, PIS: 0.0457, ISS: 0.35, CPP: 0 } },
        { min: 1800000.01, max: 3600000, rate: 0.22, deduction: 183780, distribution: { IRPJ: 0.188, CSLL: 0.192, COFINS: 0.2243, PIS: 0.0457, ISS: 0.35, CPP: 0 } },
        { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 828000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.415, PIS: 0.085, ISS: 0, CPP: 0 } },
    ],
    
    V: [ // Serviços (Tecnologia, Publicidade, etc.) - Sujeito ao Fator R
        { min: 0, max: 180000, rate: 0.155, deduction: 0, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.1410, PIS: 0.0305, CPP: 0.2885, ISS: 0.14 } },
        { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500, distribution: { IRPJ: 0.23, CSLL: 0.15, COFINS: 0.1492, PIS: 0.0323, CPP: 0.2985, ISS: 0.14 } },
        { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900, distribution: { IRPJ: 0.21, CSLL: 0.15, COFINS: 0.1574, PIS: 0.0341, CPP: 0.3085, ISS: 0.15 } },
        { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100, distribution: { IRPJ: 0.19, CSLL: 0.15, COFINS: 0.1655, PIS: 0.0360, CPP: 0.3085, ISS: 0.15 } },
        { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100, distribution: { IRPJ: 0.17, CSLL: 0.15, COFINS: 0.1737, PIS: 0.0378, CPP: 0.3185, ISS: 0.15 } },
        { min: 3600000.01, max: 4800000, rate: 0.305, deduction: 540000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.1410, PIS: 0.0305, CPP: 0, ISS: 0.3285 } },
    ],
  }
};

const FISCAL_CONFIG_2026: FiscalConfig = {
  ...FISCAL_CONFIG_2025,
  simples_nacional: structuredClone(FISCAL_CONFIG_2025.simples_nacional),
  ano_vigencia: 2026,
  salario_minimo: 1631.00,
  teto_inss: 8565.28,
  tabela_inss_clt_progressiva: [
      { min: 0, max: 1631.00, rate: 0.075, deduction: 0 },
      { min: 1631.01, max: 2980.00, rate: 0.09, deduction: 24.46 },
      { min: 2980.01, max: 4450.00, rate: 0.12, deduction: 113.86 },
      { min: 4450.01, max: 8565.28, rate: 0.14, deduction: 202.86 },
  ],
  tabela_irrf: [
      { min: 0, max: 5000.00, rate: 0, deduction: 0 },
      { min: 5000.01, max: 5500.00, rate: 0.075, deduction: 375 },
      { min: 5500.01, max: 6000.00, rate: 0.15, deduction: 787.5 },
      { min: 6000.01, max: 6500.00, rate: 0.225, deduction: 1237.5 },
      { min: 6500.01, max: Infinity, rate: 0.275, deduction: 1562.5 },
  ],
};

const IVA_FULL_RATE = { cbs: 0.09, ibs: 0.18 };

const TRANSITION_TABLE = {
    2026: { cbs: 0.009, ibs: 0.001, pis_cofins_multiplier: 1, iss_icms_multiplier: 1 },
    2027: { cbs: 0.089, ibs: 0.001, pis_cofins_multiplier: 0, iss_icms_multiplier: 1 },
    2028: { cbs: 0.089, ibs: 0.001, pis_cofins_multiplier: 0, iss_icms_multiplier: 1 }, 
    2029: { cbs: IVA_FULL_RATE.cbs, ibs: IVA_FULL_RATE.ibs * 0.1, pis_cofins_multiplier: 0, iss_icms_multiplier: 0.9 },
    2030: { cbs: IVA_FULL_RATE.cbs, ibs: IVA_FULL_RATE.ibs * 0.2, pis_cofins_multiplier: 0, iss_icms_multiplier: 0.8 },
    2031: { cbs: IVA_FULL_RATE.cbs, ibs: IVA_FULL_RATE.ibs * 0.3, pis_cofins_multiplier: 0, iss_icms_multiplier: 0.7 },
    2032: { cbs: IVA_FULL_RATE.cbs, ibs: IVA_FULL_RATE.ibs * 0.4, pis_cofins_multiplier: 0, iss_icms_multiplier: 0.6 },
    2033: { cbs: IVA_FULL_RATE.cbs, ibs: IVA_FULL_RATE.ibs, pis_cofins_multiplier: 0, iss_icms_multiplier: 0 },
} as const;

export function getFiscalParameters(year: 2025 | 2026): FiscalConfig {
  if (year === 2026) {
    return structuredClone(FISCAL_CONFIG_2026);
  }
  return structuredClone(FISCAL_CONFIG_2025);
}

export function getFiscalParametersPostReform(year: number): FiscalConfig {
    if (year < 2026 || year > 2033) {
        console.warn(`Ano ${year} fora do range esperado (2026-2033) para a reforma tributária.`);
    }

    const baseConfig = getFiscalParameters(year === 2025 ? 2025 : 2026);
    
    const safeYear = Math.max(2026, Math.min(year, 2033)) as keyof typeof TRANSITION_TABLE;
    const transition = TRANSITION_TABLE[safeYear];

    if (!transition && year < 2026) return baseConfig;

    const newConfig = {
      ...baseConfig,
      reforma_tributaria: {
          cbs_aliquota_padrao: transition.cbs,
          ibs_aliquota_padrao: transition.ibs,
          pis_cofins_multiplier: transition.pis_cofins_multiplier,
          iss_icms_multiplier: transition.iss_icms_multiplier,
      }
    };
    
    const anexos = ['I', 'II', 'III', 'IV', 'V'] as const;

    anexos.forEach(annexKey => {
        newConfig.simples_nacional[annexKey] = baseConfig.simples_nacional[annexKey].map(bracket => {
            const { PIS = 0, COFINS = 0, ISS = 0, ICMS = 0, IPI = 0 } = bracket.distribution;
            
            const newPIS = PIS * transition.pis_cofins_multiplier;
            const newCOFINS = COFINS * transition.pis_cofins_multiplier;
            const cbsLoad = (PIS + COFINS) * (1 - transition.pis_cofins_multiplier);

            const newISS = ISS * transition.iss_icms_multiplier;
            const newICMS = ICMS * transition.iss_icms_multiplier;
            const newIPI = IPI * transition.iss_icms_multiplier;
            const ibsLoad = (ISS + ICMS + IPI) * (1 - transition.iss_icms_multiplier);

            return {
                ...bracket,
                distribution: {
                    ...bracket.distribution,
                    PIS: Number(newPIS.toFixed(4)),
                    COFINS: Number(newCOFINS.toFixed(4)),
                    CBS: Number(cbsLoad.toFixed(4)),
                    ISS: Number(newISS.toFixed(4)),
                    ICMS: Number(newICMS.toFixed(4)),
                    IPI: Number(newIPI.toFixed(4)),
                    IBS: Number(ibsLoad.toFixed(4)),
                    _original_PIS: PIS,
                    _original_COFINS: COFINS
                }
            };
        });
    });

    return newConfig;
}