

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, BadgeInfo } from 'lucide-react';
import { type CalculationResults, type CalculationResults2026, type TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { PartnerDetailsCard } from './partner-details-card';
import { ProfitStatementCard } from './profit-statement-card';
import type { FatorRResponse } from '@/ai/flows/fator-r-projection-flow';
import { FatorRAnalysisComponent } from '@/app/fator-r/page';
import type { AnaliseCompleta, DadosMensais } from '@/lib/fator-r-migration-logic';
import { gerarAnaliseCompleta } from '@/lib/fator-r-migration-logic';
import { format } from 'date-fns';

interface TaxResultsProps {
  year: number;
  isLoading: boolean;
  results: CalculationResults | CalculationResults2026 | null;
  error: string | null;
  fatorRProjection: FatorRResponse | null;
  formValues: any;
}

type SelectedScenario = {
  regime: TaxDetails['regime'];
  optimizationNote?: string | null;
} | null;

export default function TaxResults({ year, isLoading, results, error, fatorRProjection, formValues }: TaxResultsProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<SelectedScenario>(null);

  const scenariosToShow = useMemo(() => {
    if (!results) return [];
    
    let scenarios: (TaxDetails | null)[] = [];
    if ('simplesNacionalBase' in results) { // 2025 results
       scenarios = [
        results.simplesNacionalOtimizado,
        results.simplesNacionalBase,
        results.lucroPresumido,
      ];
    } else if ('lucroPresumido' in results) { // 2026 results
       scenarios = [
          results.simplesNacionalOtimizado,
          results.simplesNacionalOtimizadoHibrido,
          results.simplesNacionalTradicional,
          results.simplesNacionalHibrido,
          results.lucroPresumido,
          results.lucroPresumidoAtual,
      ];
    }

    const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || (s.proLabore ?? 0) > 0));
    validScenarios.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return validScenarios;
  }, [results]);


  const cheapestScenario = useMemo(() => {
    if (scenariosToShow.length === 0) return null;
    const scenariosForRecommendation = scenariosToShow.filter(s => s.regime !== 'Lucro Presumido (Regras Atuais)');
    if (scenariosForRecommendation.length > 0) {
      return [...scenariosForRecommendation].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];
    }
    return scenariosToShow[0];
  }, [scenariosToShow]);
  
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

  const fatorRAnalysisData: AnaliseCompleta | null = useMemo(() => {
    if (!results || !results.simplesNacionalBase || results.simplesNacionalOtimizado) {
        return null;
    }

    const { rbt12, fp12 } = formValues;

    if (!rbt12 || rbt12 <= 0) return null;
    
    // Simula o histórico mensal caso não venha do formulário detalhado
    const dadosMensais: DadosMensais[] = Array.from({ length: 12 }, (_, i) => {
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
        if(analysis.jaOtimizado) return null; // Não mostra se já estiver otimizado.
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
        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row flex-wrap justify-center items-stretch gap-8'>
          <Skeleton className="h-[450px] w-full max-w-sm rounded-xl" />
          <Skeleton className="h-[450px] w-full max-w-sm rounded-xl" />
          <Skeleton className="h-[450px] w-full max-w-sm rounded-xl" />
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
    
  const groupTaxes = (details: TaxDetails) => {
    const groups: { [key: string]: { name: string; value: number }[] } = {
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
      <div>
        <div className="text-center mb-12 print-hidden">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Sua Análise Tributária</h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            Comparamos os regimes para encontrar o menor custo para sua empresa. A recomendação destaca o cenário mais econômico.
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row flex-wrap justify-center items-stretch gap-8 results-grid">
          {scenariosToShow.map((scenario) => {
            if (!scenario || (scenario.totalRevenue <= 0 && (scenario.proLabore ?? 0) <= 0)) return null;
            
            const isCurrentLpFor2026 = year >= 2026 && scenario.regime === 'Lucro Presumido (Regras Atuais)';
            const isRecommended = cheapestScenario !== null && scenario.regime === cheapestScenario.regime && (scenario.optimizationNote ?? null) === (cheapestScenario.optimizationNote ?? null) && scenariosToShow.length > 1 && cheapestScenario.totalMonthlyCost > 0 && !isCurrentLpFor2026;
            const isSelected = selectedDetails !== null && scenario.regime === selectedDetails.regime && (scenario.optimizationNote ?? null) === (selectedDetails.optimizationNote ?? null);

            const isOtimizado = scenario.regime.includes('Otimizado');
            
            const projectionNote = isOtimizado && fatorRProjection ? fatorRProjection.textoMensagem : null;
            const projectionStatus = isOtimizado && fatorRProjection ? fatorRProjection.statusMensagem : null;


            const groupedTaxes = groupTaxes(scenario);
            const effectiveRate = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;

            let title = scenario.regime.replace(/ \(.+\)/, ''); // Remove parênteses como (Anexo V)
            let subtitle = scenario.regime.match(/\((.+)\)/)?.[1] || '';


            if (year >= 2026) {
                if(scenario.regime.includes('Lucro Presumido')) {
                  title = 'Lucro Presumido';
                  subtitle = scenario.regime.replace('Lucro Presumido', '').trim();
                } else if (scenario.regime.includes('Simples Nacional')) {
                  title = 'Simples Nacional';
                  subtitle = scenario.regime.replace('Simples Nacional', '').trim();
                }
            } else { // year 2025
                if (scenario.regime === 'Simples Nacional (Otimizado)') {
                    title = 'Simples Nacional';
                    subtitle = 'Com Fator R Otimizado (Anexo III)';
                } else if (scenario.regime === 'Simples Nacional') {
                      title = 'Simples Nacional';
                      subtitle = `Padrão (${scenario.annex || 'Anexo V'})`;
                }
            }
            

            const revenueTaxes = scenario.breakdown.filter(i => i.name.toLowerCase().match(/das|pis|cofins|iss|irpj|csll|iva|ibs|cbs/));
            const totalRevenueTaxes = revenueTaxes.reduce((sum, tax) => sum + tax.value, 0);
            const effectiveRevenueTaxRate = scenario.totalRevenue > 0 ? totalRevenueTaxes / scenario.totalRevenue : 0;

            const domesticRevenue = scenario.domesticRevenue ?? 0;
            const exportRevenue = scenario.exportRevenue ?? 0;

            let projectionIcon = BadgeInfo;
            if (projectionStatus === 'success') projectionIcon = CheckCircle;
            if (projectionStatus === 'warning') projectionIcon = AlertTriangle;
            if (projectionStatus === 'error') projectionIcon = AlertTriangle;


            return (
              <div key={scenario.regime + (scenario.annex || '') + (scenario.optimizationNote || '')}
                onClick={() => setSelectedScenarioId({regime: scenario.regime, optimizationNote: scenario.optimizationNote ?? null})}
                className={cn(
                  "border rounded-xl w-full max-w-sm flex flex-col transition-all duration-300 shadow-sm hover:shadow-xl relative cursor-pointer printable-card",
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
                        {exportRevenue > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {domesticRevenue > 0 && <span>Nac: {formatCurrencyBRL(domesticRevenue)}</span>}
                                {domesticRevenue > 0 && exportRevenue > 0 && <span> + </span>}
                                {exportRevenue > 0 && <span>Exp: {formatCurrencyBRL(exportRevenue)}</span>}
                            </div>
                        )}
                      </div>
                      
                      <div className='text-center py-1 mb-1 bg-muted/40 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>Pró-labore Bruto</div>
                        <div className='text-lg font-bold text-foreground'>{formatCurrencyBRL(scenario.proLabore)}</div>
                      </div>

                      {Object.entries(groupedTaxes).map(([groupName, items]) => {
                        const filteredItems = items.filter(item => item.value > 0.001 || item.name.includes("Mensalidade"));
                        if (filteredItems.length === 0) return null;

                        const isTrimestral = groupName.includes('TRIMESTRAL');

                        return (
                          <div key={groupName} className="space-y-1">
                            <Separator className="my-2"/>
                            <h4 className="font-bold text-primary text-xs uppercase tracking-wider pt-1">
                                {groupName}
                            </h4>
                            {isTrimestral && <p className='text-muted-foreground -mt-2' style={{fontSize: '0.6rem'}}>Valores provisionados mensalmente.</p>}
                            <div className="space-y-1">
                            {filteredItems.map(item => {
                              const nameWithoutRate = item.name.replace(/\s*\([^)]+\)$/, '');
                              
                              let rateInfo: string | null = null;
                              if (item.name.toLowerCase().includes('inss s/ pró-labore')) rateInfo = '(11,00%)';
                              else if (item.name.toLowerCase().includes('cpp')) rateInfo = '(20,00%)';
                              else if (item.name.toLowerCase().startsWith('das') && scenario.effectiveDasRate) {
                                  rateInfo = `(${(scenario.effectiveDasRate * 100).toFixed(2).replace('.',',')}%)`;
                              } else if (item.name.toLowerCase().includes('iss')) {
                                  const rateFromName = parseFloat(item.name.match(/\(([^)]+)\)/)?.[1] || '0') / 100;
                                  rateInfo = `(${(rateFromName * 100).toFixed(2).replace('.', ',')}%)`;
                              } else if (item.value > 0 && scenario.regime.includes('Lucro Presumido') && (item.name.toLowerCase().includes('irpj') || item.name.toLowerCase().includes('csll'))) {
                                  rateInfo = `(${(item.value / scenario.totalRevenue * 100).toFixed(2).replace('.', ',')}%)`;
                              } else if (item.value > 0 && scenario.regime.includes('Lucro Presumido') && (item.name.toLowerCase().includes('pis') || item.name.toLowerCase().includes('cofins'))) {
                                    if (domesticRevenue > 0) rateInfo = `(${(item.value / domesticRevenue * 100).toFixed(2).replace('.',',')}%)`;
                              }
                              
                              const showRate = !item.name.toLowerCase().includes('irrf') && !item.name.toLowerCase().includes('mensalidade');

                              return (
                              <div key={item.name} className="flex justify-between items-center text-sm">
                                  <span className="text-foreground flex items-center gap-1.5">
                                    {nameWithoutRate}
                                    {showRate && rateInfo && (
                                        <span className="text-primary font-semibold text-xs">{rateInfo}</span>
                                    )}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {formatCurrencyBRL(item.value)}
                                  </span>
                              </div>
                            )})}
                            </div>
                            
                            {scenario.regime.includes('Lucro Presumido') && groupName.includes('TRIMESTRAL') && (
                                <div className="text-right rounded-lg pt-1 text-xs font-semibold flex items-center justify-end gap-2">
                                  <div className='border-primary/50 text-primary/90 rounded-md px-2 py-0.5 text-sm'>
                                    <span>Alíquota Efetiva s/ Faturamento: {formatPercent(effectiveRevenueTaxRate)}</span>
                                  </div>
                                </div>
                            )}
                          </div>
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
                                <span>
                                    {scenario.optimizationNote}
                                </span>
                            </AlertDescription>
                        </Alert>
                      )}


                      {scenario.notes.length > 0 && (
                         <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground p-3">
                            <AlertDescription className="text-xs text-primary/90 font-medium flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                                <span>
                                    {scenario.notes.join(' ')}
                                </span>
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
          <FatorRAnalysisComponent analysis={fatorRAnalysisData} />
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
