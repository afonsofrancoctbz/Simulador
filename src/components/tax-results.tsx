"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, BadgeInfo, ChevronsUpDown } from 'lucide-react';
import { type CalculationResults, type CalculationResults2026, type TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { PartnerDetailsCard } from './partner-details-card';
import { ProfitStatementCard } from './profit-statement-card';
import type { FatorRResponse } from '@/ai/flows/fator-r-projection-flow';
import type { AnaliseCompleta, DadosMensais } from '@/lib/fator-r-migration-logic';
import { gerarAnaliseCompleta } from '@/lib/fator-r-migration-logic';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// Importação da tabela atualizada
import { ComparisonTable } from './comparison-table';

interface TaxResultsProps {
  year: number;
  isLoading: boolean;
  results: CalculationResults | CalculationResults2026 | null;
  error: string | null;
  fatorRProjection: FatorRResponse | null;
  formValues: any;
  onYearChange?: (year: number) => void;
}

type SelectedScenario = {
  regime: TaxDetails['regime'];
  optimizationNote?: string | null;
} | null;

export default function TaxResults({ year, isLoading, results, error, fatorRProjection, formValues, onYearChange }: TaxResultsProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<SelectedScenario>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Mapeamento Inteligente dos Resultados para Exibição
  const scenariosToShow = useMemo(() => {
    if (!results) return [];
    
    let scenarios: (TaxDetails | null)[] = [];
    
    // CASO 1: Ano 2025 (Regime Atual)
    if ('simplesNacionalBase' in results) { 
       scenarios = [
        results.simplesNacionalOtimizado,
        results.simplesNacionalBase,
        results.lucroPresumido,
      ];
    } 
    // CASO 2: Ano 2026+ (Pós-Reforma)
    else if ('simplesNacionalHibrido' in results) { 
       // A ordem aqui define a ordem das colunas na tabela
       scenarios = [
          // 1. Simples Nacional "Atual" (adaptado para o ano selecionado)
          results.simplesNacionalOtimizado, 
          
          // 2. Simples Nacional Tradicional (Novo Regime)
          results.simplesNacionalTradicional,
          
          // 3. Simples Nacional Híbrido (Novo Regime - Só aparece em 2027+)
          results.simplesNacionalHibrido, 
          
          // 4. Lucro Presumido (Com Reforma)
          results.lucroPresumido,
          
          // 5. Lucro Presumido (Sem Reforma - Comparativo)
          results.lucroPresumidoAtual,
      ] as (TaxDetails | null)[];
    }

    // Filtra cenários nulos ou zerados para não poluir a tela
    const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || (s.proLabore ?? 0) > 0));
    
    // Ordenação personalizada: Otimizados primeiro para destaque
    validScenarios.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    
    return validScenarios;
  }, [results]);


  // Lógica de Recomendação (Menor Custo)
  const cheapestScenario = useMemo(() => {
    if (scenariosToShow.length === 0) return null;
    // Removemos o "Regras Atuais" da competição pois ele é hipotético em 2026+
    const scenariosForRecommendation = scenariosToShow.filter(s => s.regime !== 'Lucro Presumido (Regras Atuais)');
    
    if (scenariosForRecommendation.length > 0) {
      return [...scenariosForRecommendation].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];
    }
    return scenariosToShow[0];
  }, [scenariosToShow]);
  
  // Seleciona automaticamente o melhor cenário ao carregar
  useEffect(() => {
    if (cheapestScenario) {
      setSelectedScenarioId({
        regime: cheapestScenario.regime,
        optimizationNote: cheapestScenario.optimizationNote ?? null,
      });
    } else {
      setSelectedScenarioId(null);
    }
  }, [cheapestScenario]);

  const selectedDetails = useMemo(() => {
    if (!selectedScenarioId) return null;
    return scenariosToShow.find(s => s.regime === selectedScenarioId.regime && (s.optimizationNote ?? null) === selectedScenarioId.optimizationNote) ?? null;
  }, [selectedScenarioId, scenariosToShow]);

  // Lógica de Análise de Fator R (apenas para Simples Nacional)
  const fatorRAnalysisData: AnaliseCompleta | null = useMemo(() => {
    if (!results || !('simplesNacionalBase' in results) || !results.simplesNacionalBase || results.simplesNacionalOtimizado) {
        return null;
    }

    const { rbt12, fp12 } = formValues;

    if (!rbt12 || rbt12 <= 0) return null;
    
    const dadosMensais: DadosMensais[] = formValues.monthlyData && formValues.monthlyData.length === 12
      ? formValues.monthlyData
      : Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          return {
              mes: format(date, 'MM/yyyy'),
              receita: rbt12 / 12,
              folha: fp12 / 12
          };
      });
    
    try {
        const analysis = gerarAnaliseCompleta(dadosMensais, 4);
        if(analysis.jaOtimizado) return null;
        return analysis;
    } catch (e) {
        return null;
    }
  }, [results, formValues]);


  if (isLoading) {
    return (
      <div id="results-section" className="mt-12 w-full">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-1/2 mx-auto" />
          <Skeleton className="h-5 w-3/4 mx-auto mt-4" />
        </div>
        <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <Skeleton className="h-[450px] w-full rounded-xl" />
          <Skeleton className="h-[450px] w-full rounded-xl" />
          <Skeleton className="h-[450px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="results-section" className="mt-12 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro no Cálculo</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!results || scenariosToShow.length === 0) {
    return null;
  }
    
  // Agrupador de Impostos para exibição nos cards
  const groupTaxes = (details: TaxDetails) => {
    const groups: { [key: string]: { name: string; value: number, rate?: number }[] } = {
        'IMPOSTOS S/ FATURAMENTO MENSAL': [],
        'IMPOSTOS S/ FATURAMENTO TRIMESTRAL': [],
        'ENCARGOS S/ FOLHA E PRÓ-LABORE': [],
        'OUTROS CUSTOS': []
    };

    details.breakdown.forEach(item => {
        const name = item.name.toLowerCase();
        
        if (name.includes('das') || name.includes('pis') || name.includes('cofins') || name.includes('iss') || name.includes('ibs') || name.includes('cbs') || name.includes('iva')) {
            groups['IMPOSTOS S/ FATURAMENTO MENSAL'].push(item);
        } else if (name.includes('irpj') || name.includes('csll')) {
            groups['IMPOSTOS S/ FATURAMENTO TRIMESTRAL'].push(item);
        } else if (name.includes('inss') || name.includes('cpp') || name.includes('irrf')) {
             groups['ENCARGOS S/ FOLHA E PRÓ-LABORE'].push(item);
        }
    });

    groups['OUTROS CUSTOS'].push({ name: 'Mensalidade Contabilizei', value: details.contabilizeiFee });
    
    for (const key in groups) {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    }
    
    return groups;
  };
    
  return (
    <div id="results-section" className="mt-16 w-full space-y-12">
      <div className="results-container mt-8">
        {year >= 2026 && onYearChange && (
          <div className="py-4 print-hidden mb-4 relative">
             <YearSelector selectedYear={year} onYearChange={onYearChange} />
          </div>
        )}

        {/* --- QUADRO COMPARATIVO ESTRATÉGICO --- */}
        {/* Passamos o 'currentYear' para que a tabela saiba qual ano está sendo mostrado nos títulos */}
        <div className="max-w-7xl mx-auto px-1 sm:px-4 mb-16">
          <ComparisonTable scenarios={scenariosToShow} currentYear={year} />
        </div>

        {/* --- CARDS DE DETALHES (Grid) --- */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch results-grid mb-12">
          {scenariosToShow.map((scenario) => {
            if (!scenario || (scenario.totalRevenue <= 0 && (scenario.proLabore ?? 0) <= 0)) return null;
            
            const isCurrentLpFor2026 = year >= 2026 && scenario.regime === 'Lucro Presumido (Regras Atuais)';
            const isRecommended = cheapestScenario !== null && scenario.regime === cheapestScenario.regime && (scenario.optimizationNote ?? null) === (cheapestScenario.optimizationNote ?? null) && scenariosToShow.length > 1 && cheapestScenario.totalMonthlyCost > 0 && !isCurrentLpFor2026;
            const isSelected = selectedDetails !== null && scenario.regime === selectedDetails.regime && (scenario.optimizationNote ?? null) === (selectedDetails.optimizationNote ?? null);

            const isOtimizado = scenario.regime.includes('Otimizado');
            
            const projectionNote = isOtimizado && fatorRProjection ? fatorRProjection.textoMensagem : null;
            const projectionStatus = isOtimizado && fatorRProjection ? fatorRProjection.statusMensagem : null;

            const groupedTaxes = groupTaxes(scenario);
            const effectiveRate = scenario.totalRevenue > 0 ? scenario.totalMonthlyCost / scenario.totalRevenue : 0;

            // Formatação do Título do Card
            let title = scenario.regime.replace(/ \(.+\)/, ''); 
            let subtitle = scenario.regime.match(/\((.+)\)/)?.[1] || '';

            if (year >= 2026) {
                if(scenario.regime.includes('Lucro Presumido')) {
                  title = 'Lucro Presumido';
                  subtitle = scenario.regime.replace('Lucro Presumido', '').trim();
                } else if (scenario.regime.includes('Simples Nacional')) {
                  title = 'Simples Nacional';
                  subtitle = scenario.regime.replace('Simples Nacional', '').trim();
                }
            } else { 
                if (scenario.regime === 'Simples Nacional (Otimizado)') {
                    title = 'Simples Nacional';
                    subtitle = 'Com Fator R Otimizado (Anexo III)';
                } else if (scenario.regime === 'Simples Nacional') {
                      title = 'Simples Nacional';
                      subtitle = `Padrão (${scenario.annex || 'Anexo V'})`;
                }
            }
            
            return (
              <div key={scenario.regime + (scenario.annex || '') + (scenario.optimizationNote || '')}
                onClick={() => setSelectedScenarioId({regime: scenario.regime, optimizationNote: scenario.optimizationNote ?? null})}
                className={cn(
                  "border rounded-xl w-full flex flex-col h-full transition-all duration-300 shadow-sm hover:shadow-xl relative cursor-pointer printable-card",
                  isRecommended ? "border-primary shadow-lg" : "border-border bg-card",
                  isSelected && !isRecommended && "ring-2 ring-primary",
                  isCurrentLpFor2026 && "bg-slate-50 opacity-80"
                )}
              >
                  {isRecommended && (
                   <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 print-hidden" variant="default" >
                      Recomendado
                   </Badge>
                  )}
                  <div className={cn("p-2 rounded-t-xl text-center overflow-hidden", isRecommended ? "bg-primary/5" : "bg-muted/30")}>
                      <h3 className="text-xl font-bold text-foreground mt-2">{title}</h3>
                      <p className={cn("font-semibold", isRecommended ? "text-primary" : "text-muted-foreground")}>{subtitle}</p>
                  </div>

                  <div className="px-4 pb-4 pt-2 flex-grow space-y-1">
                      <div className='text-center py-1 my-1 bg-muted/40 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>FATURAMENTO MENSAL</div>
                        <div className='text-lg font-bold text-foreground'>{formatCurrencyBRL(scenario.totalRevenue)}</div>
                      </div>
                      
                      <div className='text-center py-1 mb-1 bg-muted/40 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>Pró-labore Bruto</div>
                        <div className='text-lg font-bold text-foreground'>{formatCurrencyBRL(scenario.proLabore)}</div>
                      </div>

                      {Object.entries(groupedTaxes).map(([groupName, items]) => {
                        const filteredItems = items.filter(item => item.value > 0.001 || item.name.includes("Mensalidade"));
                        if (filteredItems.length === 0) return null;

                        const isTrimestral = groupName.includes('TRIMESTRAL');
                        const sectionId = `${scenario.regime}-${groupName}`;
                        const isOpen = openSections[sectionId] ?? true;

                        return (
                          <Collapsible
                              key={groupName}
                              open={isOpen}
                              onOpenChange={(open) => setOpenSections(prev => ({ ...prev, [sectionId]: open }))}
                              className="space-y-1"
                          >
                              <Separator className="my-2" />
                              <CollapsibleTrigger className="w-full flex justify-between items-center py-1 group">
                                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                                      {groupName}
                                  </h4>
                                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:-rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-1 pt-1 animate-in slide-in-from-top-2">
                                  {isTrimestral && <p className='text-muted-foreground -mt-2 mb-2' style={{ fontSize: '0.6rem' }}>Valores provisionados mensalmente.</p>}
                                  {filteredItems.map(item => {
                                      const showRate = item.rate !== undefined && !item.name.toLowerCase().includes('irrf') && !item.name.toLowerCase().includes('mensalidade');
                                      return (
                                          <div key={item.name} className="flex justify-between items-center text-sm">
                                              <span className="text-foreground flex items-center gap-1.5">
                                                  {item.name}
                                                  {showRate && (
                                                      <span className="text-muted-foreground font-semibold text-xs">({formatPercent(item.rate as number)})</span>
                                                  )}
                                              </span>
                                              <span className="font-medium text-foreground">
                                                  {formatCurrencyBRL(item.value)}
                                              </span>
                                          </div>
                                      )
                                  })}
                              </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                  </div>
                
                  <div className="p-4 mt-auto space-y-2 bg-muted/30 rounded-b-xl">
                      {fatorRProjection && !fatorRProjection.isEnquadradoAgora && projectionNote && (
                        <Alert variant="default" className={cn("p-3", {
                            'bg-green-100/80 border-green-200/80 text-green-900': projectionStatus === 'success',
                            'bg-amber-100/80 border-amber-200/80 text-amber-900': projectionStatus === 'warning' || projectionStatus === 'error',
                            'bg-primary/10 border-primary/20': !projectionStatus || projectionStatus === 'info'
                        })}>
                            <AlertDescription className="text-xs font-medium flex items-start gap-2">
                                <span className={cn('text-primary/90', {
                                    'text-green-600': projectionStatus === 'success',
                                    'text-amber-600': projectionStatus === 'warning' || projectionStatus === 'error',
                                })}>
                                    <BadgeInfo className="h-4 w-4 mt-0.5 shrink-0" />
                                </span>
                                <span className={cn('text-primary/90', {
                                     'text-green-900': projectionStatus === 'success',
                                     'text-amber-900': projectionStatus === 'warning' || projectionStatus === 'error',
                                })} dangerouslySetInnerHTML={{ __html: projectionNote.replace(/\n/g, '<br/>') }}></span>
                            </AlertDescription>
                        </Alert>
                      )}

                      {scenario.optimizationNote && !projectionNote && (
                         <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground p-3">
                            <AlertDescription className="text-xs text-primary/90 font-medium flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                                <span>{scenario.optimizationNote}</span>
                            </AlertDescription>
                        </Alert>
                      )}
                      
                      {isCurrentLpFor2026 && (
                            <Alert variant="default" className="bg-sky-100/80 border-sky-200/80 text-sky-900 p-3">
                                <AlertDescription className="text-xs font-medium flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>Este card mostra como seria o Lucro Presumido sem a Reforma Tributária, servindo como linha de base para comparação.</span>
                                </AlertDescription>
                            </Alert>
                        )}

                      {scenario.notes.length > 0 && !isCurrentLpFor2026 && (
                         <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground p-3">
                            <AlertDescription className="text-xs text-primary/90 font-medium flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                                <span>{scenario.notes.join(' ')}</span>
                            </AlertDescription>
                        </Alert>
                      )}

                      <div className={cn("p-3 rounded-lg bg-background")}>
                          <div className="w-full space-y-1 text-center">
                              <div className='text-sm font-medium text-foreground'>Custo Total Mensal</div>
                              <div className="text-2xl font-bold text-primary">
                                  {formatCurrencyBRL(scenario.totalMonthlyCost)}
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mt-1 overflow-hidden print-hidden">
                                  <div className="bg-gradient-to-r from-green-300 via-primary to-blue-800 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(effectiveRate*100, 100)}%` }}></div>
                              </div>
                              <p className='text-xs text-muted-foreground text-right mt-1'>{formatPercent(effectiveRate)} do faturamento</p>
                          </div>
                      </div>
                  </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {fatorRAnalysisData && (
        <div className="mt-12 border-t pt-8 animate-in slide-in-from-bottom-4">
              <div className="text-center mb-8">
                <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
                    OPORTUNIDADE IDENTIFICADA
                </span>
                <h2 className="text-2xl font-bold text-foreground mt-4">
                    Plano de Redução Tributária Inteligente
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-2">Sua empresa pode economizar migrando do Anexo V para o Anexo III. Veja abaixo o plano de ação e a projeção de resultados.</p>
            </div>
        </div>
      )}

      {selectedDetails && (
        <>
            <Separator className="my-16 separator-print" />
            <div className="details-card">
                <PartnerDetailsCard details={selectedDetails} />
            </div>
            <Separator className="my-16 separator-print" />
            <div className="profit-card">
                <ProfitStatementCard details={selectedDetails} />
            </div>
        </>
      )}

    </div>
  );
};