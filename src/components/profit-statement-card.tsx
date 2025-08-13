

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import type { TaxDetails } from "@/lib/types";
import { DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function ProfitStatementCard({ details }: { details: TaxDetails | null }) {
  if (!details || details.totalRevenue <= 0) {
    return null;
  }

  const proLaboreLiquidoTotal = details.partnerTaxes.reduce((sum, partner) => sum + partner.proLaboreLiquido, 0);

  const profit = details.totalRevenue - details.totalTax - proLaboreLiquidoTotal - details.contabilizeiFee;
  
  const regimeTitle = details.regime.replace(' (Otimizado)', '');

  return (
    <Card className="shadow-lg border bg-card w-full max-w-5xl mx-auto">
        <CardHeader className="text-center">
            <DollarSign className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-2xl font-bold text-primary">
                Demonstrativo de Lucro ({regimeTitle})
            </CardTitle>
            <CardDescription className="text-md mt-2 text-muted-foreground">
                Uma visão simplificada do resultado da sua empresa no cenário selecionado.
            </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-4">
            <div className="space-y-2 text-lg">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">(+) Faturamento Mensal</span>
                    <span className="font-semibold text-foreground">{formatCurrencyBRL(details.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center text-destructive">
                    <span className="text-muted-foreground">(-) Total de Impostos e Encargos</span>
                    <span className="font-semibold">{formatCurrencyBRL(-details.totalTax)}</span>
                </div>
                 <div className="flex justify-between items-center text-destructive">
                    <span className="text-muted-foreground">(-) Pró-labore (Líquido)</span>
                    <span className="font-semibold">{formatCurrencyBRL(-proLaboreLiquidoTotal)}</span>
                </div>
                 <div className="flex justify-between items-center text-destructive">
                    <span className="text-muted-foreground">(-) Mensalidade Contabilizei</span>
                    <span className="font-semibold">{formatCurrencyBRL(-details.contabilizeiFee)}</span>
                </div>
            </div>
            <Separator className="my-4"/>
             <div className="flex justify-between items-center text-2xl font-bold text-primary pt-2">
                <span>(=) Lucro Disponível</span>
                <span>{formatCurrencyBRL(profit)}</span>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4">
                 A distribuição de lucros é isenta de Imposto de Renda para o sócio (Lei 9.249/95 – Art.10).
            </p>
        </CardContent>
    </Card>
  );
}
