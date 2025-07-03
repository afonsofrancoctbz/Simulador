
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Library, AlertTriangle, Scale, Percent, FileText, Pickaxe, BookUser, BarChartHorizontal, CheckSquare, Calendar, Users, Briefcase } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Guia Rápido da Reforma Tributária para Empresas
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda os pilares da mudança no sistema de impostos sobre o consumo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">Ressalva Importante</AlertTitle>
            <AlertDescription>
              A Reforma Tributária (EC nº 132/2023) está em fase de regulamentação. Detalhes como as alíquotas exatas ainda podem mudar. As informações abaixo baseiam-se nos textos mais recentes e nas propostas de regulamentação. A transição será gradual, de 2026 a 2033.
            </AlertDescription>
          </Alert>
          
          <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Scale className="mr-3 text-primary h-5 w-5" />
                1. Unificação de Tributos: O IVA Dual (IBS e CBS)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O pilar da reforma é a unificação de cinco impostos sobre o consumo em um sistema de Imposto sobre Valor Agregado (IVA) Dual:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contribuição sobre Bens e Serviços (CBS):</strong> Substituirá o PIS e a COFINS (tributos federais).</li>
                    <li><strong>Imposto sobre Bens e Serviços (IBS):</strong> Substituirá o ICMS (estadual) e o ISS (municipal).</li>
                </ul>
                <p>O IPI não será extinto de imediato, mas se tornará um "Imposto Seletivo" para desestimular o consumo de produtos prejudiciais à saúde e ao meio ambiente.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <Percent className="mr-3 text-primary h-5 w-5" />
                 2. O Sistema de Alíquotas
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A complexidade de múltiplas tabelas é substituída por um sistema mais simples com três níveis principais de alíquotas:</p>
                 <Card className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold w-[30%]">Tipo de Alíquota</TableHead>
                        <TableHead className="font-bold w-[20%]">Valor Estimado</TableHead>
                        <TableHead className="font-bold w-[50%]">Principais Setores e Produtos Beneficiados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Alíquota Padrão</TableCell>
                        <TableCell className="font-semibold">~26,5%</TableCell>
                        <TableCell>Regra geral para a maioria dos produtos e serviços não listados nas exceções.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Redução de 60%</TableCell>
                        <TableCell className="font-semibold text-primary">~10,6%</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Serviços de Educação e Saúde</li>
                            <li>Medicamentos e produtos de cuidados básicos à saúde menstrual</li>
                            <li>Serviços de Transporte Público Coletivo</li>
                            <li>Produções Artísticas, Culturais e Jornalísticas Nacionais</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Redução de 30%</TableCell>
                        <TableCell className="font-semibold text-primary">~18,6%</TableCell>
                         <TableCell>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                             <li>Serviços de Profissão Intelectual (advogados, contadores, engenheiros, arquitetos, etc., desde que regulamentados)</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell className="font-semibold">Alíquota Zero</TableCell>
                        <TableCell className="font-semibold text-primary">0%</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Produtos da Cesta Básica Nacional de Alimentos</li>
                            <li>Medicamentos para tratamento de doenças graves</li>
                            <li>Veículos para pessoas com deficiência e taxistas</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                 </Card>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <CheckSquare className="mr-3 text-primary h-5 w-5" />
                3. Créditos (Não Cumulatividade) e Split Payment
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p><strong>Não Cumulatividade Plena:</strong> A principal vantagem do IVA. O imposto pago na compra de insumos, produtos ou serviços para a empresa vira um crédito para abater do imposto devido na venda. Isso evita o "imposto em cascata".</p>
                   <p><strong>Split Payment:</strong> Um novo sistema onde, no momento do pagamento eletrônico, o valor do imposto (IBS/CBS) é separado ("splitado") e enviado diretamente para o governo. A empresa recebe apenas o valor líquido da venda. O objetivo é reduzir a sonegação e garantir que o crédito que seu cliente irá tomar seja lastreado por um imposto efetivamente recolhido.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                <Users className="mr-3 text-primary h-5 w-5" />
                4. Impacto no Simples Nacional
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>O regime foi mantido, mas com uma escolha estratégica crucial para empresas que vendem para outras empresas (B2B):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-background">
                      <h4 className="font-bold text-foreground">Opção 1: Regime Padrão</h4>
                      <p className="text-sm mt-2">Continuar pagando tudo na guia única (DAS). É mais simples e a carga tributária direta não muda. Porém, o crédito de imposto que você gera para seu cliente PJ é pequeno, o que pode te deixar menos competitivo.</p>
                    </Card>
                     <Card className="p-4 bg-background">
                      <h4 className="font-bold text-foreground">Opção 2: Modelo Híbrido</h4>
                      <p className="text-sm mt-2">Pagar IBS e CBS por fora do DAS, com a alíquota padrão. Isso aumenta sua carga tributária, mas permite que seu cliente PJ tome o crédito integral do imposto, tornando sua empresa mais atraente como fornecedora.</p>
                    </Card>
                  </div>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                <Briefcase className="mr-3 text-primary h-5 w-5" />
                5. Impacto no Lucro Presumido
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p>Para empresas de serviço no Lucro Presumido, o impacto é direto. O PIS/COFINS (3,65%) e o ISS (2% a 5%) são substituídos pela alíquota padrão do IVA (~26,5%).</p>
                  <p>Como prestadores de serviço geralmente têm poucas despesas com insumos para gerar créditos, a carga tributária sobre o faturamento tende a aumentar. O planejamento de preços e a busca por todas as oportunidades de crédito possíveis serão essenciais.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                <BookUser className="mr-3 text-primary h-5 w-5" />
                 6. Exemplos Práticos de Cálculo
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 text-base text-muted-foreground">
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Exemplo 1: Empresa de Serviços no Simples Nacional</h4>
                  <p className="text-sm mb-3">Cenário: Faturamento de R$ 50.000/mês, RBT12 de R$ 540.000, e R$ 8.000 em insumos geradores de crédito.</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cenário Futuro</TableHead>
                        <TableHead className="text-right">Imposto da Empresa</TableHead>
                        <TableHead className="text-right">Crédito p/ Cliente</TableHead>
                        <TableHead>Competitividade B2B</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <p className="font-semibold">Opção 1: Padrão (Tudo no DAS)</p>
                          <p className="text-xs">Cálculo atual mantido.</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold">R$ 5.115,00</TableCell>
                        <TableCell className="text-right">Baixo</TableCell>
                        <TableCell className="text-destructive">Reduzida</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <p className="font-semibold">Opção 2: Híbrido (IVA por fora)</p>
                          <p className="text-xs">IBS/CBS sobre faturamento, menos créditos de compras.</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-destructive">R$ 14.120,00</TableCell>
                        <TableCell className="text-right text-green-700">Pleno (R$ 13.250)</TableCell>
                        <TableCell className="text-green-700">Alta</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Exemplo 2: Empresa de Serviços no Lucro Presumido</h4>
                   <p className="text-sm mb-3">Cenário: Faturamento de R$ 300.000/trimestre e R$ 40.000 em insumos geradores de crédito.</p>
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Impostos</TableHead>
                        <TableHead className="text-right">Antes da Reforma</TableHead>
                        <TableHead className="text-right">Depois da Reforma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       <TableRow>
                        <TableCell className="font-semibold">Impostos s/ Consumo (PIS/COFINS/ISS vs IVA)</TableCell>
                        <TableCell className="text-right">R$ 25.950,00</TableCell>
                        <TableCell className="text-right text-destructive">R$ 68.900,00</TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell className="font-semibold">Impostos s/ Lucro (IRPJ/CSLL)</TableCell>
                        <TableCell className="text-right">R$ 26.640,00</TableCell>
                        <TableCell className="text-right">R$ 26.640,00</TableCell>
                      </TableRow>
                       <TableRow className="font-bold bg-muted/50">
                        <TableCell>Carga Total Trimestral</TableCell>
                        <TableCell className="text-right">R$ 52.590,00</TableCell>
                        <TableCell className="text-right text-destructive">R$ 95.540,00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
