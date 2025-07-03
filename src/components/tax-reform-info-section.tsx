
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
            Entenda a Reforma Tributária e a CBS (Simulação 2026)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Acompanhe o que muda com a Contribuição sobre Bens e Serviços (CBS) e como ela impactará sua empresa, incluindo o Simples Nacional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                O que é o tributo CBS e qual a diferença para o IBS?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  A <strong>Contribuição sobre Bens e Serviços (CBS)</strong> é um dos dois tributos que formam o novo Imposto sobre Valor Agregado (IVA). O objetivo da CBS é unificar e substituir os tributos federais sobre o consumo: <strong>PIS, COFINS e IPI</strong>.
                </p>
                <p>
                  Já o <strong>Imposto sobre Bens e Serviços (IBS)</strong> é o outro componente do IVA, que substitui os impostos de competência estadual (ICMS) e municipal (ISS).
                </p>
                <p>
                  Juntos, CBS e IBS possuem as mesmas características: incidem sobre todas as operações de venda de bens e serviços de forma não cumulativa, ou seja, o imposto pago na etapa anterior pode ser usado como crédito na etapa seguinte.
                </p>
                 <p>
                  Para empresas do <strong>Simples Nacional</strong>, a mudança principal é que os impostos atuais (PIS, COFINS, ISS, etc.) serão substituídos por CBS e IBS dentro da guia DAS, mas a carga tributária total não deve aumentar no modelo tradicional. No entanto, a reforma prevê um modelo <strong>híbrido</strong> opcional, onde a empresa do Simples pode recolher a CBS e o IBS fora da DAS para gerar mais créditos aos seus clientes B2B.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Quando a CBS e a Reforma entram em vigor?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>
                  A transição será gradual e longa, começando em 2026, após um período de regulamentação em 2024 e 2025.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>2026:</strong> Início da fase de testes. Empresas do Lucro Presumido e Real começam a destacar nas notas fiscais valores simbólicos de <strong>0,9% para CBS</strong> e <strong>0,1% para IBS</strong>, sem alteração no valor final a ser pago.</li>
                    <li><strong>2027:</strong> A CBS entra em vigor plenamente, <strong>extinguindo o PIS e a COFINS</strong>. As alíquotas do IPI são zeradas (exceto para produtos da Zona Franca de Manaus). O Simples Nacional passa a operar no novo sistema, com a opção pelo regime híbrido. Também entra em vigor o Imposto Seletivo.</li>
                    <li><strong>2029-2032:</strong> O ICMS e o ISS são reduzidos gradualmente, enquanto o IBS tem sua alíquota aumentada na mesma proporção.</li>
                    <li><strong>2033:</strong> O novo sistema tributário entra em vigor integralmente com a substituição completa do ICMS e ISS pelo IBS.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Qual será a alíquota da CBS e do IVA?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  A alíquota exata do IVA (soma de CBS e IBS) ainda não foi definida, mas as estimativas do governo giram em torno de <strong>26,5% a 28%</strong>.
                </p>
                <p>
                  Uma projeção divide essa alíquota em aproximadamente <strong>9,3% para a CBS</strong> (federal) e <strong>18,7% para o IBS</strong> (estadual/municipal). É importante notar que estes são valores estimados e podem mudar.
                </p>
                <p>
                  A legislação prevê alíquotas reduzidas e regimes específicos para setores essenciais como saúde, educação, cultura, e para profissionais liberais com atividades regulamentadas, além de isenções para itens da cesta básica.
                </p>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Como será o cálculo e o recolhimento?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O princípio fundamental do IVA é a <strong>não cumulatividade</strong>. O imposto é aplicado apenas ao valor "agregado" em cada etapa.
                </p>
                <p>
                  <strong>Exemplo simplificado:</strong> Uma indústria vende uma cadeira por R$ 50,00 para um varejista, pagando R$ 4,65 de CBS (9,3% sobre R$ 50). O varejista vende essa cadeira por R$ 100,00. Ele não pagará o imposto sobre os R$ 100, mas sim sobre os R$ 50 que ele agregou ao preço. Assim, ele também pagará R$ 4,65 de CBS. O total de imposto recolhido na cadeia é de R$ 9,30, que corresponde à alíquota sobre o preço final ao consumidor.
                </p>
                <p>
                  O recolhimento será modernizado com o <strong>"split payment"</strong>. No momento da transação, o sistema automaticamente divide o pagamento: uma parte para a empresa (valor do produto/serviço) e outra parte (valor do imposto) que é transferida diretamente ao governo. Isso visa simplificar o processo e combater a sonegação.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
