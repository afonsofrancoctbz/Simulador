"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeCheck, Star, AlertCircle } from "lucide-react";

// ==============================
// OpeningStepsSection (VERSÃO FINAL CORRETA)
// Plano Experts — Serviços ONLY
// - Todas as informações SEMPRE visíveis
// - Clique no card define a "Etapa atual"
// - Sem colapsar conteúdo
// ==============================

export type Step = {
  id: string;
  icon: string;
  title: string;
  short: string;
  items: string[];
  highlight?: string;
};

const STEPS: Step[] = [
  {
    id: "cadastro",
    icon: "📝",
    title: "Cadastro Inicial",
    short: "Envio e validação de dados",
    items: [
      "Preenchimento do cadastro",
      "Análise do cadastro",
      "Confirmação dos dados pelo cliente",
      "Pagamento da taxa da Junta Comercial (quando aplicável)",
    ],
  },
  {
    id: "registro-mat",
    icon: "✍️",
    title: "Registro na Junta + MAT",
    short: "Registro e enquadramento tributário",
    highlight: "MAT obrigatório",
    items: [
      "Assinatura do Contrato Social",
      "Protocolo na Junta Comercial",
      "Geração do NIRE",
      "Definição do regime tributário no MAT (gov.br Prata ou Ouro)",
      "Validação do contador antes da emissão do CNPJ",
    ],
  },
  {
    id: "prefeitura",
    icon: "🏛️",
    title: "Procedimentos Pós-CNPJ",
    short: "Inscrição Municipal e licenças",
    items: [
      "Inscrição Municipal (libera Nota Fiscal de Serviços)",
      "Emissão do certificado digital e-CNPJ (etapa essencial)",
      "Solicitação de alvará de funcionamento",
      "Vigilância Sanitária / Vistorias (quando exigido)",
    ],
  },
  {
    id: "operacao",
    icon: "✅",
    title: "Empresa Pronta para Operar",
    short: "Configuração e início",
    items: [
      "Configuração do emissor de notas fiscais de serviços",
      "Empresa apta a emitir notas após Inscrição Municipal",
      "Apresentação da Assessoria Experts",
      "Registro em Conselho de Classe (quando aplicável)",
    ],
  },
];

export default function OpeningStepsSection() {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <header className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Primeiros passos para abertura da empresa
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Todas as etapas estão visíveis. Clique em uma etapa para marcar como atual.
        </p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;

          return (
            <Card
              key={step.id}
              onClick={() => setCurrentStepIndex(index)}
              className={`cursor-pointer rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                isActive
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-border bg-white"
              }`}
            >
              <CardHeader className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{step.icon}</span>
                  <CardTitle className="text-base font-semibold">
                    {step.title}
                  </CardTitle>
                </div>

                {step.highlight && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-100 px-2 py-1 rounded-full w-fit">
                    <BadgeCheck className="h-4 w-4" />
                    {step.highlight}
                  </span>
                )}
              </CardHeader>

              <CardContent className="px-4 pb-4">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {step.items.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Star className="h-4 w-4 text-amber-500 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {isActive && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600/10 px-3 py-2 text-emerald-700 text-sm font-medium">
                    <BadgeCheck className="h-4 w-4" />
                    Etapa atual
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert WhatsApp */}
      <div className="flex justify-center">
        <Alert className="max-w-4xl bg-sky-50 border-sky-200">
          <AlertCircle className="h-5 w-5 text-sky-600" />
          <AlertTitle className="font-semibold text-sky-800">
            Fique de olho
          </AlertTitle>
          <AlertDescription className="text-sky-900">
            Durante a abertura da sua empresa, especialistas do time vão entrar em
            contato com você para agilizar o processo. Mas não se preocupe, havendo
            qualquer dúvida, você pode falar conosco no mesmo número de WhatsApp.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  );
}
