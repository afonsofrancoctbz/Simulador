
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "Como a Contabilizei pode me ajudar a economizar nos impostos?",
    answer:
      "Nossa plataforma analisa suas atividades e faturamento para identificar o regime tributário mais vantajoso (Simples Nacional ou Lucro Presumido). Além disso, nossa assessoria especializada te orienta sobre as melhores práticas para otimização fiscal, como o Fator R, garantindo que você pague o mínimo de impostos dentro da lei.",
  },
  {
    question: "O que é o Fator R e como ele funciona?",
    answer:
      "O Fator R é um cálculo que pode permitir que empresas do Simples Nacional, que estariam no Anexo V, sejam tributadas pelo Anexo III, que possui alíquotas menores. Isso acontece quando a folha de pagamento (incluindo salários e pró-labore) é igual ou superior a 28% do seu faturamento. Nossa calculadora simula este cenário para você.",
  },
  {
    question: "A Contabilizei atende a minha cidade?",
    answer:
      "Atendemos centenas de cidades em todo o Brasil. Para confirmar se a sua cidade está na nossa área de cobertura e conhecer as taxas e prazos específicos, por favor, selecione sua cidade na calculadora acima. A informação detalhada aparecerá automaticamente.",
  },
  {
    question: "É complicado abrir uma empresa? Quanto tempo leva?",
    answer:
      "Com a Contabilizei, o processo é 100% digital e simplificado. Cuidamos de toda a burocracia para você. O prazo para ter seu CNPJ ativo pode variar, mas geralmente leva poucos dias, dependendo da sua cidade. Ao selecionar sua cidade na calculadora, você verá mais detalhes sobre os prazos.",
  },
  {
    question:
      "Posso ter um plano de saúde e outros benefícios pela minha empresa?",
    answer:
      "Sim! Clientes Contabilizei têm acesso a planos de saúde PJ com condições exclusivas e até 30% mais baratos que os planos para pessoa física. Oferecemos também o plano Multibenefícios, com acesso a academias (TotalPass), telemedicina (Starbem) e muito mais, para cuidar de você e do seu negócio.",
  },
];

export default function FaqSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Perguntas Frequentes
        </h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
          Tire suas principais dúvidas sobre como abrir e gerenciar sua empresa
          com a gente.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqData.map((faq, index) => (
          <AccordionItem value={`item-${index + 1}`} key={index}>
            <AccordionTrigger className="text-lg font-semibold text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground text-left">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
