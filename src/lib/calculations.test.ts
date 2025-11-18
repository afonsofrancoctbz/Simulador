
import { calculateTaxes } from './calculations';
import { getFiscalParameters } from '../config/fiscal';
import type { TaxFormValues } from './types';

const fiscalConfig = getFiscalParameters(2025);

describe('Tax Calculation Engine', () => {

  // Teste 1: Cenário de Referência (Otimização Fator R) - O "Teste de Gabarito"
  test('should match reference calculation for Fator R optimization scenario', () => {
    const input: TaxFormValues = {
      selectedCnaes: [{ code: '7020-4/00' }], // Anexo V
      rbt12: 240000,
      fp12: 67000,
      issRate: 0.05,
      domesticActivities: [{ code: '7020-4/00', revenue: 20000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLabores: [{ value: 1518.00, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      selectedPlan: 'expertsEssencial',
    };

    const result = calculateTaxes(input, fiscalConfig);

    // Cenário Base (Anexo V)
    expect(result.simplesNacionalBase).not.toBeNull();
    // Fator R = 67000/240000 = 27.92% (< 28%) -> Anexo V
    // Alíquota efetiva Anexo V, Faixa 2: (240000 * 0.18 - 4500) / 240000 = 0.16125
    // DAS = 20000 * 0.16125 = 3225
    expect(result.simplesNacionalBase.breakdown.find(b => b.name.startsWith('DAS'))?.value).toBeCloseTo(3225, 2);
    // INSS Sócio = 1518 * 0.11 = 166.98
    // Total Tax = 3225 + 166.98 = 3391.98
    expect(result.simplesNacionalBase.totalTax).toBeCloseTo(3391.98, 2);

    // Cenário Otimizado (Anexo III)
    expect(result.simplesNacionalOtimizado).not.toBeNull();
    if (result.simplesNacionalOtimizado) {
        // Para atingir Fator R >= 28%, FP12 precisa ser >= 240000 * 0.28 = 67200.
        // Aumento de R$200 na FP12. O pro-labore sobe para cobrir isso.
        // RBT12 = 240k. Alíquota efetiva Anexo III, Faixa 2: (240000 * 0.112 - 9360) / 240000 = 0.073
        // DAS = 20000 * 0.073 = 1460
        expect(result.simplesNacionalOtimizado.breakdown.find(b => b.name.startsWith('DAS'))?.value).toBeCloseTo(1460, 2);
        
        // Custo adicional do INSS/IRRF sobre o pro-labore aumentado
        const inssOtimizado = result.simplesNacionalOtimizado.breakdown.find(b => b.name.includes('INSS s/ Pró-labore'))?.value || 0;
        const irrfOtimizado = result.simplesNacionalOtimizado.breakdown.find(b => b.name.includes('IRRF s/ Pró-labore'))?.value || 0;
        
        // Total Tax Otimizado = DAS + INSS + IRRF
        const totalTaxOtimizado = 1460 + inssOtimizado + irrfOtimizado;
        expect(result.simplesNacionalOtimizado.totalTax).toBeCloseTo(totalTaxOtimizado, 2);
    }
    
    // Cenário Lucro Presumido
    expect(result.lucroPresumido).not.toBeNull();
    // PIS = 20000 * 0.0065 = 130
    // COFINS = 20000 * 0.03 = 600
    // ISS = 20000 * 0.05 = 1000
    // Base IRPJ/CSLL = 20000 * 0.32 = 6400
    // IRPJ = 6400 * 0.15 = 960
    // CSLL = 6400 * 0.09 = 576
    // CPP = 1518 * 0.20 = 303.6
    // INSS Sócio = 1518 * 0.11 = 166.98
    // Total Tax = 130 + 600 + 1000 + 960 + 576 + 303.6 + 166.98 = 3736.58
    expect(result.lucroPresumido.totalTax).toBeCloseTo(3736.58, 2);
  });

  // Teste 2: Anexo IV - Teste de Regressão
  test('should calculate CPP correctly for Simples Nacional Anexo IV', () => {
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
    };

    const result = calculateTaxes(input, fiscalConfig);

    expect(result.simplesNacionalBase).not.toBeNull();
    // RBT12 = 200k. Alíquota efetiva Anexo IV, Faixa 2: (200000 * 0.09 - 8100) / 200000 = 0.0495
    // DAS = 20000 * 0.0495 = 990
    const dasValue = result.simplesNacionalBase.breakdown.find(b => b.name.startsWith('DAS'))?.value;
    expect(dasValue).toBeCloseTo(990, 2);

    // CPP (pago por fora no Anexo IV) = 2000 (pró-labore) * 0.20 = 400
    const cppValue = result.simplesNacionalBase.breakdown.find(b => b.name.includes('CPP'))?.value;
    expect(cppValue).toBe(400);
    
    // INSS Sócio = 2000 * 0.11 = 220
    const inssSocioValue = result.simplesNacionalBase.breakdown.find(b => b.name.includes('INSS s/ Pró-labore'))?.value;
    expect(inssSocioValue).toBe(220);

    // Total Tax = 990 + 400 + 220 = 1610
    expect(result.simplesNacionalBase.totalTax).toBeCloseTo(1610, 2);
  });

  // Teste 3: Lucro Presumido com CPP - Teste de Regressão
  test('should calculate CPP correctly for Lucro Presumido', () => {
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
    };

    const result = calculateTaxes(input, fiscalConfig);
    
    expect(result.lucroPresumido).not.toBeNull();
    // monthlyPayroll = 5000 (salário) + 5000 (pró-labore) = 10000
    // CPP = 10000 * 0.20 = 2000
    const cppValue = result.lucroPresumido.breakdown.find(b => b.name.includes('CPP'))?.value;
    expect(cppValue).toBe(2000);
  });

});
