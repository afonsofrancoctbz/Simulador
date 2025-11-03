"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, FileText, Percent, BarChart, Gem, Calendar } from "lucide-react";

export default function PfPjTaxReformSection() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Users className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">
            Reforma Tributária: O que muda para quem fatura como PF e PJ?
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda o impacto da nova tributação sobre o consumo para prestadores de serviço.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-background">
            <AlertDescription>
                A Reforma Tributária do Consumo (LC 214/2025) reorganiza os tributos sobre a venda de bens e serviços. O impacto direto não é na sua declaração de Pessoa Física, mas sim na forma como sua Pessoa Jurídica calcula e paga impostos.
            </AlertDescription>
          </Alert>

          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Gem className="mr-3 text-primary h-5 w-5" />
                O que vai mudar nos impostos?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O modelo atual de PIS, Cofins, IPI, ICMS e ISS será substituído por um Imposto sobre Valor Agregado (IVA) em duas camadas:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>CBS (Contribuição sobre Bens e Serviços):</strong> Tributo federal.</li>
                    <li><strong>IBS (Imposto sobre Bens e Serviços):</strong> Compartilhado por estados e municípios.</li>
                </ul>
                <p>Além disso, surge o <strong>Imposto Seletivo</strong>, para desestimular o consumo de produtos prejudiciais à saúde e ao meio ambiente.</p>
                <Alert variant='default' className='bg-sky-50/80 border-sky-200 text-sky-900'>
                    <AlertTitle className='font-semibold'>Importante!</AlertTitle>
                    <AlertDescription>IRPF, IRPJ, CSLL, INSS e o Simples Nacional continuam existindo.</AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                Qual a alíquota dos novos impostos e o cronograma?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Haverá uma alíquota padrão estimada em torno de <strong>27%</strong>, mas o número final pode mudar. A implementação será gradual:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>2026:</strong> Fase de teste, com destaque dos novos impostos na nota fiscal, mas sem cobrança efetiva.</li>
                    <li><strong>2027:</strong> Início da cobrança integral da CBS.</li>
                    <li><strong>2029-2032:</strong> Período de transição do ICMS/ISS para o IBS.</li>
                    <li><strong>2033:</strong> Novo sistema operando plenamente.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <BarChart className="mr-3 text-primary h-5 w-5" />
                Quais os impactos diretos para a PJ?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A lógica do novo IVA é <strong>não cumulativa</strong>. Você poderá abater, como crédito, o IVA pago nas suas compras (energia, aluguel, softwares, etc.), mas a <strong>folha de pagamento não gera crédito</strong>.</p>
                <h4 className='font-semibold text-foreground pt-2'>1. Nota Fiscal</h4>
                <p>O imposto será destacado na nota, não mais embutido no preço. Surge também o conceito de <strong>split payment</strong>, onde o imposto pode ser recolhido automaticamente na transação.</p>
                <h4 className='font-semibold text-foreground'>2. Apuração dos Impostos</h4>
                <p>Para o <strong>Simples Nacional</strong>, a apuração segue no DAS, mas será possível optar por pagar o IVA "por fora" para gerar crédito para seus clientes B2B. Para <strong>Lucro Presumido/Real</strong>, PIS/COFINS/ISS são trocados por CBS/IBS, e o impacto dependerá da quantidade de insumos que geram crédito.</p>
                 <h4 className='font-semibold text-foreground'>3. Precificação e Competitividade</h4>
                 <p>Com as novas regras de crédito, a forma como seu cliente percebe o custo do seu serviço pode mudar. Será essencial revisar sua precificação para se manter competitivo, especialmente em vendas para outras empresas.</p>
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}