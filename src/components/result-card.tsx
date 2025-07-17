
import { memo } from 'react';
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaxDetails } from "@/lib/types";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Banknote, ChevronsDown, ChevronsUp, HandCoins } from 'lucide-react';

const ResultCardComponent = ({ details, numPartners }: { details: TaxDetails, numPartners: number }) => {

    const isLucroPresumido = details.regime.includes('Lucro Presumido');

    // Separa os impostos por tipo para exibição em blocos distintos
    const faturamentoGeralTaxes = details.breakdown.filter(item => [
        'DAS (Guia Unificada)', 'PIS', 'COFINS', 'ISS', 'IRPJ', 'CSLL'
    ].some(tax => item.name.includes(tax)));

    const folhaTaxes = details.breakdown.filter(item => ['CPP (Encargos Patronais)', 'INSS s/ Pró-labore', 'IRRF s/ Pró-labore'].some(tax => item.name.includes(tax)));

    // Calcula os valores para o resumo dos sócios
    const inssProLabore = details.breakdown.find(item => item.name.includes('INSS s/ Pró-labore'))?.value ?? 0;
    const irrfProLabore = details.breakdown.find(item => item.name.includes('IRRF s/ Pró-labore'))?.value ?? 0;
    const totalDescontosProLabore = inssProLabore + irrfProLabore;
    const liquidoPorSocio = numPartners > 0 ? (details.proLabore - totalDescontosProLabore) / numPartners : 0;

    const isCheapest = details.order === 1 && details.totalMonthlyCost > 0;

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

            <CardContent className="flex-grow p-4 space-y-4 flex flex-col text-sm">
                
                <div className="p-3 border rounded-md bg-background/80 flex justify-between items-center text-base">
                    <span className="text-muted-foreground flex items-center gap-2"><Banknote className="h-5 w-5"/>Faturamento</span>
                    <span className="font-bold text-foreground">{formatCurrencyBRL(details.totalRevenue)}</span>
                </div>
                
                <div className="p-3 border rounded-md bg-background/80 space-y-4">
                    {faturamentoGeralTaxes.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-1.5">Impostos s/ Faturamento</h4>
                            {faturamentoGeralTaxes.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        {item.name}
                                        {item.name.includes('DAS') && details.effectiveDasRate !== undefined && (
                                            <span className='ml-1.5 font-bold text-primary/90'>{formatPercent(details.effectiveDasRate)}</span>
                                        )}
                                    </span>
                                    <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {folhaTaxes.length > 0 && (
                         <div className="space-y-1 pt-2 mt-2 border-t border-dashed">
                            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-1.5">Encargos s/ Folha e Pró-labore</h4>
                            {folhaTaxes.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {details.fatorR !== undefined && (
                    <div className={cn(
                        "text-center rounded-md p-2 text-sm font-semibold", 
                        details.fatorR >= 0.28 
                            ? 'bg-green-100 text-green-900 border border-green-200' 
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                    )}>
                        Fator R: {formatPercent(details.fatorR)}
                    </div>
                )}
                
                <div className="p-3 border rounded-md bg-background/80 space-y-1">
                    <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-1.5">Resumo para os Sócios</h4>
                    <div className='flex justify-between items-center'>
                        <span className="text-muted-foreground flex items-center gap-2"><HandCoins className='h-4 w-4'/>Pró-labore Bruto</span>
                        <span className="font-medium">{formatCurrencyBRL(details.proLabore)}</span>
                    </div>
                    <div className='flex justify-between items-center text-destructive'>
                        <span className="flex items-center gap-2"><ChevronsDown className='h-4 w-4'/>Total Descontos</span>
                        <span className="font-medium">- {formatCurrencyBRL(totalDescontosProLabore)}</span>
                    </div>
                    <div className='flex justify-between items-center text-green-700 font-bold border-t mt-1.5 pt-1.5'>
                        <span className="flex items-center gap-2"><ChevronsUp className='h-4 w-4'/>Líquido por Sócio</span>
                        <span>{formatCurrencyBRL(liquidoPorSocio)}</span>
                    </div>
                </div>

                {details.netProfit !== undefined && (
                    <div className="p-3 border rounded-md bg-background/80 space-y-1">
                        <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-1.5">Demonstrativo de Lucro</h4>
                        <div className='flex justify-between items-center'>
                            <span className="text-muted-foreground">Lucro Líquido Empresa</span>
                            <span className="font-medium">{formatCurrencyBRL(details.netProfit)}</span>
                        </div>
                        <div className='flex justify-between items-center font-bold text-green-700 border-t mt-1.5 pt-1.5'>
                            <span>Distribuição de Lucros</span>
                            <span>{formatCurrencyBRL(details.netProfit)}</span>
                        </div>
                        <p className='text-xs text-muted-foreground pt-2'>*A distribuição de lucros é isenta de IR para o sócio, conforme Lei 9.249/95.</p>
                    </div>
                )}
                
            </CardContent>

            <CardFooter className="p-3 bg-muted/30 mt-auto border-t">
                <div className="text-center w-full space-y-0.5">
                    <div className="flex justify-center items-baseline gap-2 text-sm text-muted-foreground">
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
                </div>
            </CardFooter>
        </Card>
    );
};

ResultCardComponent.displayName = 'ResultCard';

export const ResultCard = memo(ResultCardComponent);
