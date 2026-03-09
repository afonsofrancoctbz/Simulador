"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, BadgeInfo, ChevronsUpDown, HelpCircle, Calculator, FileDown } from 'lucide-react';
import { type CalculationResults, type CalculationResults2026, type TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { PartnerDetailsCard } from './partner-details-card';
import { ProfitStatementCard } from './profit-statement-card';
import type { FatorRResponse } from '@/ai/flows/fator-r-projection-flow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ComparisonTable }  from './comparison-table';
import { YearSelector } from './year-selector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCnaeData } from "@/lib/cnae-helpers";
import { Button } from './ui/button';
import { SimulationResults } from './simulation-results';
import { PrintableReport } from './tax-results/printable-report'; 

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

  const isNewCompany = formValues?.companyStage === 'new';

  const scenariosToShow = useMemo(() => {
    if (!results) return [];
    let scenarios: (TaxDetails | null)[] = [];
    if ('simplesNacionalBase' in results) { 
       scenarios = [results.simplesNacionalOtimizado, results.simplesNacionalBase, results.lucroPresumido];
    } else if ('simplesNacionalHibrido' in results || 'simplesNacionalTradicional' in results) { 
       scenarios = [results.simplesNacionalOtimizado, results.simplesNacionalOtimizadoHibrido, results.simplesNacionalTradicional, results.simplesNacionalHibrido, results.lucroPresumido] as (TaxDetails | null)[];
    }
    const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || (s.proLabore ?? 0) > 0));
    validScenarios.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return validScenarios;
  }, [results]);

  const cheapestScenario = useMemo(() => {
    if (scenariosToShow.length === 0) return null;
    return [...scenariosToShow].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];
  }, [scenariosToShow]);
  
  useEffect(() => {
    if (cheapestScenario) {
      setSelectedScenarioId({ regime: cheapestScenario.regime, optimizationNote: cheapestScenario.optimizationNote ?? null });
    } else {
      setSelectedScenarioId(null);
    }
  }, [cheapestScenario]);

  const selectedDetails = useMemo(() => {
    if (!selectedScenarioId) return null;
    return scenariosToShow.find(s => s.regime === selectedScenarioId.regime && (s.optimizationNote ?? null) === selectedScenarioId.optimizationNote) ?? null;
  }, [selectedScenarioId, scenariosToShow]);

  const getPresumedBases = useMemo(() => {
    let baseIRPJ = 0;
    let baseCSLL = 0;
    const cnaes = formValues.selectedCnaes || [];
    const exchangeRate = formValues.exportCurrency !== 'BRL' ? (formValues.exchangeRate || 1) : 1;
    cnaes.forEach((cnae: any) => {
        const data = getCnaeData(cnae.code);
        const revenue = (cnae.domesticRevenue || 0) + ((cnae.exportRevenue || 0) * exchangeRate);
        baseIRPJ += revenue * (data?.presumedProfitRateIRPJ ?? 0.32);
        baseCSLL += revenue * (data?.presumedProfitRateCSLL ?? 0.32);
    });
    return { baseIRPJ, baseCSLL };
  }, [formValues]);

  if (isLoading) {
    return (
      <div id="results-section" className="mt-12 w-full print-hidden">
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
      <div id="results-section" className="mt-12 max-w-5xl mx-auto print-hidden">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erro no Cálculo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!results || scenariosToShow.length === 0) {
    return null;
  }
    
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
    <>
        <div id="results-section" className="mt-16 w-full space-y-12 print-hidden">
            <div className="results-container mt-8">
                {year >= 2026 && onYearChange && (
                <div className="py-4 print-hidden mb-4 relative">
                    <YearSelector selectedYear={year} onYearChange={onYearChange} />
                </div>
                )}

                {isNewCompany && (
                    <div className="max-w-7xl mx-auto px-1 sm:px-4 mb-16">
                        <SimulationResults formValues={formValues} />
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-1 sm:px-4 mb-16">
                    <ComparisonTable currentYear={year} formValues={formValues} />
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => window.print()} variant="outline" className="print-hidden gap-2">
                            <FileDown className="h-4 w-4" />
                            Baixar Relatório em PDF
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch results-grid mb-12">
                {scenariosToShow.map((scenario) => {
                    if (!scenario || (scenario.totalRevenue <= 0 && (scenario.proLabore ?? 0) <= 0)) return null;
                    const isRecommended = cheapestScenario !== null && scenario.regime === cheapestScenario.regime && (scenario.optimizationNote ?? null) === (cheapestScenario.optimizationNote ?? null) && scenariosToShow.length > 1 && cheapestScenario.totalMonthlyCost > 0;
                    const isSelected = selectedDetails !== null && scenario.regime === selectedDetails.regime && (scenario.optimizationNote ?? null) === (selectedDetails.optimizationNote ?? null);
                    const isOtimizado = scenario.regime.includes('Otimizado');
                    const projectionNote = isOtimizado && fatorRProjection ? fatorRProjection.textoMensagem : null;
                    const projectionStatus = isOtimizado && fatorRProjection ? fatorRProjection.statusMensagem : null;
                    const groupedTaxes = groupTaxes(scenario);
                    const effectiveRate = scenario.totalRevenue > 0 ? scenario.totalMonthlyCost / scenario.totalRevenue : 0;

                    let title = "Simples Nacional";
                    let subtitle = "";
                    if (scenario.regime.includes('Lucro Presumido')) {
                        title = 'Lucro Presumido';
                        subtitle = scenario.regime.replace('Lucro Presumido', '').trim() || '(Regras da Reforma)';
                    } else if (isOtimizado) {
                        subtitle = "Anexo III (Fator R)";
                    } else if (scenario.annex) {
                        const annexLabel = scenario.annex.replace('Anexo ', '');
                        subtitle = `Anexo ${annexLabel} (Padrão)`;
                    }
                    if (year >= 2026) {
                        if (scenario.regime.includes('Híbrido')) {
                            subtitle = `${subtitle.replace(' (Padrão)', '').replace(' (Fator R)', '')} Híbrido`;
                        } else if (scenario.regime.includes('Tradicional')) {
                            subtitle = `${subtitle.replace(' (Padrão)', '').replace(' (Fator R)', '')} Tradicional`;
                        }
                    }
                    
                    return (
                    <div key={scenario.regime + (scenario.annex || '') + (scenario.optimizationNote || '')}
                        onClick={() => setSelectedScenarioId({regime: scenario.regime, optimizationNote: scenario.optimizationNote ?? null})}
                        className={cn(
                        "border rounded-xl w-full flex flex-col h-full transition-all duration-300 shadow-sm hover:shadow-xl relative cursor-pointer printable-card",
                        isRecommended ? "border-primary shadow-lg" : "border-border bg-card",
                        isSelected && !isRecommended && "ring-2 ring-primary"
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
                                        <h4 className="font-bold text-primary text-xs uppercase tracking-wider">{groupName}</h4>
                                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:-rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-1 pt-1 animate-in slide-in-from-top-2">
                                        {isTrimestral && <p className='text-muted-foreground -mt-2 mb-2' style={{ fontSize: '0.6rem' }}>Valores provisionados mensalmente.</p>}
                                        {filteredItems.map(item => {
                                            const showRate = item.rate !== undefined && !item.name.toLowerCase().includes('irrf') && !item.name.toLowerCase().includes('mensalidade');
                                            const isTestTax = item.name.includes("Teste") || item.name.includes("Compensável");
                                            const isIvaTax = item.name.includes("IBS") || item.name.includes("CBS") || item.name.includes("IVA");
                                            const showIvaMemory = isIvaTax && formValues.creditGeneratingExpenses > 0 && !isTestTax;
                                            const isIrpjOrCsll = item.name.includes("IRPJ") || item.name.includes("CSLL");
                                            const showLpMemory = isIrpjOrCsll && scenario.regime.includes("Lucro Presumido");
                                            return (
                                                <div key={item.name} className={cn("flex justify-between items-center text-sm", isTestTax ? "bg-amber-50/50 p-1.5 -mx-1.5 rounded text-muted-foreground" : "")}>
                                                    <span className="text-foreground flex items-center gap-1.5">
                                                        {isTestTax && (
                                                            <TooltipProvider><Tooltip><TooltipTrigger><HelpCircle className="h-3.5 w-3.5 text-amber-500 cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[250px]"><p>Este valor é um teste de adaptação do sistema tributário (2026). Ele é <strong>totalmente compensado</strong> do PIS/COFINS e não aumenta o custo real.</p></TooltipContent></Tooltip></TooltipProvider>
                                                        )}
                                                        <span className={cn(isTestTax ? "text-xs font-medium text-amber-700/80" : "")}>{item.name}</span>
                                                        {showRate && !isTestTax && (<span className="text-muted-foreground font-semibold text-xs">({formatPercent(item.rate as number)})</span>)}
                                                        {showIvaMemory && (
                                                            <TooltipProvider><Tooltip><TooltipTrigger><Calculator className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help hover:text-primary" /></TooltipTrigger><TooltipContent className="p-4 bg-card border shadow-xl max-w-xs"><div className="space-y-2 text-xs"><p className="font-bold text-primary mb-2 border-b pb-1">Memória de Cálculo (IVA)</p><div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">{(() => { const baseRevenue = scenario.domesticRevenue ?? scenario.totalRevenue; const expenses = formValues.creditGeneratingExpenses; const netBase = Math.max(0, baseRevenue - expenses); const impliedRate = netBase > 0 ? item.value / netBase : 0; return ( <><span className="text-muted-foreground">Faturamento Base:</span><span className="font-mono">{formatCurrencyBRL(baseRevenue)}</span><span className="text-green-600">(-) Crédito Despesa:</span><span className="font-mono text-green-600">{formatCurrencyBRL(expenses)}</span><div className="col-span-2 border-t my-1"></div><span className="font-semibold text-foreground">Base Líquida:</span><span className="font-mono font-bold">{formatCurrencyBRL(netBase)}</span><span className="font-semibold text-foreground">Impostos Liquido:</span><span className="font-mono font-bold">{formatCurrencyBRL(item.value)}</span></> )})()}</div></div></TooltipContent></Tooltip></TooltipProvider>
                                                        )}
                                                    </span>
                                                    <span className={cn("font-medium", isTestTax ? "text-xs text-amber-700/70 italic" : "text-foreground")}>{formatCurrencyBRL(item.value)}</span>
                                                </div>
                                            )
                                        })}
                                    </CollapsibleContent>
                                </Collapsible>
                                );
                            })}
                        </div>
                        <div className="p-4 mt-auto space-y-2 bg-muted/30 rounded-b-xl">
                            <div className={cn("p-3 rounded-lg bg-background")}>
                                <div className="w-full space-y-1 text-center">
                                    <div className='text-sm font-medium text-foreground'>Custo Total Mensal</div>
                                    <div className="text-2xl font-bold text-primary">{formatCurrencyBRL(scenario.totalMonthlyCost)}</div>
                                    <div className="w-full bg-muted rounded-full h-2 mt-1 overflow-hidden print-hidden">
                                        <div className="bg-gradient-to-r from-green-300 via-primary to-blue-800 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(effectiveRate*100, 100)}%` }}></div>
                                    </div>
                                    <p className='text-xs text-muted-foreground text-right mt-1'>{formatPercent(effectiveRate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            </div>
            
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

        <div className="hidden print:block">
            <PrintableReport 
                year={year} 
                results={results as any} 
                formValues={formValues} 
                scenariosToShow={scenariosToShow}
                cheapestScenario={cheapestScenario}
            />
        </div>
    </>
  );
};
