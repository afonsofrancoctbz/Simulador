"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Library, Banknote, Percent, Recycle, Gauge, CalendarClock } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Guia da Reforma Tributária (LC 214/2025)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda os principais pontos da lei que regulamenta o IBS e a CBS, e como eles impactarão sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Banknote className="mr-3 text-primary h-5 w-5" />
                1. Unificação de Tributos e o IVA Dual
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O pilar da reforma é a substituição de 5 impostos sobre o consumo por um Imposto sobre Valor Agregado (IVA) de modelo "dual", ou seja, dividido em duas esferas:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contribuição sobre Bens e Serviços (CBS):</strong> De competência federal, unifica PIS, COFINS e o IPI (que terá suas alíquotas zeradas, com exceções para a Zona Franca de Manaus).</li>
                  <li><strong>Imposto sobre Bens e Serviços (IBS):</strong> De competência de estados e municípios, unifica o ICMS e o ISS.</li>
                </ul>
                <p>Essa unificação visa simplificar radicalmente o sistema, substituindo milhares de legislações municipais e estaduais por uma regra nacional, com a mesma base de cálculo e fato gerador para todos.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <Gauge className="mr-3 text-primary h-5 w-5" />
                2. Alíquotas: Padrão, Reduzida e Isenção
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A reforma estabelece uma alíquota padrão e tratamentos favorecidos para setores essenciais. Embora a alíquota final ainda dependa de definições, as estimativas são:</p>
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-foreground/80">Regime de Alíquota</TableHead>
                      <TableHead className="font-semibold text-foreground/80">Alíquota Estimada (IVA)</TableHead>
                      <TableHead className="font-semibold text-foreground/80">Principais Beneficiados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Alíquota Padrão</TableCell>
                      <TableCell>~27.5%</TableCell>
                      <TableCell>Regra geral para a maioria dos bens e serviços.</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Redução de 30%</TableCell>
                      <TableCell>~19.25%</TableCell>
                      <TableCell>Profissionais liberais com profissão regulamentada (advogados, engenheiros, arquitetos, etc.).</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Redução de 60%</TableCell>
                      <TableCell>~11%</TableCell>
                      <TableCell>Serviços de educação, saúde, transporte público, produções artísticas e culturais, medicamentos e dispositivos médicos.</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Alíquota Zero</TableCell>
                      <TableCell>0%</TableCell>
                      <TableCell>Produtos da cesta básica, serviços de transporte coletivo (rodoviário, metroviário), entre outros.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground"><strong>Importante:</strong> Estas alíquotas reduzidas se aplicam aos regimes de Lucro Presumido e Lucro Real. O Simples Nacional mantém suas próprias tabelas de alíquotas.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Recycle className="mr-3 text-primary h-5 w-5" />
                3. Não Cumulatividade Plena (Créditos)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Uma das maiores mudanças é o princípio da "não cumulatividade plena". Isso significa que o imposto pago em cada etapa da cadeia de produção vira crédito para ser abatido na etapa seguinte. O objetivo é tributar apenas o "valor agregado" em cada fase, eliminando o "imposto em cascata".</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Direito ao Crédito:</strong> Empresas do regime regular (Lucro Presumido e Real) poderão se creditar do IVA pago na aquisição de praticamente todos os bens e serviços usados em sua atividade, com poucas exceções (como bens de uso e consumo pessoal).</li>
                    <li><strong>Fim da Bitributação:</strong> O sistema evita que o imposto seja calculado sobre ele mesmo, como acontece hoje em algumas situações. O resultado é uma tributação mais transparente e justa.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
             <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                <Percent className="mr-3 text-primary h-5 w-5" />
                4. Impacto no Simples Nacional
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O Simples Nacional não foi extinto, mas será impactado. Empresas optantes terão duas alternativas a partir de 2027:</p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Manter o Regime Padrão:</strong> Continuar pagando todos os impostos na guia unificada (DAS).
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Vantagem:</strong> Carga tributária continua baixa e simplificada.</li>
                      <li><strong>Desvantagem:</strong> Gera pouco crédito de IVA para seus clientes PJ (Pessoa Jurídica), o que pode te tornar menos competitivo ao vender para empresas maiores.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Optar pelo Regime Híbrido:</strong> Pagar o IBS e a CBS por fora da guia do Simples, como uma empresa do Lucro Presumido/Real, enquanto os outros impostos continuam no DAS.
                     <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Vantagem:</strong> Gera crédito cheio de IVA para seus clientes PJ, aumentando sua competitividade. Também permite que sua empresa se credite do IVA de suas compras.</li>
                      <li><strong>Desvantagem:</strong> A carga tributária sobre o faturamento aumenta significativamente.</li>
                    </ul>
                  </li>
                </ol>
                 <p className="pt-2">A escolha dependerá do perfil do seu cliente. Se você vende majoritariamente para o consumidor final (B2C), o regime padrão tende a ser melhor. Se seu foco é em outras empresas (B2B), o regime híbrido pode ser uma necessidade estratégica.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                <CalendarClock className="mr-3 text-primary h-5 w-5" />
                5. Cronograma de Transição
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A mudança será gradual para permitir a adaptação de empresas e governos.</p>
                 <ul className="list-disc pl-6 space-y-2">
                  <li><strong>2026:</strong> Início da fase de testes. A CBS (0.9%) e o IBS (0.1%) serão calculados e destacados em nota, mas o valor poderá ser compensado com os impostos do sistema antigo. A carga tributária efetiva não muda.</li>
                  <li><strong>2027:</strong> A CBS entra em vigor plenamente, extinguindo PIS e COFINS. O IPI é zerado (com exceções). Empresas do Simples Nacional passam a poder optar pelo regime híbrido.</li>
                  <li><strong>2029 a 2032:</strong> O ICMS e o ISS começam a ser reduzidos gradualmente, enquanto as alíquotas do IBS sobem na mesma proporção.</li>
                  <li><strong>2033:</strong> Extinção completa do ICMS e ISS. O novo sistema tributário com IBS e CBS estará 100% em vigor.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
