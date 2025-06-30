
import { memo } from 'react';
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaxDetails, TaxFormValues } from "@/lib/types";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Info } from 'lucide-react';

const ResultCardComponent = ({ details, isCheapest, formValues }: { details: TaxDetails, isCheapest: boolean, formValues: TaxFormValues }) => {
    const numSocios = formValues.numberOfPartners || 1;
    
    const faturamentoTaxes = details.breakdown.filter(item => ['DAS (Guia Unificada)', 'PIS', 'COFINS', 'ISS', 'IRPJ', 'CSLL', 'ISS (Fora do DAS)'].includes(item.name));
    const folhaTaxes = details.breakdown.filter(item => ['CPP (INSS Patronal - 20%)', 'INSS s/ Pró-labore (11%)', 'IRRF s/ Pró-labore'].includes(item.name));

    const proLaboreLabel = details.optimizationNote ? 'Pró-labore (Otimizado)' : 'Pró-labore por Sócio';

    return (
        <Card className={cn(
            "flex flex-col w-full max-w-sm mx-auto shadow-lg transition-all duration-300 relative border-2", 
            isCheapest ? 'border-primary shadow-primary/30' : 'border-border/80 bg-muted/20'
        )}>
            {isCheapest && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold text-sm px-4 py-1.5 rounded-full shadow-lg">🏆 Recomendado</Badge>}
            
            <CardHeader className={cn(
                'pt-8 pb-1 text-center',
                 isCheapest ? 'bg-primary/5' : ''
            )}>
                <CardTitle className="text-xl font-bold text-foreground">{details.regime}</CardTitle>
                {details.annex && <CardDescription className='font-semibold text-primary/90 text-base'>{details.annex}</CardDescription>}
            </CardHeader>

            <CardContent className="flex-grow p-3 space-y-2 flex flex-col text-sm">
                
                <div className="p-2 border rounded-md bg-background/80 space-y-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Faturamento Mensal</span>
                        <span className="font-medium text-foreground">{formatCurrencyBRL(details.totalRevenue)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">{proLaboreLabel}</span>
                        <span className="font-medium text-foreground">{formatCurrencyBRL(details.proLabore / numSocios)}</span>
                    </div>
                </div>
                
                <div className="space-y-2">
                     <div className="p-2 border rounded-md bg-background/80 space-y-1.5">
                        
                        {faturamentoTaxes.length > 0 && (
                             <div className="space-y-1">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Impostos s/ Faturamento</h4>
                                {faturamentoTaxes.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b border-dashed pb-0.5 last:border-b-0">
                                        <span className="text-muted-foreground">
                                            {item.name}
                                            {item.name === 'DAS (Guia Unificada)' && details.effectiveDasRate !== undefined && (
                                                <span className='ml-1.5 font-bold text-primary'>({formatPercent(details.effectiveDasRate)})</span>
                                            )}
                                        </span>
                                        <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {folhaTaxes.length > 0 && (
                             <div className="space-y-1 pt-1.5">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Encargos s/ Folha e Pró-labore</h4>
                                {folhaTaxes.map((item, index) => {
                                    const match = item.name.match(/(\(\s*\d+(\.\d+)?%\s*\))/);
                                    return (
                                        <div key={index} className="flex justify-between items-center border-b border-dashed pb-0.5 last:border-b-0">
                                            <span className="text-muted-foreground">
                                                {match ? (
                                                    <>
                                                        {item.name.replace(match[0], '').trim()}
                                                        <span className='ml-1.5 font-bold text-primary'>{match[0]}</span>
                                                    </>
                                                ) : (
                                                    item.name
                                                )}
                                            </span>
                                            <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="space-y-1 pt-1.5">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Outros Custos</h4>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Mensalidade Contabilizei</span>
                                <span className="font-medium text-foreground">{formatCurrencyBRL(details.contabilizeiFee)}</span>
                            </div>
                        </div>

                     </div>
                </div>

                 {details.fatorR !== undefined && (
                    <div className={cn(
                        "text-center rounded-md p-1.5 text-sm", 
                        details.fatorR >= 0.28 
                            ? 'bg-green-100 text-green-900 border border-green-200' 
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                    )}>
                        <span className="font-semibold">Fator R: <span className="font-bold text-primary">{formatPercent(details.fatorR)}</span></span>
                        <p className="text-xs mt-0.5">{details.fatorR >= 0.28 ? '✅ Cenário otimizado' : '⚠️ Alíquota maior aplicada'}</p>
                    </div>
                )}

                 {details.optimizationNote && (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-start gap-2">
                         <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                         <p>{details.optimizationNote}</p>
                     </div>
                )}
            </CardContent>

            <CardFooter className="p-2 bg-muted/30 mt-auto border-t">
                <div className="text-center w-full space-y-0.5">
                    <div className="text-sm text-muted-foreground">Custo Total Mensal Estimado</div>
                    <div className="text-2xl font-bold text-primary">
                        {formatCurrencyBRL(details.totalMonthlyCost)}
                    </div>
                     <div className="text-xs text-muted-foreground">
                        (Impostos + Mensalidade)
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

ResultCardComponent.displayName = 'ResultCard';

export const ResultCard = memo(ResultCardComponent);
