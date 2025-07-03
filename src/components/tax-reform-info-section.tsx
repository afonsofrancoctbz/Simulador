
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Landmark className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Entenda o IBS (Imposto sobre Bens e Serviços)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            O IBS vai unificar os impostos estadual (ICMS) e municipal (ISS) que incidem sobre bens e serviços, conforme a proposta da nova Reforma Tributária. Entenda como essa mudança pode impactar sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                O que é o IBS da reforma tributária?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  IBS é a sigla para Imposto sobre Bens e Serviços. Essa forma de arrecadação é uma das propostas da Reforma Tributária e tem como base o modelo IVA (Imposto sobre Valor Agregado), utilizado por grande parte dos países desenvolvidos.
                </p>
                <p>
                  O IBS vai substituir os tributos estadual e municipal — Imposto sobre a Circulação de Mercadorias (ICMS) e o Imposto Sobre Serviços (ISS) — e transformá-los em uma cobrança única.
                </p>
                <p>
                  Essa unificação visa a simplificação na forma como os impostos sobre consumo são cobrados e calculados no Brasil. As formas de recolhimento, cálculo e definição de alíquotas passam a ser nacionais, com o mesmo regulamento em todo o Brasil.
                </p>
                <p>
                  Outra característica do IBS é a não cumulatividade. O tributo será aplicado apenas sobre o valor que foi agregado na mercadoria para a próxima venda, evitando que um imposto seja calculado sobre o outro.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Exemplo de cálculo de IBS
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Na prática, esse imposto incidirá sobre o valor agregado em cada etapa. Para deixar o entendimento mais claro, vamos utilizar um exemplo com a fabricação de um suco, com uma alíquota fictícia do IBS de 10%.
                </p>
                <ul className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong className="text-foreground/90">Produtor:</strong> Vende as frutas para o fabricante por R$ 10,00. Sobre esse valor, ele paga 10% de imposto: <strong className="text-primary">R$ 1,00 de IBS</strong>.
                  </li>
                  <li>
                    <strong className="text-foreground/90">Fabricante:</strong> Transforma as frutas em suco e vende para um supermercado por R$ 15,00. O valor agregado foi de R$ 5,00 (R$ 15 - R$ 10). O imposto sobre o valor agregado é de <strong className="text-primary">R$ 0,50</strong> (10% de R$ 5).
                  </li>
                  <li>
                    <strong className="text-foreground/90">Supermercado:</strong> Vende o suco para o consumidor final por R$ 25,00. O valor agregado foi de R$ 10,00 (R$ 25 - R$ 15). O imposto sobre o valor agregado é de <strong className="text-primary">R$ 1,00</strong> (10% de R$ 10).
                  </li>
                </ul>
                <p className="mt-4">
                  O cliente final pagou R$ 25,00 pelo suco. O imposto total embutido no preço foi de R$ 2,50 (R$ 1,00 + R$ 0,50 + R$ 1,00), que corresponde exatamente a 10% do valor final. Essa fórmula de cálculo evita a cobrança de imposto sobre imposto (bitributação).
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Quais impostos são unificados pelo IVA (CBS e IBS)?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>Atualmente, os 5 principais impostos sobre o consumo de bens e serviços são:</p>
                 <ul className="list-disc pl-6 space-y-2">
                    <li>ICMS (estadual)</li>
                    <li>ISS (municipal)</li>
                    <li>IPI (federal)</li>
                    <li>PIS (federal)</li>
                    <li>Cofins (federal)</li>
                </ul>
                <p>Essa forma de arrecadação tende a gerar transtornos como acúmulo de tributos e diferentes alíquotas e bases de cálculo.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                O que muda com a Reforma Tributária?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Com a aprovação do IVA brasileiro (chamado de "IVA Dual"), os 5 impostos sobre consumo deixam de ser cobrados separadamente e se tornam dois novos tributos:
                </p>
                 <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>IBS (Imposto sobre Bens e Serviços):</strong> Unifica o ICMS (estadual) e o ISS (municipal).
                    </li>
                     <li>
                        <strong>CBS (Contribuição sobre Bens e Serviços):</strong> Unifica os tributos federais PIS, Cofins e zera as alíquotas de IPI.
                    </li>
                </ul>
                <p>
                  A alíquota geral do IVA estimada é de 28%, dividindo-se em aproximadamente 18,7% de IBS e 9,3% de CBS.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                Qual a relação entre IVA e IBS?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  IVA significa Imposto sobre Valor Adicionado. Consiste em um tipo de tributação que tem como base de cálculo o valor agregado ao bem ou serviço em cada uma das suas etapas de produção e comercialização.
                </p>
                <p>
                  Utilizado em muitos países, o IVA é um tributo não-cumulativo que garante que o percentual do imposto cobrado do cliente final seja o mesmo que foi recolhido durante todo o processo, evitando a bitributação.
                </p>
                <p>
                  A relação do IVA com o IBS é que o modelo IVA serviu de inspiração para a criação do IBS e da CBS na Reforma Tributária Brasileira. É por isso que o nosso sistema é chamado de "IVA Dual".
                </p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
