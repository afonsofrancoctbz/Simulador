
import { memo } from 'react';
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaxDetails, TaxFormValues } from "@/lib/types";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Info } from 'lucide-react';

const ResultCardComponent = ({ details, isCheapest, formValues }: { details: TaxDetails, isCheapest: boolean, formValues: TaxFormValues }) => {
    const numSocios = formValues.numberOfPartners || 1;
    
    const isLucroPresumido = details.regime === 'Lucro Presumido';

    const faturamentoGeralTaxes = !isLucroPresumido ? details.breakdown.filter(item => [
        'DAS (Guia Unificada)', 
        'DAS (Simples Nacional)',
        'IVA (CBS+IBS) fora do DAS',
        'ISS (Fora do DAS)',
        'CBS',
        'IBS'
    ].includes(item.name)) : [];

    const faturamentoMensalTaxes = isLucroPresumido 
        ? details.breakdown.filter(item => ['PIS', 'COFINS', 'ISS'].includes(item.name)) 
        : [];

    const faturamentoTrimestralTaxes = isLucroPresumido
        ? details.breakdown.filter(item => ['IRPJ', 'CSLL'].includes(item.name))
        : [];
    
    const folhaTaxes = details.breakdown.filter(item => ['CPP (Encargos Patronais)', 'CPP (INSS Patronal - 20%)', 'INSS s/ Pró-labore (11%)', 'IRRF s/ Pró-labore'].includes(item.name));

    const proLaboreLabel = details.optimizationNote ? 'Pró-labore (Otimizado)' : 'Pró-labore por Sócio';

    const lucroPresumidoPercentages: { [key: string]: string } = {
      'PIS': '0,65%',
      'COFINS': '3,00%',
      'CSLL': '2,88%',
      'ISS': '5,00%',
    };

    const totalImpostosFaturamentoLP = [...faturamentoMensalTaxes, ...faturamentoTrimestralTaxes].reduce((sum, item) => sum + item.value, 0);
    const aliquotaEfetivaFaturamento = details.totalRevenue > 0 ? totalImpostosFaturamentoLP / details.totalRevenue : 0;

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

            <CardContent className="flex-grow p-3 space-y-2 flex flex-col">
                
                <div className="p-2 border rounded-md bg-background/80 space-y-1 text-sm">
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
                     <div className="p-2 border rounded-md bg-background/80 space-y-1.5 text-sm">
                        
                        {isLucroPresumido ? (
                            <>
                                {faturamentoMensalTaxes.length > 0 && (
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Impostos s/ Faturamento Mensal</h4>
                                        {faturamentoMensalTaxes.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center border-b border-dashed pb-0.5 last:border-b-0">
                                                <span className="text-muted-foreground">
                                                    {item.name}
                                                    {lucroPresumidoPercentages[item.name] && <span className='ml-1.5 font-bold text-primary'>{lucroPresumidoPercentages[item.name]}</span>}
                                                </span>
                                                <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {faturamentoTrimestralTaxes.length > 0 && (
                                    <div className="space-y-1 pt-1.5">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Impostos s/ Faturamento Trimestral</h4>
                                        <p className="text-xs text-muted-foreground/80 -mt-1 mb-2">Valores provisionados mensalmente.</p>
                                        {faturamentoTrimestralTaxes.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center border-b border-dashed pb-0.5 last:border-b-0">
                                                <span className="text-muted-foreground">
                                                    {item.name}
                                                    <span className='ml-1.5 font-bold text-primary'>
                                                        {item.name === 'IRPJ' 
                                                            ? formatPercent(details.totalRevenue > 0 ? item.value / details.totalRevenue : 0) 
                                                            : (lucroPresumidoPercentages[item.name] || '')
                                                        }
                                                    </span>
                                                </span>
                                                <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t border-solid pt-1 mt-1 font-semibold">
                                    <span>Alíquota Efetiva Total</span>
                                    <span className="text-primary">{formatPercent(aliquotaEfetivaFaturamento)}</span>
                                </div>
                            </>
                        ) : (
                            faturamentoGeralTaxes.length > 0 && (
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Impostos s/ Faturamento</h4>
                                    {faturamentoGeralTaxes.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center border-b border-dashed pb-0.5 last:border-b-0">
                                            <span className="text-muted-foreground">
                                                {item.name}
                                                {item.name === 'DAS (Guia Unificada)' && details.effectiveDasRate !== undefined && (
                                                    <span className='ml-1.5 font-bold text-primary'>{formatPercent(details.effectiveDasRate)}</span>
                                                )}
                                            </span>
                                            <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                        
                        {folhaTaxes.length > 0 && (
                             <div className="space-y-1 pt-1.5">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Encargos s/ Folha e Pró-labore</h4>
                                {folhaTaxes.map((item, index) => {
                                    const match = item.name.match(/(\d+(\.\d+)?%)/);
                                    return (
                                        <div key={index} className="flex justify-between items-center border-b border-dashed pb-0.5 last:border-b-0">
                                            <span className="text-muted-foreground">
                                                {match ? (
                                                    <>
                                                        {item.name.split(match[0])[0]}
                                                        <span className='font-bold text-primary'>{match[0]}</span>
                                                        {item.name.split(match[0])[1]}
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
                    <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                       <span>Custo Total Mensal Estimado</span>
                        {details.totalRevenue > 0 && (
                            <span className="font-bold text-primary">
                                {formatPercent(details.totalMonthlyCost / details.totalRevenue)}
                            </span>
                        )}
                    </div>
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
