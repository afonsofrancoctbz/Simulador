"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, AlertTriangle } from "lucide-react";

export default function CapitalSocialSection() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="shadow-lg border bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">
                Saiba o que é o Capital Social
              </CardTitle>
              <CardDescription className="text-md mt-1">
                O investimento inicial para sua empresa começar a operar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold text-foreground">O que é Capital Social?</h3>
                    <p className="text-muted-foreground mt-1">
                        Capital social é o investimento bruto inicial que uma empresa precisa para começar a funcionar e se manter até gerar lucro. Ele é a 1ª movimentação financeira da sua empresa.
                    </p>
                 </div>
                 <div>
                    <h3 className="text-lg font-semibold text-foreground">Definição do valor</h3>
                    <p className="text-muted-foreground mt-1">
                        A indicação é que se registre, no mínimo, R$ 1.000,00 (quantia válida para as modalidades Empresário Individual e Sociedade Limitada) e o valor pode ser alterado posteriormente.
                    </p>
                 </div>
                 <div>
                    <h3 className="text-lg font-semibold text-foreground">Como usar?</h3>
                    <p className="text-muted-foreground mt-1">
                        O valor do capital social pode ser utilizado para arcar com as despesas da sua empresa, como impostos e mensalidades da Contabilizei. Ao acabar, não há obrigatoriedade de reposição deste valor.
                    </p>
                 </div>
            </div>
             <div className="flex items-center justify-center">
                <Alert variant="destructive" className="bg-amber-50/80 border-amber-200 text-amber-900 max-w-md">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-semibold text-amber-800">ATENÇÃO:</AlertTitle>
                    <AlertDescription className="text-amber-900/90">
                        A definição do capital social constará no seu contrato social. Por isso, qualquer alteração solicitada após a assinatura do contrato será mediante à contratação do serviço avulso de <strong>ALTERAÇÃO CONTRATUAL</strong> (verificar valores), que leva cerca de 90 dias para ser concluído.
                    </AlertDescription>
                </Alert>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}