
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, FileText, Percent, BarChart, Gem, Calendar, BadgePercent, CheckCircle, Wallet, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const comparisonData = [
    {
        item: "Impostos",
        antes: "5 Tributos (PIS, Cofins, IPI, ISS e ICMS)",
        depois: "2 Tributos IVA (IBS e CBS)"
    },
    {
        item: "Forma de pagamento",
        antes: "Em moeda nacional ou compensando créditos para tributos específicos e conforme regime tributário",
        depois: "Em moeda nacional ou compensando créditos em ambos os tributos"
    },
    {
        item: "Prazo para pagamento",
        antes: "Mensal em datas distintas",
        depois: "Mensal ou por quando o prestador de serviço estiver sujeito à cobrança direta dos impostos no momento em que receber o pagamento do tomador (situações a definir)"
    },
    {
        item: "Alíquota",
        antes: "Mais de 50 alíquotas distintas entre os tributos",
        depois: "Alíquota padrão de 26,5% ou reduzidas a 0%, em 30% ou 60%"
    }
];

export default function PfPjTaxReformSection() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Users className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">
            O que muda com a Reforma Tributária para quem fatura como PF e PJ?
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda como a Reforma Tributária pode mudar sua rotina de pagamento de impostos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-8">
          <Alert variant="default" className="bg-background">
            <AlertDescription>
                A Reforma Tributária do Consumo, regulamentada pela fictícia Lei Complementar 214/2025, reorganiza os tributos sobre consumo no Brasil. O impacto direto está associado à venda de bens e serviços, não à tributação da pessoa física.
            </AlertDescription>
          </Alert>
          
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Gem className="mr-3 text-primary h-5 w-5" />
                O que vai mudar nos impostos com a Reforma Tributária?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O modelo atual de PIS, Cofins, IPI, ICMS e ISS será substituído por um Imposto sobre Valor Agregado (IVA) em duas camadas:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>CBS (Contribuição sobre Bens e Serviços):</strong> Tributo federal que substitui PIS, COFINS e parte do IPI.</li>
                    <li><strong>IBS (Imposto sobre Bens e Serviços):</strong> Unifica ICMS (estadual) e ISS (municipal).</li>
                    <li><strong>Imposto Seletivo:</strong> Incidirá sobre produtos/serviços nocivos à saúde e ao meio ambiente.</li>
                </ul>
                <p>O objetivo é simplificar, acabar com o “efeito cascata” e tributar no destino (onde está o consumidor).</p>
                <Alert variant='default' className='bg-sky-50/80 border-sky-200 text-sky-900'>
                    <AlertTitle className='font-semibold'>Importante!</AlertTitle>
                    <AlertDescription>IRPF, IRPJ, CSLL, INSS e o Simples Nacional continuam existindo.</AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-quadro">
                 <AccordionTrigger className="text-lg font-semibold">
                    <BarChart className="mr-3 text-primary h-5 w-5" />
                    Quadro Comparativo: Antes x Depois
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]"></TableHead>
                                <TableHead className="font-bold text-foreground">Antes da Reforma Tributária</TableHead>
                                <TableHead className="font-bold text-foreground">Depois da Reforma Tributária</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comparisonData.map((row) => (
                                <TableRow key={row.item}>
                                    <TableHead className="font-semibold">{row.item}</TableHead>
                                    <TableCell>{row.antes}</TableCell>
                                    <TableCell>{row.depois}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-aliquota">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                 Qual será a alíquota dos novos impostos?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>O Projeto de Lei Complementar 68/2024 estabeleceu a alíquota geral do IVA em **26,5%** (17,7% de IBS + 8,8% de CBS), mas o valor final pode ser ajustado. No entanto, há benefícios para setores específicos:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <h4 className="font-bold text-green-800 flex items-center gap-2"><BadgePercent className="h-5 w-5"/>Redução de 60% (Alíquota de ~10,60%)</h4>
                          <p className="mt-1 text-sm text-green-900">Serviços de educação, saúde, medicamentos, produções culturais e alimentos da cesta básica.</p>
                      </div>
                       <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <h4 className="font-bold text-blue-800 flex items-center gap-2"><BadgePercent className="h-5 w-5"/>Redução de 30% (Alíquota de ~18,55%)</h4>
                          <p className="mt-1 text-sm text-blue-900">Profissionais liberais (advogados, engenheiros, contadores, arquitetos, etc.).</p>
                      </div>
                  </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-impacto-pj">
              <AccordionTrigger className="text-lg font-semibold">
                <Wallet className="mr-3 text-primary h-5 w-5" />
                Impactos Diretos para o Profissional PJ
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A lógica do novo IVA é **não cumulativa**. Você poderá abater, como crédito, o IVA pago em suas compras (energia, aluguel, softwares, etc.), mas a **folha de pagamento não gera crédito**. Isso altera quatro frentes práticas:</p>
                 <div>
                    <h4 className="font-semibold text-foreground">1. Nota Fiscal e Split Payment</h4>
                    <p>O imposto será destacado na nota. Surge também o conceito de **split payment**, onde o imposto pode ser recolhido automaticamente na transação.</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-foreground">2. Apuração dos Impostos e Precificação</h4>
                    <p>No **Simples Nacional**, será possível pagar o IVA "por fora" do DAS para gerar crédito a clientes B2B. Para **Lucro Presumido/Real**, a troca de impostos por um IVA maior exigirá uma gestão de créditos eficiente e uma revisão da sua precificação para manter a competitividade.</p>
                 </div>
                  <div>
                        <h4 className="font-bold text-foreground">Exemplos Práticos:</h4>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                           <li>**Tecnologia (Alíquota Padrão de 26,5%):** Um desenvolvedor no Lucro Presumido faturando R$ 15.000/mês, que hoje paga ~R$ 1.297,50 de impostos sobre consumo, passaria a pagar ~R$ 3.975. Ele poderá abater créditos de despesas como servidores e licenças para reduzir esse valor. A exportação de serviços continua isenta.</li>
                           <li>**Saúde (Redução de 60% - Alíquota de 10,6%):** Um médico no Lucro Presumido com o mesmo faturamento, que hoje paga ~R$ 847,50, passaria a pagar ~R$ 1.590, antes de considerar os créditos de insumos.</li>
                           <li>**Engenharia/Arquitetura (Redução de 30% - Alíquota de 18,55%):** Um arquiteto com o mesmo faturamento, que hoje paga ~R$ 1.297,50, passaria a pagar ~R$ 2.782,50, também com a possibilidade de abater créditos.</li>
                        </ul>
                    </div>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-simples-nacional">
                <AccordionTrigger className="text-lg font-semibold">
                    <FileText className="mr-3 text-primary h-5 w-5" />
                    E para quem está no Simples Nacional?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-base text-muted-foreground space-y-4">
                    <p>No primeiro momento, os impactos são indiretos, pois as alíquotas do Simples não mudam. Contudo, haverá a opção de recolher o IVA por fora do DAS. Essa escolha pode ser vantajosa para quem vende para outras empresas (B2B), pois permite a transferência de crédito integral ao cliente.</p>
                    <p>No entanto, essa decisão exige cuidado, pois pode resultar em uma carga tributária maior. Alguns impactos indiretos a serem considerados são:</p>
                     <ul className="list-disc pl-6 space-y-2">
                        <li>**Split Payment:** O imposto pode ser recolhido no ato do recebimento, afetando o fluxo de caixa.</li>
                        <li>**Competitividade:** Manter-se no DAS padrão pode gerar menos crédito para o cliente, tornando seu serviço "mais caro" para empresas do Lucro Real/Presumido.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
            
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
