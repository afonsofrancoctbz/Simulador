
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Library, AlertTriangle, Table as TableIcon, ListChecks, NotebookTabs, Ban, BrainCircuit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Guia das "Tabelas" de Tributação na Reforma
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda como a lógica de alíquotas funcionará no novo sistema tributário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">Ressalva Importante</AlertTitle>
            <AlertDescription>
              A Reforma Tributária (EC nº 132/2023) está em fase de regulamentação. Detalhes como as alíquotas exatas ainda podem mudar. As informações abaixo baseiam-se nos textos mais recentes, considerando a transição gradual de 2026 a 2033.
            </AlertDescription>
          </Alert>
          
          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <TableIcon className="mr-3 text-primary h-5 w-5" />
                1. A "Tabela" Principal: Alíquota Padrão do IVA
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Não haverá uma tabela com diferentes faixas de faturamento (exceto para o Simples Nacional). A regra geral será uma Alíquota Padrão única, aplicada sobre o valor da operação (o preço do bem ou serviço).</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Composição:</strong> Essa alíquota será a soma da CBS (federal) e do IBS (estadual/municipal).</li>
                    <li><strong>Valor da Alíquota Padrão:</strong> Ainda não foi definida em lei. As análises do Ministério da Fazenda apontam para uma alíquota de referência em torno de 26,5% a 27,5%.</li>
                    <li><strong>Lógica:</strong> Simplicidade. O mesmo percentual será aplicado a quase todos os produtos e serviços, com o imposto sendo não-cumulativo (o valor pago na compra vira crédito para abater na venda).</li>
                </ul>
                <div className="p-3 border-l-4 border-primary/50 bg-background rounded-r-md">
                    <h4 className="font-bold text-foreground">Exemplo de Aplicação (Alíquota de 26,5%):</h4>
                    <p className="mt-1">Venda de um serviço de consultoria: R$ 10.000,00</p>
                    <p className="mt-1 font-semibold">Cálculo do IBS/CBS: R$ 10.000,00 x 26,5% = R$ 2.650,00</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <ListChecks className="mr-3 text-primary h-5 w-5" />
                2. A "Tabela" de Exceções: Regimes Diferenciados
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>Aqui sim teremos uma espécie de "tabela", não com faixas de valor, mas com listas de setores e produtos que terão tratamento favorecido.</p>
                 <Card className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Alíquota Aplicada</TableHead>
                        <TableHead className="font-bold">Redução</TableHead>
                        <TableHead className="font-bold">Setores e Produtos Beneficiados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Alíquota Reduzida em 60%</TableCell>
                        <TableCell>Paga 40% da Alíquota Padrão</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Serviços de Educação (ensino infantil, fundamental, médio, superior, etc.)</li>
                            <li>Serviços de Saúde (consultas, procedimentos, internações, etc.)</li>
                            <li>Dispositivos Médicos e de Acessibilidade</li>
                            <li>Medicamentos e produtos de cuidados básicos à saúde menstrual</li>
                            <li>Serviços de Transporte Público Coletivo (rodoviário, metroviário e ferroviário)</li>
                            <li>Produtos Agropecuários, Pesqueiros, Florestais e Extrativistas Vegetais in natura</li>
                            <li>Insumos Agropecuários e Aquícolas</li>
                            <li>Produções Artísticas, Culturais, Jornalísticas e Audiovisuais Nacionais</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Alíquota Reduzida em 30%</TableCell>
                        <TableCell>Paga 70% da Alíquota Padrão</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5 space-y-1">
                             <li>Serviços de Profissão Intelectual, de Natureza Científica, Literária ou Artística (profissionais liberais como advogados, contadores, engenheiros, arquitetos, etc., desde que regulamentados por conselho)</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Alíquota Zero</TableCell>
                        <TableCell>0%</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Produtos da Cesta Básica Nacional de Alimentos (a ser definida em lei complementar)</li>
                            <li>Medicamentos para tratamento de doenças graves (lista a ser definida)</li>
                            <li>Serviços de Transporte Coletivo com características de transporte urbano ou metropolitano</li>
                            <li>Veículos adquiridos por pessoas com deficiência e taxistas</li>
                            <li>ProUni e serviços prestados por entidades de inovação (ICTs)</li>
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
                <NotebookTabs className="mr-3 text-primary h-5 w-5" />
                3. A Tabela do Simples Nacional
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p>A estrutura de tabelas do Simples Nacional, com seus Anexos I a V e suas respectivas faixas de faturamento, foi mantida. A forma de calcular a alíquota efetiva continua a mesma.</p>
                  <p><strong>O que muda?</strong> A composição interna da alíquota. Os percentuais que antes eram destinados a PIS, COFINS, ICMS e ISS serão substituídos por percentuais equivalentes de CBS e IBS. Para o empresário, o valor final do DAS, se ele optar por permanecer no regime padrão, não deve sofrer grande alteração.</p>
                  <div className="p-3 border-l-4 border-primary/50 bg-background rounded-r-md">
                    <h4 className="font-bold text-foreground">A Grande Novidade (Opção de Tributação Híbrida):</h4>
                    <p className="mt-1">A principal mudança não é na tabela, mas na opcionalidade. A empresa do Simples poderá escolher:</p>
                    <ul className="list-decimal pl-5 mt-2 space-y-1">
                        <li><strong>Pagar tudo no DAS:</strong> Conforme a tabela do seu Anexo, como hoje.</li>
                        <li><strong>Pagar IBS e CBS "por fora":</strong> Pagar os impostos sobre o lucro e a contribuição previdenciária (IRPJ, CSLL, CPP) via DAS (com uma alíquota reduzida) e pagar o IBS/CBS pela Alíquota Padrão (ex: 26,5%), com direito a tomar créditos.</li>
                    </ul>
                  </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                <Ban className="mr-3 text-primary h-5 w-5" />
                4. A "Tabela" do Imposto Seletivo (IS) - o "Imposto do Pecado"
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p>Este é um imposto novo que incidirá uma única vez sobre a produção, importação ou comercialização de bens e serviços prejudiciais à saúde ou ao meio ambiente. Não haverá uma tabela única, mas sim alíquotas específicas definidas por lei para cada produto.</p>
                  <h4 className="font-bold text-foreground">Produtos Abrangidos (lista principal):</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Veículos (automóveis, aeronaves e embarcações)</li>
                    <li>Produtos Fumígenos (cigarros, etc.)</li>
                    <li>Bebidas Alcoólicas</li>
                    <li>Bebidas Açucaradas</li>
                    <li>Bens Minerais Extraídos (petróleo, minério de ferro)</li>
                  </ul>
                  <p><strong>Alíquotas:</strong> Ainda serão definidas em Lei Ordinária. A única baliza já fixada na Constituição é que a alíquota sobre a extração de minérios não poderá ultrapassar 1%. As demais serão definidas pelo Congresso.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                <BrainCircuit className="mr-3 text-primary h-5 w-5" />
                5. Resumo Estratégico para o Especialista
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p>Como seu consultor, destaco que a "tabela de tributação" deixou de ser um conceito estático. O entendimento do novo sistema exige focar em:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Alíquota Padrão:</strong> Saber o valor de referência (hoje estimado em ~26,5%).</li>
                    <li><strong>Enquadramento em Exceções:</strong> Identificar se a sua atividade ou produto se encaixa em alguma das listas de alíquota reduzida ou zero.</li>
                    <li><strong>Simples Nacional:</strong> A análise não é mais sobre a tabela, e sim sobre a decisão estratégica: continuar no regime padrão ou migrar para o híbrido para gerar mais crédito aos clientes?</li>
                    <li><strong>Imposto Seletivo:</strong> Verificar se algum dos seus produtos está na "lista do pecado" e acompanhar a definição das alíquotas específicas.</li>
                    <li><strong>Tabelas Operacionais:</strong> Ficar atento às novas tabelas técnicas, como a "Tabela de Código de Classificação Tributária do IBS e da CBS", que serão fundamentais para emitir corretamente as notas fiscais.</li>
                  </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
