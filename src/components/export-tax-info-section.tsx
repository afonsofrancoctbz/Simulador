
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, BookCheck, Coins } from "lucide-react";

export default function ExportTaxInfoSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Plane className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Impostos sobre Serviços Prestados no Exterior
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda como funciona a tributação para receitas recebidas de clientes fora do Brasil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <BookCheck className="mr-3 text-primary h-5 w-5" />
                Simples Nacional
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Para empresas no Simples Nacional, a exportação de serviços conta com imunidade tributária para PIS, COFINS e ISS. Isso significa que, ao apurar seu imposto mensal (DAS), esses tributos não incidirão sobre a receita vinda do exterior.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Apuração Segregada:</strong> No momento de gerar a guia do Simples, você deve informar os valores recebidos do exterior em um campo separado.</li>
                    <li><strong>Redução no Imposto:</strong> O sistema do Simples Nacional calculará o DAS aplicando as alíquotas apenas dos impostos devidos (IRPJ, CSLL e, em alguns casos, a CPP), resultando em uma carga tributária significativamente menor sobre essa receita.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <BookCheck className="mr-3 text-primary h-5 w-5" />
                 Lucro Presumido
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>No Lucro Presumido, a exportação de serviços também goza de isenção de PIS, COFINS e ISS. Os impostos são apurados individualmente:</p>
                 <ul className="list-disc pl-6 space-y-2">
                    <li><strong>PIS e COFINS:</strong> Não incidem sobre a receita de exportação. Você não precisará pagar as guias desses tributos sobre os valores recebidos do exterior.</li>
                    <li><strong>ISS:</strong> Também não há incidência. O ISS é um imposto municipal e, por lei, a exportação de serviços para o exterior não é fato gerador deste imposto.</li>
                    <li><strong>IRPJ e CSLL:</strong> Estes impostos são devidos. A base de cálculo será a "presunção de lucro" (geralmente 32% para serviços) sobre o valor da receita convertida para Reais. Sobre essa base, aplicam-se as alíquotas de IRPJ (15% + 10% adicional, se aplicável) e CSLL (9%).</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Coins className="mr-3 text-primary h-5 w-5" />
                Câmbio e Faturamento
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p>A correta conversão da moeda é fundamental para o cálculo dos impostos.</p>
                   <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Nota Fiscal (Invoice):</strong> Você deve emitir uma Nota Fiscal para seu cliente no exterior, no valor e na moeda combinados (ex: Dólar, Euro).</li>
                        <li><strong>Conversão para Real (BRL):</strong> Para fins de apuração dos impostos, o valor a ser considerado é o em Reais (BRL), utilizando a taxa de câmbio (PTAX de venda) do Banco Central do Brasil referente ao <strong>dia do recebimento</strong> do valor em sua conta.</li>
                   </ul>
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
