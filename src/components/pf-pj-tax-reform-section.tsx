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
                O que muda nos impostos com a Reforma Tributária?
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
                  <p>Haverá uma alíquota padrão estimada em torno de 27%, mas o número final depende de regulamentações. O Projeto de Lei Complementar 68/2024 estabeleceu a alíquota geral do IVA em 26,5%, sendo 17,7% para o IBS e 8,8% para a CBS.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <h4 className="font-bold text-green-800 flex items-center gap-2"><BadgePercent className="h-5 w-5"/>Redução de 30% (Alíquota de ~18,55%)</h4>
                          <p className="mt-1 text-sm text-green-900">Profissionais liberais (advogados, engenheiros, contadores, etc.).</p>
                      </div>
                       <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <h4 className="font-bold text-green-800 flex items-center gap-2"><BadgePercent className="h-5 w-5"/>Redução de 60% (Alíquota de ~10,60%)</h4>
                          <p className="mt-1 text-sm text-green-900">Setores essenciais como saúde, educação e cultura.</p>
                      </div>
                  </div>
                   <p className="text-sm">A regra vale tanto para autônomos quanto para PJs com clínicas, escolas, etc. A legislação ainda prevê que, em 2031, a alíquota do IVA seja fixada em 26,5%, condicionada à revisão de benefícios fiscais.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-impacto-pj">
              <AccordionTrigger className="text-lg font-semibold">
                <Wallet className="mr-3 text-primary h-5 w-5" />
                Impactos Diretos para o Profissional PJ
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A lógica do novo IVA é <strong>não cumulativa</strong>. Você poderá abater, como crédito, o IVA pago em suas compras (energia, aluguel, softwares, etc.), mas a <strong>folha de pagamento não gera crédito</strong>. Isso altera quatro frentes práticas:</p>
                 <div>
                    <h4 className="font-semibold text-foreground">1. Nota Fiscal e Split Payment</h4>
                    <p>O imposto será destacado na nota, não mais embutido no preço. Surge também o conceito de <strong>split payment</strong>, onde o imposto pode ser recolhido automaticamente na transação.</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-foreground">2. Apuração dos Impostos</h4>
                    <p>No <strong>Simples Nacional</strong>, será possível optar por pagar o IVA "por fora" do DAS para gerar crédito para clientes B2B. Para <strong>Lucro Presumido/Real</strong>, a troca de impostos por um IVA com alíquota maior exigirá uma gestão de créditos eficiente para mitigar o impacto.</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-foreground">3. Precificação e Competitividade</h4>
                    <p>Com as novas regras, o preço dos seus serviços pode precisar de ajustes para se manter competitivo, especialmente em vendas para outras empresas (B2B).</p>
                 </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-profissoes">
                <AccordionTrigger className="text-lg font-semibold">
                    <CheckCircle className="mr-3 text-primary h-5 w-5" />
                    Exemplos Práticos: Como Fica a Tributação?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-base text-muted-foreground space-y-6">
                    <div>
                        <h4 className="font-bold text-foreground">Profissionais de Tecnologia</h4>
                        <p>Para este setor, a alíquota geral será de 26,5%. Um desenvolvedor no Lucro Presumido que fatura R$ 15.000/mês e hoje paga R$ 1.297,50 (8,65%) de impostos sobre consumo, passaria a pagar ~R$ 4.020,00 (26,5%). Ele poderá abater créditos de despesas como servidores e licenças para reduzir esse valor.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-foreground">Médicos e Profissionais da Saúde</h4>
                        <p>Com a redução de 60%, a alíquota sobre consumo será de 10,6%. Um médico no Lucro Presumido com faturamento de R$ 15.000, que hoje paga R$ 847,50 (5,65%), passará a pagar R$ 1.590,00 (10,6%). A carga tributária total, somando IRPJ/CSLL, subiria de ~18% para ~21%, antes de considerar os créditos.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-foreground">Engenheiros, Arquitetos e Advogados</h4>
                        <p>Estes profissionais terão redução de 30%, resultando em uma alíquota de 18,55%. Um arquiteto que fatura R$ 15.000 e hoje paga R$ 1.297,50 (8,65%) de impostos sobre consumo, passaria a pagar R$ 2.782,50 (18,55%), também com a possibilidade de abater créditos.</p>
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
                        <li><strong>Split Payment:</strong> O imposto será recolhido no ato do recebimento, afetando o fluxo de caixa.</li>
                        <li><strong>Competitividade:</strong> Manter-se no DAS padrão pode gerar menos crédito para o cliente, tornando seu serviço "mais caro" para empresas do Lucro Real/Presumido.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
            
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
