
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, BarChart, ListChecks, HelpCircle } from "lucide-react";

const playbookSteps = [
  {
    icon: Building2,
    trigger: "Passo 1: Empresa",
    content: "Selecione a cidade onde sua empresa será registrada. Essa informação é vital, pois as taxas municipais (como o ISS) e os prazos para abertura do CNPJ variam significativamente de um local para outro. A cidade correta garante uma simulação de custos mais precisa."
  },
  {
    icon: Users,
    trigger: "Passo 2: Folha e Sócios",
    content: "Informe o custo total mensal com funcionários (CLT) e o valor do pró-labore de cada sócio. O pró-labore é a remuneração dos sócios pela administração da empresa e é a base para o cálculo do INSS e do IRRF retido. Essas informações são essenciais para calcular o Fator R no Simples Nacional."
  },
  {
    icon: FileText,
    trigger: "Passo 3: Faturamento Anual (RBT12)",
    content: "A Receita Bruta dos últimos 12 meses (RBT12) é o principal fator para determinar a alíquota efetiva no Simples Nacional. Se sua empresa é nova, pode deixar este campo zerado. A Folha de Pagamento dos últimos 12 meses (FP12) também é usada no cálculo do Fator R."
  },
  {
    icon: BarChart,
    trigger: "Passo 4: Atividades (CNAE) e Faturamento Mensal",
    content: "Selecione as atividades (CNAEs) que sua empresa irá exercer. O CNAE define o anexo do Simples Nacional ou as regras do Lucro Presumido. Informe seu faturamento mensal esperado, separando o que é para clientes no Brasil e no exterior. Para os cenários pós-reforma (2026+), informe também o percentual de receita de clientes PJ (B2B) e as despesas que geram crédito de IVA."
  },
  {
    icon: ListChecks,
    trigger: "Passo 5: Plano Contabilizei",
    content: "Escolha o plano de contabilidade. A mensalidade do plano é considerada no cálculo final do custo total e do lucro líquido da sua empresa em cada cenário tributário, oferecendo uma visão completa das suas finanças."
  },
];

export default function CalculatorPlaybookSection() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">
            Playbook da Calculadora
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda o porquê de cada informação solicitada no simulador e preencha com mais segurança.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-8">
          <Accordion type="single" collapsible className="w-full text-left">
            {playbookSteps.map((step, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-semibold">
                  <step.icon className="mr-3 text-primary h-5 w-5" />
                  {step.trigger}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                  <p>{step.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
