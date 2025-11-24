

import { calculateTaxes } from './calculations';
import { getFiscalParameters } from '../config/fiscal';
import type { TaxFormValues } from './types';

describe('Tax Calculation Engine (2025)', () => {
  const fiscalConfig = getFiscalParameters(2025);

  test('Cenário 1: "Candidato à Otimização" (Fator R baixo -> Anexo V)', () => {
    const input: TaxFormValues = {
      selectedCnaes: [{ code: '6201-5/01' }], // Desenvolvimento de Software
      rbt12: 240000,
      fp12: 18216, // 1518 * 12 -> Fator R = 7.59%
      issRate: 0.05,
      domesticActivities: [{ code: '6201-5/01', revenue: 20000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLabores: [{ value: 1518.00, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      selectedPlan: 'expertsEssencial',
      year: 2025
    };

    const result = calculateTaxes(input);

    // Valida o cenário base (Anexo V)
    const baseScenario = result.simplesNacionalBase;
    expect(baseScenario).not.toBeNull();
    expect(baseScenario.fatorR).toBeLessThan(0.28);
    expect(baseScenario.annex).toContain('Anexo V');
    // Alíquota Efetiva: (240000 * 18% - 4500) / 240000 = 16.125%
    // DAS = 20000 * 0.16125 = 3225
    expect(baseScenario.effectiveDasRate).toBeCloseTo(0.16125);
    expect(baseScenario.breakdown.find(b => b.name.startsWith('DAS'))?.value).toBeCloseTo(3225);

    // Valida o cenário otimizado (Anexo III)
    const otimizadoScenario = result.simplesNacionalOtimizado;
    expect(otimizadoScenario).not.toBeNull();
    if(otimizadoScenario) {
      expect(otimizadoScenario.fatorR).toBeGreaterThanOrEqual(0.28);
      expect(otimizadoScenario.annex).toContain('Anexo III');
      // Alíquota Efetiva: (240000 * 11.2% - 9360) / 240000 = 7.30%
      // DAS = 20000 * 0.073 = 1460
      expect(otimizadoScenario.effectiveDasRate).toBeCloseTo(0.073);
      expect(otimizadoScenario.breakdown.find(b => b.name.startsWith('DAS'))?.value).toBeCloseTo(1460);
    }
  });

  test('Cenário 2: O "Otimizado" (Fator R ideal -> Anexo III)', () => {
    const input: TaxFormValues = {
      selectedCnaes: [{ code: '6201-5/01' }], // Desenvolvimento de Software
      rbt12: 240000,
      fp12: 67200, // 5600 * 12 -> Fator R = 28%
      issRate: 0.05,
      domesticActivities: [{ code: '6201-5/01', revenue: 20000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLabores: [{ value: 5600, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      selectedPlan: 'expertsEssencial',
      year: 2025
    };

    const result = calculateTaxes(input);

    const baseScenario = result.simplesNacionalBase;
    expect(baseScenario).not.toBeNull();
    expect(baseScenario.fatorR).toBeGreaterThanOrEqual(0.28);
    expect(baseScenario.annex).toContain('Anexo III');
     // Alíquota Efetiva: (240000 * 11.2% - 9360) / 240000 = 7.30%
    // DAS = 20000 * 0.073 = 1460
    expect(baseScenario.effectiveDasRate).toBeCloseTo(0.073);
    expect(baseScenario.breakdown.find(b => b.name.startsWith('DAS'))?.value).toBeCloseTo(1460);
    
    // Cenário otimizado não deve ser gerado, pois já está ótimo
    expect(result.simplesNacionalOtimizado?.optimizationNote).toBeDefined();
  });


  test('Cenário 3: Anexo IV - Deve calcular CPP por fora do DAS', () => {
    const input: TaxFormValues = {
      selectedCnaes: [{ code: '6911-7/01' }], // Advocacia, Anexo IV
      rbt12: 200000,
      fp12: 24000,
      issRate: 0.05,
      domesticActivities: [{ code: '6911-7/01', revenue: 20000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLabores: [{ value: 2000, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      selectedPlan: 'padrao',
      year: 2025
    };

    const result = calculateTaxes(input);

    const baseScenario = result.simplesNacionalBase;
    expect(baseScenario).not.toBeNull();
    // RBT12 = 200k. Alíquota efetiva Anexo IV, Faixa 2: (200000 * 0.09 - 8100) / 200000 = 0.0495
    // DAS = 20000 * 0.0495 = 990
    const dasValue = baseScenario.breakdown.find(b => b.name.startsWith('DAS'))?.value;
    expect(dasValue).toBeCloseTo(990);

    // CPP (pago por fora no Anexo IV) = 2000 (pró-labore) * 0.20 = 400
    const cppValue = baseScenario.breakdown.find(b => b.name.includes('CPP'))?.value;
    expect(cppValue).toBe(400);
    
    // INSS Sócio = 2000 * 0.11 = 220
    const inssSocioValue = baseScenario.breakdown.find(b => b.name.includes('INSS s/ Pró-labore'))?.value;
    expect(inssSocioValue).toBe(220);

    // Total Tax = 990 (DAS) + 400 (CPP) + 220 (INSS) = 1610
    expect(baseScenario.totalTax).toBeCloseTo(1610);
  });

  test('Cenário 4: Lucro Presumido - Deve calcular CPP sobre a folha total', () => {
    const input: TaxFormValues = {
      selectedCnaes: [{ code: '7020-4/00' }], // Serviço qualquer
      rbt12: 0,
      fp12: 0,
      issRate: 0.05,
      domesticActivities: [{ code: '7020-4/00', revenue: 50000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 5000,
      proLabores: [{ value: 5000, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      selectedPlan: 'padrao',
      year: 2025
    };

    const result = calculateTaxes(input);
    
    const lpScenario = result.lucroPresumido;
    expect(lpScenario).not.toBeNull();

    // monthlyPayroll = 5000 (salário) + 5000 (pró-labore) = 10000
    // CPP = 10000 * 0.20 = 2000
    const cppValue = lpScenario.breakdown.find(b => b.name.includes('CPP'))?.value;
    expect(cppValue).toBe(2000);
  });

  test('Cenário 5: INSS Sócio - Deve respeitar o teto', () => {
      const config = getFiscalParameters(2025);
      const input: TaxFormValues = {
      selectedCnaes: [{ code: '7020-4/00' }],
      rbt12: 0,
      fp12: 0,
      issRate: 0.05,
      domesticActivities: [],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLabores: [{ value: 10000, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      selectedPlan: 'padrao',
      year: 2025
    };

    const result = calculateTaxes(input);
    const inssSocio = result.simplesNacionalBase.partnerTaxes[0].inss;
    
    // Teto INSS 2025 = 8157.41
    // INSS = 8157.41 * 0.11 = 897.3151
    expect(inssSocio).toBeCloseTo(config.teto_inss * config.aliquota_inss_prolabore);
  })

});

