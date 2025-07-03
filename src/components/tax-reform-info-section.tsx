"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <CreditCard className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Entenda o Split Payment da Reforma Tributária
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            O "pagamento dividido" é um novo sistema de recolhimento de impostos que impactará o fluxo de caixa das empresas. Entenda como se preparar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                O que muda com o split payment no pagamento de impostos?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O maior impacto previsto com o split payment está no fluxo de caixa da empresa. Hoje, o imposto que é pago pelo empreendedor é normalmente utilizado para ajudar a financiar suas atividades, entre o recebimento do cliente até o vencimento do imposto no mês seguinte. Já com o split payment, ele passa a ser retido pelos intermediários de pagamentos.
                </p>
                <p>
                  Em uma transação sujeita ao split payment, o vendedor do produto ou prestador de serviço que só realizaria o pagamento dos impostos no dia 25 do mês seguinte já não terá mais esse cenário. Isso porque, após a implementação do split payment, ele receberá o valor líquido da transação, já descontado de CBS e IBS na hora da compra – ao invés de receber o valor cheio.
                </p>
                <div className="p-4 border-l-4 border-amber-400 bg-amber-50 text-amber-900 rounded-r-md">
                    <p className="font-semibold">
                        “A redução dos valores recebidos pelos produtos ou serviços vendidos ou prestados causa efeitos indiretos no fluxo de caixa das micro e pequenas empresas. Antes da proposta da nova Reforma Tributária, estes empreendedores poderiam utilizar o valor dos impostos para efetuar o pagamento de outras obrigações empresariais, como fornecedores e funcionários, até o vencimento dos impostos”
                        <span className="block text-sm text-right mt-2">– Charles Gularte, vice-presidente executivo de serviços aos clientes da Contabilizei.</span>
                    </p>
                </div>
                <p>
                  Em termos práticos, o vendedor ou o prestador não receberá o valor total da nota fiscal, que engloba o valor do produto ou serviço mais CBS e IBS, mas sim o valor líquido sem a parcela de tributos. Esta sistemática reduz o montante recebido pelo vendedor e impede-o de aplicar o recurso dos impostos em outras despesas necessárias para a empresa, diminuindo as estratégias na gestão financeira das micros e pequenas que não possuem giro de caixa.
                </p>
                <p>Assim, podemos resumir os possíveis impactos do split payment na perspectiva do pequeno negócio:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Alteração no fluxo de caixa:</strong> o pagamento imediato dos impostos reduz os valores de entradas no fluxo de caixa das empresas, especialmente no curto prazo.</li>
                  <li><strong>Necessidade de renegociar contratos:</strong> empresas podem precisar ajustar contratos com fornecedores e clientes para ajustar os prazos de pagamento.</li>
                  <li><strong>Aumento dos custos operacionais:</strong> a necessidade de adaptar os sistemas de fluxo de caixa e adequação aos novos processos pode gerar custos adicionais.</li>
                  <li><strong>Impacto na competitividade:</strong> as empresas, que não se adaptarem rapidamente às novas regras e realizarem as ações acima, podem perder competitividade no mercado diante da necessidade de aumentar preços.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Quais os benefícios do split payment?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Segundo Charles Gularte, o benefício desta proposta é um aumento de eficiência no processo de recolhimento e arrecadação de impostos, que viabiliza a liberação dos créditos de impostos para as empresas contratantes ou compradoras, e também vai contribuir para redução da sonegação e regularidade tributária das empresas.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Quem vai ser afetado pelo split payment?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>
                    Como comentamos acima, ainda há um processo de implementação para a adoção do split payment de forma gradual. Será um mecanismo que impactará todas as empresas ativas no Brasil (exceto MEI), independentemente de seu porte ou regime tributário.
                 </p>
                 <p>
                    A novidade está na forma como os impostos serão recolhidos: diretamente no momento da liquidação financeira de cada transação. Isso muda a forma como as empresas lidam com suas obrigações tributárias, alcançando desde grandes corporações até negócios menores.
                 </p>
                 <p>
                    Empresas que operam por meio de plataformas digitais e marketplaces também sentirão um impacto significativo, já que as plataformas digitais serão responsáveis por recolher os tributos diretamente das vendas realizadas em seus ambientes. Isso inclui desde a venda de mercadorias físicas até infoprodutos e serviços.
                 </p>
                 <p>
                    No varejo, indústria e serviços, os pagamentos realizados pelos clientes por meios eletrônicos, incluindo desde maquininhas de cartão até a venda via e-commerce, devem ter a fatia do imposto recolhida diretamente, reforçando a questão do impacto no fluxo de caixa e, com isso, a necessidade de maior planejamento.
                 </p>
                 <p>
                    Empresas do regime Simples Nacional também estarão sujeitas ao split payment, embora ainda existam dúvidas sobre como ele será aplicado, especialmente em relação às diferentes formas de tributação no regime possibilitadas pela Reforma Tributária.
                 </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Como se preparar para mudanças no fluxo de caixa?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O split payment deixa claro a necessidade de planejamento financeiro por parte do empreendedor, considerando o imediato pagamento de impostos e o impacto no seu caixa. Além disso, é necessário considerar um possível impacto no capital de giro para garantir a liquidez da sua empresa. Abaixo, saiba o que fazer desde já para se adaptar ao split payment.
                </p>
                 <ul className="list-decimal pl-6 space-y-3">
                    <li>
                        <strong className="text-foreground/90">Mapeie seus pagamentos e os custos:</strong> Identifique todas as suas obrigações tributárias e os prazos de pagamento atuais. Também liste seus fornecedores e os prazos de pagamento.
                    </li>
                     <li>
                        <strong className="text-foreground/90">Faça simulações com a nova forma de pagamento:</strong> Faça uma simulação do seu fluxo de caixa considerando a nova regra do Split Payment. Considere o valor total dos impostos pagos mensalmente e quanto tempo você tem atualmente para pagar esses impostos. Anote o valor. Agora, calcule qual será a diferença do valor resultante no seu fluxo de caixa com o desconto imediato dos impostos.
                    </li>
                    <li>
                        <strong className="text-foreground/90">Negocie condições de pagamento:</strong> Pode ser necessário combinar novos prazos com fornecedores para manter sua margem de lucro adequada em diferentes períodos do mês a fim de cumprir as demais obrigações da empresa, como o pagamento de despesas e funcionários.
                    </li>
                    <li>
                        <strong className="text-foreground/90">Considere fatores adicionais:</strong> Além dos novos desafios, o empreendedor deve considerar questões como a variação nas vendas e o impacto disso no montante de impostos a serem pagos e demais regras e oportunidades previstas na Reforma Tributária.
                    </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                Exemplo prático de split payment
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                    Para empresas que atuam no regime normal de tributação, a sistemática funciona da seguinte maneira:
                </p>
                <p>
                    Imagine uma loja online que vende capas de celular através de um marketplace, com cada capa sendo vendida por R$ 50,00 e comprada do fornecedor por R$ 20,00. Considerando a alíquota padrão estimada do Imposto sobre Valor Agregado (IVA) de 28%, o vendedor deverá recolher R$ 8,40 em tributos sobre o valor que adicionou à capa (R$30,00). Isso ocorre porque os outros R$ 5,60 que completam a o tributo total sobre o preço final já foram recolhidos em etapas anteriores da cadeia produtiva.
                </p>
                <p>
                    É importante ressaltar que o vendedor não receberá o valor total de R$ 50,00 pela venda, mas apenas R$ 41,40, pois o imposto de R$ 8,40 será retido pelo marketplace, que será o responsável de recolher e repassar o valor aos cofres públicos através do novo mecanismo de recolhimento.
                </p>
                <p>
                    No sistema atual, o valor do imposto sobre a venda permanece no caixa da empresa, podendo ser utilizado nas operações financeiras ao longo do mês. Posteriormente, no mês seguinte, esse montante é pago de forma acumulada, juntamente com os impostos de todas as vendas realizadas no período, em uma data específica, conforme previsto pelo regime tributário adotado.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                Como o split payment pode afetar o preço dos produtos?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                    Para começar, vale destacar que o objetivo principal do split payment não é aumentar os preços nem a arrecadação de impostos. Assim, os efeitos no preço dos produtos podem ser ocasionados pela necessidade das empresas de garantir um caixa com faturamento mais estável na liquidez diária, em oposição ao método adotado hoje para o pagamento de impostos que exige o valor dos impostos em caixa apenas uma vez por mês. 
                </p>
                <p>
                    Como comentamos, isto deverá ser analisado pelo empreendedor no detalhe, pois é necessário se manter competitivo, garantindo um bom planejamento financeiro.
                </p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
