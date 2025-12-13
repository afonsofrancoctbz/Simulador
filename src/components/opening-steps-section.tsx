"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PenSquare, Building2, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// Novo fluxo com atualizações pós 01/12/2025
const steps = [
  {
    icon: "📝",
    title: "Cadastro Inicial",
    items: [
      "Preenchimento do cadastro",
      "Análise do cadastro",
      "Confirmação dos dados cadastrados",
      "Taxa da Junta Comercial",
    ],
  },
  {
    icon: "✍️",
    title: "Formalização e Emissão do CNPJ",
    items: [
      "Cadastro Ouro Prata no GOV.BR",
      "Assinatura do Contrato Social",
      "Protocolo na Junta Comercial",
    ],
  },
  {
    icon: "🏛️",
    title: "Prefeitura e Alvará",
    items: [
      "Emissão do certificado e-CNPJ",
      "Taxa da Prefeitura",
      "Inscrição Municipal e expedição do Alvará de Funcionamento",
      "AVCB (Auto de Vistoria do Corpo de Bombeiros)",
      "Notificação de Abertura para Emissão de Nota Fiscal (cerca de 48 horas)",
    ],
  },
  {
    icon: "✅",
    title: "Finalização e Emissão de Notas Fiscais",
    items: [
      "Enquadramento tributário",
      "Configuração do emissor de notas fiscais (sua empresa estará apta à emissão de notas após esta etapa)",
      "Registro de Classe*",
      "Apresentação da Assessoria Experts",
    ],
  },
];

export default function OpeningStepsSection() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Primeiros passos para Abertura da empresa
        </h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            Qual etapa eu estou e quando poderei emitir notas fiscais?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        {steps.map((step, index) => (
          <Card key={index} className="h-full flex flex-col shadow-md bg-card">
            <CardHeader className="flex-row items-center gap-3">
              <span className="text-3xl">{step.icon}</span>
              <CardTitle className="text-xl font-bold text-primary">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-muted-foreground">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-amber-500 mt-1 shrink-0" fill="currentColor" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-start justify-center pt-4">
        <Alert variant="default" className="bg-sky-50/80 border-sky-200 text-sky-900 max-w-4xl shadow-sm">
          <AlertCircle className="h-5 w-5 text-sky-600" />
          <AlertTitle className="font-bold text-sky-800">FIQUE DE OLHO:</AlertTitle>
          <AlertDescription className="text-sky-900/90">
            Durante a abertura da sua empresa, especialistas do time vão entrar em contato com você para agilizar o processo. Mas não se preocupe, havendo qualquer dúvida, você pode falar conosco no mesmo número de WhatsApp.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
