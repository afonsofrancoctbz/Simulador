
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
import { Library, AlertTriangle, Scale, Percent, CheckSquare, Users, Briefcase } from "lucide-react";

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
              A Reforma Tributária (EC nº 132/2023) está em fase de regulamentação. Detalhes como as alíquotas exatas e regras de creditamento ainda podem mudar. As informações abaixo baseiam-se nas propostas mais recentes e em uma alíquota padrão estimada de 26,5%.
            </AlertDescription>
          </Alert>
          
          <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Scale className="mr-3 text-primary h-5 w-5" />
                1. Conceitos Centrais da Reforma
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O pilar da reforma é a unificação de cinco impostos (PIS, COFINS, IPI, ICMS, ISS) em um sistema de Imposto sobre Valor Agregado (IVA) Dual:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contribuição sobre Bens e Serviços (CBS):</strong> Substituirá PIS e COFINS (tributos federais).</li>
                    <li><strong>Imposto sobre Bens e Serviços (IBS):</strong> Substituirá ICMS (estadual) e ISS (municipal).</li>
                    <li><strong>Não Cumulatividade Plena:</strong> O imposto pago na compra de insumos vira crédito para abater do imposto devido na venda.</li>
                    <li className="font-semibold text-destructive"><strong>Ponto Crítico para Serviços:</strong> A mão de obra (folha de pagamento) não gera créditos de IBS/CBS, o que impacta diretamente empresas com alto custo de pessoal.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <Briefcase className="mr-3 text-primary h-5 w-5" />
                 2. Análise dos Regimes Pós-Reforma
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 text-base text-muted-foreground">
                 <div>
                    <h4 className="font-bold text-foreground">Lucro Presumido</h4>
                    <p className="mt-1">Empresas neste regime pagarão a alíquota padrão do IVA (estimada em 26,5%) sobre o faturamento, substituindo PIS, COFINS e ISS. Poderão se creditar de despesas com insumos (ex: aluguel, software, marketing), mas não da folha de pagamento. Os impostos sobre o lucro (IRPJ, CSLL) permanecem inalterados.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-foreground">Simples Nacional</h4>
                    <p className="mt-1">O regime foi mantido, mas com uma escolha estratégica crucial para empresas que vendem para outras empresas (B2B):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <Card className="p-4 bg-background">
                            <h5 className="font-bold text-primary">Opção 1: Regime Padrão (DAS)</h5>
                            <p className="text-sm mt-2">Continuar pagando tudo na guia única (DAS). É mais simples, mas a empresa não transfere créditos de IVA para seus clientes, o que a torna menos competitiva no mercado B2B.</p>
                        </Card>
                        <Card className="p-4 bg-background">
                            <h5 className="font-bold text-primary">Opção 2: Regime Híbrido</h5>
                            <p className="text-sm mt-2">Pagar IBS e CBS por fora do DAS. Isso permite que seu cliente PJ tome o crédito integral do imposto (26,5%), tornando sua empresa mais atraente. Em contrapartida, sua empresa paga o IVA cheio e também o "DAS restante" (IRPJ, CSLL, CPP).</p>
                        </Card>
                    </div>
                 </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                3. Simulação: Empresa de Software (CNAE 6201-5/01)
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
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}

