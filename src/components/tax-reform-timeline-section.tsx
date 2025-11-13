"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Info } from 'lucide-react';

export default function TaxReformTimelineSection() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
            <Info className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">
            A Reforma Tributária do Consumo
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground max-w-3xl mx-auto">
            Entenda o processo de mudança e simplificação na forma como os tributos sobre o consumo serão cobrados e administrados no Brasil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-4 md:p-8">
            <div className="space-y-4 text-base text-foreground/90 text-justify">
                <h3 className="font-bold text-xl text-foreground text-left">Como é o Sistema Tributário no Brasil?</h3>
                <p>O atual sistema tributário brasileiro foi promulgado em 1988. Desde então, diferentes governos ofereceram propostas para sua simplificação. Essas tentativas têm como principal motivação simplificar a existência de diversos impostos, taxas e contribuições, além de diferentes regimes tributários e suas respectivas obrigações fiscais acessórias, presentes no sistema atual.</p>
                <p>Além de pagar os tributos, pessoas físicas e, em especial, as pessoas jurídicas, têm que prestar uma série de informações ao Fisco, periodicamente, tornando o acompanhamento das obrigações fiscais e tributárias um processo muito complexo. Como exemplo desta complexidade destaca-se o fato do Brasil possuir 26 estados, mais o Distrito Federal e mais de 5 mil municípios, sendo, cada um deles, responsável pela criação e alteração de regras fiscais dos tributos arrecadados, bem como, suas respectivas obrigações fiscais acessórias.</p>
            </div>

            <div className="space-y-4 text-base text-foreground/90 text-justify">
                <h3 className="font-bold text-xl text-foreground text-left">Quando a Reforma Tributária começará a valer?</h3>
                <p>Os anos de 2024 e 2025 devem ser anos de regulamentação da Reforma Tributária, ou seja, de edição, discussões e publicações de leis complementares e ordinárias, ao passo que os efeitos práticos começarão a ser vistos a partir de 2026.</p>
                <p>Vale destacar que o processo de adoção do novo modelo de tributação de consumo será longo e gradativo, e a transição final para o novo sistema de impostos acontecerá em 2033. Em termos práticos, significa dizer que ao longo de 7 anos, de 2026 a 2032, coexistirão dois sistemas tributários distintos, o atual e o novo. Isso significa que, durante este período, a contabilidade precisará atuar com base em duas regras tributárias, cálculos e declarações de impostos.</p>
                 <Alert variant="default" className="mt-4 bg-sky-50/80 border-sky-200 text-sky-900 text-left">
                    <AlertCircle className="h-5 w-5 text-sky-600" />
                    <AlertTitle className="font-bold text-sky-800">Neutralidade Tributária</AlertTitle>
                    <AlertDescription className="text-sky-900/90">
                        A princípio, a Reforma busca garantir a neutralidade tributária, ou seja, o contribuinte não será afetado com aumento da carga tributária, mas precisará recolher os mesmos tributos em guias de pagamento diferentes para o mesmo período.
                    </AlertDescription>
                </Alert>
            </div>

            <div className="space-y-4">
                 <h3 className="font-bold text-xl text-foreground text-center">O que esperar para os próximos anos</h3>
                <div className="relative w-full mt-4">
                    <Image
                        src="https://www.contabilizei.com.br/wp-content/uploads/2024/04/tabela-reforma-tributaria.png"
                        alt="Cronograma da Reforma Tributária de 2026 a 2033"
                        width={1024}
                        height={555}
                        className="rounded-lg shadow-md border"
                        data-ai-hint="tax reform timeline"
                    />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
