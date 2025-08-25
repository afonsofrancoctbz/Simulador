"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, CalendarDays, AlertTriangle } from "lucide-react";

export default function CapitalSocialSection() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Saiba o que é o <span className="text-primary">Capital Social</span>.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10 items-start">
        {/* Left Column: Definition */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 h-full flex flex-col justify-center shadow-lg">
          <p className="text-xl font-medium leading-relaxed">
            Capital social é o <strong>investimento bruto inicial</strong> que uma empresa precisa para começar a funcionar e se manter até gerar lucro. Ele é a 1ª movimentação financeira da sua empresa.
          </p>
        </div>

        {/* Right Column: Steps */}
        <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 items-start relative">
                
                {/* Step 1: Definição do valor */}
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                            <Search className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Definição do valor</h3>
                    <p className="text-muted-foreground text-base max-w-sm">
                        A indicação é que se registre, no mínimo, R$ 1.000,00 (quantia válida para as modalidades Empresário Individual e Sociedade Limitada) e o valor pode ser alterado posteriormente.
                    </p>
                </div>

                {/* Step 2: Como usar? */}
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                            <CalendarDays className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Como usar?</h3>
                    <p className="text-muted-foreground text-base max-w-sm">
                        O valor do capital social pode ser utilizado para arcar com as despesas da sua empresa, como impostos e mensalidades da Contabilizei. Ao acabar, não há obrigatoriedade de reposição deste valor.
                    </p>
                </div>
            </div>
        </div>
      </div>

       <div className="flex items-start justify-center pt-4">
            <Alert variant="destructive" className="bg-amber-50/80 border-amber-200 text-amber-900 max-w-4xl">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="font-semibold text-amber-800">ATENÇÃO:</AlertTitle>
                <AlertDescription className="text-amber-900/90">
                     A definição do capital social constará no seu contrato social. Por isso, qualquer alteração solicitada após a assinatura do contrato será mediante à contratação do serviço avulso de <strong>ALTERAÇÃO CONTRATUAL</strong> (verificar valores), que leva cerca de 90 dias para ser concluído.
                </AlertDescription>
            </Alert>
        </div>
    </div>
  );
}
