/**
 * @fileOverview Lógica completa de análise e adequação do Fator R para empresas em migração
 * 
 * Esta é a lógica CRÍTICA que estava faltando no simulador.
 * Calcula como a empresa pode se enquadrar no Fator R de 28% e migrar para o Anexo III.
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
  custoComEncargos: number;     // Custo mensal incluindo encargos (31%)
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
  // 1. Validação de Segurança (Evita quebrar se o array vier vazio)
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

  // 2. CORREÇÃO DO ERRO "sum is not defined"
  // Usamos 'acc' (acumulador) em vez de tentar chamar uma função sum() inexistente
  const rbt12 = dadosMensais.reduce((acc, item) => acc + (item.receita || 0), 0);
  const folha12 = dadosMensais.reduce((acc, item) => acc + (item.folha || 0), 0);
  
  // Evita divisão por zero
  const fatorR = rbt12 > 0 ? folha12 / rbt12 : 0;
  
  // Define o anexo baseado no Fator R
  const anexo: 'III' | 'V' = fatorR >= 0.28 ? 'III' : 'V';
  
  // Calcula alíquota efetiva estimada
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

/**
 * Calcula a alíquota efetiva do Anexo III (tabela progressiva)
 */
function calcularAliquotaEfetivaAnexoIII(rbt12: number): number {
  // Tabela do Simples Nacional - Anexo III (simplificada)
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

/**
 * Calcula a alíquota efetiva do Anexo V (tabela progressiva)
 */
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
 * Analisa o GAP necessário para atingir Fator R de 28%
 */
export function analisarGap(situacaoAtual: SituacaoAtual): AnaliseGap {
  const folhaNecessaria = situacaoAtual.rbt12 * 0.28;
  const diferencaTotal = situacaoAtual.folha12 > 0 ? Math.max(0, folhaNecessaria - situacaoAtual.folha12) : folhaNecessaria;
  const percentualAumento = situacaoAtual.folha12 > 0 ? (diferencaTotal / situacaoAtual.folha12) * 100 : Infinity;
  
  // Valida viabilidade (aumentos acima de 500% são questionáveis)
  const viavel = percentualAumento <= 500;
  let mensagemViabilidade;

  if (!viavel) {
    mensagemViabilidade = 
      `⚠️ Aumento de ${percentualAumento.toFixed(0)}% pode não ser viável economicamente. ` +
      `Considere contratar funcionários reais ou avaliar se vale a pena permanecer no Anexo V.`;
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
 * Gera um plano de adequação para X meses
 */
export function gerarPlanoAdequacao(
  situacaoAtual: SituacaoAtual,
  analiseGap: AnaliseGap,
  mesesParaAdequacao: number
): PlanoAdequacao {
  if (mesesParaAdequacao <= 0) mesesParaAdequacao = 1;
  const aumentoMensalNecessario = analiseGap.diferencaTotal / mesesParaAdequacao;
  const folhaBaseAtual = situacaoAtual.folhaMensal;
  const folhaTotalMensal = folhaBaseAtual + aumentoMensalNecessario;
  
  // Encargos sobre a folha: INSS Patronal (20%) + FGTS (8%) + RAT (3%) = 31%
  const TAXA_ENCARGOS = 0.31;
  const custoComEncargos = aumentoMensalNecessario * (1 + TAXA_ENCARGOS);

  return {
    mesesParaAdequacao,
    aumentoMensalNecessario,
    folhaBaseAtual,
    folhaTotalMensal,
    custoComEncargos,
  };
}

/**
 * Gera a projeção mês a mês considerando a janela móvel de 12 meses
 * CRÍTICO: A cada mês, um mês antigo SAI do cálculo e um novo ENTRA
 */
export function gerarProjecao(
  situacaoAtual: SituacaoAtual,
  plano: PlanoAdequacao,
  dadosMensaisHistorico: DadosMensais[]
): ProjecaoMes[] {
  const projecao: ProjecaoMes[] = [];
  let folhaAcumulada = situacaoAtual.folha12;
  
  // Economia estimada ao migrar para Anexo III
  const aliquotaAnexoIII = calcularAliquotaEfetivaAnexoIII(situacaoAtual.rbt12);
  const diferencaAliquota = situacaoAtual.aliquotaAtual - aliquotaAnexoIII;
  const economiaMensal = situacaoAtual.receitaMensal * diferencaAliquota;

  for (let i = 0; i < plano.mesesParaAdequacao; i++) {
    // Remove a folha do mês mais antigo (janela móvel)
    const mesAntigoIndex = i % 12;
    const folhaMesAntigo = dadosMensaisHistorico[mesAntigoIndex]?.folha || situacaoAtual.folhaMensal;
    
    // Calcula nova folha acumulada
    folhaAcumulada = folhaAcumulada - folhaMesAntigo + plano.folhaTotalMensal;
    
    // Calcula novo Fator R
    const fatorRProjetado = situacaoAtual.rbt12 > 0 ? folhaAcumulada / situacaoAtual.rbt12 : 0;
    const anexoProjetado: 'III' | 'V' = fatorRProjetado >= 0.28 ? 'III' : 'V';
    
    // Calcula economia (só começa a economizar quando atingir Anexo III)
    const economiaEstimada = anexoProjetado === 'III' ? economiaMensal : 0;

    // Gera datas (exemplo - ajuste conforme sua lógica de datas)
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

/**
 * Calcula o ROI (Retorno sobre Investimento) da adequação
 */
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

/**
 * Gera recomendações personalizadas
 */
export function gerarRecomendacoes(
  analiseCompleta: Omit<AnaliseCompleta, 'recomendacoes' | 'jaOtimizado'>
): string[] {
  const recomendacoes: string[] = [];
  const { analiseGap, roi, projecao } = analiseCompleta;

  // Verifica viabilidade
  if (!analiseGap.viavel) {
    recomendacoes.push(analiseGap.mensagemViabilidade!);
    recomendacoes.push('💡 Considere contratar funcionários CLT em vez de aumentar apenas o pró-labore.');
    return recomendacoes;
  }

  // Verifica payback
  if (roi.paybackMeses <= 6) {
    recomendacoes.push('✅ Excelente! O payback é rápido (menos de 6 meses). Recomendamos iniciar imediatamente.');
  } else if (roi.paybackMeses <= 12) {
    recomendacoes.push('✅ Payback aceitável (menos de 1 ano). A adequação é viável e recomendada.');
  } else {
    recomendacoes.push('⚠️ Payback superior a 1 ano. Avalie se a economia compensa no longo prazo.');
  }

  // Economia anual
  recomendacoes.push(
    `💰 Economia anual estimada: **R$ ${roi.economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**`
  );

  // Quando atinge objetivo
  const mesAtinge = projecao.findIndex(p => p.anexoProjetado === 'III') + 1;
  if (mesAtinge > 0) {
    recomendacoes.push(
      `📅 Meta atingida no **mês ${mesAtinge}**. A partir daí, você pagará DAS com alíquota reduzida.`
    );
  }

  // Lembrete sobre defasagem
  recomendacoes.push(
    '⚠️ Lembre-se: a folha de pagamento é considerada com defasagem de 1 mês (folha do mês 11 afeta DAS do mês 12).'
  );

  return recomendacoes;
}

/**
 * FUNÇÃO PRINCIPAL: Gera análise completa de adequação
 */
export function gerarAnaliseCompleta(
  dadosMensais: DadosMensais[],
  mesesParaAdequacao: number = 4
): AnaliseCompleta {
  // 1. Calcula situação atual
  const situacaoAtual = calcularSituacaoAtual(dadosMensais);
  
  // 2. VERIFICAÇÃO DE SUCESSO IMEDIATO
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

  // 3. Analisa o GAP
  const analiseGap = analisarGap(situacaoAtual);
  
  // 4. Gera plano de adequação
  const planoAdequacao = gerarPlanoAdequacao(situacaoAtual, analiseGap, mesesParaAdequacao);
  
  // 5. Gera projeção mês a mês
  const projecao = gerarProjecao(situacaoAtual, planoAdequacao, dadosMensais);
  
  // 6. Calcula ROI
  const roi = calcularROI(situacaoAtual, planoAdequacao, projecao);
  
  // 7. Gera recomendações
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

/**
 * Função auxiliar para formatar datas
 */
function formatarMesAno(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${mes}/${ano}`;
}

    