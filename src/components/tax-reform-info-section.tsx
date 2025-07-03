
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Library, AlertTriangle, Building, BookOpen, Lightbulb } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Library className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Guia Prático da Reforma Tributária para Empresas
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda o impacto do IVA (IBS/CBS) no Simples Nacional e Lucro Presumido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">Ressalva Importante</AlertTitle>
            <AlertDescription>
              A Reforma Tributária (EC nº 132/2023) está em regulamentação. Detalhes como alíquotas exatas ainda podem mudar. As informações abaixo baseiam-se nos textos mais recentes, considerando a transição gradual de 2026 a 2033.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground">O Novo Cenário Fiscal: IBS, CBS e o Fim de Cinco Tributos</h3>
            <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
              A espinha dorsal da Reforma é a unificação de cinco tributos em um sistema de IVA dual, composto por <strong>CBS (federal, substituindo PIS/COFINS)</strong> e <strong>IBS (estadual/municipal, substituindo ICMS/ISS)</strong>. O IPI será, em grande parte, substituído pelo novo Imposto Seletivo (IS).
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Building className="mr-3 text-primary h-5 w-5" />
                1. Empresas do Simples Nacional na Reforma Tributária
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O regime do Simples Nacional foi mantido. A principal mudança é a opcionalidade no recolhimento do IBS e da CBS.</p>
                <div className="space-y-3 p-4 border rounded-md bg-background">
                  <h4 className="font-bold text-foreground">Opção 1: Manter o Recolhimento Unificado (Padrão)</h4>
                  <p><strong>Lógica:</strong> A empresa continua a recolher seus tributos na guia única (DAS). A composição interna da alíquota muda (IBS e CBS substituem ICMS, ISS, PIS, COFINS), mas o valor total permanece o mesmo.</p>
                  <p><strong>Vantagem:</strong> Mantém a simplicidade e a carga tributária atual.</p>
                  <p><strong>Desvantagem:</strong> O crédito de IBS/CBS que seus clientes PJ poderão aproveitar será muito limitado, o que pode reduzir sua competitividade no mercado B2B.</p>
                </div>
                <div className="space-y-3 p-4 border rounded-md bg-background">
                  <h4 className="font-bold text-foreground">Opção 2: Recolher IBS e CBS "por Fora" (Modelo Híbrido)</h4>
                  <p><strong>Lógica:</strong> A empresa paga o IBS e a CBS pelas regras do regime geral (com alíquota padrão, estimada em ~26.5%) e o restante dos impostos (IRPJ, CSLL, etc.) continua no DAS.</p>
                  <p><strong>Vantagem:</strong> Permite que seus clientes aproveitem o crédito integral de IBS/CBS, tornando sua empresa mais atrativa. Você também poderá se creditar do IBS/CBS de suas compras.</p>
                  <p><strong>Desvantagem:</strong> A carga tributária sobre o faturamento tende a aumentar consideravelmente.</p>
                </div>

                <h4 className="font-bold text-foreground mt-4">Faturamento com o Exterior (Exportações)</h4>
                <p>As exportações continuam imunes de IBS e CBS. A grande vantagem é que a empresa manterá o direito de usar os créditos de IBS/CBS de suas compras, gerando um benefício financeiro.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <BookOpen className="mr-3 text-primary h-5 w-5" />
                2. Empresas do Lucro Presumido na Reforma Tributária
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A principal mudança é a migração do regime cumulativo de PIS/COFINS (3,65%) para o regime não-cumulativo do IVA (IBS/CBS), com alíquota muito maior mas com direito a créditos.</p>
                <h4 className="font-bold text-foreground">Lógica de Cálculo</h4>
                <p><strong>IBS/CBS:</strong> Seguirá a lógica da não-cumulatividade. O imposto a pagar será o resultado do débito sobre as vendas (Faturamento x Alíquota Padrão) menos o crédito sobre as compras de bens e serviços.</p>
                <p><strong>IRPJ e CSLL:</strong> O cálculo permanece o mesmo, incidindo sobre uma base de lucro presumida (ex: 8% para comércio, 32% para serviços).</p>
                <h4 className="font-bold text-foreground mt-4">Impacto</h4>
                <p>Para prestadores de serviço com poucos insumos, a carga tributária tende a aumentar, pois a nova alíquota do IVA será maior que a soma atual de PIS/COFINS e ISS. Para comércio e indústria, o impacto pode ser menor devido à maior geração de créditos.</p>
                 <h4 className="font-bold text-foreground mt-4">Faturamento com o Exterior (Exportações)</h4>
                <p>As exportações são desoneradas do IBS e CBS para aumentar a competitividade. A empresa mantém o direito de se creditar do IBS/CBS pagos na aquisição de insumos, e o saldo credor pode ser usado para abater outros débitos ou ser ressarcido.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Lightbulb className="mr-3 text-primary h-5 w-5" />
                Apanhado Geral para se Tornar um Expert
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                  <p><strong>Entenda o IVA:</strong> A chave é a não-cumulatividade. O imposto pago na compra vira "crédito" para abater do imposto devido na venda. O custo real é transferido para o consumidor final.</p>
                  <p><strong>Atenção à Competitividade (Simples Nacional):</strong> A decisão será entre simplicidade (menor geração de crédito para clientes) ou competitividade no B2B (modelo híbrido com maior custo tributário). Analisar o perfil da sua clientela será fundamental.</p>
                  <p><strong>Planejamento para Serviços (Lucro Presumido):</strong> O setor de serviços, especialmente com poucos insumos, deve se preparar para um aumento da carga tributária sobre o consumo. Será crucial reavaliar preços e custos.</p>
                  <p><strong>Transição Gradual (2026-2033):</strong> A mudança não será imediata. 2026 será um ano de teste com alíquotas simbólicas (0,9% CBS + 0,1% IBS). Os sistemas antigo e novo coexistirão, exigindo atenção contábil.</p>
                  <p><strong>Exportação é Vantagem:</strong> A desoneração das exportações com manutenção integral dos créditos é um dos pontos mais positivos da reforma.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
