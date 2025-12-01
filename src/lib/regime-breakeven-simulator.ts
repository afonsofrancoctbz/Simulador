// src/lib/regime-breakeven-simulator.ts
/**
 * SIMULADOR DE BREAK-EVEN: SIMPLES NACIONAL vs LUCRO PRESUMIDO
 * 
 * Calcula qual regime é mais vantajoso nos primeiros 12 meses de operação,
 * considerando que o Simples usa alíquotas nominais (sem RBT12) no início.
 */

import { getFiscalParametersPostReform } from '@/config/fiscal';
import { getCnaeData } from './cnae-helpers';
import { findBracket } from './utils';
import type { Annex } from './types';

export interface MonthlyProjection {
  mes: number; // 1 a 12
  mesReferencia: string; // "Jan/2026"
  receitaDomestica: number;
  receitaExportacao: number;
  folhaPagamento: number;
  
  // Simples Nacional
  rbt12Acumulado: number; // Receita dos últimos 12 meses
  anexoSimples: Annex;
  aliquotaSimplesNominal: number; // Do bracket da tabela
  aliquotaSimplesEfetiva: number; // Com dedução
  custoSimples: number;
  
  // Lucro Presumido
  custoPresumido: number;
  
  // Comparação
  diferencaAbsoluta: number; // Presumido - Simples (negativo = Simples melhor)
  diferencaPercentual: number;
  regimeMaisVantajoso: 'simples' | 'presumido' | 'empate';
}

export interface BreakEvenAnalysis {
  projecao12Meses: MonthlyProjection[];
  
  // Sumário
  totalCustoSimples: number;
  totalCustoPresumido: number;
  economiaTotal: number;
  regimeRecomendado: 'simples' | 'presumido';
  
  // Break-even
  mesBreakEven?: number; // Mês onde o regime muda de vantagem
  receitaBreakEven?: number; // Receita mensal onde os regimes se igualam
  
  // Insights
  insights: string[];
}

export interface BreakEvenInputs {
  // Projeção mensal
  receitaMensalDomestica: number; // Receita projetada constante
  receitaMensalExportacao: number;
  crescimentoMensal: number; // % de crescimento (ex: 0.05 = 5%)
  
  // Estrutura
  folhaMensal: number;
  numeroSocios: number;
  proLaborePorSocio: number;
  
  // CNAE
  cnaeCode: string;
  
  // Impostos
  issRate: number; // 0.02 a 0.05
  
  // Ano fiscal
  year: number;
}

/**
 * Calcula Simples Nacional com alíquota NOMINAL (sem RBT12 real)
 */
function calcularSimplesInicial(
  receitaMensal: number,
  rbt12Acumulado: number,
  anexo: Annex,
  year: number
): { aliquotaNominal: number; aliquotaEfetiva: number; custo: number } {
  const fiscalConfig = getFiscalParametersPostReform(year);
  
  // Se não tem RBT12 ainda, usa a primeira faixa
  const rbt12ParaCalculo = rbt12Acumulado > 0 ? rbt12Acumulado : receitaMensal * 12;
  
  const annexTable = fiscalConfig.simples_nacional[anexo];
  const bracket = findBracket(annexTable, rbt12ParaCalculo);
  
  const aliquotaNominal = bracket.rate;
  const aliquotaEfetiva = rbt12ParaCalculo > 0 
    ? (rbt12ParaCalculo * bracket.rate - bracket.deduction) / rbt12ParaCalculo 
    : bracket.rate;
  
  const custo = receitaMensal * aliquotaEfetiva;
  
  return { aliquotaNominal, aliquotaEfetiva, custo };
}

/**
 * Calcula Lucro Presumido (não muda com o tempo)
 */
function calcularPresumidoInicial(
  receitaDomestica: number,
  receitaExportacao: number,
  issRate: number,
  cnaeCode: string,
  year: number
): number {
  const fiscalConfig = getFiscalParametersPostReform(year);
  const cnaeInfo = getCnaeData(cnaeCode);
  
  const receitaTotal = receitaDomestica + receitaExportacao;
  const presumedRate = cnaeInfo?.presumedProfitRateIRPJ ?? 0.32;
  
  // Base presumida
  const presumedProfit = receitaTotal * presumedRate;
  
  // IRPJ (15% sobre base presumida)
  const irpj = presumedProfit * 0.15;
  
  // IRPJ Adicional (10% sobre o que passar de R$ 20k/mês)
  const irpjAdicional = Math.max(0, (presumedProfit - 20000) * 0.10);
  
  // CSLL (9% sobre base presumida de 32% ou 12%)
  const csllRate = cnaeInfo?.presumedProfitRateCSLL ?? 0.32;
  const csll = receitaTotal * csllRate * 0.09;
  
  // PIS/COFINS (apenas receita doméstica)
  const pis = receitaDomestica * 0.0065;
  const cofins = receitaDomestica * 0.03;
  
  // ISS (apenas receita doméstica)
  const iss = receitaDomestica * issRate;
  
  return irpj + irpjAdicional + csll + pis + cofins + iss;
}

/**
 * SIMULADOR PRINCIPAL
 */
export function simularBreakEven(inputs: BreakEvenInputs): BreakEvenAnalysis {
  const {
    receitaMensalDomestica,
    receitaMensalExportacao,
    crescimentoMensal,
    folhaMensal,
    cnaeCode,
    issRate,
    year
  } = inputs;
  
  const cnaeInfo = getCnaeData(cnaeCode);
  if (!cnaeInfo) {
    throw new Error(`CNAE ${cnaeCode} não encontrado`);
  }
  
  const fiscalConfig = getFiscalParametersPostReform(year);
  const projecao: MonthlyProjection[] = [];
  
  let rbt12Acumulado = 0;
  let totalCustoSimples = 0;
  let totalCustoPresumido = 0;
  let mesBreakEven: number | undefined;
  
  // Determinar anexo
  let anexo: Annex = cnaeInfo.annex;
  
  // Se requer Fator R, calcular
  if (cnaeInfo.requiresFatorR) {
    const folhaAnual = folhaMensal * 12;
    const receitaAnual = (receitaMensalDomestica + receitaMensalExportacao) * 12;
    const fatorR = receitaAnual > 0 ? folhaAnual / receitaAnual : 0;
    
    anexo = fatorR >= fiscalConfig.simples_nacional.limite_fator_r ? 'III' : 'V';
  }
  
  // Simular 12 meses
  for (let mes = 1; mes <= 12; mes++) {
    // Aplicar crescimento
    const multiplicador = Math.pow(1 + crescimentoMensal, mes - 1);
    const receitaDomestica = receitaMensalDomestica * multiplicador;
    const receitaExportacao = receitaMensalExportacao * multiplicador;
    const receitaTotal = receitaDomestica + receitaExportacao;
    
    // Acumular RBT12 (considera apenas últimos 12 meses)
    rbt12Acumulado += receitaTotal;
    
    // Calcular Simples
    const simples = calcularSimplesInicial(
      receitaTotal,
      rbt12Acumulado,
      anexo,
      year
    );
    
    // Calcular Presumido
    const custoPresumido = calcularPresumidoInicial(
      receitaDomestica,
      receitaExportacao,
      issRate,
      cnaeCode,
      year
    );
    
    totalCustoSimples += simples.custo;
    totalCustoPresumido += custoPresumido;
    
    const diferenca = custoPresumido - simples.custo;
    const diferencaPerc = receitaTotal > 0 ? (diferenca / receitaTotal) * 100 : 0;
    
    let regimeMaisVantajoso: 'simples' | 'presumido' | 'empate';
    if (Math.abs(diferenca) < 100) {
      regimeMaisVantajoso = 'empate';
    } else {
      regimeMaisVantajoso = diferenca > 0 ? 'simples' : 'presumido';
    }
    
    // Detectar break-even
    if (mes > 1) {
      const anterior = projecao[mes - 2];
      if (anterior.regimeMaisVantajoso !== regimeMaisVantajoso && !mesBreakEven) {
        mesBreakEven = mes;
      }
    }
    
    projecao.push({
      mes,
      mesReferencia: obterMesReferencia(mes, year),
      receitaDomestica,
      receitaExportacao,
      folhaPagamento: folhaMensal,
      rbt12Acumulado,
      anexoSimples: anexo,
      aliquotaSimplesNominal: simples.aliquotaNominal,
      aliquotaSimplesEfetiva: simples.aliquotaEfetiva,
      custoSimples: simples.custo,
      custoPresumido,
      diferencaAbsoluta: diferenca,
      diferencaPercentual: diferencaPerc,
      regimeMaisVantajoso
    });
  }
  
  // Análise final
  const economiaTotal = totalCustoPresumido - totalCustoSimples;
  const regimeRecomendado = economiaTotal > 0 ? 'simples' : 'presumido';
  
  const insights = gerarInsights(
    projecao,
    anexo,
    totalCustoSimples,
    totalCustoPresumido,
    cnaeInfo.requiresFatorR === true
  );
  
  return {
    projecao12Meses: projecao,
    totalCustoSimples,
    totalCustoPresumido,
    economiaTotal,
    regimeRecomendado,
    mesBreakEven,
    insights
  };
}

/**
 * Gera insights automáticos da análise
 */
function gerarInsights(
  projecao: MonthlyProjection[],
  anexo: Annex,
  totalSimples: number,
  totalPresumido: number,
  requiresFatorR: boolean
): string[] {
  const insights: string[] = [];
  
  const primeiroMes = projecao[0];
  const ultimoMes = projecao[11];
  
  // Insight 1: Comparação geral
  const economia = totalPresumido - totalSimples;
  if (economia > 0) {
    insights.push(
      `✅ Simples Nacional é ${((economia / totalPresumido) * 100).toFixed(1)}% mais vantajoso nos primeiros 12 meses, economizando R$ ${economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
    );
  } else {
    insights.push(
      `⚠️ Lucro Presumido é ${((Math.abs(economia) / totalSimples) * 100).toFixed(1)}% mais vantajoso nos primeiros 12 meses, economizando R$ ${Math.abs(economia).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
    );
  }
  
  // Insight 2: Alíquota inicial
  insights.push(
    `📊 Alíquota inicial do Simples (${anexo}): ${(primeiroMes.aliquotaSimplesNominal * 100).toFixed(2)}%. Alíquota efetiva no mês 12: ${(ultimoMes.aliquotaSimplesEfetiva * 100).toFixed(2)}%.`
  );
  
  // Insight 3: Exportação
  if (primeiroMes.receitaExportacao > 0) {
    insights.push(
      `🌍 Receitas de exportação (${((primeiroMes.receitaExportacao / (primeiroMes.receitaDomestica + primeiroMes.receitaExportacao)) * 100).toFixed(0)}%) têm tributação reduzida em ambos os regimes.`
    );
  }
  
  // Insight 4: Fator R
  if (requiresFatorR) {
    if (anexo === 'III') {
      insights.push(
        `✅ Sua empresa atinge o Fator R de 28% e se beneficia do Anexo III (alíquotas menores).`
      );
    } else {
      insights.push(
        `⚠️ Sua empresa está no Anexo V (alíquotas mais altas). Aumentar a folha para 28% da receita pode reduzir custos significativamente.`
      );
    }
  }
  
  // Insight 5: Mudança de regime
  insights.push(
    `🗓️ Lembre-se: a mudança de regime tributário só pode ocorrer em Janeiro. Avalie a projeção para o ano inteiro antes de decidir.`
  );
  
  return insights;
}

/**
 * Converte mês numérico em referência legível
 */
function obterMesReferencia(mes: number, year: number): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const data = new Date(year, mes - 1, 1);
  return `${meses[data.getMonth()]}/${data.getFullYear()}`;
}

/**
 * FUNÇÃO AUXILIAR: Encontrar receita de break-even
 * (onde os dois regimes têm o mesmo custo)
 */
export function encontrarReceitaBreakEven(
  cnaeCode: string,
  folhaMensal: number,
  issRate: number,
  year: number
): number {
  const cnaeInfo = getCnaeData(cnaeCode);
  if (!cnaeInfo) return 0;
  
  // Binary search para encontrar o break-even
  let min = 10000;
  let max = 500000;
  let melhorAproximacao = 0;
  
  for (let i = 0; i < 20; i++) {
    const meio = (min + max) / 2;
    
    const inputs: BreakEvenInputs = {
      receitaMensalDomestica: meio,
      receitaMensalExportacao: 0,
      crescimentoMensal: 0,
      folhaMensal,
      numeroSocios: 1,
      proLaborePorSocio: 0,
      cnaeCode,
      issRate,
      year
    };
    
    const resultado = simularBreakEven(inputs);
    const diferenca = resultado.totalCustoPresumido - resultado.totalCustoSimples;
    
    if (Math.abs(diferenca) < 1000) {
      melhorAproximacao = meio;
      break;
    }
    
    if (diferenca > 0) {
      // Simples está mais barato, aumentar receita
      min = meio;
    } else {
      // Presumido está mais barato, diminuir receita
      max = meio;
    }
    
    melhorAproximacao = meio;
  }
  
  return melhorAproximacao;
}
