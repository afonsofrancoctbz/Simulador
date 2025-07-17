
import { memo } from 'react';
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaxDetails } from "@/lib/types";
import { formatCurrencyBRL } from "@/lib/utils";
import { ChevronsDown, ChevronsUp, HandCoins } from 'lucide-react';

const PartnerProfitCardComponent = ({ details, numPartners }: { details: TaxDetails, numPartners: number }) => {

    const inssProLabore = details.breakdown.find(item => item.name.includes('INSS s/ Pró-labore'))?.value ?? 0;
    const irrfProLabore = details.breakdown.find(item => item.name.includes('IRRF s/ Pró-labore'))?.value ?? 0;
    const totalDescontosProLabore = inssProLabore + irrfProLabore;

    return (
        <Card className="flex flex-col w-full max-w-sm mx-auto shadow-lg border-2 border-primary">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground text-center">Resumo para os Sócios</CardTitle>
                 <CardDescription className='text-center'>Resultado líquido no cenário recomendado.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-4 space-y-4 text-sm">
                <div className="space-y-1">
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
                        <span>{formatCurrencyBRL( (details.proLabore - totalDescontosProLabore) / numPartners)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

PartnerProfitCardComponent.displayName = 'PartnerProfitCard';

export const PartnerProfitCard = memo(PartnerProfitCardComponent);
