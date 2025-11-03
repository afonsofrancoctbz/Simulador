
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Coins, List, Target, ShieldBan, Calendar, CheckSquare, Building, HelpCircle } from "lucide-react";

export default function SinTaxInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <ShieldBan className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">
            "Imposto do Pecado" (Imposto Seletivo)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            O que é, quando começa a valer e a lista de produtos impactados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Target className="mr-3 text-primary h-5 w-5" />
                O que é e qual o objetivo?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  O Imposto Seletivo (IS), apelidado de "Imposto do Pecado", é um novo imposto federal criado pela Reforma Tributária (EC 132/2023 e LC 214/2025) com um objetivo principal: <strong>desestimular o consumo de produtos e serviços considerados prejudiciais à saúde ou ao meio ambiente.</strong>
                </p>
                <p>
                  Diferente de impostos que visam apenas arrecadar, o IS tem uma função "extrafiscal". Ele será cobrado de forma <strong>monofásica</strong> (uma única vez na cadeia) e seu valor integrará a base de cálculo do IBS e da CBS.
                </p>
                 <Alert variant="default" className="bg-background">
                    <AlertDescription>
                        As exportações não serão tributadas pelo IS, e ele não incidirá sobre energia elétrica e telecomunicações. No entanto, a extração de minérios será taxada mesmo que destinada à exportação, com alíquota máxima de 1%.
                    </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <List className="mr-3 text-primary h-5 w-5" />
                 Quais produtos serão impactados?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O imposto impactará fabricantes e importadores, mas o custo tende a ser repassado ao consumidor final. A Lei Complementar 214/2025 definiu a lista de produtos sujeitos à tributação, que ainda aguarda regulamentação detalhada:</p>
                <ul className="list-disc space-y-3 pl-5">
                    <li><strong>Tabaco e derivados:</strong> Inclui cigarros, fumos para enrolar, charutos, produtos de tabaco aquecido, vapes (quando regulados) e essências de narguilé.</li>
                    <li><strong>Bebidas alcoólicas:</strong> Abrange cerveja, chope, destilados (cachaça, uísque, vodka), bebidas prontas (RTDs) e sidras.</li>
                    <li><strong>Bebidas adoçadas:</strong> Refrigerantes, refrescos, chás prontos, isotônicos e energéticos, com a tendência de graduar o imposto pelo teor de açúcar.</li>
                    <li><strong>Veículos com pior desempenho ambiental:</strong> Carros e comerciais leves com maiores emissões de CO2 ou menor eficiência energética.</li>
                    <li><strong>Extração de recursos naturais:</strong> Minérios (ferro, ouro, etc.) e hidrocarbonetos (petróleo e gás), com cobrança na etapa de extração.</li>
                    <li><strong>Apostas:</strong> Serviços de apostas como "bets" e fantasy sports.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-aliquota">
                <AccordionTrigger className="text-lg font-semibold">
                    <Coins className="mr-3 text-primary h-5 w-5" />
                    Qual será a alíquota?
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                    <p>Não há uma alíquota única. A lógica é calibrar o imposto por impacto (teor alcoólico, açúcar, emissões, etc.). A lei complementar definirá as bases de cálculo e as faixas de alíquotas. Não há um teto constitucional expresso para o Imposto Seletivo.</p>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-simples">
              <AccordionTrigger className="text-lg font-semibold">
                <Building className="mr-3 text-primary h-5 w-5" />
                E as empresas do Simples Nacional?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Em regra geral, empresas do Simples Nacional que sejam fabricantes ou importadoras dos itens alcançados deverão recolher o Imposto Seletivo <strong>fora do DAS</strong> (Documento de Arrecadação do Simples Nacional), ou seja, adicionalmente ao regime simplificado.</p>
                <p>Isso cria uma situação de "Simples Nacional Híbrido" apenas para o IS, onde a empresa mantém os benefícios do regime para os demais tributos, mas recolhe o Imposto Seletivo de forma separada.</p>
                <p>Além disso, a Reforma Tributária permite que empresas do Simples optem por recolher também o <strong>IBS e a CBS por fora do DAS</strong>. Essa pode ser uma boa opção para empresas que vendem para outras pessoas jurídicas (B2B) e desejam gerar crédito tributário para seus clientes, mantendo-se competitivas.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Calendar className="mr-3 text-primary h-5 w-5" />
                Quando o Imposto do Pecado começa a valer?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>O Imposto Seletivo entrará em vigor a partir de <strong>2027</strong>, mas sua aplicação ainda depende de regulamentação complementar para detalhar as alíquotas e as regras específicas.</p>
                   <Alert variant="default" className="bg-sky-50/80 border-sky-200 text-sky-900 mt-4">
                      <AlertTitle className="font-semibold">Cronograma de Vigência da Reforma</AlertTitle>
                      <AlertDescription>
                          <ul className="list-disc pl-5 mt-2">
                            <li><strong>2026:</strong> Período de teste, com alíquotas simbólicas de CBS (0,9%) e IBS (0,1%) destacadas em nota para adaptação dos sistemas.</li>
                            <li><strong>2027:</strong> Início da cobrança efetiva tanto da <strong>CBS</strong> quanto do <strong>Imposto Seletivo (IS)</strong>.</li>
                            <li><strong>2029-2033:</strong> Período de transição e consolidação completa do <strong>IBS</strong>.</li>
                          </ul>
                      </AlertDescription>
                   </Alert>
              </AccordionContent>
            </AccordionItem>
            
             <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                <CheckSquare className="mr-3 text-primary h-5 w-5" />
                Como preparar a sua empresa?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>Você pode começar a se preparar para as mudanças com os seguintes passos:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Mapear Despesas:</strong> Identifique todas as despesas que podem gerar crédito de IBS/CBS, como mercadorias, serviços, energia, aluguel e equipamentos.</li>
                    <li><strong>Organizar Notas Fiscais:</strong> Mantenha um controle rigoroso das notas de entrada e saída para garantir o aproveitamento de todos os créditos.</li>
                    <li><strong>Simular Cenários:</strong> Use ferramentas como esta calculadora para comparar os regimes tributários (Simples, Presumido, Real) no novo cenário.</li>
                    <li><strong>Ajustar Emissores de NF:</strong> Verifique se seu sistema de emissão de notas fiscais estará preparado para destacar os novos tributos e controlar os créditos.</li>
                    <li><strong>Acompanhar a Regulamentação:</strong> Fique atento às discussões sobre alíquotas finais, setores com tratamento diferenciado e as regras do Simples Nacional para o uso de créditos.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-faq">
                <AccordionTrigger className="text-lg font-semibold">
                    <HelpCircle className="mr-3 text-primary h-5 w-5" />
                    FAQ: Perguntas Rápidas
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-base text-muted-foreground">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="faq-1">
                            <AccordionTrigger className="text-md font-semibold">De quem é a responsabilidade pela cobrança?</AccordionTrigger>
                            <AccordionContent className="text-base">Da União. A arrecadação não é compartilhada com estados/municípios.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="faq-2">
                            <AccordionTrigger className="text-md font-semibold">Prestação de serviços entra no Imposto do Pecado?</AccordionTrigger>
                            <AccordionContent className="text-base">O foco principal são os bens. Serviços só entram se a lei complementar estabelecer uma clara relação de dano à saúde/ambiente.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="faq-3">
                            <AccordionTrigger className="text-md font-semibold">O Imposto Seletivo vai ser somado aos outros tributos?</AccordionTrigger>
                            <AccordionContent className="text-base">Sim. O Seletivo é um imposto adicional, cobrado além do IBS/CBS.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="faq-4">
                            <AccordionTrigger className="text-md font-semibold">Importação por pessoa física/e-commerce paga?</AccordionTrigger>
                            <AccordionContent className="text-base">Quando a remessa for tributada na importação, o imposto tende a incidir. Isenções e cotas seguem normas aduaneiras específicas.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="faq-5">
                            <AccordionTrigger className="text-md font-semibold">O cashback para baixa renda se aplica?</AccordionTrigger>
                            <AccordionContent className="text-base">Não. O mecanismo de cashback (devolução de imposto) é do IBS/CBS e não se aplica ao Imposto Seletivo.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

