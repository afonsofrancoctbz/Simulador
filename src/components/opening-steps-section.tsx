"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Star, AlertCircle } from "lucide-react";

// Novo fluxo após 01/12/2025 (MAT integrado)
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
    title: "Registro na Junta Comercial",
    items: [
      "Assinatura do Contrato Social",
      "Protocolo na Junta Comercial",
      "Geração do NIRE (Número de Registro)",
    ],
  },
  {
    icon: "📊",
    title: "MAT – Administração Tributária",
    items: [
      "Acesso ao MAT com conta gov.br (Prata ou Ouro)",
      "Escolha obrigatória do regime tributário (Simples, Presumido, Real)",
      "Confirmação de dados e aceite digital do contador",
      "CNPJ emitido após conclusão no MAT",
    ],
  },
  {
    icon: "🏛️",
    title: "Procedimentos Pós-CNPJ",
    items: [
      "Inscrição Municipal (para emissão de notas)",
      "Inscrição Estadual (quando aplicável)",
      "Emissão do certificado digital e-CNPJ",
      "Solicitação de alvará de funcionamento",
      "AVCB / Vistoria quando necessário",
    ],
  },
  {
    icon: "✅",
    title: "Finalização e Operação",
    items: [
      "Configuração do emissor de notas fiscais (empresa apta a emitir)",
      "Apresentação da Assessoria Experts",
      "Registro de Classe (quando aplicável)",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
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
            Com o novo MAT (Módulo de Administração Tributária), a escolha do regime
            tributário acontece antes da emissão do CNPJ — sem isso o CNPJ não será emitido.
            Após o CNPJ liberado, mostraremos as etapas municipais para você começar a emitir
            notas fiscais. :contentReference[oaicite:4]{index=4}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
