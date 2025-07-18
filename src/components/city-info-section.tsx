
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Ticket, Clock, Gift, Home, Building } from "lucide-react";
import type { CityData } from "@/lib/city-data";

export default function CityInfoSection({ data }: { data: CityData }) {
  const { cardTitle, cardDescription, costs, deadlines, cnaeRestrictions, nfeEmitter, additionalCosts } = data;
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Building className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            {cardTitle}
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            {cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full text-left">

            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Ticket className="mr-3 text-primary" />
                Quais são os custos para abrir a empresa?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Na Contabilizei, <strong>não cobramos honorários para a abertura do seu CNPJ</strong>. Você contrata o plano de contabilidade e arca apenas com as taxas dos órgãos públicos. Para <strong>{data.name} - {data.state}</strong>, os custos iniciais são:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Taxa da Junta Comercial:</strong> <Badge variant="secondary">{costs.boardTaxSociety}</Badge> para sociedades (LTDA/SLU) ou <Badge variant="secondary">{costs.boardTaxIndividual}</Badge> para Empresário Individual (EI). Esta taxa é paga apenas uma vez.</li>
                  <li><strong>Taxa de Alvará (Prefeitura):</strong> A partir de <Badge variant="secondary">{costs.permitTax}</Badge>.</li>
                </ul>
                {costs.costZeroCampaign && (
                  <div className="p-3 border-l-4 border-green-500 bg-green-50/80 text-green-900 rounded-r-md">
                      <h4 className="font-bold flex items-center gap-2"><Gift className="h-5 w-5"/>Campanha Custo Zero</h4>
                      <p className="mt-1">
                          {data.name} participa da nossa campanha de <strong>Custo Zero</strong>! Isso significa que <strong>isentamos você da taxa da Junta Comercial</strong>, uma economia e tanto para começar.
                      </p>
                  </div>
                )}
                {costs.advocacyNotes && <p className="text-sm mt-3">{costs.advocacyNotes}</p>}
                {costs.tfeNotes && <p className="text-sm">{costs.tfeNotes}</p>}
                {costs.notes?.map((note, index) => (
                    <p key={index} className="text-sm">{note}</p>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <Clock className="mr-3 text-primary" />
                Quais os prazos para ter meu CNPJ?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O processo é ágil e digital:</p>
                 <ul className="list-disc pl-6 space-y-2">
                  <li>O prazo para obtenção do <strong>CNPJ é de aproximadamente {deadlines.cnpj}</strong>.</li>
                  <li>A emissão de notas fiscais poderá acontecer após o enquadramento da empresa no regime tributário, com um prazo total de aproximadamente <strong>{deadlines.nfe}</strong>.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {cnaeRestrictions && (
              <AccordionItem value="item-cnaes">
                <AccordionTrigger className="text-lg font-semibold">
                  <cnaeRestrictions.icon className="mr-3 text-primary" />
                  {cnaeRestrictions.title}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>{cnaeRestrictions.description}</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {cnaeRestrictions.list.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <CheckCircle className="mr-3 text-primary" />
                O que está incluso no serviço da Contabilizei?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>
                  Depois que sua empresa estiver aberta, cuidamos de toda a rotina contábil para você focar no que realmente importa: seu negócio. Nossos serviços incluem:
                </p>
                 <ul className="list-disc pl-6 space-y-2">
                  <li>Cálculo e emissão de guias de impostos.</li>
                  <li>Entrega de todas as declarações contábeis obrigatórias.</li>
                  <li>Elaboração do Imposto de Renda da Pessoa Jurídica (IRPJ).</li>
                  <li>Acesso a relatórios contábeis online sempre que precisar.</li>
                  {nfeEmitter?.type === 'integrated' && <li><strong>Emissor de Notas Fiscais</strong> integrado à plataforma para facilitar sua rotina.</li>}
                </ul>
                 {nfeEmitter && nfeEmitter.type !== 'integrated' && (
                    <div className="p-3 mt-4 border-l-4 border-sky-500 bg-sky-50/80 text-sky-900 rounded-r-md">
                        <h4 className="font-bold">Emissão de Nota Fiscal</h4>
                        <p className="mt-1">{nfeEmitter.description}</p>
                    </div>
                 )}
                 <div className="p-3 border-l-4 border-blue-500 bg-blue-50/80 text-blue-900 rounded-r-md">
                    <h4 className="font-bold">Conta PJ Gratuita e Integrada</h4>
                    <p className="mt-1">
                     É fundamental separar suas finanças pessoais e empresariais. Oferecemos o <strong>Contabilizei Bank</strong>, uma conta PJ digital gratuita, sem tarifas de manutenção e totalmente integrada à sua contabilidade, simplificando o envio de extratos.
                    </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
               <AccordionTrigger className="text-lg font-semibold">
                <Home className="mr-3 text-primary" />
                Preciso sair de casa para abrir a empresa?
              </AccordionTrigger>
              <AccordionContent className="pt-2 text-base text-muted-foreground">
                <p>
                  Não! Com a Contabilizei, você pode ter o seu CNPJ <strong>sem sair de casa</strong>. Cuidamos de todo o processo de forma digital, com auxílio dos nossos especialistas em todas as etapas e um valor muito acessível.
                </p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          <Alert variant="default" className="mt-8 bg-amber-50/80 border-amber-200 text-amber-900">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-semibold">{additionalCosts.title}</AlertTitle>
            <AlertDescription className="space-y-2">
                <p>{additionalCosts.description}</p>
                {additionalCosts.items && (
                     <ul className="list-disc pl-5 text-sm">
                        {additionalCosts.items.map((item, index) => (
                            <li key={index}><strong>{item.title}:</strong> {item.value}</li>
                        ))}
                    </ul>
                )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
