
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import type { TaxDetails } from "@/lib/types";
import { Users } from "lucide-react";

export function PartnerDetailsCard({ details }: { details: TaxDetails | null }) {
  if (!details || !details.partnerTaxes || details.partnerTaxes.length === 0) {
    return null;
  }
  
  const regimeTitle = details.regime.replace(' (Otimizado)', '');

  return (
    <Card className="shadow-lg border bg-card w-full max-w-5xl mx-auto">
        <CardHeader className="text-center">
            <Users className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-2xl font-bold text-primary">
                Detalhamento por Sócio ({regimeTitle})
            </CardTitle>
            <CardDescription className="text-md mt-2 text-muted-foreground">
                Valores individuais de pró-labore e impostos retidos no cenário selecionado.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {details.partnerTaxes.map((partner, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/20 space-y-2">
                        <h4 className="font-bold text-foreground">Sócio {index + 1}</h4>
                        <div className="space-y-1 text-sm">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Pró-labore Bruto</span>
                                <span className="font-medium">{formatCurrencyBRL(partner.proLaboreBruto)}</span>
                            </div>
                            <div className="flex justify-between items-center text-destructive">
                                <span className="text-muted-foreground">(-) INSS Retido (11%)</span>
                                <span className="font-medium">- {formatCurrencyBRL(partner.inss)}</span>
                            </div>
                            <div className="flex justify-between items-center text-destructive">
                                <span className="text-muted-foreground">(-) IRRF Retido</span>
                                <span className="font-medium">- {formatCurrencyBRL(partner.irrf)}</span>
                            </div>
                            <div className="flex justify-between items-center text-green-700 font-bold border-t mt-2 pt-2">
                                <span>(=) Pró-labore Líquido</span>
                                <span>{formatCurrencyBRL(partner.proLaboreLiquido)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
