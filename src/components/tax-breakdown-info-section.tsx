
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, List, FileText } from "lucide-react";

export default function TaxBreakdownInfoSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <PieChart className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Entendendo a Repartição dos Tributos
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Saiba como a sua guia de imposto (DAS) é composta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <List className="mr-3 text-primary h-5 w-5" />
                Quais impostos compõem o Simples Nacional?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O Documento de Arrecadação do Simples Nacional (DAS) unifica vários tributos em uma única guia. O percentual de repartição indica quanto da sua alíquota efetiva corresponde a cada um dos impostos federais, estaduais e municipais:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>CPP:</strong> Contribuição Patronal Previdenciária (INSS da empresa)</li>
                    <li><strong>IRPJ:</strong> Imposto de Renda de Pessoa Jurídica</li>
                    <li><strong>CSLL:</strong> Contribuição Social sobre o Lucro Líquido</li>
                    <li><strong>PIS/Pasep:</strong> Programa de Integração Social</li>
                    <li><strong>COFINS:</strong> Contribuição para o Financiamento da Seguridade Social</li>
                    <li><strong>ISS:</strong> Imposto sobre Serviços (Municipal)</li>
                    <li><strong>ICMS:</strong> Imposto sobre Circulação de Mercadorias e Serviços (Estadual, para comércio)</li>
                </ul>
                <p>Nossa calculadora já mostra os valores principais de forma separada para maior clareza.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <FileText className="mr-3 text-primary h-5 w-5" />
                 Regra Especial do ISS (Imposto Municipal)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>Existe uma regra importante para o Imposto Sobre Serviços (ISS): o percentual efetivo recolhido dentro do DAS é limitado a no máximo 5% sobre o faturamento.</p>
                 <p>Quando a alíquota efetiva do Simples Nacional aumenta muito nas faixas de maior faturamento, a parcela que seria destinada ao ISS ultrapassaria esse teto. Para corrigir isso, a lei determina que:</p>
                 <ul className="list-disc pl-6 space-y-2">
                    <li>A alíquota de ISS dentro do DAS é travada em 5%.</li>
                    <li>A diferença ("sobra") é automaticamente redistribuída de forma proporcional entre os outros tributos federais (IRPJ, CSLL, PIS, COFINS) dentro da mesma guia.</li>
                 </ul>
                 <p>Você não precisa se preocupar com este cálculo, pois nossa ferramenta já considera essa regra para garantir a precisão do seu resultado.</p>
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
