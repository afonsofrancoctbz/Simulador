
"use client";

import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { type CalculationResults, type CalculationResults2026, type TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { PartnerDetailsCard } from './partner-details-card';
import { ProfitStatementCard } from './profit-statement-card';
import { getFiscalParameters } from '@/config/fiscal';

interface TaxResultsProps {
  year: 2025 | 2026;
  isLoading: boolean;
  results: CalculationResults | CalculationResults2026 | null;
  error: string | null;
}

export default function TaxResults({ year, isLoading, results, error }: TaxResultsProps) {
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

  if (!results) {
    return null;
  }
  
  const scenarios = 'simplesNacionalBase' in results 
    ? [results.simplesNacionalOtimizado, results.simplesNacionalBase, results.lucroPresumido]
    : [results.simplesNacionalTradicional, results.simplesNacionalHibrido, results.lucroPresumido];

  const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || (s.proLabore ?? 0) > 0));
  if (validScenarios.length === 0) return null;
    
  const cheapestScenario = [...validScenarios].sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost)[0];
  
  let scenariosToShow: (TaxDetails | null)[] = [];
  let orderedScenarios: (TaxDetails | null)[] = [];

  if ('simplesNacionalBase' in results) {
    // Fixed order for 2025
    orderedScenarios = [
      results.simplesNacionalOtimizado,
      results.simplesNacionalBase,
      results.lucroPresumido,
    ];
  } else if ('simplesNacionalTradicional' in results) {
     orderedScenarios = [
      results.simplesNacionalTradicional,
      results.simplesNacionalHibrido,
      results.lucroPresumido,
    ];
  }

  scenariosToShow = orderedScenarios;

  const groupTaxes = (details: TaxDetails) => {
    const groups: { [key: string]: { name: string; value: number }[] } = {
        'IMPOSTOS S/ FATURAMENTO MENSAL': [],
        'IMPOSTOS S/ FATURAMENTO TRIMESTRAL': [],
        'ENCARGOS S/ FOLHA E PRÓ-LABORE': [],
        'OUTROS CUSTOS': []
    };

    details.breakdown.forEach(item => {
        const name = item.name.toLowerCase();
        
        if (details.regime.includes('Simples')) {
          if (name.includes('das')) {
              groups['IMPOSTOS S/ FATURAMENTO MENSAL'].push(item);
          }
        } else if (details.regime === 'Lucro Presumido') {
            if (name.includes('pis') || name.includes('cofins') || name.includes('iss')) {
                groups['IMPOSTOS S/ FATURAMENTO MENSAL'].push(item);
            } else if (name.includes('irpj') || name.includes('csll')) {
                groups['IMPOSTOS S/ FATURAMENTO TRIMESTRAL'].push(item);
            }
        }

        if (name.includes('inss') || name.includes('cpp')) {
            groups['ENCARGOS S/ FOLHA E PRÓ-LABORE'].push(item);
        }

        if (name.includes('irrf')) {
          const irrfItem = { name: "IRRF s/ Pró-labore", value: item.value };
          if (!groups['ENCARGOS S/ FOLHA E PRÓ-LABORE'].find(i => i.name === irrfItem.name)) {
             groups['ENCARGOS S/ FOLHA E PRÓ-LABORE'].push(irrfItem);
          }
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
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Sua Análise Tributária</h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            Comparamos os regimes para encontrar o menor custo para sua empresa. A recomendação destaca o cenário mais econômico.
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row flex-wrap justify-center items-stretch gap-8">
          {scenariosToShow.map((scenario) => {
            if (!scenario || (scenario.totalRevenue <= 0 && (scenario.proLabore ?? 0) <= 0)) return null;

            const isRecommended = cheapestScenario !== null && scenario.regime === cheapestScenario.regime && scenario.optimizationNote === cheapestScenario.optimizationNote && scenariosToShow.length > 1 && cheapestScenario.totalMonthlyCost > 0;
            const groupedTaxes = groupTaxes(scenario);
            const costPercentage = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;

            let title = scenario.regime;
            if (title === "Simples Nacional (Otimizado)") title = "Simples Nacional";
            
            const revenueTaxes = scenario.breakdown.filter(i => i.name.toLowerCase().match(/das|pis|cofins|iss|irpj|csll/));
            const totalRevenueTaxes = revenueTaxes.reduce((sum, tax) => sum + tax.value, 0);
            const effectiveRevenueTaxRate = scenario.totalRevenue > 0 ? totalRevenueTaxes / scenario.totalRevenue : 0;
            
            const domesticRevenue = scenario.breakdown
                .filter(item => item.name.toLowerCase().includes('pis') || item.name.toLowerCase().includes('cofins') || item.name.toLowerCase().includes('iss'))
                .reduce((sum, item) => {
                    const rateMatch = item.name.match(/\(([^)]+)\)/);
                    if (!rateMatch) return sum;
                    const rate = parseFloat(rateMatch[1].replace(',', '.')) / 100;
                    return rate > 0 ? sum + (item.value / rate) : sum;
                }, 0);

            const exportRevenue = scenario.totalRevenue - domesticRevenue;

            return (
              <div key={scenario.regime + (scenario.annex || '') + (scenario.optimizationNote || '')}
                className={cn(
                  "border rounded-xl w-full max-w-sm flex flex-col transition-all duration-300 shadow-sm hover:shadow-xl relative",
                  isRecommended ? "border-primary shadow-lg" : "border-border bg-card"
                )}
              >
                  {isRecommended && (
                   <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" variant="default" >
                      Recomendado
                  </Badge>
                  )}
                  <div className={cn("p-4 rounded-t-xl text-center overflow-hidden", isRecommended ? "bg-primary/5" : "bg-muted/30")}>

                      <h3 className="text-xl font-bold text-foreground mt-2">{title}</h3>
                      {scenario.annex && scenario.annex !== 'N/A' && <p className="font-semibold text-primary">{scenario.annex}</p>}
                      {scenario.optimizationNote && <p className="text-sm text-primary/90 mt-1">Com Fator R</p>}
                      {!scenario.optimizationNote && scenario.regime.includes("Simples") && <p className="text-sm text-muted-foreground mt-1">Sem Fator R</p>}
                  </div>

                  <div className="px-4 pb-4 pt-2 flex-grow space-y-1">
                      <div className='text-center py-1 my-1 bg-muted/30 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>FATURAMENTO MENSAL</div>
                        <div className='text-base font-bold text-foreground'>{formatCurrencyBRL(scenario.totalRevenue)}</div>
                        {(domesticRevenue > 0 || exportRevenue > 0) && (
                            <div className="text-xs text-muted-foreground">
                                {domesticRevenue > 0 && <span>Nac: {formatCurrencyBRL(domesticRevenue)}</span>}
                                {domesticRevenue > 0 && exportRevenue > 0 && <span> + </span>}
                                {exportRevenue > 0 && <span>Exp: {formatCurrencyBRL(exportRevenue)}</span>}
                            </div>
                        )}
                      </div>
                      
                      <div className='text-center py-1 mb-1 bg-muted/30 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>Pró-labore Bruto</div>
                        <div className='text-base font-bold text-foreground'>{formatCurrencyBRL(scenario.proLabore)}</div>
                      </div>

                      {Object.entries(groupedTaxes).map(([groupName, items]) => {
                        const filteredItems = items.filter(item => item.value > 0.001 || item.name.includes("Mensalidade"));
                        if (filteredItems.length === 0) return null;

                        const isTrimestral = groupName.includes('TRIMESTRAL');

                        return (
                          <div key={groupName} className="space-y-1">
                            <Separator className="my-1"/>
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
                              } else if (item.value > 0 && scenario.regime === 'Lucro Presumido' && (item.name.toLowerCase().includes('irpj') || item.name.toLowerCase().includes('csll'))) {
                                  rateInfo = `(${(item.value / scenario.totalRevenue * 100).toFixed(2).replace('.', ',')}%)`;
                              } else if (item.value > 0 && scenario.regime === 'Lucro Presumido' && (item.name.toLowerCase().includes('pis') || item.name.toLowerCase().includes('cofins'))) {
                                    const domesticRevenue = scenario.breakdown.filter(i => i.name.toLowerCase().includes('pis') || i.name.toLowerCase().includes('cofins') || i.name.toLowerCase().includes('iss')).reduce((sum, i) => {
                                      const rateMatch = i.name.match(/\(([^)]+)\)/);
                                      if (!rateMatch) return sum;
                                      const rate = parseFloat(rateMatch[1].replace(',','.') || '0') / 100;
                                      return rate > 0 ? sum + (i.value / rate) : sum;
                                    }, 0);
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
                            
                            {scenario.regime === 'Lucro Presumido' && (groupName.includes('FATURAMENTO')) && (
                                <>
                                 <div className="text-right rounded-lg pt-1 text-xs font-semibold flex items-center justify-end gap-2 text-primary/80">
                                    <span>Alíquota Efetiva s/ Faturamento: {formatPercent(effectiveRevenueTaxRate)}</span>
                                </div>
                                </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                
                  <div className="p-4 mt-auto space-y-2 bg-muted/20 rounded-b-xl">
                      {scenario.fatorR !== undefined && (
                      <div className={cn(
                          "text-center rounded-lg p-2 text-sm font-semibold flex items-center justify-center gap-2",
                          scenario.fatorR >= 0.28 ? 'bg-green-100/80 text-green-900 border border-green-200/80' : 'bg-amber-100/80 text-amber-900 border border-amber-200/80'
                      )}>
                          {scenario.fatorR >= 0.28 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                          <span>Fator R: {formatPercent(scenario.fatorR)}</span>
                      </div>
                      )}
                      {(scenario.optimizationNote || (exportRevenue > 0)) && (
                         <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground p-3">
                            <AlertDescription className="text-sm text-primary/90 font-medium flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                                <span>
                                    {scenario.optimizationNote}
                                    {exportRevenue > 0 && scenario.regime.includes('Simples') && " A alíquota do DAS foi reduzida na parcela de exportação devido à isenção de PIS, COFINS e ISS."}
                                    {exportRevenue > 0 && scenario.regime === 'Lucro Presumido' && " PIS, COFINS e ISS não incidem sobre a receita de exportação."}
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
                              <div className="w-full bg-muted rounded-full h-2 mt-1 overflow-hidden">
                                  <div className="bg-gradient-to-r from-green-300 via-primary to-blue-800 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(costPercentage*100, 100)}%` }}></div>
                              </div>
                              <p className='text-xs text-muted-foreground text-right mt-1'>{formatPercent(costPercentage)} do faturamento</p>
                          </div>
                      </div>
                  </div>
              </div>
            )
          })}
        </div>
      </div>

      {cheapestScenario && cheapestScenario.totalRevenue > 0 && (
        <>
          <Separator className="my-16" />
          <PartnerDetailsCard details={cheapestScenario as TaxDetails} />
          <Separator className="my-16" />
          <ProfitStatementCard details={cheapestScenario as TaxDetails} />
        </>
      )}
    </div>
  );
};
