
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
import { Library, AlertTriangle, Scale, Percent, CheckSquare, Info, Calculator } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Guia da Reforma Tributária: Metodologia de Cálculo
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda como os novos impostos (IBS, CBS, IS) serão calculados e o impacto em cada regime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-8">

          <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">Ressalva Importante</AlertTitle>
            <AlertDescription>
               As informações abaixo baseiam-se nas propostas da Reforma Tributária (EC 132/2023) e projetos de Lei Complementar. Alíquotas e regras definitivas dependem da aprovação final e regulamentação.
            </AlertDescription>
          </Alert>
          
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Calculator className="mr-3 text-primary h-5 w-5" />
                I. Cálculo do IBS e da CBS (IVA Dual)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O IBS e a CBS seguem a mecânica de um Imposto sobre Valor Agregado (IVA). Para empresas do Lucro Presumido e as do Simples Nacional que optarem pelo Regime Regular, os cálculos se baseiam em débitos e créditos.</p>
                
                <h4 className="font-semibold text-foreground pt-2">A. Base de Cálculo (Débito)</h4>
                <p>A base de cálculo é o valor da operação, incluindo acréscimos e encargos. Para o cálculo "por fora", é preciso excluir o próprio IVA e outros tributos como o IPI e o Imposto Seletivo.</p>
                
                <h4 className="font-semibold text-foreground pt-2">B. Alíquotas</h4>
                <p>A alíquota-padrão combinada é estimada em **26,5%**, mas o valor final será definido anualmente. Setores específicos (saúde, educação, etc.) terão alíquotas reduzidas ou isenção.</p>

                <h4 className="font-semibold text-foreground pt-2">C. Não Cumulatividade (Crédito)</h4>
                <p>O imposto devido é a diferença entre os débitos (saídas) e os créditos (entradas). O crédito pode ser apropriado sobre o valor do IBS/CBS pago na aquisição de praticamente todos os bens e serviços usados na operação, comprovado por documento fiscal eletrônico.</p>

              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <Scale className="mr-3 text-primary h-5 w-5" />
                 II. Cálculo do Imposto Seletivo (IS)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>O "Imposto do Pecado" incidirá sobre a produção, importação ou comercialização de bens e serviços prejudiciais à saúde ou ao meio ambiente.</p>
                 <ul className="list-disc pl-6 space-y-2">
                    <li>**Lista de Incidência:** A lei definirá a lista exata de produtos e serviços.</li>
                    <li>**Alíquota Calibrada:** A alíquota não será única, mas calibrada pelo impacto do produto (teor alcoólico, açúcar, emissões de CO2, etc.).</li>
                    <li>**Base de Cálculo:** Será o valor da operação, mas a metodologia específica ainda será detalhada em lei.</li>
                 </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                III. Detalhes por Regime Tributário
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 text-base text-muted-foreground">
                  <div>
                    <h4 className="font-bold text-foreground">A. Lucro Presumido (LP)</h4>
                    <p className="mt-1">O regime do LP não será extinto, e o cálculo de IRPJ/CSLL continua o mesmo. A grande mudança é que, para os impostos sobre consumo (IBS/CBS), a empresa passará a operar no **regime não cumulativo**, podendo se creditar dos impostos pagos em suas aquisições.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">B. Simples Nacional (SN)</h4>
                    <p className="mt-1">O Simples Nacional foi mantido, mas com alterações importantes. O conceito de Receita Bruta foi ampliado, e surge a opção do **Regime Híbrido** a partir de 2027:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>**Regime Tradicional:** Continua pagando tudo no DAS. O crédito gerado para o cliente é limitado à alíquota paga dentro do Simples.</li>
                        <li>**Regime Híbrido (Opcional):** A empresa pode optar por pagar o IBS/CBS "por fora" do DAS. Isso permite gerar crédito integral para o cliente (mantendo a competitividade no B2B), mas a carga tributária total da empresa do Simples tende a aumentar.</li>
                    </ul>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Regime Tributário</TableHead><TableHead>Impostos de Consumo (IBS/CBS)</TableHead><TableHead>Outros Tributos (IRPJ/CSLL)</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell className="font-semibold">Lucro Presumido</TableCell><TableCell>Não cumulativo (com créditos), seguindo as regras gerais.</TableCell><TableCell>Cálculo mantido por presunção da Receita Bruta.</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">Simples Nacional (Tradicional)</TableCell><TableCell>Unificado no DAS. Não gera crédito integral para o cliente.</TableCell><TableCell>Cálculo pela RBT12 e Fator R.</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">Simples Nacional (Híbrido)</TableCell><TableCell>Não cumulativo (pago fora do DAS). Gera crédito integral.</TableCell><TableCell>Mantém-se no Simples Nacional para os demais tributos.</TableCell></TableRow>
                    </TableBody>
                  </Table>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                <Info className="mr-3 text-primary h-5 w-5" />
                Metáfora do Cálculo
              </AccordionTrigger>
              <AccordionContent className="pt-2 text-base text-muted-foreground">
                 <div className="p-4 border-l-4 border-primary bg-primary/10 text-primary-foreground rounded-r-lg">
                    <p className="italic text-primary/90">
                        "O processo de cálculo sob a nova Reforma Tributária não é mais como tentar somar peças de diferentes quebra-cabeças (os cinco tributos antigos). Agora, funciona como uma linha de montagem, onde você só paga o imposto pela nova peça que adicionou (o valor agregado). Para ter certeza de que pagou corretamente, você precisa do registro detalhado de todas as peças compradas (os créditos) e de quanto o seu produto final impacta o ambiente ou a saúde (Imposto Seletivo)."
                    </p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
