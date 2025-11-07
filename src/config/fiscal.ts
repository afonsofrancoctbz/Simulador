

// Baseado na sua solicitação para um arquivo de configuração centralizado.
// Todos os parâmetros fiscais que podem mudar ano a ano são armazenados aqui.

// Configuração para o cenário PRÉ-REFORMA
export const FISCAL_CONFIG_2025 = {
  ano_vigencia: 2025,
  salario_minimo: 1518.00,
  teto_inss: 8157.41,
  aliquota_inss_prolabore: 0.11, // Alíquota fixa de 11% para pró-labore de sócios
  aliquotas_cpp_patronal: {
    base: 0.20,
    rat: 0.03, // Riscos Ambientais do Trabalho (média) - Não usado em todos os casos
    terceiros: 0.058, // Salário Educação, etc. - Não usado em todos os casos
    get total() {
        return this.base; // Para Lucro Presumido e Anexo IV context
    }
  },
  lucro_presumido_rates: {
    PIS: 0.0065,
    COFINS: 0.03,
    ISS: 0.05, // Alíquota máxima padrão, pode variar por município
    IRPJ_BASE: 0.15,
    IRPJ_ADICIONAL_BASE: 0.10,
    CSLL: 0.09,
    LIMITE_ISENCAO_IRPJ_ADICIONAL_MENSAL: 20000,
  },
  tabela_inss_clt_progressiva: [
    { min: 0, max: 1518.00, rate: 0.075, deduction: 0 },
    { min: 1518.01, max: 2793.88, rate: 0.09, deduction: 22.77 },
    { min: 2793.89, max: 4190.83, rate: 0.12, deduction: 106.59 },
    { min: 4190.84, max: 8157.41, rate: 0.14, deduction: 190.40 },
  ],
  tabela_irrf: [
    { min: 0, max: 2428.80, rate: 0, deduction: 0 },
    { min: 2428.81, max: 2826.65, rate: 0.075, deduction: 182.16 },
    { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 394.16 },
    { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
    { min: 4664.69, max: Infinity, rate: 0.275, deduction: 908.73 },
  ],
  simples_nacional: {
    limite_fator_r: 0.28,
    I: [
        { min: 0, max: 180000, rate: 0.04, deduction: 0, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.415, ICMS: 0.34 } },
        { min: 180000.01, max: 360000, rate: 0.073, deduction: 5940, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.415, ICMS: 0.34 } },
        { min: 360000.01, max: 720000, rate: 0.095, deduction: 13860, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { min: 720000.01, max: 1800000, rate: 0.107, deduction: 22500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { min: 1800000.01, max: 3600000, rate: 0.143, deduction: 87300, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.42, ICMS: 0.335 } },
        { min: 3600000.01, max: 4800000, rate: 0.19, deduction: 378000, distribution: { IRPJ: 0.135, CSLL: 0.10, COFINS: 0.2827, PIS: 0.0613, CPP: 0, ICMS: 0.421 } },
    ],
    II: [
        { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 180000.01, max: 360000, rate: 0.078, deduction: 5940, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 360000.01, max: 720000, rate: 0.10, deduction: 13860, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 720000.01, max: 1800000, rate: 0.112, deduction: 22500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 1800000.01, max: 3600000, rate: 0.147, deduction: 85500, distribution: { IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1274, PIS: 0.0276, CPP: 0.375, ICMS: 0.3, IPI: 0.075 } },
        { min: 3600000.01, max: 4800000, rate: 0.30, deduction: 720000, distribution: { IRPJ: 0.085, CSLL: 0.075, COFINS: 0.2274, PIS: 0.0276, CPP: 0, ICMS: 0, IPI: 0.35 } },
    ],
    III: [
      { min: 0, max: 180000, rate: 0.06, deduction: 0, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.434, ISS: 0.335 } },
      { min: 180000.01, max: 360000, rate: 0.112, deduction: 9360, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1405, PIS: 0.0305, CPP: 0.434, ISS: 0.320 } },
      { min: 360000.01, max: 720000, rate: 0.135, deduction: 17640, distribution: { IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1364, PIS: 0.0296, CPP: 0.434, ISS: 0.325 } },
      { min: 720000.01, max: 1800000, rate: 0.16, deduction: 35640, distribution: { IRPJ: 0.04, CSLL: 0.04, COFINS: 0.1409, PIS: 0.0306, CPP: 0.434, ISS: 0.3145 } },
      { min: 1800000.01, max: 3600000, rate: 0.21, deduction: 125640, distribution: { IRPJ: 0.04, CSLL: 0.04, COFINS: 0.1356, PIS: 0.0294, CPP: 0.445, ISS: 0.310 } },
      { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 648000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.1603, PIS: 0.0347, CPP: 0.295, ISS: 0 } },
    ],
    IV: [
        { min: 0, max: 180000, rate: 0.045, deduction: 0, distribution: { IRPJ: 0.188, CSLL: 0.152, COFINS: 0.2043, PIS: 0.0457, ISS: 0.41, CPP: 0 } },
        { min: 180000.01, max: 360000, rate: 0.09, deduction: 8100, distribution: { IRPJ: 0.198, CSLL: 0.152, COFINS: 0.2143, PIS: 0.0457, ISS: 0.39, CPP: 0 } },
        { min: 360000.01, max: 720000, rate: 0.102, deduction: 12420, distribution: { IRPJ: 0.208, CSLL: 0.152, COFINS: 0.2243, PIS: 0.0457, ISS: 0.37, CPP: 0 } },
        { min: 720000.01, max: 1800000, rate: 0.14, deduction: 39780, distribution: { IRPJ: 0.178, CSLL: 0.192, COFINS: 0.2343, PIS: 0.0457, ISS: 0.35, CPP: 0 } },
        { min: 1800000.01, max: 3600000, rate: 0.22, deduction: 183780, distribution: { IRPJ: 0.188, CSLL: 0.192, COFINS: 0.2243, PIS: 0.0457, ISS: 0.35, CPP: 0 } },
        { min: 3600000.01, max: 4800000, rate: 0.33, deduction: 828000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.415, PIS: 0.085, ISS: 0, CPP: 0 } },
    ],
    V: [
      { min: 0, max: 180000, rate: 0.155, deduction: 0, distribution: { IRPJ: 0.25, CSLL: 0.15, COFINS: 0.1410, PIS: 0.0305, CPP: 0.2885, ISS: 0.14 } },
      { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500, distribution: { IRPJ: 0.23, CSLL: 0.15, COFINS: 0.1492, PIS: 0.0323, CPP: 0.2985, ISS: 0.14 } },
      { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900, distribution: { IRPJ: 0.21, CSLL: 0.15, COFINS: 0.1574, PIS: 0.0341, CPP: 0.3085, ISS: 0.15 } },
      { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100, distribution: { IRPJ: 0.19, CSLL: 0.15, COFINS: 0.1655, PIS: 0.0360, CPP: 0.3085, ISS: 0.15 } },
      { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100, distribution: { IRPJ: 0.17, CSLL: 0.15, COFINS: 0.1737, PIS: 0.0378, CPP: 0.3185, ISS: 0.15 } },
      { min: 3600000.01, max: 4800000, rate: 0.305, deduction: 540000, distribution: { IRPJ: 0.35, CSLL: 0.15, COFINS: 0.1410, PIS: 0.0305, CPP: 0, ISS: 0.3285 } },
    ],
  }
};

// Configuração para o ANO-TESTE da Reforma
export const FISCAL_CONFIG_2026 = {
    ...FISCAL_CONFIG_2025,
    ano_vigencia: 2026,
    reforma_tributaria: {
        // Alíquotas de teste para LP/LR.
        cbs_rate_test: 0.009, 
        ibs_rate_test: 0.001,
        // Alíquota cheia para cenários hipotéticos pós-reforma
        iva_rate: 0.265, // 26.5%
    }
};

// Configuração para o INÍCIO DA TRANSIÇÃO (CBS Plena)
export const FISCAL_CONFIG_2027_2028 = {
    ...FISCAL_CONFIG_2025, // Herda regras que não mudam (IRRF, INSS, etc)
    ano_vigencia: 2027, // Representa o período 2027-2028
    reforma_tributaria: {
        ...FISCAL_CONFIG_2026.reforma_tributaria,
        // PIS/COFINS são extintos. CBS entra com alíquota plena (estimada) - 0.1pp
        cbs_rate: 0.087, 
        // IBS continua em teste
        ibs_rate: 0.001, 
        get iva_rate() { return this.cbs_rate + this.ibs_rate; }
    },
    // No Simples, PIS/COFINS são substituídos pela CBS
    simples_nacional: {
        ...FISCAL_CONFIG_2025.simples_nacional,
        I: FISCAL_CONFIG_2025.simples_nacional.I.map(b => ({...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), PIS: 0, COFINS: 0 }})),
        II: FISCAL_CONFIG_2025.simples_nacional.II.map(b => ({...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), PIS: 0, COFINS: 0 }})),
        III: FISCAL_CONFIG_2025.simples_nacional.III.map(b => ({...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), PIS: 0, COFINS: 0 }})),
        IV: FISCAL_CONFIG_2025.simples_nacional.IV.map(b => ({...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), PIS: 0, COFINS: 0 }})),
        V: FISCAL_CONFIG_2025.simples_nacional.V.map(b => ({...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), PIS: 0, COFINS: 0 }})),
    }
};

// Configuração para a TRANSIÇÃO DO IBS (Parcial)
export const FISCAL_CONFIG_2029_2032 = {
    ...FISCAL_CONFIG_2027_2028,
    ano_vigencia: 2029, // Representa o período 2029-2032
    reforma_tributaria: {
        ...FISCAL_CONFIG_2027_2028.reforma_tributaria,
        // Aqui a lógica seria mais complexa, dependendo do ano exato.
        // O IBS aumenta e o ICMS/ISS diminui.
        // Para simplificação, vamos usar a regra de 2029.
        ibs_rate: 0.0265, // 10% da alíquota cheia de 26.5%
        get iva_rate() { return this.cbs_rate + this.ibs_rate; }
    },
    simples_nacional: {
        ...FISCAL_CONFIG_2027_2028.simples_nacional,
        // A distribuição dentro do DAS mudaria ano a ano.
        // Para 2029: 9/10 de ICMS/ISS + 1/10 de IBS
        I: FISCAL_CONFIG_2027_2028.simples_nacional.I.map(b => ({...b, distribution: {...b.distribution, IBS: (b.distribution.ICMS || 0) * 0.1, ICMS: (b.distribution.ICMS || 0) * 0.9 }})),
        II: FISCAL_CONFIG_2027_2028.simples_nacional.II.map(b => ({...b, distribution: {...b.distribution, IBS: (b.distribution.ICMS || 0) * 0.1, ICMS: (b.distribution.ICMS || 0) * 0.9 }})),
        III: FISCAL_CONFIG_2027_2028.simples_nacional.III.map(b => ({...b, distribution: {...b.distribution, IBS: (b.distribution.ISS || 0) * 0.1, ISS: (b.distribution.ISS || 0) * 0.9 }})),
        IV: FISCAL_CONFIG_2027_2028.simples_nacional.IV.map(b => ({...b, distribution: {...b.distribution, IBS: (b.distribution.ISS || 0) * 0.1, ISS: (b.distribution.ISS || 0) * 0.9 }})),
        V: FISCAL_CONFIG_2027_2028.simples_nacional.V.map(b => ({...b, distribution: {...b.distribution, IBS: (b.distribution.ISS || 0) * 0.1, ISS: (b.distribution.ISS || 0) * 0.9 }})),
    }
};

// Configuração para a VIGÊNCIA PLENA
export const FISCAL_CONFIG_2033_PLUS = {
    ...FISCAL_CONFIG_2025,
    ano_vigencia: 2033,
    reforma_tributaria: {
        iva_rate: 0.265, // Alíquota padrão de referência
        cbs_rate: 0.088, // Estimativa
        ibs_rate: 0.177, // Estimativa
    },
    // No Simples, PIS/COFINS/ISS/ICMS são substituídos por CBS/IBS
    simples_nacional: {
        ...FISCAL_CONFIG_2025.simples_nacional,
        I: FISCAL_CONFIG_2025.simples_nacional.I.map(b => ({ ...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), IBS: (b.distribution.ICMS || 0), PIS: 0, COFINS: 0, ICMS: 0 } })),
        II: FISCAL_CONFIG_2025.simples_nacional.II.map(b => ({ ...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), IBS: (b.distribution.ICMS || 0), PIS: 0, COFINS: 0, ICMS: 0 } })),
        III: FISCAL_CONFIG_2025.simples_nacional.III.map(b => ({ ...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), IBS: (b.distribution.ISS || 0), PIS: 0, COFINS: 0, ISS: 0 } })),
        IV: FISCAL_CONFIG_2025.simples_nacional.IV.map(b => ({ ...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), IBS: (b.distribution.ISS || 0), PIS: 0, COFINS: 0, ISS: 0 } })),
        V: FISCAL_CONFIG_2025.simples_nacional.V.map(b => ({ ...b, distribution: {...b.distribution, CBS: (b.distribution.PIS + b.distribution.COFINS), IBS: (b.distribution.ISS || 0), PIS: 0, COFINS: 0, ISS: 0 } })),
    }
};


export type FiscalConfig = typeof FISCAL_CONFIG_2025;
export type FiscalConfig2026 = typeof FISCAL_CONFIG_2026;
export type FiscalConfig2027 = typeof FISCAL_CONFIG_2027_2028;
export type FiscalConfig2029 = typeof FISCAL_CONFIG_2029_2032;
export type FiscalConfig2033 = typeof FISCAL_CONFIG_2033_PLUS;

/**
 * Retrieves the fiscal configuration for a given year.
 * This function now handles the year-by-year transition rules.
 * @param year The fiscal year for which to retrieve parameters.
 * @returns The fiscal configuration object for the specified year.
 */
export const getFiscalParameters = (year: number): FiscalConfig | FiscalConfig2026 | FiscalConfig2027 | FiscalConfig2029 | FiscalConfig2033 => {
    if (year <= 2025) {
        return FISCAL_CONFIG_2025;
    }
    if (year === 2026) {
        return FISCAL_CONFIG_2026;
    }
    if (year >= 2027 && year <= 2028) {
        return FISCAL_CONFIG_2027_2028;
    }
    if (year >= 2029 && year <= 2032) {
        // Here you could add more complex logic to adjust proportions year by year
        // For now, it returns the 2029 setup as a representative for the period
        return FISCAL_CONFIG_2029_2032;
    }
     // For 2033 and beyond
    return FISCAL_CONFIG_2033_PLUS;
}
