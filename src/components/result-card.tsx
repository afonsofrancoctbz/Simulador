
import { memo } from 'react';
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaxDetails } from "@/lib/types";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { CheckCircle, Info, Trophy } from 'lucide-react';

const ResultCardComponent = ({ details }: { details: TaxDetails }) => {
    const isCheapest = details.order === 1 && details.totalMonthlyCost > 0;
    const partnersCount = details.partnerTaxes.length || 1;
    const proLaborePerPartner = details.proLabore / partnersCount;

    const faturamentoTaxes = details.breakdown.filter(item => ['DAS', 'PIS', 'COFINS', 'ISS', 'IRPJ', 'CSLL'].some(tax => item.name.includes(tax)));
    const folhaTaxes = details.breakdown.filter(item => ['CPP', 'INSS s/ Pró-labore', 'IRRF s/ Pró-labore'].some(tax => item.name.includes(tax)));
    const outrosCustos = [{ name: 'Mensalidade Contabilizei', value: details.contabilizeiFee }];

    const parseTaxName = (name: string) => {
        const match = name.match(/^(.*?)(\s\(.*\))?$/);
        if (!match) return { baseName: name, percentage: null };

        return {
            baseName: match[1],
            percentage: match[2] || null
        };
    };

    return (
        <Card className={cn(
            "flex flex-col w-full max-w-sm mx-auto shadow-lg transition-all duration-300 relative border-2 bg-card", 
            isCheapest ? 'border-primary shadow-primary/30' : 'border-border/80'
        )}>
            {isCheapest && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold text-sm px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"><Trophy className="h-4 w-4" />Recomendado</Badge>}
            
            <CardHeader className={cn(
                'pt-10 pb-4 text-center',
                 isCheapest ? 'bg-primary/5' : ''
            )}>
                <CardTitle className="text-xl font-bold text-foreground">{details.regime}</CardTitle>
                 {details.annex && <CardDescription className='font-semibold text-primary/90 text-base mt-1'>{details.annex}</CardDescription>}
            </CardHeader>

            <CardContent className="flex-grow p-4 pt-2 space-y-4 flex flex-col text-sm">
                
                <div className="p-4 border rounded-lg bg-muted/20 space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Faturamento Mensal</span>
                        <span className="font-bold text-foreground">{formatCurrencyBRL(details.totalRevenue)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pró-labore por Sócio</span>
                        <span className="font-bold text-foreground">{formatCurrencyBRL(proLaborePerPartner)}</span>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-background/30 space-y-3 flex-grow">
                    {faturamentoTaxes.length > 0 && (
                        <div className="space-y-1.5">
                            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-2">Impostos s/ Faturamento</h4>
                            {faturamentoTaxes.map((item, index) => {
                                const { baseName, percentage } = parseTaxName(item.name);
                                return (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        {baseName}
                                        {percentage && <span className='ml-1.5 font-bold text-primary'>{percentage}</span>}
                                    </span>
                                    <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                </div>
                            )})}
                        </div>
                    )}
                    
                    {folhaTaxes.length > 0 && (
                         <div className="space-y-1.5 pt-3 mt-3 border-t border-dashed">
                            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-2">Encargos s/ Folha e Pró-labore</h4>
                            {folhaTaxes.map((item, index) => {
                                const { baseName, percentage } = parseTaxName(item.name);
                                return (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        {baseName}
                                        {percentage && <span className='ml-1.5 font-bold text-primary'>{percentage}</span>}
                                    </span>
                                    <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                </div>
                            )})}
                        </div>
                    )}

                     {outrosCustos.length > 0 && (
                         <div className="space-y-1.5 pt-3 mt-3 border-t border-dashed">
                            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs mb-2">Outros Custos</h4>
                            {outrosCustos.map((item, index) => (
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
                        "text-center rounded-lg p-3 text-sm font-semibold flex flex-col items-center justify-center gap-1", 
                        details.fatorR >= 0.28 
                            ? 'bg-green-100 text-green-900 border border-green-200' 
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                    )}>
                        <span>Fator R: {formatPercent(details.fatorR)}</span>
                         {details.fatorR >= 0.28 && (
                             <span className="flex items-center gap-1.5 text-xs"><CheckCircle className="h-3.5 w-3.5"/> Cenário otimizado</span>
                         )}
                    </div>
                )}
                
                {details.notes && details.notes.map((note, index) => (
                     <div key={index} className="flex items-start gap-3 p-3 text-xs rounded-lg bg-sky-50 text-sky-900 border border-sky-200">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{note}</p>
                    </div>
                ))}
            </CardContent>

            <CardFooter className={cn(
                "p-4 bg-muted/30 mt-auto border-t",
                isCheapest ? 'bg-primary/5' : ''
            )}>
                <div className="text-center w-full space-y-1">
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
                    <p className="text-xs text-muted-foreground">(Impostos + Mensalidade)</p>
                </div>
            </CardFooter>
        </Card>
    );
};

ResultCardComponent.displayName = 'ResultCard';

export const ResultCard = memo(ResultCardComponent);
