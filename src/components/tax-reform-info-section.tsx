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
import { Library, AlertTriangle, FileText, BarChart, Users, Info } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Dois Eixos de Análise: Simples Nacional e IVA Dual
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            A tributação pós-reforma depende do cruzamento entre o regime da empresa (que define IRPJ/CSLL) e a alíquota do novo IVA (que define o imposto sobre consumo).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-8">

          <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">Simulador de Cenários</AlertTitle>
            <AlertDescription>
               Este simulador compara o **Simples Nacional** (com suas tabelas e Fator R) e o **Lucro Presumido** sob as novas regras do IVA (IBS/CBS). Empresas no Lucro Presumido e no Simples Híbrido ganham direito a créditos (não cumulatividade plena), uma mudança crucial em relação ao sistema atual.
            </AlertDescription>
          </Alert>
          
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <FileText className="mr-3 text-primary h-5 w-5" />
                Eixo 1: Classificação no Simples Nacional (Anexos I a V)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A classificação no Simples Nacional é essencial, pois o enquadramento em um Anexo determina a alíquota efetiva total paga. A CPP (Contribuição Previdenciária Patronal) pode ou não estar inclusa no DAS.</p>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="font-bold w-1/5">Anexo</TableHead>
                        <TableHead className="font-bold w-2/5">Abrangência</TableHead>
                        <TableHead className="font-bold w-2/5">Observações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-semibold">Anexo I</TableCell>
                            <TableCell>Comércio e atividades de Bares e Restaurantes</TableCell>
                            <TableCell>Alíquotas totais de 4% a 19% (2025)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Anexo II</TableCell>
                            <TableCell>Indústria</TableCell>
                            <TableCell>Não contemplado nesta calculadora.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Anexo III</TableCell>
                            <TableCell>Serviços de caráter não intelectual e serviços intelectuais com **Fator R ≥ 28%**.</TableCell>
                            <TableCell>Alíquotas totais de 6% a 33% (2025)</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-semibold">Anexo IV</TableCell>
                            <TableCell>Serviços com regras específicas de CPP (Construção Civil, Limpeza, Advocacia).</TableCell>
                            <TableCell>A CPP é recolhida **por fora** do Simples.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">Anexo V</TableCell>
                            <TableCell>Serviços de natureza intelectual, técnica ou científica com **Fator R < 28%** (Engenharia, Medicina, etc.).</TableCell>
                            <TableCell>Alíquotas iniciais mais altas que o Anexo III.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <BarChart className="mr-3 text-primary h-5 w-5" />
                 Eixo 2: Carga Tributária do IVA Dual (Lucro Presumido / Simples Híbrido)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>Para empresas no Lucro Presumido ou no Simples Híbrido, a tributação sobre o consumo (IBS/CBS) seguirá a alíquota padrão (AP) de ~26,5% ou alíquotas reduzidas, dependendo da atividade.</p>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold w-1/4">Redução</TableHead>
                            <TableHead className="font-bold w-1/4">Alíquota Final (Est.)</TableHead>
                            <TableHead className="font-bold w-1/2">Setores Beneficiados</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-semibold text-green-700">60%</TableCell>
                            <TableCell className="font-semibold">10,60%</TableCell>
                            <TableCell>Serviços de Saúde e Educação; Produções Artísticas e Culturais; Atividades Desportivas.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold text-amber-700">40%</TableCell>
                            <TableCell className="font-semibold">15,9%</TableCell>
                            <TableCell>Regime Específico para Bares, Restaurantes, Hotelaria, Agências de Turismo e Parques.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold text-blue-700">30%</TableCell>
                            <TableCell className="font-semibold">18,55%</TableCell>
                            <TableCell>Profissões Intelectuais Regulamentadas (Advocacia, Arquitetura, Engenharia, Contabilidade, etc.).</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-semibold text-red-700">0%</TableCell>
                            <TableCell className="font-semibold">26,5%</TableCell>
                            <TableCell>Alíquota Padrão. Comércio, Tecnologia e demais serviços não listados nas reduções.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Users className="mr-3 text-primary h-5 w-5" />
                III. Informações Específicas por Regime Tributário
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2 text-base text-muted-foreground">
                  <div>
                    <h4 className="font-bold text-foreground">A. Lucro Presumido (LP)</h4>
                    <p className="mt-1">A Reforma Tributária **não extingue o regime de Lucro Presumido** nem altera o cálculo do IRPJ e da CSLL. O impacto principal está nos impostos sobre consumo (PIS, COFINS, ISS), que são substituídos pelo IBS e CBS, passando a operar no **regime não cumulativo** (com direito a créditos).</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">B. Simples Nacional (SN)</h4>
                    <p className="mt-1">O Simples Nacional é mantido, mas a Lei Complementar 214/2025 traz duas grandes novidades: a base de cálculo da Receita Bruta foi ampliada para incluir receitas não operacionais, e foi criada a opção pelo **Regime Híbrido** a partir de 2027.</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>**Regime Tradicional:** Continua pagando tudo no DAS. O crédito gerado para o cliente é limitado à alíquota paga dentro do Simples.</li>
                        <li>**Regime Híbrido (Opcional):** Permite recolher o IBS/CBS "por fora" do DAS. Isso gera crédito integral para o cliente (aumentando a competitividade no B2B), mas a carga tributária da empresa do Simples tende a aumentar.</li>
                    </ul>
                  </div>
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
