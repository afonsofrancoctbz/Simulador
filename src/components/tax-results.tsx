

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
  isAdviceLoading: boolean;
  results: CalculationResults | CalculationResults2026 | null;
  advice: string | null;
  error: string | null;
}

export default function TaxResults({ year, isLoading, isAdviceLoading, results, error }: TaxResultsProps) {
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

  let scenarios: (TaxDetails | null)[] = [];
  if (year === 2025 && 'simplesNacionalBase' in results) {
    // Fixed display order as requested
    if (results.simplesNacionalOtimizado) {
      scenarios.push(results.simplesNacionalOtimizado);
    }
    scenarios.push(results.simplesNacionalBase);
    scenarios.push(results.lucroPresumido);

  } else if (year === 2026 && 'simplesNacionalTradicional' in results) {
    const isCommerceOnly = results.lucroPresumido.breakdown.length === 0 && results.lucroPresumido.totalRevenue > 0;
    scenarios.push(results.simplesNacionalTradicional as TaxDetails, results.simplesNacionalHibrido as TaxDetails);
    if (!isCommerceOnly) scenarios.push(results.lucroPresumido as TaxDetails);
  }

  const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || s.proLabore > 0));
  if (validScenarios.length === 0) return null;
    
  const cheapestScenario = validScenarios.length > 0 ? validScenarios.reduce((prev, current) => (prev.totalMonthlyCost < current.totalMonthlyCost ? prev : current)) : null;

  const groupTaxes = (details: TaxDetails) => {
    const groups: { [key: string]: { name: string; value: number }[] } = {
        'IMPOSTOS S/ FATURAMENTO MENSAL': [],
        'IMPOSTOS S/ FATURAMENTO TRIMESTRAL': [],
        'IMPOSTOS S/ FATURAMENTO': [],
        'ENCARGOS S/ FOLHA E PRÓ-LABORE': [],
        'OUTROS CUSTOS': []
    };

    details.breakdown.forEach(item => {
        const name = item.name.toLowerCase();
        
        if (details.regime === 'Lucro Presumido') {
            if (name.includes('pis') || name.includes('cofins') || name.includes('iss')) {
                groups['IMPOSTOS S/ FATURAMENTO MENSAL'].push(item);
            } else if (name.includes('irpj') || name.includes('csll')) {
                groups['IMPOSTOS S/ FATURAMENTO TRIMESTRAL'].push(item);
            }
        } else {
            if (name.includes('das') || name.includes('iva')) {
                groups['IMPOSTOS S/ FATURAMENTO'].push(item);
            }
        }

        if (name.includes('inss') || name.includes('irrf') || name.includes('cpp')) {
            groups['ENCARGOS S/ FOLHA E PRÓ-LABORE'].push(item);
        }
    });

    groups['OUTROS CUSTOS'].push({ name: 'Mensalidade Contabilizei', value: details.contabilizeiFee });
    
    // Cleanup empty groups
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
          {validScenarios.map((scenario) => {
            if (!scenario) return null;
            const isRecommended = cheapestScenario !== null && scenario.regime === cheapestScenario.regime && scenario.optimizationNote === cheapestScenario.optimizationNote && validScenarios.length > 1 && cheapestScenario.totalMonthlyCost > 0;
            const groupedTaxes = groupTaxes(scenario);
            const costPercentage = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;
            const config = getFiscalParameters(year);

            let title = scenario.regime;
            if (title === "Simples Nacional (Otimizado)") title = "Simples Nacional";

            const getRateInfo = (itemName: string, itemValue: number): string | null => {
              const nameLower = itemName.toLowerCase();

              if (nameLower.includes('inss s/ pró-labore')) return `(11,00%)`;
              if (nameLower.includes('cpp (inss patronal')) return `(20,00%)`;

              if (scenario.totalRevenue <= 0) return null;
              
              if (nameLower.startsWith('das') && scenario.effectiveDasRate) {
                  return `(${formatPercent(scenario.effectiveDasRate).replace('%','')})%`;
              }
              if (nameLower.startsWith('iss')) {
                  const rateMatch = itemName.match(/\(([^)]+)\)/);
                  return rateMatch ? `(${rateMatch[1]})` : null;
              }
              if (itemValue > 0 && (nameLower.includes('irpj') || nameLower.includes('csll'))) {
                  return `(${(formatPercent(itemValue / scenario.totalRevenue)).replace('%','')})%`;
              }
               if (itemValue > 0 && (nameLower.includes('pis') || nameLower.includes('cofins'))) {
                   const domesticRevenue = scenario.breakdown.reduce((sum, item) => {
                      const lowerName = item.name.toLowerCase();
                      if (lowerName.includes('pis') || lowerName.includes('cofins') || lowerName.includes('iss')) {
                          return sum + item.value / (parseFloat(lowerName.match(/\(([^)]+)\)/)?.[1] || 1) / 100);
                      }
                      return sum;
                   }, 0);
                   
                  if (domesticRevenue > 0) return `(${(formatPercent(itemValue / domesticRevenue)).replace('%','')})%`;
              }


              return null;
            };
            
            const revenueTaxes = scenario.breakdown.filter(i => i.name.toLowerCase().match(/das|pis|cofins|iss|irpj|csll|iva/));
            const totalRevenueTaxes = revenueTaxes.reduce((sum, tax) => sum + tax.value, 0);
            const effectiveRevenueTaxRate = scenario.totalRevenue > 0 ? totalRevenueTaxes / scenario.totalRevenue : 0;

            return (
              <div key={scenario.regime + (scenario.annex || '') + (scenario.optimizationNote || '')}
                className={cn(
                  "border bg-card/80 rounded-xl w-full max-w-sm flex flex-col transition-all duration-300 shadow-sm hover:shadow-xl",
                  isRecommended ? "border-primary shadow-lg" : "border-border"
                )}
              >
                  <div className={cn("p-6 rounded-t-xl text-center relative overflow-hidden", isRecommended ? "bg-primary/5" : "bg-muted/30")}>
                      {isRecommended && (
                      <Badge className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-50%] bg-primary text-primary-foreground font-bold px-4 py-1.5 shadow-md">
                          Recomendado
                      </Badge>
                      )}
                      <h3 className="text-xl font-bold text-foreground mt-4">{title}</h3>
                      {scenario.annex && scenario.annex !== 'N/A' && <p className="font-semibold text-primary">{scenario.annex}</p>}
                      {scenario.optimizationNote && <p className="text-sm text-primary/90 mt-1">Com Fator R</p>}
                      {!scenario.optimizationNote && scenario.regime.includes("Simples") && <p className="text-sm text-muted-foreground mt-1">Sem Fator R</p>}
                  </div>

                  <div className="px-6 pb-6 pt-0 flex-grow text-base">
                      <div className='text-center py-3 my-4 bg-muted/30 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>FATURAMENTO MENSAL</div>
                        <div className='text-lg font-bold text-foreground'>{formatCurrencyBRL(scenario.totalRevenue)}</div>
                      </div>
                      
                      <div className='text-center py-3 mb-4 bg-muted/30 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>Pró-labore Bruto</div>
                        <div className='text-lg font-bold text-foreground'>{formatCurrencyBRL(scenario.proLabore)}</div>
                      </div>

                      {Object.entries(groupedTaxes).map(([groupName, items]) => {
                        const filteredItems = items.filter(item => item.value > 0.001 || item.name.includes("Mensalidade"));
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={groupName} className="space-y-3">
                                <Separator className="my-3"/>
                                <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                                    {groupName}
                                </h4>
                                {groupName.includes('TRIMESTRAL') && <p className='text-xs text-muted-foreground -mt-2'>Valores provisionados mensalmente.</p>}
                                <div className="space-y-3">
                                {filteredItems.map(item => {
                                  const rateInfo = getRateInfo(item.name, item.value);
                                  const nameWithoutRate = item.name.replace(/\s*\([^)]+\)$/, '');
                                  const showRate = !item.name.toLowerCase().includes('irrf') && !item.name.toLowerCase().includes('mensalidade');

                                  return (
                                  <div key={item.name} className="flex justify-between items-center text-sm">
                                      <span className="text-foreground flex items-center gap-1.5">
                                        {nameWithoutRate}
                                        {showRate && rateInfo && (
                                            <span className="text-primary font-semibold">{rateInfo}</span>
                                        )}
                                      </span>
                                      <span className="font-medium text-foreground">
                                        {formatCurrencyBRL(item.value)}
                                      </span>
                                  </div>
                                )})}
                                </div>
                            </div>
                        )
                      })}
                  </div>
                
                  <div className="p-6 mt-auto space-y-4 bg-muted/20 rounded-b-xl">
                      {scenario.fatorR !== undefined && (
                      <div className={cn(
                          "text-center rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2",
                          scenario.fatorR >= 0.28 ? 'bg-green-100/80 text-green-900 border border-green-200/80' : 'bg-amber-100/80 text-amber-900 border border-amber-200/80'
                      )}>
                          {scenario.fatorR >= 0.28 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                          <span>Fator R: {formatPercent(scenario.fatorR)}</span>
                      </div>
                      )}
                      {scenario.regime === 'Lucro Presumido' && scenario.totalRevenue > 0 && (
                        <div className="text-center rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2 bg-blue-100/80 text-blue-900 border border-blue-200/80">
                           <span>Alíquota Efetiva sobre Faturamento: {formatPercent(effectiveRevenueTaxRate)}</span>
                        </div>
                      )}
                      {scenario.optimizationNote && !scenario.regime.includes('2026') && (
                         <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground">
                            <AlertDescription className="text-sm text-primary/90 font-medium flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                                <span>{scenario.optimizationNote}</span>
                            </AlertDescription>
                        </Alert>
                      )}
                      <div className={cn("p-4 rounded-lg bg-card")}>
                          <div className="w-full space-y-2 text-center">
                              <div className='text-sm font-medium text-foreground'>Custo Total Mensal</div>
                              <div className="text-3xl font-bold text-primary">
                                  {formatCurrencyBRL(scenario.totalMonthlyCost)}
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5 mt-2 overflow-hidden">
                                  <div className="bg-gradient-to-r from-green-300 via-primary to-blue-800 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(costPercentage*100, 100)}%` }}></div>
                              </div>
                              <p className='text-sm text-muted-foreground text-right mt-1'>{formatPercent(costPercentage)} do faturamento</p>
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
