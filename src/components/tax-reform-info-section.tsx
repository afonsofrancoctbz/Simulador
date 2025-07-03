"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            IBS e CBS: Detalhes da Reforma Tributária
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda os principais pontos da Proposta de Lei Complementar (PLP 68/2024) que regulamenta os novos tributos sobre o consumo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                1. Fato Gerador
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O IBS e a CBS incidem sobre todas as operações onerosas que tenham por objeto bens e serviços. As operações sobre as quais incidem o IBS e a CBS compreendem o fornecimento de bens e serviços e podem decorrer de qualquer ato ou negócio jurídico.</p>
                <p>Para fins de segurança jurídica, o PLP 68/2024 incluiu um rol exemplificativo dos atos e negócios jurídicos sujeitos ao IBS e à CBS:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Alienação, inclusive compra e venda, troca ou permuta e dação em pagamento;</li>
                  <li>Locação;</li>
                  <li>Licenciamento, concessão, cessão;</li>
                  <li>Empréstimo;</li>
                  <li>Doação onerosa;</li>
                  <li>Instituição onerosa de direitos reais;</li>
                  <li>Arrendamento, inclusive mercantil; e</li>
                  <li>Prestação de serviços.</li>
                </ul>
                <p>Todo fornecimento que não tenha por objeto um bem material ou imaterial, inclusive direito, será considerado como uma operação com serviço.</p>
                <p>O IBS e a CBS também incidem sobre determinadas operações não onerosas, ou realizadas a valor inferior ao de mercado, como o fornecimento de bens e serviços para uso e consumo pessoal do próprio contribuinte, de empregados e administradores. Não são considerados de uso e consumo pessoal aqueles utilizados exclusivamente na atividade econômica do contribuinte.</p>
                <p>Além das imunidades constitucionais, não há incidência sobre os serviços prestados por pessoas físicas na qualidade de empregados, administradores ou membros de conselhos. A transferência de bens entre estabelecimentos do contribuinte, a transmissão de participação societária e operações de fusão, cisão e incorporação também não sofrem incidência.</p>
                <p>Rendimentos financeiros e operações com títulos não sofrem incidência, exceto no regime específico de serviços financeiros.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                2. Momento da Ocorrência do Fato Gerador
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Como regra geral, o fato gerador ocorre no momento do fornecimento ou do pagamento, o que ocorrer primeiro.</p>
                <p>Para operações de execução continuada (água, energia, comunicação, etc.), o fato gerador ocorre quando o pagamento se torna devido.</p>
                <p>Na prestação de serviço de transporte iniciado no País, o fato gerador ocorre no início do transporte. Nos demais serviços, ocorre no término da prestação.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                3. Local da Operação
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O local da operação define o destino para fins de alíquota e arrecadação do IBS. Varia conforme o tipo de fornecimento:</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-foreground/80">Tipo/Objeto do Fornecimento</TableHead>
                      <TableHead className="font-semibold text-foreground/80">Local da Operação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Bem móvel material</TableCell>
                      <TableCell>Local da entrega ou disponibilização do bem ao destinatário</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Bem imóvel, ou serviços/direitos relacionados a bem imóvel</TableCell>
                      <TableCell>Local onde o imóvel estiver situado</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço prestado fisicamente sobre a pessoa física ou fruído presencialmente</TableCell>
                      <TableCell>Local da prestação do serviço</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço de planejamento de eventos (feiras, congressos, etc.)</TableCell>
                      <TableCell>Local do evento</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço sobre bem móvel material</TableCell>
                      <TableCell>Local da prestação do serviço</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço de transporte de passageiros</TableCell>
                      <TableCell>Local de início do transporte</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço de transporte de carga</TableCell>
                      <TableCell>Local da entrega ou disponibilização do bem ao destinatário</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço de exploração de rodovia (pedágio)</TableCell>
                      <TableCell>Proporcional à extensão da rodovia em cada território</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Serviço de comunicação (com meio físico)</TableCell>
                      <TableCell>Local da recepção dos serviços</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Demais serviços e bens imateriais</TableCell>
                      <TableCell>Local do domicílio principal do destinatário</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p>O domicílio principal do destinatário é definido pelo seu cadastro, considerando habitação permanente (PF) ou o local do estabelecimento que recebe o serviço (PJ).</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                4. Base de Cálculo
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A base de cálculo é o valor integral da operação, incluindo acréscimos, juros, multas e outros tributos, exceto o próprio IBS e CBS, IPI, descontos incondicionais e, durante a transição, ICMS, ISS, PIS e COFINS.</p>
                <p>Em alguns casos (operações sem valor, com valor indeterminado, ou entre partes relacionadas), a base de cálculo será o valor de mercado.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                5. Alíquotas
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>As alíquotas da CBS (federal) e do IBS (estadual/municipal) serão fixadas por lei específica de cada ente. Cada estado e município definirá sua própria alíquota de IBS, que deverá ser a mesma para todas as operações, salvo regimes especiais.</p>
                <p>A alíquota final do IBS em uma operação será a soma das alíquotas do estado e do município de destino.</p>
                <p>Caso um ente não defina sua alíquota, será aplicada uma alíquota de referência.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                6. Sujeitos Passivos (Contribuintes e Responsáveis)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <h4 className="font-semibold text-foreground pt-2">Contribuintes</h4>
                <p>O contribuinte do IBS e da CBS é o fornecedor que realiza operações no desenvolvimento de atividade econômica de modo habitual. Fornecedores do exterior que realizam operações no país também são contribuintes. O contribuinte deve se inscrever no regime regular, a menos que opte pelo Simples Nacional ou MEI.</p>
                <p>Condomínios e consórcios não são contribuintes, mas podem optar por se inscrever.</p>
                <h4 className="font-semibold text-foreground pt-2">Responsáveis</h4>
                <p>Plataformas digitais são responsáveis pelo recolhimento do imposto nas operações que intermediam, substituindo o fornecedor (se este for estrangeiro) ou de forma solidária (se o fornecedor nacional não registrar a operação).</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                7. Pagamento do IBS e da CBS
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O PLP 68/2024 prevê as seguintes modalidades de pagamento:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Compensação com créditos de IBS e CBS.</li>
                  <li>Pagamento direto pelo sujeito passivo.</li>
                  <li>Recolhimento na liquidação financeira (split payment).</li>
                  <li>Recolhimento pelo próprio adquirente.</li>
                  <li>Recolhimento por um responsável tributário.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                8. Não Cumulatividade (Sistema de Créditos)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O contribuinte do regime regular pode se creditar do IBS e CBS pagos na aquisição de bens e serviços. O crédito é vedado apenas na aquisição de bens e serviços de uso ou consumo pessoal (ex: joias, bebidas, armas).</p>
                <p>Operações imunes ou isentas não geram crédito para a etapa seguinte. Na exportação, o crédito das aquisições é mantido. O prazo para utilizar os créditos é de cinco anos, e eles são intransferíveis, exceto em casos de sucessão empresarial (fusão, cisão, etc.).</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                9. Simples Nacional
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A empresa optante pelo Simples Nacional poderá escolher apurar o IBS e a CBS pelo regime regular (fora da guia do Simples).</p>
                <p>Se mantiver o recolhimento via Simples Nacional:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Não poderá se apropriar de créditos de IBS e CBS em suas compras.</li>
                  <li>Permitirá que seus clientes do regime regular se apropriem de créditos correspondentes ao valor do IBS e CBS efetivamente pagos na guia do Simples Nacional.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
