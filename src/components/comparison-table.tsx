"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { TaxDetails, TaxFormValues } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { TrendingUp, Trophy, AlertCircle, CalendarRange, ArrowRight } from 'lucide-react';
import { calculateTaxes2026 } from '@/lib/calculations-2026';

interface ComparisonTableProps {
  currentYear: number;
  formValues: TaxFormValues;
}

interface ColumnData {
  year: number;
  type: 'SN' | 'LP'; // Simples Nacional ou Lucro Presumido
  label: string;
  details: TaxDetails;
  isBestOfYear: boolean;
  isCurrentYear: boolean;
}

export function ComparisonTable({ currentYear, formValues }: ComparisonTableProps) {
  const [columns, setColumns] = useState<ColumnData[]>([]);

  useEffect(() => {
    if (!formValues || !formValues.year || currentYear < 2026) {
        setColumns([]);
        return;
    };

    // Define os 3 anos: Atual, +1, +2 (Limitado a 2033)
    const yearsToProject = [currentYear, currentYear + 1, currentYear + 2].filter(y => y <= 2033);
    const newColumns: ColumnData[] = [];

    yearsToProject.forEach(year => {
      const yearValues = { ...formValues, year };
      const results = calculateTaxes2026(yearValues); // Roda o motor para o ano específico
      
      if (!results || !results.lucroPresumido) return;

      // 1. Encontra o MELHOR Simples Nacional deste ano (Menor Imposto Puro)
      const simplesOptions = [
        results.simplesNacionalTradicional,
        results.simplesNacionalHibrido,
        results.simplesNacionalOtimizado,
        results.simplesNacionalOtimizadoHibrido
      ].filter((s): s is NonNullable<typeof s> => s !== null);

      // Ordena pelo totalTax (Carga Tributária) para pegar o mais barato
      const bestSimples = simplesOptions.sort((a, b) => a.totalTax - b.totalTax)[0];
      const lucroPresumido = results.lucroPresumido;

      if (!bestSimples) return;

      // Define quem ganha neste ano
      const winner = bestSimples.totalTax < lucroPresumido.totalTax ? 'SN' : 'LP';

      // Formata nome curto do Simples
      let simplesName = 'Simples Nac.';
      if (bestSimples.regime.includes('Otimizado')) simplesName = 'SN (Fator R)';
      else if (bestSimples.regime.includes('Híbrido')) simplesName = 'SN (Híbrido)';
      else if (bestSimples.regime.includes('Tradicional')) simplesName = 'SN (Tradicional)';

      // Adiciona Coluna Simples
      newColumns.push({
        year,
        type: 'SN',
        label: simplesName,
        details: bestSimples,
        isBestOfYear: winner === 'SN',
        isCurrentYear: year === currentYear
      });

      // Adiciona Coluna Lucro Presumido
      newColumns.push({
        year,
        type: 'LP',
        label: 'Lucro Presumido',
        details: lucroPresumido,
        isBestOfYear: winner === 'LP',
        isCurrentYear: year === currentYear
      });
    });

    setColumns(newColumns);
  }, [formValues, currentYear]);

  if (columns.length === 0) return null;

  // Configuração do Grid: 1 Coluna fixa (Rótulos) + N Colunas de dados
  // Ex: 200px + 6 colunas iguais
  const gridStyle = { gridTemplateColumns: `200px repeat(${columns.length}, minmax(0, 1fr))` };
  
  // Agrupamento para o Header de Anos (Super Header)
  // Cada ano ocupa 2 colunas no grid
  const yearsHeader = Array.from(new Set(columns.map(c => c.year)));

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Título da Seção */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wide">
           <TrendingUp className="w-3 h-3" />
           Análise Progressiva
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Evolução: {yearsHeader[0]} a {yearsHeader[yearsHeader.length - 1]}</h3>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            Comparativo ano a ano entre a melhor opção do Simples Nacional e o Lucro Presumido.
        </p>
      </div>

      <div className="overflow-x-auto pb-4 px-1">
        <div className="min-w-[1000px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
          
          {/* --- SUPER HEADER (ANOS) --- */}
          <div className="grid divide-x divide-slate-200 border-b border-slate-200 bg-slate-100/80" 
               style={{ gridTemplateColumns: `200px repeat(${yearsHeader.length}, 1fr)` }}>
             <div className="p-3 flex items-center justify-center font-bold text-xs text-slate-400 uppercase tracking-widest">
                Ano Base
             </div>
             {yearsHeader.map(year => (
                <div key={year} className={cn(
                    "p-2 text-center font-bold text-lg flex items-center justify-center gap-2",
                    year === currentYear ? "text-blue-700 bg-blue-50/50" : "text-slate-600"
                )}>
                    <CalendarRange className="w-4 h-4 opacity-50" /> {year}
                </div>
             ))}
          </div>

          {/* --- HEADER (REGIMES) --- */}
          <div className="grid divide-x divide-slate-100 border-b border-slate-200 bg-slate-50/30" style={gridStyle}>
            <div className="p-3 flex items-center justify-center font-bold text-xs text-slate-400 uppercase tracking-widest">
               Indicadores
            </div>
            {columns.map((col, idx) => (
              <div key={idx} className={cn(
                  "relative flex flex-col items-center justify-start pt-4 pb-3 px-1 text-center group transition-colors",
                  col.isBestOfYear ? (col.isCurrentYear ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-900") : "bg-white text-slate-500"
              )}>
                {col.isBestOfYear && (
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" /> VENCEDOR
                     </div>
                )}
                <span className={cn("font-bold text-xs leading-snug", col.isBestOfYear && col.isCurrentYear ? "text-white" : "text-slate-700")}>
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          {/* --- DADOS --- */}
          <div className="divide-y divide-slate-100 text-sm">
            
            {/* Linha 1: Faturamento */}
            <div className="grid divide-x divide-slate-100 hover:bg-slate-50/30 transition-colors" style={gridStyle}>
              <div className="p-3 flex items-center justify-start pl-6 text-slate-600 font-semibold bg-slate-50/30 text-xs uppercase tracking-wide">
                Faturamento
              </div>
              {columns.map((col, idx) => (
                <div key={idx} className="p-3 flex items-center justify-center font-medium text-slate-600">
                  {formatCurrencyBRL(col.details.totalRevenue)}
                </div>
              ))}
            </div>

            {/* Linha 2: Imposto Total (SEM MENSALIDADE) */}
            <div className="grid divide-x divide-slate-100 hover:bg-slate-50/30 transition-colors" style={gridStyle}>
              <div className="p-3 flex flex-col justify-center pl-6 bg-slate-50/30">
                <span className="text-slate-700 font-bold text-xs uppercase tracking-wide">Imposto Total</span>
                <span className="text-[9px] text-slate-400 font-normal">Só Tributos</span>
              </div>
              {columns.map((col, idx) => (
                <div key={idx} className={cn("p-3 flex items-center justify-center font-bold", col.isBestOfYear ? "text-red-600 bg-red-50/10" : "text-slate-400")}>
                    {formatCurrencyBRL(col.details.totalTax)}
                </div>
              ))}
            </div>

            {/* Linha 3: Carga Real */}
            <div className="grid divide-x divide-slate-100 hover:bg-slate-50/30 transition-colors" style={gridStyle}>
               <div className="p-3 flex items-center justify-start pl-6 text-slate-600 font-semibold bg-slate-50/30 text-xs uppercase tracking-wide">
                Alíquota Real
              </div>
              {columns.map((col, idx) => {
                 const rate = col.details.totalRevenue > 0 ? col.details.totalTax / col.details.totalRevenue : 0;
                 return (
                    <div key={idx} className={cn("p-3 flex items-center justify-center font-medium", col.isBestOfYear ? "text-blue-700" : "text-slate-400")}>
                        {formatPercent(rate)}
                    </div>
                 )
              })}
            </div>

            {/* Linha 4: Receita Líquida */}
            <div className="grid divide-x divide-slate-100 bg-white" style={gridStyle}>
               <div className="p-4 flex flex-col justify-center pl-6 border-t border-slate-200 bg-white">
                <span className="text-slate-800 font-bold text-xs uppercase tracking-wide">Receita Líquida</span>
                <span className="text-[9px] text-slate-400 font-normal">Em Caixa</span>
              </div>
              {columns.map((col, idx) => {
                 // Receita Líquida = Faturamento - Imposto - Mensalidade
                 const net = col.details.totalRevenue - col.details.totalMonthlyCost;
                 return (
                    <div key={idx} className={cn("p-4 flex flex-col items-center justify-center border-t relative", col.isBestOfYear ? "bg-green-50/30" : "bg-white")}>
                         {col.isBestOfYear && <div className="absolute inset-x-0 top-0 h-[2px] bg-green-500"></div>}
                         <span className={cn("text-sm font-extrabold tracking-tight", col.isBestOfYear ? "text-green-700" : "text-slate-400")}>
                            {formatCurrencyBRL(net)}
                         </span>
                    </div>
                 )
              })}
            </div>

          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ArrowRight className="w-3 h-3" />
            <span>A tabela exibe automaticamente o <strong>Melhor Cenário do Simples Nacional</strong> contra o <strong>Lucro Presumido</strong> para cada ano.</span>
        </div>
      </div>
    </div>
  );
}
    