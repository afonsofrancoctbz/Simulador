import React from 'react';
import { TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { CheckCircle2, TrendingUp, DollarSign, Percent, ArrowRight } from 'lucide-react';

interface ComparisonTableProps {
  scenarios: TaxDetails[];
  currentYear: number; // Nova prop para ajudar na nomenclatura
}

export function ComparisonTable({ scenarios, currentYear }: ComparisonTableProps) {
  if (!scenarios || scenarios.length === 0) return null;

  // Filtramos o "Lucro Presumido (Regras Atuais)" da recomendação de melhor cenário
  const scenariosForRanking = scenarios.filter(s => s.regime !== 'Lucro Presumido (Regras Atuais)');
  const bestScenario = scenariosForRanking.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];

  // Centralized mapping for regime titles for better maintainability
  const REGIME_TITLES: Record<string, string | ((year: number) => string)> = {
    'Simples Nacional': 'Simples Nacional 2025/26 (Regime Atual)',
    'Simples Nacional (Otimizado)': 'Simples Nacional 2025/26 (Otimizado)',
    'Simples Nacional (Tradicional)': 'Simples Nacional Tradicional 2027/28',
    'Simples Nacional (Híbrido)': 'Simples Nacional Híbrido 2027/28',
    'Lucro Presumido': (year: number) => year >= 2027 ? 'Lucro Presumido 2027/28' : 'Lucro Presumido 2026',
    'Lucro Presumido (Regras Atuais)': 'Lucro Presumido (Regras Atuais)',
  };

  // Function to get the custom column title based on the scenario
  const getCustomTitle = (scenario: TaxDetails) => {
    const titleOrFn = REGIME_TITLES[scenario.regime];
    if (typeof titleOrFn === 'function') {
      return titleOrFn(currentYear);
    }
    return titleOrFn || scenario.regime; // Fallback to the original regime name
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center justify-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
           <TrendingUp className="w-4 h-4" />
           Quadro Comparativo Estratégico
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Confira o resultado da sua simulação</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
            Analise lado a lado o impacto financeiro no regime atual e nos cenários previstos pela Reforma Tributária.
        </p>
      </div>

      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[900px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg">
          {/* Header da Tabela */}
          <div className="grid grid-flow-col auto-cols-fr bg-slate-50 divide-x divide-slate-200 border-b border-slate-200">
            <div className="p-4 flex flex-col justify-center items-center text-center bg-white min-w-[200px]">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Regime Tributário</span>
               <span className="text-sm font-semibold text-slate-700">Cenários Analisados</span>
            </div>
            
            {scenarios.map((scenario, idx) => {
              const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;
              const title = getCustomTitle(scenario);
             
              return (
                <div key={idx} className={cn(
                  "p-4 flex flex-col items-center justify-center text-center gap-2 relative min-w-[200px] transition-colors",
                  isBest ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-50"
                )}>
                  {isBest && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide border-2 border-white">
                      Menor Carga Tributária
                    </div>
                  )}
                  <span className={cn(
                    "font-bold text-sm leading-tight px-2",
                    isBest ? "text-white" : "text-slate-800"
                  )}>
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Linhas de Dados */}
          <div className="divide-y divide-slate-100 text-sm">
            
            {/* Linha: Faturamento */}
            <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex flex-col justify-center items-center text-center min-w-[200px] bg-slate-50/30">
                <span className="font-semibold text-slate-600">Faturamento bruto/mês</span>
              </div>
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="p-4 flex items-center justify-center text-center font-medium text-slate-900 min-w-[200px]">
                  {formatCurrencyBRL(scenario.totalRevenue)}
                </div>
              ))}
            </div>

            {/* Linha: Impostos Totais */}
            <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex flex-col justify-center items-center text-center min-w-[200px] bg-slate-50/30">
                <span className="font-semibold text-slate-600">Imposto total (Faturamento + Folha)</span>
              </div>
              {scenarios.map((scenario, idx) => {
                 const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;
                 return (
                  <div key={idx} className={cn(
                      "p-4 flex items-center justify-center text-center font-bold min-w-[200px]", 
                      isBest ? "text-red-600 bg-blue-50/30" : "text-slate-700"
                  )}>
                    {formatCurrencyBRL(scenario.totalMonthlyCost)}
                  </div>
                 )
              })}
            </div>

             {/* Linha: Carga % */}
             <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex flex-col justify-center items-center text-center min-w-[200px] bg-slate-50/30">
                <span className="font-semibold text-slate-600">Percentual da carga tributária</span>
              </div>
              {scenarios.map((scenario, idx) => {
                const effectiveRate = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;
                const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;
               
                return (
                  <div key={idx} className={cn(
                      "p-4 flex items-center justify-center text-center min-w-[200px]",
                      isBest ? "font-bold text-blue-700 bg-blue-50/30" : "text-slate-700 font-medium"
                  )}>
                    {formatPercent(effectiveRate)}
                  </div>
                );
              })}
            </div>

            {/* Linha: Receita Líquida (HIGHLIGHT) */}
            <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 bg-slate-50/80 border-t border-slate-200">
              <div className="p-5 flex flex-col justify-center items-center text-center min-w-[200px] bg-white border-r border-slate-200">
                <span className="font-bold text-slate-800 text-base">Receita Líquida</span>
                <span className="text-[10px] text-slate-400 mt-1">(Faturamento - Impostos)</span>
              </div>
              {scenarios.map((scenario, idx) => {
                 const netIncome = scenario.totalRevenue - scenario.totalMonthlyCost;
                 const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;

                 return (
                  <div key={idx} className={cn(
                    "p-5 flex items-center justify-center text-center min-w-[200px]",
                    isBest ? "bg-blue-100/50 ring-inset ring-4 ring-blue-500/10" : "bg-white"
                  )}>
                    <span className={cn(
                        "text-xl font-extrabold", 
                        isBest ? "text-green-700" : "text-slate-600"
                    )}>
                      {formatCurrencyBRL(netIncome)}
                    </span>
                  </div>
                 )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}