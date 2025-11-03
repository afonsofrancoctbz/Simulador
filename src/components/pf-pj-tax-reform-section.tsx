
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, FileText, Percent, BarChart, Gem, Calendar, BadgePercent, CheckCircle, Wallet } from "lucide-react";

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
                A Reforma Tributária do Consumo (regulamentada pela fictícia Lei Complementar 214/2025) reorganiza os tributos sobre consumo no Brasil. O impacto direto está associado à venda de bens e serviços, não à tributação da pessoa física.
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
                    <li><strong>Imposto Seletivo:</strong> Incidirá sobre produtos/serviços nocivos à saúde e ao meio ambiente.</li>
                </ul>
                <p>O objetivo é simplificar, acabar com o “efeito cascata” e tributar no destino (onde está o consumidor).</p>
                <Alert variant='default' className='bg-sky-50/80 border-sky-200 text-sky-900'>
                    <AlertTitle className='font-semibold'>Importante!</AlertTitle>
                    <AlertDescription>IRPF, IRPJ, CSLL, INSS e o Simples Nacional continuam existindo.</AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-aliquota">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                 Qual será a alíquota dos novos impostos?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>Haverá uma alíquota padrão estimada em torno de 27%, mas o número final depende de regulamentações e avaliação das reduções e isenções para alguns itens e serviços.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <h4 className="font-bold text-green-800 flex items-center gap-2"><BadgePercent className="h-5 w-5"/>Redução de 30%</h4>
                          <p className="mt-1 text-green-900">Profissionais liberais (advogados, engenheiros, contadores, etc.) terão a alíquota reduzida para aproximadamente <strong>18,55%</strong>.</p>
                      </div>
                       <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <h4 className="font-bold text-green-800 flex items-center gap-2"><BadgePercent className="h-5 w-5"/>Redução de 60%</h4>
                          <p className="mt-1 text-green-900">Setores essenciais como saúde, educação e cultura pagarão uma alíquota de cerca de <strong>10,60%</strong>.</p>
                      </div>
                  </div>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-calendar">
              <AccordionTrigger className="text-lg font-semibold">
                <Calendar className="mr-3 text-primary h-5 w-5" />
                Quando as mudanças entram em vigor?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>A implementação dos novos impostos será feita de forma gradual:</p>
                  <ul className="list-disc pl-6 space-y-2">
                      <li><strong>2026:</strong> Início da fase-piloto, com simulação dos novos impostos na nota fiscal.</li>
                      <li><strong>2027:</strong> A CBS entra em vigor, substituindo PIS/COFINS.</li>
                      <li><strong>2029-2032:</strong> Período de transição do ICMS e ISS para o IBS.</li>
                      <li><strong>2033:</strong> O novo sistema estará operando plenamente.</li>
                  </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-impacto">
              <AccordionTrigger className="text-lg font-semibold">
                <Wallet className="mr-3 text-primary h-5 w-5" />
                Impactos diretos para o profissional PJ
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A lógica do novo IVA é <strong>não cumulativa</strong>. Você poderá abater, como crédito, o IVA pago em suas compras (energia, aluguel, softwares, etc.), mas a <strong>folha de pagamento não gera crédito</strong>.</p>
                <h4 className='font-semibold text-foreground pt-2'>1. Nota Fiscal e Split Payment</h4>
                <p>O imposto será destacado na nota, não mais embutido no preço. Surge também o conceito de <strong>split payment</strong>, onde o imposto pode ser recolhido automaticamente na transação.</p>
                <h4 className='font-semibold text-foreground'>2. Apuração dos Impostos</h4>
                <p>Para o <strong>Simples Nacional</strong>, será possível optar por pagar o IVA "por fora" do DAS para gerar crédito para clientes B2B. Para <strong>Lucro Presumido/Real</strong>, a troca de impostos por um IVA com alíquota maior exigirá uma gestão de créditos mais eficiente para mitigar o impacto.</p>
                 <h4 className='font-semibold text-foreground'>3. Precificação e Competitividade</h4>
                 <p>Com as novas regras de crédito, a forma como seu cliente percebe o custo do seu serviço pode mudar. Será essencial revisar sua precificação para se manter competitivo, especialmente em vendas para outras empresas.</p>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-profissoes">
                <AccordionTrigger className="text-lg font-semibold">
                    <CheckCircle className="mr-3 text-primary h-5 w-5" />
                    Quais profissões serão mais afetadas?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-base text-muted-foreground space-y-4">
                    <p>A reforma impactará todos os setores. No entanto, algumas profissões e atividades que estão expressamente destacadas na proposta são:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Medicina e outras áreas da saúde, como Psicologia, Fonoaudiologia e Fisioterapia.</li>
                        <li>Profissionais liberais, incluindo Advogados, Contadores, Engenheiros e Arquitetos.</li>
                        <li>Serviços de educação.</li>
                        <li>Comerciantes e produtores de alimentos, medicamentos, produtos de higiene pessoal e materiais de limpeza.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
            
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
