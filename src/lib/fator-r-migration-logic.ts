/**
 * @fileOverview Lógica completa de análise e adequação do Fator R para empresas em migração
 * * Atualizado para as regras de 2026:
 * - Salário Mínimo: R$ 1.621,00
 * - Isenção de IRPF: Até R$ 5.000,00
 * - Encargos Patronais (PJ): 0% sobre Pró-labore (INSS embutido no DAS)
 */

export interface DadosMensais {
  mes: string; // Formato: "MM/YYYY"
  receita: number;
  folha: number;
}

export interface SituacaoAtual {
  rbt12: number;           // Receita Bruta Total (12 meses)
  folha12: number;         // Folha de Salários Total (12 meses)
  fatorR: number;          // Fator R atual (0.00 a 1.00)
  anexo: 'III' | 'V';      // Anexo atual
  custoMensalAtual: number;
  aliquotaAtual: number;
  receitaMensal: number;   // Receita média mensal
  folhaMensal: number;     // Folha média mensal
}

export interface AnaliseGap {
  folhaNecessaria: number;      // Folha necessária para atingir 28%
  diferencaTotal: number;       // Diferença a ser aumentada
  percentualAumento: number;    // Aumento percentual necessário
  viavel: boolean;              // Se o aumento é viável (< 500%)
  mensagemViabilidade?: string;
}

export interface PlanoAdequacao {
  mesesParaAdequacao: number;
  aumentoMensalNecessario: number;
  folhaBaseAtual: number;
  folhaTotalMensal: number;
  custoComEncargos: number;     // Custo mensal (Ajustado para 0% de encargos patronais no Pró-labore)
}

export interface ProjecaoMes {
  mes: number;                  // Número sequencial (1, 2, 3...)
  mesReferencia: string;        // Data de referência "MM/YYYY"
  mesApuracao: string;          // Mês de apuração do DAS (sempre +1)
  folhaBase: number;
  aumentoAplicado: number;
  folhaTotal: number;
  folhaAcumulada12m: number;
  fatorRProjetado: number;
  anexoProjetado: 'III' | 'V';
  economiaEstimada: number;
  custoAdequacao: number;
}

export interface ROI {
  custoMensalAdequacao: number;
  economiaMensal: number;
  economiaAnual: number;
  paybackMeses: number;
  investimentoTotal: number;
  retornoTotal12Meses: number;
}

export interface AnaliseCompleta {
  situacaoAtual: SituacaoAtual;
  analiseGap: AnaliseGap;
  planoAdequacao: PlanoAdequacao;
  projecao: ProjecaoMes[];
  roi: ROI;
  recomendacoes: string[];
  jaOtimizado: boolean;
}

/**
 * Calcula a situação atual da empresa com base nos dados dos últimos 12 meses
 */
export function calcularSituacaoAtual(dadosMensais: DadosMensais[]): SituacaoAtual {
  if (!dadosMensais || dadosMensais.length !== 12) {
    return {
      rbt12: 0,
      folha12: 0,
      fatorR: 0,
      anexo: 'V',
      custoMensalAtual: 0,
      aliquotaAtual: 0.155,
      receitaMensal: 0,
      folhaMensal: 0,
    };
  }

  const rbt12 = dadosMensais.reduce((acc, item) => acc + (item.receita || 0), 0);
  const folha12 = dadosMensais.reduce((acc, item) => acc + (item.folha || 0), 0);
  
  const fatorR = rbt12 > 0 ? folha12 / rbt12 : 0;
  const anexo: 'III' | 'V' = fatorR >= 0.28 ? 'III' : 'V';
  
  const aliquotaAtual = anexo === 'III' 
    ? calcularAliquotaEfetivaAnexoIII(rbt12)
    : calcularAliquotaEfetivaAnexoV(rbt12);

  const receitaMensal = rbt12 / 12;
  const folhaMensal = folha12 / 12;
  const custoMensalAtual = receitaMensal * aliquotaAtual;

  return {
    rbt12,
    folha12,
    fatorR,
    anexo,
    custoMensalAtual,
    aliquotaAtual,
    receitaMensal,
    folhaMensal,
  };
}

function calcularAliquotaEfetivaAnexoIII(rbt12: number): number {
  const faixas = [
    { ate: 180000, aliquota: 0.06, deducao: 0 },
    { ate: 360000, aliquota: 0.112, deducao: 9360 },
    { ate: 720000, aliquota: 0.135, deducao: 17640 },
    { ate: 1800000, aliquota: 0.16, deducao: 35640 },
    { ate: 3600000, aliquota: 0.21, deducao: 125640 },
    { ate: 4800000, aliquota: 0.33, deducao: 648000 },
  ];
  if(rbt12 <= 0) return faixas[0].aliquota;
  const faixa = faixas.find(f => rbt12 <= f.ate) || faixas[faixas.length - 1];
  return (rbt12 * faixa.aliquota - faixa.deducao) / rbt12;
}

function calcularAliquotaEfetivaAnexoV(rbt12: number): number {
  const faixas = [
      { ate: 180000, aliquota: 0.155, deducao: 0 },
      { ate: 360000, aliquota: 0.18, deducao: 4500 },
      { ate: 720000, aliquota: 0.195, deducao: 9900 },
      { ate: 1800000, aliquota: 0.205, deducao: 17100 },
      { ate: 3600000, aliquota: 0.23, deducao: 62100 },
      { ate: 4800000, aliquota: 0.305, deducao: 540000 },
  ];
   if(rbt12 <= 0) return faixas[0].aliquota;
  const faixa = faixas.find(f => rbt12 <= f.ate) || faixas[faixas.length - 1];
  return (rbt12 * faixa.aliquota - faixa.deducao) / rbt12;
}

/**
 * Analisa o GAP necessário para atingir Fator R de 28% (Com proteção anti-Infinity e regras 2026)
 */
export function analisarGap(situacaoAtual: SituacaoAtual): AnaliseGap {
  const folhaNecessaria = situacaoAtual.rbt12 * 0.28;
  const diferencaTotal = situacaoAtual.folha12 > 0 
    ? Math.max(0, folhaNecessaria - situacaoAtual.folha12) 
    : folhaNecessaria;
  
  let percentualAumento = 0;
  let viavel = true;
  let mensagemViabilidade = "";

  if (situacaoAtual.folha12 > 0) {
    percentualAumento = (diferencaTotal / situacaoAtual.folha12) * 100;
    viavel = percentualAumento <= 500;
  } else if (diferencaTotal > 0) {
    // Evita o erro Infinity% se a folha anterior for 0
    percentualAumento = 100; 
  }

  if (situacaoAtual.folha12 === 0 && diferencaTotal > 0) {
    mensagemViabilidade = `💡 Sua empresa não possui histórico de pró-labore. O ajuste criará uma folha do zero a partir do teto de isenção ou salário mínimo de 2026.`;
  } else if (!viavel) {
    mensagemViabilidade = 
      `⚠️ Aumento de ${percentualAumento.toFixed(0)}% exige cuidado. ` +
      `Lembre-se que em 2026 o pró-labore de até R$ 5.000 é isento de IRPF, tornando ajustes mais altos muito mais vantajosos.`;
  }

  return {
    folhaNecessaria,
    diferencaTotal,
    percentualAumento,
    viavel,
    mensagemViabilidade,
  };
}

/**
 * Gera um plano de adequação para X meses (Adequado para 2026)
 */
export function gerarPlanoAdequacao(
  situacaoAtual: SituacaoAtual,
  analiseGap: AnaliseGap,
  mesesParaAdequacao: number
): PlanoAdequacao {
  if (mesesParaAdequacao <= 0) mesesParaAdequacao = 1;
  
  const SALARIO_MINIMO_2026 = 1621;
  let aumentoMensalNecessario = analiseGap.diferencaTotal / mesesParaAdequacao;
  const folhaBaseAtual = situacaoAtual.folhaMensal;
  
  let folhaTotalMensal = folhaBaseAtual + aumentoMensalNecessario;
  
  // Regra: Pró-labore não pode ser inferior a 1 Salário Mínimo (2026)
  if (folhaTotalMensal > 0 && folhaTotalMensal < SALARIO_MINIMO_2026) {
      folhaTotalMensal = SALARIO_MINIMO_2026;
      aumentoMensalNecessario = folhaTotalMensal - folhaBaseAtual;
  }

  // Encargos sobre o pró-labore para a PJ no Simples Nacional: 0% 
  // O sócio paga 11% retido, mas não há acréscimo de 31% para a PJ.
  const TAXA_ENCARGOS = 0.00;
  const custoComEncargos = aumentoMensalNecessario * (1 + TAXA_ENCARGOS);

  return {
    mesesParaAdequacao,
    aumentoMensalNecessario,
    folhaBaseAtual,
    folhaTotalMensal,
    custoComEncargos,
  };
}

export function gerarProjecao(
  situacaoAtual: SituacaoAtual,
  plano: PlanoAdequacao,
  dadosMensaisHistorico: DadosMensais[]
): ProjecaoMes[] {
  const projecao: ProjecaoMes[] = [];
  let folhaAcumulada = situacaoAtual.folha12;
  
  const aliquotaAnexoIII = calcularAliquotaEfetivaAnexoIII(situacaoAtual.rbt12);
  const diferencaAliquota = situacaoAtual.aliquotaAtual - aliquotaAnexoIII;
  const economiaMensal = situacaoAtual.receitaMensal * diferencaAliquota;

  for (let i = 0; i < plano.mesesParaAdequacao; i++) {
    const mesAntigoIndex = i % 12;
    const folhaMesAntigo = dadosMensaisHistorico[mesAntigoIndex]?.folha || situacaoAtual.folhaMensal;
    
    folhaAcumulada = folhaAcumulada - folhaMesAntigo + plano.folhaTotalMensal;
    
    const fatorRProjetado = situacaoAtual.rbt12 > 0 ? folhaAcumulada / situacaoAtual.rbt12 : 0;
    const anexoProjetado: 'III' | 'V' = fatorRProjetado >= 0.28 ? 'III' : 'V';
    
    const economiaEstimada = anexoProjetado === 'III' ? economiaMensal : 0;

    const hoje = new Date();
    const mesReferencia = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const mesApuracao = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1);

    projecao.push({
      mes: i + 1,
      mesReferencia: formatarMesAno(mesReferencia),
      mesApuracao: formatarMesAno(mesApuracao),
      folhaBase: plano.folhaBaseAtual,
      aumentoAplicado: plano.aumentoMensalNecessario,
      folhaTotal: plano.folhaTotalMensal,
      folhaAcumulada12m: folhaAcumulada,
      fatorRProjetado,
      anexoProjetado,
      economiaEstimada,
      custoAdequacao: plano.custoComEncargos,
    });
  }

  return projecao;
}

export function calcularROI(
  situacaoAtual: SituacaoAtual,
  plano: PlanoAdequacao,
  projecao: ProjecaoMes[]
): ROI {
  const aliquotaAnexoIII = calcularAliquotaEfetivaAnexoIII(situacaoAtual.rbt12);
  const diferencaAliquota = situacaoAtual.aliquotaAtual - aliquotaAnexoIII;
  const economiaMensal = diferencaAliquota > 0 ? situacaoAtual.receitaMensal * diferencaAliquota : 0;
  const economiaAnual = economiaMensal * 12;
  
  const custoMensalAdequacao = plano.custoComEncargos;
  const paybackMeses = economiaMensal > 0 ? custoMensalAdequacao / economiaMensal : Infinity;
  
  const investimentoTotal = custoMensalAdequacao * plano.mesesParaAdequacao;
  const retornoTotal12Meses = economiaAnual;

  return {
    custoMensalAdequacao,
    economiaMensal,
    economiaAnual,
    paybackMeses,
    investimentoTotal,
    retornoTotal12Meses,
  };
}

export function gerarRecomendacoes(
  analiseCompleta: Omit<AnaliseCompleta, 'recomendacoes' | 'jaOtimizado'>
): string[] {
  const recomendacoes: string[] = [];
  const { analiseGap, roi, projecao } = analiseCompleta;

  if (!analiseGap.viavel) {
    if (analiseGap.mensagemViabilidade) {
      recomendacoes.push(analiseGap.mensagemViabilidade);
    }
    recomendacoes.push('💡 Considere contratar funcionários reais (CLT) ou avaliar estrategicamente a permanência no Anexo V.');
    return recomendacoes;
  }

  if (roi.paybackMeses <= 6) {
    recomendacoes.push('✅ Excelente! O payback é rápido (menos de 6 meses). Recomendamos iniciar imediatamente.');
  } else if (roi.paybackMeses <= 12) {
    recomendacoes.push('✅ Payback aceitável (menos de 1 ano). A adequação é viável e recomendada.');
  } else {
    recomendacoes.push('⚠️ Payback superior a 1 ano. Avalie se a economia compensa no longo prazo.');
  }

  recomendacoes.push(
    `💰 Economia anual estimada: **R$ ${roi.economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**`
  );

  const mesAtinge = projecao.findIndex(p => p.anexoProjetado === 'III') + 1;
  if (mesAtinge > 0) {
    recomendacoes.push(
      `📅 Meta atingida no **mês ${mesAtinge}**. A partir daí, você pagará DAS com alíquota reduzida.`
    );
  }

  recomendacoes.push(
    '⚠️ Lembre-se: a folha de pagamento é considerada com defasagem de 1 mês (folha do mês 11 afeta DAS do mês 12).'
  );
  
  // Dica bônus baseada nas regras de 2026:
  recomendacoes.push(
    '🎯 Dica 2026: Com a isenção do Imposto de Renda para até R$ 5.000, aumentar seu pró-labore até este teto se tornou a estratégia mais rentável e segura para atingir os 28%.'
  );

  return recomendacoes;
}

export function gerarAnaliseCompleta(
  dadosMensais: DadosMensais[],
  mesesParaAdequacao: number = 4
): AnaliseCompleta {
  const situacaoAtual = calcularSituacaoAtual(dadosMensais);
  
  if (situacaoAtual.fatorR >= 0.28) {
    return {
      situacaoAtual,
      analiseGap: { folhaNecessaria: 0, diferencaTotal: 0, percentualAumento: 0, viavel: true },
      planoAdequacao: { mesesParaAdequacao: 0, aumentoMensalNecessario: 0, folhaBaseAtual: situacaoAtual.folhaMensal, folhaTotalMensal: situacaoAtual.folhaMensal, custoComEncargos: 0 },
      projecao: [],
      roi: { custoMensalAdequacao: 0, economiaMensal: 0, economiaAnual: 0, paybackMeses: 0, investimentoTotal: 0, retornoTotal12Meses: 0 },
      recomendacoes: ['✅ Sua empresa já está enquadrada no Anexo III! Mantenha o Fator R acima de 28%.'],
      jaOtimizado: true,
    };
  }

  const analiseGap = analisarGap(situacaoAtual);
  const planoAdequacao = gerarPlanoAdequacao(situacaoAtual, analiseGap, mesesParaAdequacao);
  const projecao = gerarProjecao(situacaoAtual, planoAdequacao, dadosMensais);
  const roi = calcularROI(situacaoAtual, planoAdequacao, projecao);
  
  const analiseParaRecomendacoes = {
    situacaoAtual,
    analiseGap,
    planoAdequacao,
    projecao,
    roi,
  };
  const recomendacoes = gerarRecomendacoes(analiseParaRecomendacoes);

  return {
    situacaoAtual,
    analiseGap,
    planoAdequacao,
    projecao,
    roi,
    recomendacoes,
    jaOtimizado: false,
  };
}

function formatarMesAno(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${mes}/${ano}`;
}