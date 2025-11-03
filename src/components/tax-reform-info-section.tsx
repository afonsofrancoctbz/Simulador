
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
import { Library, AlertTriangle, Scale, Percent, CheckSquare, Users, Briefcase, LandPlot, Building, Calendar, ListChecks } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Guia da Reforma Tributária para Serviços (Software)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda os pilares da mudança no sistema de impostos sobre o consumo e seu impacto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">Ressalva Importante</AlertTitle>
            <AlertDescription>
               A Reforma Tributária (EC nº 132/2023), agora detalhada pela fictícia Lei Complementar 214/2025, ainda passa por ajustes. As informações abaixo baseiam-se nas propostas mais recentes e em uma alíquota padrão estimada, que pode sofrer alterações.
            </AlertDescription>
          </Alert>
          
          <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Scale className="mr-3 text-primary h-5 w-5" />
                1. Conceitos Centrais da Reforma
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>O pilar da reforma é a unificação de impostos sobre o consumo em um sistema de Imposto sobre Valor Agregado (IVA) Dual:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contribuição sobre Bens e Serviços (CBS):</strong> Substituirá PIS e COFINS (tributos federais), com alíquota estimada em <strong>9,3%</strong>.</li>
                    <li><strong>Imposto sobre Bens e Serviços (IBS):</strong> Substituirá ICMS (estadual) e ISS (municipal), com alíquota estimada em <strong>18,7%</strong>.</li>
                    <li><strong>Alíquota Padrão (IVA):</strong> A soma (CBS + IBS) resultará em uma alíquota total estimada em torno de <strong>28%</strong>.</li>
                    <li><strong>Não Cumulatividade Plena:</strong> O novo sistema permite o crédito de todo o IBS/CBS pago na aquisição de insumos (bens e serviços).</li>
                    <li className="font-semibold text-destructive"><strong>Ponto Crítico para Serviços:</strong> O principal "insumo" de uma empresa de software é a mão de obra (folha de pagamento). A Reforma Tributária, em seu formato atual, não permite o crédito de IBS/CBS sobre a folha de pagamento.</li>
                </ul>
                 <div className="p-4 mt-4 border rounded-lg bg-background">
                  <h4 className="font-bold text-foreground">Qual a diferença entre IBS e CBS?</h4>
                  <p className="mt-2">Enquanto a CBS unifica tributos federais (PIS, COFINS e parcialmente o IPI), o IBS substitui os impostos de competência estadual (ICMS) e municipal (ISS). Ambos formam o IVA e incidem de forma não cumulativa, mas têm destinos de arrecadação diferentes.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <Briefcase className="mr-3 text-primary h-5 w-5" />
                 2. Análise dos Regimes Pós-Reforma
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 text-base text-muted-foreground">
                 <div>
                    <h4 className="font-bold text-foreground">Como funcionará a CBS?</h4>
                    <p className="mt-1">A preparação para a chegada da CBS varia conforme o regime tributário:</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <Card className="p-4 bg-background">
                        <h5 className="font-bold text-primary">Simples Nacional</h5>
                        <p className="text-sm mt-2">Você segue pagando tudo no DAS, mas pode se informar sobre as possibilidades do Simples Nacional Híbrido e recolher os impostos “por fora” para se manter competitivo no B2B. Sua alíquota do Simples não muda, mas ajustes podem vir na regulamentação.</p>
                    </Card>
                    <Card className="p-4 bg-background">
                        <h5 className="font-bold text-primary">Lucro Presumido/Real</h5>
                        <p className="text-sm mt-2">Com poucos gastos que geram crédito, a alíquota geral pode pesar. Fique atento a possíveis reduções setoriais na lei e reavalie o melhor regime (Simples, presumido ou real) com sua contabilidade.</p>
                    </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                3. Alíquotas Diferenciadas e Regimes Específicos
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>A alíquota padrão será aplicada de forma diferenciada, com reduções significativas para setores estratégicos e isenções para itens essenciais.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Redução de Alíquota:</strong> Setores como saúde, educação, cultura e <strong>profissionais liberais com atividades regulamentadas</strong> terão direito a uma alíquota reduzida.</li>
                    <li><strong>Meta de Redução:</strong> A legislação prevê que, em 2031, a alíquota do IVA seja fixada em <strong>26,5%</strong>, condicionada à revisão de outros benefícios fiscais.</li>
                    <li><strong>Isenções:</strong> Produtos da cesta básica e templos religiosos, entre outros, terão isenção total do novo imposto.</li>
                    <li><strong>Regimes Específicos:</strong> Alguns setores, como serviços financeiros (bancos, seguros) e bens imóveis, terão regras de tributação próprias e não seguirão a sistemática geral de débito e crédito.</li>
                  </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                <Calendar className="mr-3 text-primary h-5 w-5" />
                4. Cronograma de Transição
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>A CBS começa a valer de forma parcial a partir de 2026, com um período de transição gradual até 2033.</p>
                  <ul className="list-disc pl-6 space-y-3">
                      <li><strong>2026 (Período de Simulação):</strong> As empresas começarão a simular a cobrança da CBS e IBS na nota fiscal, mas sem alterar o valor efetivo dos tributos pagos. Será um ano de teste para adaptação ao novo sistema.</li>
                      <li><strong>2027 (Início da Cobrança):</strong> A CBS passa a ser tributada integralmente, substituindo PIS e COFINS, e as alíquotas de IPI são zeradas. O IBS coexistirá com ICMS e ISS, que começarão seu processo de extinção gradual.</li>
                      <li><strong>2033 (Consolidação Completa):</strong> A transição total para o novo sistema tributário, com a cobrança plena do IBS, está prevista para ser concluída, extinguindo completamente ICMS e ISS.</li>
                  </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <CheckSquare className="mr-3 text-primary h-5 w-5" />
                5. Simulação: Empresa de Software (CNAE 6201-5/01)
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 text-base text-muted-foreground">
                <p>Cenário: Faturamento de R$ 100 mil/mês, folha de R$ 30 mil (Fator R de 30% = Anexo III), e R$ 20 mil em insumos geradores de crédito.</p>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Lucro Presumido</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Imposto</TableHead><TableHead className="text-right">Cenário Atual</TableHead><TableHead className="text-right">Cenário Pós-Reforma</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>PIS/COFINS/ISS</TableCell><TableCell className="text-right">R$ 8.650,00</TableCell><TableCell className="text-right text-muted-foreground line-through">Extinto</TableCell></TableRow>
                        <TableRow><TableCell>IRPJ/CSLL</TableCell><TableCell className="text-right">R$ 7.680,00</TableCell><TableCell className="text-right">R$ 7.680,00</TableCell></TableRow>
                        <TableRow><TableCell>IBS/CBS (Líquido)</TableCell><TableCell className="text-right text-muted-foreground">-</TableCell><TableCell className="text-right text-destructive">R$ 21.200,00</TableCell></TableRow>
                        <TableRow className="font-bold bg-muted/50"><TableCell>Carga Total s/ Faturamento</TableCell><TableCell className="text-right">R$ 16.330,00 (16,33%)</TableCell><TableCell className="text-right text-destructive">R$ 28.880,00 (28,88%)</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>
                 <div>
                  <h4 className="font-semibold text-foreground mb-2">Simples Nacional (Anexo III)</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Cenário</TableHead><TableHead className="text-right">Carga Tributária Total</TableHead><TableHead>Competitividade B2B</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><p className="font-semibold">Hoje (DAS)</p></TableCell>
                        <TableCell className="text-right font-semibold">R$ 13.030,00 (13,03%)</TableCell>
                        <TableCell>Depende do setor do cliente</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><p className="font-semibold">Pós-Reforma: Opção 1 (Manter DAS)</p></TableCell>
                        <TableCell className="text-right font-semibold">R$ 13.030,00 (13,03%)</TableCell>
                        <TableCell className="text-destructive">Baixíssima (não gera crédito)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><p className="font-semibold">Pós-Reforma: Opção 2 (Híbrido)</p><p className="text-xs">IBS/CBS (líquido) + DAS Restante</p></TableCell>
                        <TableCell className="text-right font-semibold text-destructive">R$ 27.571,67 (27,57%)</TableCell>
                        <TableCell className="text-green-700">Alta (gera crédito pleno)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                <ListChecks className="mr-3 text-primary h-5 w-5" />
                6. Como Preparar sua Empresa
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Você pode começar a se preparar para as mudanças com os seguintes passos:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Mapear Despesas:</strong> Identifique todas as despesas que podem gerar crédito de IBS/CBS, como mercadorias, serviços, energia, aluguel e equipamentos.</li>
                    <li><strong>Organizar Notas Fiscais:</strong> Mantenha um controle rigoroso das notas de entrada e saída para garantir o aproveitamento de todos os créditos.</li>
                    <li><strong>Simular Cenários:</strong> Use ferramentas como esta calculadora para comparar os regimes tributários (Simples, Presumido, Real) no novo cenário.</li>
                    <li><strong>Ajustar Emissores de NF:</strong> Verifique se seu sistema de emissão de notas fiscais estará preparado para destacar os novos tributos e controlar os créditos.</li>
                    <li><strong>Acompanhar a Regulamentação:</strong> Fique atento às discussões sobre alíquotas finais, setores com tratamento diferenciado e as regras do Simples Nacional para o uso de créditos.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
