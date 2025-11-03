
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
import { Coins, List, Target, ShieldBan } from "lucide-react";

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
                  Diferente de impostos que visam apenas arrecadar, o IS tem uma função "extrafiscal" para induzir comportamentos mais saudáveis e sustentáveis.
                </p>
                <Alert variant="default" className="bg-background">
                  <AlertDescription>
                    Ele será cobrado de forma <strong>monofásica</strong>, ou seja, incidirá uma única vez na cadeia produtiva (na importação, produção ou extração), sem gerar sistema de créditos e débitos. O valor do IS integrará a base de cálculo do IBS e da CBS.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                 <List className="mr-3 text-primary h-5 w-5" />
                 Produtos e Serviços Afetados
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>A Lei Complementar 214/2025 definiu os seguintes itens como passíveis de tributação pelo Imposto Seletivo:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Veículos', 'Embarcações e aeronaves', 'Produtos fumígenos', 'Bebidas alcoólicas', 'Bebidas açucaradas', 'Bens minerais'].map(item => (
                        <Badge key={item} variant="secondary" className="justify-center py-2 text-sm text-center">{item}</Badge>
                    ))}
                </div>
                <Alert variant="default" className="bg-amber-50/80 border-amber-200 text-amber-900">
                    <Coins className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-semibold text-amber-800">Atenção à Extração Mineral</AlertTitle>
                    <AlertDescription className="text-amber-900/90">
                         O IS incidirá sobre a extração de minérios mesmo que destinados à exportação. A alíquota, neste caso, será limitada a 1% do valor de mercado do produto.
                    </AlertDescription>
                </Alert>
                <p className="text-sm italic">* A lista final e as alíquotas específicas ainda dependem de regulamentação complementar.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <Coins className="mr-3 text-primary h-5 w-5" />
                Como o IS se encaixa na Reforma?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>A reforma cria três novos impostos principais. O IS funciona em paralelo ao sistema do IVA-Dual:</p>
                  <ul className="list-decimal pl-6 space-y-3">
                        <li>
                            <strong>Contribuição sobre Bens e Serviços (CBS):</strong> Tributo federal que substitui PIS/COFINS (e parte do IPI). Início da transição em <strong>2027</strong>.
                        </li>
                        <li>
                            <strong>Imposto sobre Bens e Serviços (IBS):</strong> Tributo estadual/municipal que substitui ICMS/ISS. Início da transição em <strong>2029</strong>.
                        </li>
                        <li>
                            <strong>Imposto Seletivo (IS):</strong> Tributo federal com função regulatória, assumindo o papel que era em parte do IPI. Vigência a partir de <strong>2027</strong>.
                        </li>
                  </ul>
                   <Alert variant="default" className="bg-sky-50/80 border-sky-200 text-sky-900">
                      <AlertTitle className="font-semibold">E o ano de 2026?</AlertTitle>
                      <AlertDescription>
                          Será um período de teste. As empresas deverão destacar alíquotas simbólicas de CBS (0,9%) e IBS (0,1%) em suas notas fiscais, mas sem recolhimento efetivo, apenas para adaptação dos sistemas.
                      </AlertDescription>
                   </Alert>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
