
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Info className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Entenda o IVA e a Reforma Tributária (Simulação 2026)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            O IVA (Imposto sobre Valor Agregado) é o novo modelo que unifica 5 tributos sobre o consumo. Veja como ele funciona e o que muda para sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                O que é o imposto IVA?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O Imposto sobre Valor Agregado é um modelo de unificação de impostos, que permite maior transparência e facilidade de tributação. Com o IVA, cada etapa da cadeia produtiva paga o imposto referente ao valor que adicionou ao produto ou serviço.
                </p>
                <p>
                  Ou seja, em vez de cobrar um imposto alto sobre o produto final, o IVA é cobrado em pequenas quantias em cada fase de produção e distribuição de bens e serviços, desde a matéria prima até o consumidor final.
                </p>
                <p>
                  É um sistema considerado mais justo e eficiente, que busca simplificar a tributação e evitar a cobrança em cascata de impostos.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Quais impostos serão englobados pelo IVA?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>Os tributos que serão abarcados no novo IVA são:</p>
                 <ul className="list-disc pl-6 space-y-2">
                    <li>PIS (Programa de Integração Social);</li>
                    <li>Cofins (Contribuição para o Financiamento da Seguridade Social);</li>
                    <li>ICMS (Imposto sobre Operações relativas à Circulação de Mercadorias e sobre Prestações de Serviços);</li>
                    <li>ISS (Imposto Sobre Serviços);</li>
                    <li>IPI (Imposto sobre Produtos Industrializados), que não será extinto mas terá suas alíquotas zeradas, com exceção dos produtos iguais ou similares aos produzidos na Zona Franca de Manaus.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                O que é IVA dual? Qual a diferença do IVA?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O IVA brasileiro, ao unificar diversos tributos , como o IPI, PIS, Cofins (federais), ICMS (estadual) e ISS (municipal), busca simplificar o sistema tributário. No entanto, devido às necessidades de manutenção dos entes federativos, o IVA brasileiro será dual.
                </p>
                <p>
                  Assim, o IVA será dividido em dois tributos: um federal único (CBS), substituindo os impostos e contribuições federais, enquanto o outro (IBS) será compartilhado entre estados e municípios, garantindo a autonomia de cada ente na arrecadação.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                O que muda com o IVA?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <h4 className="font-bold text-foreground/90">Alíquota padrão</h4>
                <p>O IVA terá um percentual único, chamado de alíquota padrão, a ser aplicado na comercialização de bens e serviços, diferentemente do sistema atual, onde cada imposto e contribuição tem uma alíquota própria e específica.</p>
                <h4 className="font-bold text-foreground/90 mt-3">Transparência na apuração</h4>
                <p>Além disso, a legislação que regulamenta os novos impostos também é unificada, trazendo mais transparência e segurança na hora de apurar e pagar o tributo.</p>
                <h4 className="font-bold text-foreground/90 mt-3">Não cumulatividade de tributos</h4>
                <p>Outra diferença é que cada parte da cadeia produtiva paga o imposto somente sobre o valor que agregou na sua etapa de venda, seguindo o princípio da não cumulatividade. Ou seja, tributos não serão mais acumulados (tributados) sobre impostos.</p>
                <h4 className="font-bold text-foreground/90 mt-3">Simplificação</h4>
                <p>O IVA vai reunir a longa e complexa lista de mercadorias, serviços, alíquotas e regras para diferentes tipos e portes de empresas em um modelo único de tributação.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                Qual será a alíquota do IVA no Brasil?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Ainda não é possível definir uma alíquota padrão exata para o IVA, embora a estimativa fique em torno de 28%, dividida em aproximadamente 18,7% para o IBS e 9,3% para a CBS.</p>
                <p>A legislação prevê um mecanismo para reduzir essa alíquota para 26,5% a partir de 2031, condicionado à revisão de benefícios fiscais. Enquanto isso não ocorre, os contribuintes devem se preparar para trabalhar com a alíquota estimada.</p>
                <p>Vale ressaltar que a alíquota padrão do IVA não será aplicada de forma uniforme. A legislação prevê reduções de 60% para saúde e educação, 30% para profissionais liberais (advogados, arquitetos, engenheiros), e isenção para produtos da cesta básica.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                Como calcular o valor do IVA?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O valor do imposto é aplicado sobre o valor agregado em cada etapa da cadeia. Por exemplo, digamos que o consumidor final adquira uma peça de roupa por R$100,00. Com um IVA de 28%, o imposto total seria de R$ 28,00, dividido da seguinte forma:</p>
                <Table className="mt-4 border rounded-lg">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Preço de Venda</TableHead>
                      <TableHead>Valor Agregado</TableHead>
                      <TableHead className="text-right">IVA (28%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Fábrica de roupas</TableCell>
                      <TableCell>R$50,00</TableCell>
                      <TableCell>R$50,00</TableCell>
                      <TableCell className="text-right font-medium">R$14,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Atacadista</TableCell>
                      <TableCell>R$75,00</TableCell>
                      <TableCell>R$25,00</TableCell>
                      <TableCell className="text-right font-medium">R$7,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Varejista</TableCell>
                      <TableCell>R$100,00</TableCell>
                      <TableCell>R$25,00</TableCell>
                      <TableCell className="text-right font-medium">R$7,00</TableCell>
                    </TableRow>
                     <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={3} className="text-primary">IVA Total</TableCell>
                      <TableCell className="text-right text-primary">R$28,00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm">Em cada etapa, o imposto é calculado sobre a diferença entre o valor de venda e o valor de compra. Por exemplo, o varejista: (R$ 100,00 - R$ 75,00) * 28% = R$ 7,00.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                Como os novos tributos serão pagos?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O pagamento será feito via “split payment”. No momento da transação, o valor do imposto é automaticamente separado e transferido para o governo. A empresa recebe apenas o valor líquido da operação, o que visa reduzir a sonegação e simplificar a arrecadação.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-semibold">
                Quando o IVA começa a valer?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>A transição é gradual. O período de 2024 e 2025 é de regulamentação. Os efeitos práticos começam em 2026, com a consolidação completa do novo sistema programada para 2033.</p>
                 <p>Durante sete anos, de 2026 a 2032, o sistema atual e o novo coexistirão, com as alíquotas dos impostos antigos sendo reduzidas gradualmente enquanto as do IVA aumentam.</p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
