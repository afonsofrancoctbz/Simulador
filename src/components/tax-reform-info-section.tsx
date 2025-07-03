"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Impactos da Reforma Tributária para Prestadores de Serviço
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            A Reforma Tributária brasileira vai trazer mudanças no atual sistema de tributação e impactos diretos para empresas prestadoras de serviços. A principal ponto é a unificação de tributos com uma alíquota única.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                1. Unificação dos principais tributos sobre consumo
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Os impostos que incidem hoje sobre o consumo e a venda de mercadorias e serviços são:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Programa de Integração Social (PIS)</li>
                  <li>Cofins</li>
                  <li>Imposto sobre Produtos Industrializados (IPI)</li>
                  <li>Imposto sobre Circulação de Mercadorias e Prestação de Serviços (ICMS)</li>
                  <li>Imposto Sobre Serviços de Qualquer Natureza (ISS)</li>
                </ul>
                <p>Esses tributos vão ser unificados em dois novos: a <strong>Contribuição sobre Bens e Serviço (CBS)</strong> e o <strong>Imposto Sobre Bens e Serviços (IBS)</strong>.</p>
                <h4 className="font-semibold text-foreground pt-2">O que é o Imposto Sobre Valor Agregado?</h4>
                <p>A CBS e o IBS, por sua vez, vão compor o IVA (Imposto sobre Valor Agregado). A CBS será de competência federal, substituindo o PIS, Cofins e IPI, enquanto o IBS será gerido por um Comitê Gestor e distribuído entre estados e municípios, substituindo o ICMS e o ISS.</p>
                <p>Outro ponto de destaque é a ampliação do uso de créditos tributários. Será possível abater os impostos pagos na aquisição de bens e serviços no valor final de impostos a pagar, rompendo com a cumulatividade de impostos atual.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                2. Mudança no valor da carga tributária
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Após a sanção da lei regulamentadora, o governo estimou que a alíquota geral do IVA ficará em torno de <strong>28%</strong>. Esse valor deve ser regulado até 2031, com uma meta de chegar a 26,5%.</p>
                <p>Na prática, as empresas enquadradas no Lucro Real e Lucro Presumido vão sentir diretamente o impacto dessa nova alíquota. Será possível abater os impostos pagos na aquisição de bens e serviços no valor final a pagar, o que significa que, apesar de um possível aumento na carga tributária bruta, a efetiva pode ser reduzida.</p>
                <p>Já para as empresas enquadradas no Simples Nacional, a nova alíquota não vai ser aplicada. As alíquotas e a forma de apuração dos tributos permanecerão as mesmas, mas haverá impactos indiretos.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                3. Profissões com redução no valor da alíquota
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A alíquota estimada do IVA de 28% terá reduções para certas profissões:</p>
                 <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Redução de 30% (Alíquota de 19,6%):</strong> Aplicável a profissionais liberais com profissões regulamentadas, como Arquitetos, Advogados e Engenheiros.
                    </li>
                    <li>
                      <strong>Redução de 60% (Alíquota de 11,2%):</strong> Para serviços essenciais como educação, saúde (médicos, etc.), produções artísticas e alguns dispositivos médicos.
                    </li>
                 </ul>
                 <p>Profissões do segmento de tecnologia e marketing, por exemplo, não foram beneficiadas com alíquotas reduzidas e ficarão com a alíquota cheia.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                O que muda para as empresas do Simples Nacional?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>Para empresas do Simples Nacional, a carga tributária permanecerá inalterada. A principal novidade é a introdução do <strong>Simples Nacional Híbrido</strong>.</p>
                 <p>Este novo modelo permite que empresas optem por recolher o IVA (IBS e CBS) separadamente da guia única (DAS). O objetivo é permitir que essas empresas gerem créditos tributários integrais para seus clientes PJ, assim como as empresas do Lucro Real e Presumido.</p>
                 <p>A desvantagem é que, ao fazer isso, o prestador de serviços pagará mais impostos (a alíquota cheia do IVA), impactando seu lucro. A decisão exige um planejamento cuidadoso, avaliando o impacto no fluxo de caixa e na competitividade.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                Exemplo prático: cenários para profissionais da saúde
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4 text-base text-muted-foreground">
                <p>Vamos considerar um profissional da saúde (psicólogo, médico, etc.) com faturamento de <strong>R$ 15.000,00</strong> mensais, prestando serviços para Pessoas Jurídicas.</p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Cenário 1: Simples Nacional Tradicional</h4>
                  <p className="mb-3">Os impostos permanecem os mesmos (R$ 1.541,26), mas a geração de crédito para o cliente diminui drasticamente, o que pode reduzir a competitividade.</p>
                  <Table>
                    <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Antes da Reforma</TableHead><TableHead>Após a Reforma</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Faturamento</TableCell><TableCell>R$ 15.000,00</TableCell><TableCell>R$ 15.000,00</TableCell></TableRow>
                      <TableRow><TableCell>Valor em impostos no SN</TableCell><TableCell>R$ 1.541,26</TableCell><TableCell>R$ 1.541,26</TableCell></TableRow>
                      <TableRow><TableCell>Lucro líquido</TableCell><TableCell>R$ 13.458,74</TableCell><TableCell>R$ 13.458,74</TableCell></TableRow>
                      <TableRow><TableCell className="font-semibold">Crédito para o cliente</TableCell><TableCell className="font-semibold">R$ 1.387,50</TableCell><TableCell className="font-semibold text-destructive">R$ 441,90</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Cenário 2: Simples Nacional Híbrido</h4>
                   <p className="mb-3">A empresa paga mais imposto (R$ 2.779,36) para gerar um crédito maior para o cliente (R$ 1.680,00), mantendo a competitividade, mas com lucro menor.</p>
                  <Table>
                    <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Após a Reforma</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Faturamento</TableCell><TableCell>R$ 15.000,00</TableCell></TableRow>
                      <TableRow><TableCell>Valor em impostos no SN Híbrido</TableCell><TableCell>R$ 2.779,36</TableCell></TableRow>
                      <TableRow><TableCell>Lucro líquido</TableCell><TableCell>R$ 12.220,64</TableCell></TableRow>
                      <TableRow><TableCell className="font-semibold">Crédito para o cliente</TableCell><TableCell className="font-semibold text-primary">R$ 1.680,00</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Cenário 3: Lucro Presumido</h4>
                   <p className="mb-3">A carga tributária aumenta (R$ 3.179,72), mas gera o mesmo crédito competitivo (R$ 1.680,00) que o Simples Híbrido, porém com o menor lucro líquido entre os cenários pós-reforma.</p>
                  <Table>
                    <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Antes da Reforma</TableHead><TableHead>Após a Reforma</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Faturamento</TableCell><TableCell>R$ 15.000,00</TableCell><TableCell>R$ 15.000,00</TableCell></TableRow>
                      <TableRow><TableCell>Valor em impostos LP</TableCell><TableCell>R$ 2.887,22</TableCell><TableCell>R$ 3.179,72</TableCell></TableRow>
                      <TableRow><TableCell>Lucro líquido</TableCell><TableCell>R$ 12.112,78</TableCell><TableCell>R$ 11.730,28</TableCell></TableRow>
                      <TableRow><TableCell className="font-semibold">Crédito para o cliente</TableCell><TableCell className="font-semibold">R$ 1.387,50</TableCell><TableCell className="font-semibold text-primary">R$ 1.680,00</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                Como escolher o melhor regime tributário?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A decisão é complexa e depende de fatores como:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Seu tipo de cliente:</strong> Para quem presta serviços a Pessoas Físicas, o Simples Nacional Tradicional tende a ser melhor.</li>
                  <li><strong>Perfil da clientela:</strong> Para clientes PJ, a análise é mais complexa. O Simples Nacional Híbrido ou Lucro Presumido se tornam mais competitivos pela geração de crédito, mas aumentam sua carga tributária.</li>
                  <li><strong>Análise estratégica:</strong> É essencial avaliar o impacto no lucro, a possibilidade de renegociar preços e o cenário competitivo com o apoio de um contador.</li>
                </ul>
                <p className="font-semibold">Lembre-se: a transição será gradual. As mudanças para o Simples Nacional (incluindo o regime Híbrido) só entram em vigor em 2027.</p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
