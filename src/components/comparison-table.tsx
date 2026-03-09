"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TaxDetails, TaxFormValues, CnaeItem } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { TrendingUp, Trophy, CalendarRange, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { calculateTaxes2026 } from '@/lib/calculations-2026';
import { Button } from './ui/button';

interface ComparisonTableProps {
  currentYear: number;
  formValues: TaxFormValues;
}

interface ColumnData {
  year: number;
  type: 'SN' | 'LP';
  label: string;
  details: TaxDetails;
  isBestOfYear: boolean;
  isCurrentYear: boolean;
}

export function ComparisonTable({ currentYear, formValues }: ComparisonTableProps) {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  // Estado para controlar a expansão dos detalhes de impostos
  const [expandedTaxDetails, setExpandedTaxDetails] = useState(false);

  useEffect(() => {
    if (!formValues || !formValues.year || currentYear < 2026) return;

    // 1. Definição dos Anos
    const yearsToProject = [currentYear, currentYear + 1, currentYear + 2].filter(y => y <= 2033);
    const newColumns: ColumnData[] = [];

    // 2. Preparação dos Dados de Atividade (Fixo para todos os anos)
    const domesticActivities: CnaeItem[] = (formValues.selectedCnaes || [])
        .filter(c => (c.domesticRevenue || 0) > 0)
        .map(c => ({
            code: c.code,
            revenue: c.domesticRevenue || 0,
            cClassTrib: c.cClassTrib,
            nbsCode: c.nbsCode
        }));

    const exportActivities: CnaeItem[] = (formValues.selectedCnaes || [])
        .filter(c => (c.exportRevenue || 0) > 0)
        .map(c => ({
            code: c.code,
            revenue: c.exportRevenue || 0,
            cClassTrib: c.cClassTrib,
            nbsCode: c.nbsCode
        }));

    // 3. Loop de Cálculo (Garante isolamento de escopo por ano)
    yearsToProject.forEach(year => {
      // Clona profundamente para evitar referência cruzada
      const yearValues: TaxFormValues = JSON.parse(JSON.stringify({ 
          ...formValues, 
          year, // Força o ano correto para este loop
          domesticActivities,
          exportActivities
      }));

      // Chama o motor de cálculo. O motor deve usar 'yearValues.year' para buscar a tabela de transição.
      const results = calculateTaxes2026(yearValues);
      
      if (!results || !results.lucroPresumido) return;

      // 4. Seleção do Melhor Simples Nacional
      const simplesOptions = [
        results.simplesNacionalTradicional,
        results.simplesNacionalHibrido,
        results.simplesNacionalOtimizado,
        results.simplesNacionalOtimizadoHibrido
      ].filter((s): s is NonNullable<typeof s> => s !== null);

      // Ordena: Menor Imposto (totalTax) vence
      const bestSimples = simplesOptions.sort((a, b) => a.totalTax - b.totalTax)[0];
      const lucroPresumido = results.lucroPresumido;

      if (!bestSimples) return;

      // 5. Comparação Final (Vencedor do Ano)
      const winnerType = bestSimples.totalTax < lucroPresumido.totalTax ? 'SN' : 'LP';

      // Nomes amigáveis
      let simplesName = 'SN (Tradicional)';
      if (bestSimples.regime.includes('Otimizado')) simplesName = 'SN (Fator R)';
      else if (bestSimples.regime.includes('Híbrido')) simplesName = 'SN (Híbrido)';

      // Adiciona Coluna Simples (Sempre à Esquerda)
      newColumns.push({
        year,
        type: 'SN',
        label: simplesName,
        details: bestSimples,
        isBestOfYear: winnerType === 'SN',
        isCurrentYear: year === currentYear
      });

      // Adiciona Coluna Lucro Presumido (Sempre à Direita)
      newColumns.push({
        year,
        type: 'LP',
        label: 'Lucro Presumido',
        details: lucroPresumido,
        isBestOfYear: winnerType === 'LP',
        isCurrentYear: year === currentYear
      });
    });

    setColumns(newColumns);
  }, [formValues, currentYear]);

  // Extrai e agrupa os nomes dos impostos (Folha vs Faturamento)
  const groupedTaxNames = useMemo(() => {
    const groups: Record<string, Set<string>> = {
      'Impostos s/ Faturamento': new Set(),
      'Encargos s/ Folha': new Set()
    };

    columns.forEach(col => {
      col.details.breakdown.forEach(item => {
        const nameLower = item.name.toLowerCase();
        // Identifica se é encargo de folha/sócio
        if (nameLower.includes('inss') || nameLower.includes('cpp') || nameLower.includes('irrf')) {
          groups['Encargos s/ Folha'].add(item.name);
        } else {
          groups['Impostos s/ Faturamento'].add(item.name);
        }
      });
    });

    return [
      { category: 'Impostos s/ Faturamento', items: Array.from(groups['Impostos s/ Faturamento']).sort() },
      { category: 'Encargos s/ Folha', items: Array.from(groups['Encargos s/ Folha']).sort() }
    ].filter(g => g.items.length > 0);
  }, [columns]);

  if (columns.length === 0) return null;

  const gridStyle = { gridTemplateColumns: `minmax(120px, 1.5fr) repeat(${columns.length}, minmax(0, 1fr))` };
  const yearsHeader = Array.from(new Set(columns.map(c => c.year)));
  const lastYear = yearsHeader[yearsHeader.length - 1];

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wide">
           <TrendingUp className="w-3 h-3" />
           Análise Progressiva
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Evolução: {currentYear} a {lastYear}</h3>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            Comparativo ano a ano entre a melhor opção do Simples Nacional e o Lucro Presumido.
        </p>
      </div>

      <div className="overflow-x-auto pb-4 px-1 print-remove-overflow print:overflow-visible print:px-0">
        <div className="min-w-[1000px] md:min-w-full print:min-w-0 print:w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ring-1 ring-slate-900/5 print-safe-table print:shadow-none print:ring-0 print:text-[10px]">
          
          {/* SUPER HEADER (ANOS) */}
          <div className="grid divide-x divide-slate-200 border-b border-slate-200 bg-slate-100/80" 
               style={{ gridTemplateColumns: `minmax(120px, 1.5fr) repeat(${yearsHeader.length}, 1fr)` }}>
             <div className="p-3 flex items-center justify-center font-bold text-xs text-slate-400 uppercase tracking-widest bg-slate-100/50">
                ANO BASE
             </div>
             {yearsHeader.map(year => (
                <div key={year} className="p-2 text-center font-bold text-lg flex items-center justify-center gap-2 text-slate-600">
                    <CalendarRange className="w-4 h-4 opacity-50" /> {year}
                </div>
             ))}
          </div>

          {/* HEADER (REGIMES + VENCEDOR) */}
          <div className="grid divide-x divide-slate-100 border-b border-slate-200" style={gridStyle}>
            <div className="p-3 flex items-center justify-center font-bold text-xs text-slate-400 uppercase tracking-widest bg-white">
               INDICADORES
            </div>
            {columns.map((col, idx) => (
              <div key={idx} className={cn(
                  "relative flex flex-col items-center justify-center py-4 px-1 text-center transition-colors",
                  col.isBestOfYear ? "bg-blue-600 text-white" : "bg-white text-slate-700"
              )}>
                {col.isBestOfYear && (
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10 border border-yellow-500/20">
                        <Trophy className="w-3 h-3" /> Recomendado
                     </div>
                )}
                <span className="font-bold text-xs leading-snug">
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          {/* FATURAMENTO */}
          <div className="grid divide-x divide-slate-100 hover:bg-slate-50/30 transition-colors border-b border-slate-100" style={gridStyle}>
            <div className="p-3 flex items-center justify-start pl-6 text-slate-500 font-bold bg-slate-50/20 text-xs uppercase tracking-wide">
              Faturamento
            </div>
            {columns.map((col, idx) => (
              <div key={idx} className="p-3 flex items-center justify-center font-medium text-slate-600">
                {formatCurrencyBRL(col.details.totalRevenue)}
              </div>
            ))}
          </div>

          {/* IMPOSTO TOTAL (COM TOGGLE) */}
          <div className={cn(
              "grid divide-x divide-slate-100 transition-colors border-b border-slate-100 relative group",
              expandedTaxDetails ? "bg-slate-50" : "hover:bg-slate-50/30"
            )} style={gridStyle}>
            
            <div className="p-2 flex items-center justify-between pl-4 bg-slate-50/20 cursor-pointer hover:bg-slate-100/50 transition-colors"
                 onClick={() => setExpandedTaxDetails(!expandedTaxDetails)}>
              <div className="flex flex-col justify-center">
                <span className="text-slate-700 font-bold text-xs uppercase tracking-wide">Imposto Total</span>
                <span className="text-[9px] text-slate-400 font-normal">Só Tributos</span>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400">
                  {expandedTaxDetails ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </Button>
            </div>

            {columns.map((col, idx) => (
              <div key={idx} className={cn("p-3 flex items-center justify-center font-bold", col.isBestOfYear ? "text-red-600" : "text-slate-400")}>
                  {formatCurrencyBRL(col.details.totalTax)}
              </div>
            ))}
          </div>

          {/* --- DETALHAMENTO EXPANDIDO (AGORA AGRUPADO) --- */}
          {expandedTaxDetails && (
            <div className="bg-slate-50/50 shadow-inner border-b border-slate-200 animate-in slide-in-from-top-2 duration-300 pb-2">
                {groupedTaxNames.map((group, groupIdx) => (
                    <React.Fragment key={groupIdx}>
                        {/* Cabçalho do Grupo (ex: IMPOSTOS S/ FATURAMENTO) */}
                        <div className="bg-slate-100/60 border-y border-slate-200/50 p-2 pl-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 first:mt-0">
                            {group.category}
                        </div>
                        {/* Itens do Grupo */}
                        {group.items.map((taxName, rowIndex) => (
                            <div key={rowIndex} className="grid divide-x divide-slate-100/50 border-b border-slate-100 last:border-0 hover:bg-slate-100/50" style={gridStyle}>
                                <div className="p-2 pl-8 flex items-center text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                                    {taxName}
                                </div>
                                {columns.map((col, colIndex) => {
                                    const taxItem = col.details.breakdown.find(b => b.name === taxName);
                                    return (
                                        <div key={colIndex} className="p-2 flex items-center justify-center text-xs text-slate-600">
                                            {taxItem ? formatCurrencyBRL(taxItem.value) : '-'}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
          )}

          {/* ALÍQUOTA REAL */}
          <div className="grid divide-x divide-slate-100 hover:bg-slate-50/30 transition-colors border-b border-slate-100" style={gridStyle}>
             <div className="p-3 flex items-center justify-start pl-6 text-slate-500 font-bold bg-slate-50/20 text-xs uppercase tracking-wide">
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

          {/* RECEITA LÍQUIDA */}
          <div className="grid divide-x divide-slate-100 bg-white" style={gridStyle}>
             <div className="p-4 flex flex-col justify-center pl-6 bg-white">
              <span className="text-slate-800 font-bold text-xs uppercase tracking-wide">Receita Líquida</span>
              <span className="text-[9px] text-slate-400 font-normal">Em Caixa</span>
            </div>
            {columns.map((col, idx) => {
               // Receita Líquida = Faturamento - Imposto - Mensalidade
               const net = col.details.totalRevenue - col.details.totalMonthlyCost;
               return (
                  <div key={idx} className={cn("p-4 flex flex-col items-center justify-center relative", col.isBestOfYear ? "bg-green-50/30" : "bg-white")}>
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
    </div>
  );
}