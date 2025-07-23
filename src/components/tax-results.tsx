

"use client";

import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { type CalculationResults, type CalculationResults2026, type TaxDetails } from '@/lib/types';
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { PartnerDetailsCard } from './partner-details-card';
import { ProfitStatementCard } from './profit-statement-card';

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

  let scenarios: TaxDetails[] = [];
  if (year === 2025 && 'simplesNacionalBase' in results) {
    scenarios.push(results.lucroPresumido);
    if (results.simplesNacionalBase) scenarios.push(results.simplesNacionalBase);
    if (results.simplesNacionalOtimizado) {
      scenarios.push(results.simplesNacionalOtimizado);
    }
  } else if (year === 2026 && 'simplesNacionalTradicional' in results) {
    const isCommerceOnly = results.lucroPresumido.breakdown.length === 0 && results.lucroPresumido.totalRevenue > 0;
    if (!isCommerceOnly) scenarios.push(results.lucroPresumido as TaxDetails);
    scenarios.push(results.simplesNacionalTradicional as TaxDetails, results.simplesNacionalHibrido as TaxDetails);
  }

  if (scenarios.length === 0) return null;
    
  const validScenarios = scenarios.filter(s => s && (s.totalRevenue > 0 || s.proLabore > 0));
  const cheapestScenario = validScenarios.length > 0 ? validScenarios.reduce((prev, current) => (prev.totalMonthlyCost < current.totalMonthlyCost ? prev : current)) : null;

  const groupTaxes = (details: TaxDetails) => {
    const groups: { [key: string]: { name: string; value: number }[] } = {
        'IMPOSTOS S/ FATURAMENTO': [],
        'ENCARGOS S/ FOLHA E PRÓ-LABORE': [],
        'OUTROS CUSTOS': [],
    };

    details.breakdown.forEach(item => {
        if (['DAS', 'PIS', 'COFINS', 'ISS', 'ICMS', 'IPI', 'IRPJ', 'CSLL', 'IVA'].includes(item.name)) {
            groups['IMPOSTOS S/ FATURAMENTO'].push(item);
        } else if (['CPP (INSS Patronal)', 'INSS s/ Pró-labore', 'IRRF s/ Pró-labore'].includes(item.name)) {
            groups['ENCARGOS S/ FOLHA E PRÓ-LABORE'].push(item);
        }
    });

    groups['OUTROS CUSTOS'].push({ name: 'Mensalidade Contabilizei', value: details.contabilizeiFee });

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
          {validScenarios.sort((a, b) => a.order! - b.order!).map((scenario) => {
            if (!scenario) return null;
            const isRecommended = cheapestScenario !== null && scenario.regime === cheapestScenario.regime && scenario.annex === cheapestScenario.annex && scenario.optimizationNote === cheapestScenario.optimizationNote && validScenarios.length > 1 && cheapestScenario.totalMonthlyCost > 0;
            const groupedTaxes = groupTaxes(scenario);
            const costPercentage = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;
            
            let title = scenario.regime;

            return (
              <div key={scenario.regime + (scenario.annex || '') + (scenario.optimizationNote || '')}
                className={cn(
                  "border bg-card rounded-xl w-full max-w-sm flex flex-col transition-all duration-300 shadow-sm",
                  isRecommended ? "border-primary shadow-lg" : "border-border"
                )}
              >
                  <div className={cn("p-6 rounded-t-xl text-center relative overflow-hidden")}>
                      {isRecommended && (
                      <Badge className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-50%] bg-primary text-primary-foreground font-bold px-4 py-1.5 shadow-md">
                          Recomendado
                      </Badge>
                      )}
                      <h3 className="text-xl font-bold text-foreground mt-4">{title}</h3>
                      {scenario.annex && scenario.annex !== 'N/A' && <p className="font-semibold text-primary">{scenario.annex}</p>}
                  </div>

                  <div className="px-6 pb-6 pt-0 flex-grow text-base">
                      <div className='text-center py-3 mb-4 bg-muted/30 rounded-md'>
                        <div className='text-xs uppercase text-muted-foreground font-semibold'>FATURAMENTO MENSAL</div>
                        <div className='text-lg font-bold text-foreground'>{formatCurrencyBRL(scenario.totalRevenue)}</div>
                      </div>

                      {Object.entries(groupedTaxes).map(([groupName, items]) => {
                        const filteredItems = items.filter(item => item.value > 0.001 || item.name.includes("Mensalidade"));
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={groupName} className="space-y-3">
                                <Separator className="my-4"/>
                                <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                    {groupName}
                                </h4>
                                <div className="space-y-3">
                                {filteredItems.map(item => {
                                  let itemName = item.name;
                                  let rateInfo: string | null = null;
                                  
                                  if(item.name === 'DAS' && scenario.effectiveDasRate) {
                                      rateInfo = `(Alíq. Efetiva: ${formatPercent(scenario.effectiveDasRate)})`;
                                  } else if (item.name === 'INSS s/ Pró-labore') {
                                      rateInfo = '(11,00%)';
                                  } else if (item.name === 'CPP (INSS Patronal)') {
                                      rateInfo = '(20,00%)';
                                  }

                                  return (
                                  <div key={item.name} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground flex items-center gap-1.5">
                                        {itemName}
                                        {rateInfo && <span className="text-xs text-muted-foreground/80 font-medium">{rateInfo}</span>}
                                      </span>
                                      <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                  </div>
                                )})}
                                </div>
                            </div>
                        )
                      })}
                  </div>
                
                  <div className="p-6 mt-auto space-y-4">
                      {scenario.fatorR !== undefined && (
                      <div className={cn(
                          "text-center rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2",
                          scenario.fatorR >= 0.28 ? 'bg-green-100/80 text-green-900 border border-green-200/80' : 'bg-amber-100/80 text-amber-900 border border-amber-200/80'
                      )}>
                          {scenario.fatorR >= 0.28 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                          <span>Fator R: {formatPercent(scenario.fatorR)}</span>
                      </div>
                      )}
                      <div className={cn("p-4 rounded-lg bg-muted/30")}>
                          <div className="w-full space-y-2 text-center">
                              <div className='text-sm font-medium text-foreground'>Custo Total Mensal</div>
                              <div className="text-3xl font-bold text-primary">
                                  {formatCurrencyBRL(scenario.totalMonthlyCost)}
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                                  <div className="bg-gradient-to-r from-primary/70 to-primary h-2.5 rounded-full" style={{ width: `${Math.min(costPercentage*100, 100)}%` }}></div>
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
          <PartnerDetailsCard details={cheapestScenario as TaxDetails} />
          <ProfitStatementCard details={cheapestScenario as TaxDetails} />
        </>
      )}
    </div>
  );
};
