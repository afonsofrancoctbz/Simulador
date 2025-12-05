import React from 'react';
import { TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { CheckCircle2, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface ComparisonTableProps {
  scenarios: TaxDetails[];
}

export function ComparisonTable({ scenarios }: ComparisonTableProps) {
  if (!scenarios || scenarios.length === 0) return null;

  // Encontra o melhor cenário (menor custo mensal)
  // Filtramos o "Lucro Presumido (Regras Atuais)" da recomendação, pois ele é apenas base de comparação
  const scenariosForRanking = scenarios.filter(s => s.regime !== 'Lucro Presumido (Regras Atuais)');
  const bestScenario = scenariosForRanking.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
           <TrendingUp className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Quadro Comparativo de Resultados</h3>
          <p className="text-sm text-slate-500">
            Compare lado a lado o impacto financeiro de cada regime para sua empresa.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[800px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Header da Tabela */}
          <div className="grid grid-flow-col auto-cols-fr bg-slate-50 divide-x divide-slate-200 border-b border-slate-200">
            <div className="p-4 flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">
              Indicadores Financeiros
            </div>
            {scenarios.map((scenario, idx) => {
              const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;
              const isBaseline = scenario.regime === 'Lucro Presumido (Regras Atuais)';
              
              return (
                <div key={idx} className={cn(
                  "p-4 flex flex-col items-center justify-center text-center gap-2 relative min-w-[180px]",
                  isBest ? "bg-blue-50/50" : ""
                )}>
                  {isBest && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
                      Menor Carga Tributária
                    </div>
                  )}
                  <span className={cn(
                    "font-bold text-sm leading-tight",
                    isBest ? "text-blue-700" : "text-slate-700"
                  )}>
                    {scenario.regime.replace(' (Anexo V)', '').replace(' (Fator R Otimizado)', '')}
                  </span>
                  {scenario.regime.includes('Fator R') && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                      Otimizado
                    </span>
                  )}
                  {isBaseline && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      Regra Atual (Sem Reforma)
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Linhas de Dados */}
          <div className="divide-y divide-slate-100">
            {/* Linha: Faturamento */}
            <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex items-center gap-2 text-sm font-medium text-slate-600 min-w-[200px]">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Faturamento Bruto
              </div>
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="p-4 text-center text-sm font-medium text-slate-900 min-w-[180px]">
                  {formatCurrencyBRL(scenario.totalRevenue)}
                </div>
              ))}
            </div>

            {/* Linha: Custo Total (Impostos) */}
            <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex items-center gap-2 text-sm font-medium text-slate-600 min-w-[200px]">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Total de Impostos e Custos
              </div>
              {scenarios.map((scenario, idx) => {
                 const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;
                 return (
                  <div key={idx} className={cn("p-4 text-center text-sm font-bold min-w-[180px]", isBest ? "text-red-600" : "text-slate-700")}>
                    - {formatCurrencyBRL(scenario.totalMonthlyCost)}
                  </div>
                 )
              })}
            </div>

             {/* Linha: Carga Tributária % */}
             <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-4 flex items-center gap-2 text-sm font-medium text-slate-600 min-w-[200px]">
                <Percent className="w-4 h-4 text-slate-400" />
                Carga Tributária Efetiva
              </div>
              {scenarios.map((scenario, idx) => {
                const effectiveRate = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;
                const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;
                
                return (
                  <div key={idx} className="p-4 flex flex-col items-center justify-center min-w-[180px]">
                    <span className={cn("text-sm font-bold", isBest ? "text-blue-700" : "text-slate-700")}>
                      {formatPercent(effectiveRate)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Linha: Receita Líquida (HIGHLIGHT) */}
            <div className="grid grid-flow-col auto-cols-fr divide-x divide-slate-100 bg-slate-50/80">
              <div className="p-5 flex items-center gap-2 text-sm font-bold text-slate-800 min-w-[200px]">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Receita Líquida Estimada
                <span className="text-[10px] font-normal text-slate-400 ml-1">(Aprox.)</span>
              </div>
              {scenarios.map((scenario, idx) => {
                 const netIncome = scenario.totalRevenue - scenario.totalMonthlyCost;
                 const isBest = bestScenario && scenario.regime === bestScenario.regime && scenario.optimizationNote === bestScenario.optimizationNote;

                 return (
                  <div key={idx} className={cn(
                    "p-5 text-center flex flex-col justify-center min-w-[180px]",
                    isBest ? "bg-blue-100/30 ring-inset ring-2 ring-blue-500/20" : ""
                  )}>
                    <span className={cn("text-lg font-extrabold", isBest ? "text-green-700" : "text-slate-600")}>
                      {formatCurrencyBRL(netIncome)}
                    </span>
                    {isBest && (
                      <span className="text-[10px] font-medium text-green-600 mt-1">
                        Melhor Resultado
                      </span>
                    )}
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