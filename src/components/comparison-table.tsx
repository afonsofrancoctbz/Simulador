import React from 'react';
import { TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { TrendingUp, Trophy, AlertCircle } from 'lucide-react';

interface ComparisonTableProps {
  scenarios: TaxDetails[];
  currentYear: number;
}

export function ComparisonTable({ scenarios, currentYear }: ComparisonTableProps) {
  if (!scenarios || scenarios.length === 0) return null;

  // 1. FILTRAGEM ESTRATÉGICA
  const visibleScenarios = scenarios.filter(s => {
    // Remove regra redundante do LP
    if (s.regime === 'Lucro Presumido (Regras Atuais)') return false;
    // Remove "Simples Nacional" genérico se não tiver estratégia definida
    if (s.regime === 'Simples Nacional' && scenarios.some(o => o.regime.includes('Otimizado'))) return false;
    return true;
  });

  // 2. ORDENAÇÃO PERSONALIZADA
  const sortOrder = [
    'Otimizado', // 1º
    'Tradicional', // 2º
    'Híbrido', // 3º
    'Lucro Presumido' // 4º
  ];

  const sortedScenarios = [...visibleScenarios].sort((a, b) => {
    const indexA = sortOrder.findIndex(key => a.regime.includes(key));
    const indexB = sortOrder.findIndex(key => b.regime.includes(key));
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  // Encontra o vencedor (Menor Custo) para destacar
  const bestScenario = [...sortedScenarios].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];

  // 3. TÍTULOS DINÂMICOS (CORREÇÃO DO ANO)
  const getCustomTitle = (regime: string) => {
    // Simples Otimizado geralmente é a base de comparação (Regras Atuais/Fator R)
    if (regime.includes('Otimizado') || regime.includes('Fator R')) {
        return 'Simples Nacional (Fator R Otimizado)';
    }

    // Para os demais, usamos o currentYear dinamicamente para evitar o erro "2027/28" em 2033
    const yearLabel = currentYear >= 2027 ? currentYear : '2027/28'; // Fallback ou ano exato

    if (regime.includes('Tradicional')) return `Simples Nacional Tradicional ${currentYear}`;
    if (regime.includes('Híbrido')) return `Simples Nacional Híbrido ${currentYear}`;
    if (regime.includes('Lucro Presumido')) return `Lucro Presumido ${currentYear}`;
    
    return regime;
  };

  // Configuração do Grid: 1 coluna fixa (200px) + Colunas dinâmicas iguais
  const gridStyle = {
    gridTemplateColumns: `200px repeat(${sortedScenarios.length}, minmax(0, 1fr))`
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Cabeçalho da Seção */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wide">
           <TrendingUp className="w-3 h-3" />
           Quadro Comparativo
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Resultado da Simulação</h3>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            Compare o cenário atual com as projeções para o ano de <strong>{currentYear}</strong>.
        </p>
      </div>

      <div className="overflow-x-auto pb-6 px-1">
        <div className="min-w-[900px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
          
          {/* --- CABEÇALHO DA TABELA --- */}
          <div className="grid divide-x divide-slate-100 border-b border-slate-200 bg-slate-50/50" style={gridStyle}>
            {/* Célula Vazia do Canto */}
            <div className="p-4 flex items-center justify-center font-bold text-xs text-slate-400 uppercase tracking-widest bg-slate-50">
               Indicadores
            </div>

            {/* Colunas dos Cenários */}
            {sortedScenarios.map((scenario, idx) => {
              const isBest = bestScenario && scenario.regime === bestScenario.regime;
              const title = getCustomTitle(scenario.regime);

              return (
                <div key={idx} className={cn(
                  "relative flex flex-col items-center justify-start pt-6 pb-4 px-2 text-center group transition-colors",
                  isBest ? "bg-blue-600" : "bg-white hover:bg-slate-50"
                )}>
                  {/* Badge de Melhor Opção */}
                  <div className="h-6 mb-2 w-full flex justify-center items-center">
                    {isBest && (
                        <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm border border-white/20">
                            <Trophy className="w-3 h-3 text-yellow-300" />
                            Melhor Opção
                        </span>
                    )}
                  </div>

                  <span className={cn(
                    "font-bold text-sm leading-snug max-w-[160px]",
                    isBest ? "text-white" : "text-slate-700"
                  )}>
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* --- LINHAS DE DADOS --- */}
          <div className="divide-y divide-slate-100 text-sm">
            
            {/* Linha 1: Faturamento */}
            <div className="grid divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors" style={gridStyle}>
              <div className="p-4 flex items-center justify-start pl-6 text-slate-600 font-semibold bg-slate-50/30">
                Faturamento Mensal
              </div>
              {sortedScenarios.map((scenario, idx) => (
                <div key={idx} className="p-4 flex items-center justify-center font-medium text-slate-700">
                  {formatCurrencyBRL(scenario.totalRevenue)}
                </div>
              ))}
            </div>

            {/* Linha 2: Imposto Total */}
            <div className="grid divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors" style={gridStyle}>
              <div className="p-4 flex flex-col justify-center pl-6 bg-slate-50/30">
                <span className="text-slate-600 font-semibold">Imposto Total</span>
                <span className="text-[10px] text-slate-400">DAS + Folha + Outros</span>
              </div>
              {sortedScenarios.map((scenario, idx) => {
                 const isBest = bestScenario && scenario.regime === bestScenario.regime;
                 return (
                    <div key={idx} className={cn(
                        "p-4 flex items-center justify-center font-bold",
                        isBest ? "text-red-100 bg-blue-600/5" : "text-slate-700"
                    )}>
                        <span className={cn(isBest ? "text-red-600" : "text-slate-700")}>
                            {formatCurrencyBRL(scenario.totalMonthlyCost)}
                        </span>
                    </div>
                 )
              })}
            </div>

            {/* Linha 3: Alíquota Efetiva */}
            <div className="grid divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors" style={gridStyle}>
               <div className="p-4 flex items-center justify-start pl-6 text-slate-600 font-semibold bg-slate-50/30">
                Alíquota Efetiva
              </div>
              {sortedScenarios.map((scenario, idx) => {
                 const effectiveRate = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;
                 const isBest = bestScenario && scenario.regime === bestScenario.regime;
                 return (
                    <div key={idx} className={cn(
                        "p-4 flex items-center justify-center font-medium",
                        isBest ? "text-blue-700 bg-blue-50/30 font-bold" : "text-slate-600"
                    )}>
                        {formatPercent(effectiveRate)}
                    </div>
                 )
              })}
            </div>

            {/* Linha 4: RECEITA LÍQUIDA */}
            <div className="grid divide-x divide-slate-100 bg-white" style={gridStyle}>
               <div className="p-5 flex flex-col justify-center pl-6 border-t border-slate-200 bg-white">
                <span className="text-slate-800 font-bold text-base">Receita Líquida</span>
                <span className="text-[10px] text-slate-400">Disponível em caixa</span>
              </div>
              {sortedScenarios.map((scenario, idx) => {
                 const netIncome = scenario.totalRevenue - scenario.totalMonthlyCost;
                 const isBest = bestScenario && scenario.regime === bestScenario.regime;

                 return (
                    <div key={idx} className={cn(
                        "p-5 flex flex-col items-center justify-center border-t relative transition-all",
                        isBest ? "bg-blue-50 border-blue-200" : "border-slate-200 bg-white"
                    )}>
                         {isBest && <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-500"></div>}
                        
                         <span className={cn(
                            "text-lg font-extrabold tracking-tight",
                            isBest ? "text-green-600" : "text-slate-500"
                         )}>
                            {formatCurrencyBRL(netIncome)}
                         </span>
                         
                         {/* REMOVIDO: A palavra "Vencedor" foi retirada conforme solicitado */}
                    </div>
                 )
              })}
            </div>

          </div>
        </div>
        
        {/* Legenda Rodapé */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-3 h-3" />
            <span>Valores estimados com base nas regras de transição vigentes no ano selecionado.</span>
        </div>
      </div>
    </div>
  );
}