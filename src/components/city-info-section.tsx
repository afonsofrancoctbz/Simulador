
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

export default function CityInfoSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Building className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Informações para Abrir sua Empresa em São Paulo - SP
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Tudo o que você precisa saber para começar com o pé direito.
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
                  Na Contabilizei, <strong>não cobramos honorários para a abertura do seu CNPJ</strong>. Você contrata o plano de contabilidade e arca apenas com as taxas dos órgãos públicos. Para <strong>São Paulo - SP</strong>, os custos iniciais são:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Taxa da Junta Comercial (JUCESP):</strong> <Badge variant="secondary">R$ 211,01</Badge> para sociedades (LTDA/SLU) ou <Badge variant="secondary">R$ 91,44</Badge> para Empresário Individual (EI). Esta taxa é paga apenas uma vez.</li>
                  <li><strong>Taxa de Alvará (Prefeitura):</strong> A partir de <Badge variant="secondary">R$ 216,23</Badge>.</li>
                </ul>
                <div className="p-3 border-l-4 border-green-500 bg-green-50/80 text-green-900 rounded-r-md">
                    <h4 className="font-bold flex items-center gap-2"><Gift className="h-5 w-5"/>Campanha Custo Zero</h4>
                    <p className="mt-1">
                        São Paulo participa da nossa campanha de <strong>Custo Zero</strong>! Isso significa que <strong>isentamos você da taxa da Junta Comercial</strong>, uma economia e tanto para começar.
                    </p>
                </div>
                 <p className="text-sm mt-3">
                  <strong>Para atividades de advocacia:</strong> O processo ocorre junto à OAB, e não na Junta Comercial. O valor da taxa da OAB não é informado neste momento.
                </p>
                 <p className="text-sm">
                  <strong>Taxa de Fiscalização de Estabelecimentos (TFE):</strong> Em São Paulo, este é um tributo municipal cobrado anualmente em decorrência das atividades de fiscalização.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <Clock className="mr-3 text-primary" />
                Quais os prazos para ter meu CNPJ?
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                <p>O processo é mais rápido do que você imagina:</p>
                 <ul className="list-disc pl-6 space-y-2">
                  <li>O prazo para obtenção do <strong>CNPJ é de aproximadamente 6 dias corridos</strong>.</li>
                  <li>A emissão de notas fiscais poderá acontecer após o enquadramento da empresa no regime tributário, com um prazo total de aproximadamente <strong>29 dias corridos</strong>.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

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
                  <li><strong>Emissor de Notas Fiscais</strong> integrado à plataforma para facilitar sua rotina.</li>
                </ul>
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
            <AlertTitle className="font-semibold">Atenção aos Custos Adicionais</AlertTitle>
            <AlertDescription>
              Este simulador contempla apenas os valores iniciais da taxa de alvará. Dependendo da sua atividade e município, podem incidir taxas adicionais como <strong>AVCB (Bombeiros)</strong> e <strong>Vigilância Sanitária</strong>, que não estão inclusas nesta estimativa. O custo zero incide apenas sobre o valor da taxa da junta comercial.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
