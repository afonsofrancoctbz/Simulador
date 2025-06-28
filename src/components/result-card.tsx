import { memo } from 'react';
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaxDetails, TaxFormValues } from "@/lib/types";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Lightbulb } from 'lucide-react';

const ResultCardComponent = ({ details, isCheapest, formValues }: { details: TaxDetails, isCheapest: boolean, formValues: TaxFormValues }) => {
    const numSocios = formValues.numberOfPartners || 1;
    const partnerTotalWithheld = details.partnerTaxes.inss + details.partnerTaxes.irrf;
    const totalWithheldForAllPartners = partnerTotalWithheld * numSocios;
    
    return (
        <Card className={cn("flex flex-col shadow-lg transition-all duration-300 relative", isCheapest ? 'border-2 border-primary shadow-primary/20' : 'border-border')}>
            {isCheapest && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold text-sm px-3 py-1">🏆 RECOMENDADO</Badge>}
            
            <CardHeader className={cn(isCheapest ? 'bg-primary/10' : 'bg-muted/30', 'pt-8 pb-4 text-center')}>
                <CardTitle className="text-2xl font-bold text-accent">{details.regime}</CardTitle>
                {details.annex && <CardDescription className='font-semibold'>{details.annex}</CardDescription>}
            </CardHeader>

            <CardContent className="flex-grow p-4 space-y-4 flex flex-col">
                {details.optimizationNote && (
                    <div className="p-3 border rounded-lg bg-emerald-50 text-emerald-900 border-emerald-200 text-sm font-serif flex items-start gap-3">
                         <Lightbulb className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                         <p>{details.optimizationNote}</p>
                     </div>
                )}
                
                <div className="space-y-2">
                     <h4 className="font-semibold text-foreground">💰 Pró-labore & Alíquotas</h4>
                     <div className="p-3 border rounded-lg bg-background space-y-2 font-serif text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Pró-labore Base</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrencyBRL(details.proLabore)}</span>
                        </div>
                        {details.effectiveDasRate !== undefined && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Alíquota Efetiva do Simples</span>
                                <span className="font-mono font-medium text-foreground">{formatPercent(details.effectiveDasRate)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 flex-grow">
                    <h4 className="font-semibold text-foreground">📊 Detalhamento dos Impostos e Custos</h4>
                    <div className="p-3 border rounded-lg bg-background space-y-2 font-serif text-sm">
                        {details.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-dashed pb-1 last:border-b-0">
                                <span className="text-muted-foreground">{item.name}</span>
                                <div className="text-right">
                                  <span className="font-mono font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                </div>
                            </div>
                        ))}
                         <div className="flex justify-between items-center font-bold pt-1 text-base border-t">
                            <span className="text-foreground">Total de Impostos</span>
                            <span className="font-mono text-accent">{formatCurrencyBRL(details.totalTax)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-1 border-t border-dashed">
                            <span className="text-muted-foreground">Mensalidade Contabilizei</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrencyBRL(details.contabilizeiFee)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                     <h4 className="font-semibold text-foreground">👥 Gestão de Sócios</h4>
                     <div className="p-3 border rounded-lg bg-background space-y-2 text-sm font-serif">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">INSS retido por sócio (11%):</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrencyBRL(details.partnerTaxes.inss)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IRRF retido por sócio:</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrencyBRL(details.partnerTaxes.irrf)}</span>
                        </div>
                         <div className="flex justify-between font-semibold pt-1 border-t border-dashed">
                            <span className="text-muted-foreground">Total retido por sócio:</span>
                            <span className="font-mono text-foreground">{formatCurrencyBRL(partnerTotalWithheld)}</span>
                        </div>
                         <div className="flex justify-between font-bold text-base pt-1 border-t">
                            <span className="text-foreground">Total retido de {numSocios} sócio(s):</span>
                            <span className="font-mono text-foreground">{formatCurrencyBRL(totalWithheldForAllPartners)}</span>
                        </div>
                     </div>
                </div>
                
                {details.fatorR !== undefined && (
                    <div className={cn(
                        "text-center rounded-md p-2", 
                        details.fatorR >= 0.28 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                    )}>
                        <span className="font-semibold">Fator R: {formatPercent(details.fatorR)}</span>
                        <p className="text-xs">{details.fatorR >= 0.28 ? '✅ Alíquota reduzida aplicada' : '⚠️ Considere aumentar pró-labore para otimizar'}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 border-t bg-muted/20 mt-auto">
                <div className="text-center w-full">
                    <div className="text-sm text-muted-foreground">Custo Total Mensal Estimado</div>
                    <div className="text-3xl font-bold text-foreground my-1">
                        {formatCurrencyBRL(details.totalMonthlyCost)}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

ResultCardComponent.displayName = 'ResultCard';

export const ResultCard = memo(ResultCardComponent);