import { calculateTaxes } from './calculations';
import { getFiscalParameters } from '../config/fiscal';
import type { TaxFormValues } from './types';

const fiscalConfig = getFiscalParameters(2025);

describe('Tax Calculation Engine', () => {

  // Teste 1: Cenário de Referência (Otimização Fator R) - O "Teste de Gabarito"
  test('should match reference calculation for Fator R optimization scenario', () => {
    const input: TaxFormValues = {
      selectedCnaes: ['7020-4/00'], // Anexo V
      rbt12: 480000,
      fp12: 0,
      domesticActivities: [{ code: '7020-4/00', revenue: 40331.75 }],
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
    // Alíquota efetiva Anexo V, Faixa 3: (480000 * 0.195 - 9900) / 480000 = 0.174375
    // DAS = 40331.75 * 0.174375 = 7032.89
    // INSS Sócio = 1518 * 0.11 = 166.98
    // Total Tax = 7032.89 + 166.98 = 7199.87
    expect(result.simplesNacionalBase.totalTax).toBeCloseTo(7199.87, 2);

    // Cenário Otimizado (Anexo III)
    expect(result.simplesNacionalOtimizado).not.toBeNull();
    if (result.simplesNacionalOtimizado) {
        // Pró-labore otimizado = 40331.75 * 0.28 = 11292.89
        // RBT12 = 480000. Alíquota efetiva Anexo III, Faixa 3: (480000 * 0.135 - 17640) / 480000 = 0.09825
        // DAS = 40331.75 * 0.09825 = 3962.59
        // INSS Sócio = 8157.41 * 0.11 = 897.32 (Teto)
        // IRRF Sócio: Base = 11292.89 - 897.32 = 10395.57. IRRF = 10395.57 * 0.275 - 896 = 1962.78
        // Total Tax = 3962.59 + 897.32 + 1962.78 = 6822.69
        expect(result.simplesNacionalOtimizado.totalTax).toBeCloseTo(6822.69, 2);
    }
    
    // Cenário Lucro Presumido
    expect(result.lucroPresumido).not.toBeNull();
    // PIS = 40331.75 * 0.0065 = 262.16
    // COFINS = 40331.75 * 0.03 = 1209.95
    // ISS = 40331.75 * 0.05 = 2016.59 (Suposição de 5%)
    // Base IRPJ/CSLL = 40331.75 * 0.32 = 12906.16
    // IRPJ = 12906.16 * 0.15 = 1935.92
    // CSLL = 12906.16 * 0.09 = 1161.55
    // CPP = 1518 * 0.20 = 303.6
    // INSS Sócio = 166.98
    // Total Tax = 262.16 + 1209.95 + 2016.59 + 1935.92 + 1161.55 + 303.6 + 166.98 = 7056.75
    expect(result.lucroPresumido.totalTax).toBeCloseTo(7056.75, 2);
  });

  // Teste 2: Anexo IV - Teste de Regressão
  test('should calculate CPP correctly for Simples Nacional Anexo IV', () => {
    const input: TaxFormValues = {
      selectedCnaes: ['6911-7/01'], // Advocacia, Anexo IV
      rbt12: 200000,
      fp12: 24000,
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
    const cppValue = result.simplesNacionalBase.breakdown.find(b => b.name === 'CPP (INSS Patronal)')?.value;
    expect(cppValue).toBe(400);
    
    // INSS Sócio = 2000 * 0.11 = 220
    const inssSocioValue = result.simplesNacionalBase.breakdown.find(b => b.name === 'INSS s/ Pró-labore')?.value;
    expect(inssSocioValue).toBe(220);

    // Total Tax = 990 + 400 + 220 = 1610
    expect(result.simplesNacionalBase.totalTax).toBeCloseTo(1610, 2);
  });

  // Teste 3: Lucro Presumido com CPP - Teste de Regressão
  test('should calculate CPP correctly for Lucro Presumido', () => {
    const input: TaxFormValues = {
      selectedCnaes: ['7020-4/00'], // Serviço qualquer
      rbt12: 0,
      fp12: 0,
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
    const cppValue = result.lucroPresumido.breakdown.find(b => b.name === 'CPP (INSS Patronal)')?.value;
    expect(cppValue).toBe(2000);
  });

});
