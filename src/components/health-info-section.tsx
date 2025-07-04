
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
import { FileText, HeartPulse, Home, ShieldCheck } from "lucide-react";

export default function HealthInfoSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <HeartPulse className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Informações Importantes para o Setor da Saúde
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Regras essenciais para abrir sua empresa na área da saúde ou veterinária.
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
                  A escolha do endereço depende da natureza da sua atividade:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Endereço Residencial:</strong> Geralmente permitido para atividades puramente de consulta, sem atendimento físico de pacientes no local (ex: telemedicina, consultoria médica online).
                  </li>
                  <li>
                    <strong>Endereço Comercial:</strong> Obrigatório para clínicas (médicas, psicológicas, etc.) e qualquer estabelecimento que receba pacientes para consultas, exames ou procedimentos.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                <FileText className="mr-3 text-primary" />
                Protocolos, Documentação e Registros
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2 text-base text-muted-foreground">
                <p>
                  Abrir uma empresa na área da saúde envolve múltiplas etapas de registro para garantir a conformidade:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Órgãos Públicos:</strong> Além do CNPJ na Receita Federal e do registro na Junta Comercial, é necessário obter alvarás da Prefeitura e da Vigilância Sanitária.</li>
                  <li><strong>Conselho de Classe (Obrigatório):</strong> O registro da Pessoa Jurídica no conselho profissional correspondente (CRM, CRMV, CREFITO, etc.) é mandatório e deve ser feito logo após a abertura da empresa. A empresa pode ser fiscalizada e autuada a partir da inclusão do CNAE, mesmo antes de emitir notas.</li>
                  <li><strong>Cartório:</strong> O registro em cartório é uma alternativa à Junta Comercial apenas para Sociedades Simples Puras, onde todos os sócios são profissionais regulamentados da mesma área.</li>
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
                  Toda empresa de saúde precisa de um Responsável Técnico (RT), que é o profissional que responde legalmente pelas atividades exercidas.
                </p>
                 <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Requisito:</strong> O RT deve ser uma pessoa física com registro ativo no conselho de classe do estado onde a empresa está sediada.</li>
                  <li><strong>O RT pode não ser sócio:</strong> Em muitos casos, o RT pode ser um profissional contratado, não precisando fazer parte do quadro societário da empresa.</li>
                  <li><strong>Responsabilidade:</strong> A responsabilidade técnica é vinculada ao profissional, não sendo uma cláusula específica no contrato social da empresa.</li>
                </ul>
                <Alert variant="default" className="mt-4 bg-amber-50/80 border-amber-200 text-amber-900">
                    <AlertTitle className="font-semibold">Atenção!</AlertTitle>
                    <AlertDescription>
                        É crucial que o registro da PJ no conselho de classe seja realizado pelo empresário. A Contabilizei orienta, mas a responsabilidade final é do titular da empresa.
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
