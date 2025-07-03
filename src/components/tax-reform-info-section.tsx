
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Info className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Entenda a Reforma Tributária (Simulação 2026)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Aprovada no Brasil, a reforma não altera diretamente o regime do Simples Nacional, mas traz pontos de atenção para empresas B2B.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                Quais as principais mudanças?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Um dos principais focos da Reforma Tributária está na unificação dos cinco principais tributos sobre consumo de bens e serviços (ISS, ICMS, IPI, PIS, COFINS) no chamado <strong>Imposto sobre Valor Agregado (IVA)</strong>.
                </p>
                <p>
                  O IVA será "dual", composto pela <strong>Contribuição sobre Bens e Serviços (CBS)</strong>, que unifica os tributos federais (PIS, COFINS, IPI), e pelo <strong>Imposto sobre Bens e Serviços (IBS)</strong>, que unifica os tributos estaduais e municipais (ICMS, ISS).
                </p>
                <p>
                  A principal característica do IVA é a <strong>não cumulatividade plena</strong>, que evita a cobrança de imposto em cascata, permitindo que os impostos pagos em cada etapa da cadeia produtiva sejam compensados nas fases seguintes.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                O que muda para o Simples Nacional?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O Simples Nacional mantém sua essência. O recolhimento continuará via DAS, e os tributos substituídos (PIS, COFINS, ISS, etc.) serão agrupados como CBS e IBS dentro da guia, <strong>sem aumento da carga tributária total</strong> no modelo tradicional.
                </p>
                <p>
                  A principal mudança está na <strong>geração de créditos tributários</strong> para clientes. Empresas do Simples que vendem para outras empresas (B2B) do Lucro Presumido ou Lucro Real passarão a conceder créditos de IBS e CBS. No entanto, o crédito será baseado no valor efetivamente pago no DAS (que é reduzido), e não na alíquota cheia como acontecia com PIS/COFINS, o que pode diminuir a atratividade de seus serviços.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                O que é o Simples Nacional Híbrido?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Para manter a competitividade, empresas B2B do Simples Nacional terão uma opção: o <strong>regime híbrido</strong>. Elas poderão optar por recolher a CBS e o IBS fora do DAS, pela alíquota padrão do IVA, para suas vendas a outras empresas.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Vantagem:</strong> Permite gerar um crédito fiscal integral para o cliente, tornando seu serviço mais competitivo.</li>
                  <li><strong>Desvantagem:</strong> Aumenta a carga tributária para a própria empresa do Simples, pois ela pagará a alíquota cheia de CBS/IBS sobre essa parte do faturamento.</li>
                </ul>
                <p>
                  Para empresas que vendem para pessoas físicas (B2C) ou exportam, o regime tradicional do Simples Nacional continua sendo a melhor opção, pois seus clientes não utilizam créditos.
                </p>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Como acontece a transição?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  A transição será gradual, começando em 2026.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>2026:</strong> Início de uma fase de testes para empresas do Lucro Presumido e Real, com alíquotas de 0,9% para CBS e 0,1% para IBS, que podem ser compensadas.</li>
                    <li><strong>2027:</strong> A CBS entra em vigor plenamente, extinguindo PIS e COFINS. A opção pelo regime híbrido do Simples Nacional passa a valer.</li>
                    <li><strong>2029-2032:</strong> ICMS e ISS são gradualmente reduzidos.</li>
                    <li><strong>2033:</strong> O novo sistema tributário entra em vigor integralmente com a substituição completa de ICMS e ISS pelo IBS.</li>
                </ul>
                 <p className="text-sm mt-3">
                  <strong>Nota do Simulador:</strong> Esta simulação para 2026 utiliza as alíquotas de teste (0,9% CBS e 0,1% IBS) para ilustrar os possíveis cenários e ajudar no planejamento estratégico.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
