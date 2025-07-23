
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Lightbulb, BadgeHelp, Briefcase } from "lucide-react";

export default function FatorRInfoSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-primary/20 bg-card">
        <CardHeader className="text-center">
           <Calculator className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Conceitos essenciais para a otimização de impostos no Simples Nacional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <BadgeHelp className="mr-3 text-primary" /> O que é o Fator R?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Fator R é uma fórmula que calcula a porcentagem do faturamento bruto da empresa gasto com folha de pagamento e cujo resultado determina em qual anexo do Simples Nacional uma empresa prestadora de serviços será enquadrada — e, consequentemente, qual a alíquota de imposto ela irá pagar.
                </p>
                <p>
                  As empresas que possuem um montante de folha de pagamento que representa um percentual <strong>igual ou superior a 28%</strong> do seu faturamento acumulado, podem ser tributadas no <strong>Anexo III</strong> do Simples Nacional com alíquotas mais baixas, a partir de 6%. As que possuem um valor abaixo são tributadas no <strong>Anexo V</strong> com alíquotas a partir de 15,5%.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <Calculator className="mr-3 text-primary" /> Como calcular o Fator R?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O cálculo consiste na divisão de dois valores, que seguem o período de apuração de 12 meses:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Total gasto em folha de pagamento (salários, pró-labore, INSS patronal, FGTS).</li>
                    <li>Receita bruta da empresa.</li>
                </ul>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-mono text-center text-sm md:text-base">Fator R = Folha de Pagamento (12 meses) / Receita Bruta (12 meses)</p>
                </div>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50/80 text-blue-900 rounded-r-md">
                    <h4 className="font-bold">Exemplo Prático</h4>
                    <p className="mt-1">
                        Se sua empresa faturou R$ 120.000,00 e gastou R$ 60.000,00 com folha de pagamento nos últimos 12 meses:
                    </p>
                    <p className="font-mono text-sm mt-2">R$ 60.000,00 / R$ 120.000,00 = 0,50</p>
                    <p className="mt-1">
                        O resultado é <strong>50%</strong>. Como é superior a 28%, a empresa é tributada pelo <strong>Anexo III</strong>.
                    </p>
                </div>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Briefcase className="mr-3 text-primary" /> Quais atividades são sujeitas ao Fator R?
              </AccordionTrigger>
              <AccordionContent className="pt-2 text-base text-muted-foreground">
                <p>
                  Em geral, atividades do setor de serviços decorrentes do exercício de atividade intelectual, de natureza técnica, científica, desportiva, artística ou cultural são sujeitas ao Fator R. Alguns exemplos incluem:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>Arquitetura e urbanismo</li>
                    <li>Medicina e Odontologia</li>
                    <li>Representação comercial</li>
                    <li>Psicologia e psicanálise</li>
                    <li>Fisioterapia</li>
                    <li>Academias e ensino de esportes</li>
                    <li>Agências de viagens</li>
                    <li>Consultoria e gestão empresarial</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                 <Lightbulb className="mr-3 text-primary" /> O que é Elisão Fiscal?
              </AccordionTrigger>
              <AccordionContent className="pt-2 text-base text-muted-foreground">
                <p>
                  É uma prática <strong>totalmente legal</strong> que se vale de permissões, e até omissões, nas leis que geram os impostos para reduzir a carga tributária nas empresas. O planejamento para se enquadrar no Fator R é um exemplo clássico de elisão fiscal: ajustar o pró-labore para pagar menos impostos, tudo dentro da lei.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
