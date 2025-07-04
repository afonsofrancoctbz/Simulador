
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
import { FileText, Home, ShieldCheck, Stethoscope } from "lucide-react";

export default function OdontologyInfoSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Stethoscope className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Informações Importantes para Odontologia (CRO)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Regras essenciais para abrir sua empresa no ramo odontológico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["item-1"]} className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <Home className="mr-3 text-primary" />
                Endereço da Empresa: Residencial ou Comercial?
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                <p>
                  A escolha do endereço é crucial e depende do tipo de atividade:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Endereço Residencial:</strong> Permitido apenas se a atividade for puramente administrativa ou de consultoria, sem atendimento físico de pacientes no local.
                  </li>
                  <li>
                    <strong>Endereço Comercial:</strong> Obrigatório para clínicas odontológicas e qualquer estabelecimento que realize atendimentos, consultas ou procedimentos em pacientes.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <FileText className="mr-3 text-primary" />
                Protocolos e Documentação
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                <p>
                  Para garantir a conformidade, sua empresa precisará de registros em múltiplos órgãos:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Órgãos Públicos:</strong> Registro do CNPJ na Receita Federal, arquivamento na Junta Comercial e obtenção de alvarás na Prefeitura.</li>
                  <li><strong>Conselho de Classe (CRO):</strong> O registro da Pessoa Jurídica no Conselho Regional de Odontologia (CRO) é mandatório e deve ser feito logo após a abertura da empresa.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                <ShieldCheck className="mr-3 text-primary" />
                O Responsável Técnico (RT)
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                <p>
                  Toda empresa de odontologia precisa de um Responsável Técnico (RT), que é o profissional que responde legalmente pelas atividades exercidas.
                </p>
                 <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Requisito:</strong> O RT deve ser uma pessoa física com registro ativo no CRO do estado onde a empresa está sediada.</li>
                  <li><strong>O RT pode não ser sócio:</strong> O responsável técnico não precisa ser sócio, mas seus documentos de registro profissional são necessários no ato da constituição da empresa.</li>
                 </ul>
                <Alert variant="default" className="mt-4 bg-amber-50/80 border-amber-200 text-amber-900">
                    <AlertTitle className="font-semibold">Atenção!</AlertTitle>
                    <AlertDescription>
                        É crucial que o registro da PJ no conselho de classe seja realizado pelo empresário. A Contabilizei orienta, mas a responsabilidade final é do titular da empresa. A falta de registro pode levar a fiscalizações e autuações.
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
