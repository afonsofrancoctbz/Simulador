
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

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

const simpleAnnexes = [
  { annex: "Anexo I", scope: "Comércio", observation: "Tributação sobre a receita de venda de mercadorias." },
  { annex: "Anexo II", scope: "Indústria", observation: "Para empresas que realizam produção ou fabricação." },
  { annex: "Anexo III", scope: "Serviços", observation: "Alíquotas menores, para atividades que não exigem Fator R ou que o cumprem." },
  { annex: "Anexo IV", scope: "Serviços", observation: "Para atividades específicas (advocacia, construção civil) com CPP paga por fora do DAS." },
  { annex: "Anexo V", scope: "Serviços", observation: "Alíquotas maiores, sujeitas ao Fator R para possível migração para o Anexo III." },
];

const ivaRates = [
  { reduction: "0%", rate: "~26,5%", scope: "Alíquota padrão para a maioria dos bens e serviços (ex: tecnologia, locação de bens)." },
  { reduction: "30%", rate: "~18,55%", scope: "Serviços de profissão intelectual, científica ou artística (ex: advocacia, engenharia)." },
  { reduction: "60%", rate: "~10,60%", scope: "Serviços de saúde e educação, produções culturais, medicamentos e cesta básica." },
];

const reformFaqData = [
    {
        question: "Como a calculadora simula os impostos pós-Reforma (2026+)?",
        content: (
            <div className="space-y-4">
                <p>A simulação pós-reforma considera dois eixos de análise para determinar o melhor cenário:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold mb-2">Eixo 1: Simples Nacional (Anexos)</h3>
                        <p className="text-sm text-muted-foreground mb-3">A atividade (CNAE) define o anexo e a forma de tributação dentro do Simples.</p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Anexo</TableHead>
                                    <TableHead>Abrangência</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {simpleAnnexes.map(item => (
                                    <TableRow key={item.annex}>
                                        <TableCell className="font-semibold">{item.annex}</TableCell>
                                        <TableCell>{item.scope}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div>
                        <h3 className="font-bold mb-2">Eixo 2: Carga Tributária do IVA (IBS/CBS)</h3>
                        <p className="text-sm text-muted-foreground mb-3">Fora do Simples (Lucro Presumido ou Simples Híbrido), a alíquota do IVA pode variar.</p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Redução</TableHead>
                                    <TableHead>Alíquota</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ivaRates.map(item => (
                                    <TableRow key={item.rate}>
                                        <TableCell><Badge variant="secondary">{item.reduction}</Badge></TableCell>
                                        <TableCell className="font-semibold">{item.rate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        )
    },
    {
        question: "O que é o 'Imposto do Pecado' (Imposto Seletivo)?",
        content: (
            <div className="space-y-4">
                <p>O Imposto Seletivo (IS), apelidado de "Imposto do Pecado", é um novo tributo federal criado para desestimular o consumo de produtos prejudiciais à saúde ou ao meio ambiente. Ele será cobrado uma única vez na cadeia de produção (monofásico) a partir de 2027 e incidirá sobre:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Veículos, aeronaves e embarcações poluentes.</li>
                    <li>Cigarros e produtos de tabaco.</li>
                    <li>Bebidas alcoólicas.</li>
                    <li>Bebidas açucaradas.</li>
                    <li>Extração de minérios e petróleo.</li>
                </ul>
                <p>Empresas do Simples Nacional que fabriquem ou importem esses itens deverão recolher este imposto por fora do DAS.</p>
            </div>
        )
    },
    {
        question: "Quais as principais mudanças da Reforma Tributária para PJ?",
        content: (
            <div className="space-y-4">
                <p>A principal mudança é a unificação de cinco impostos (PIS, Cofins, IPI, ICMS, ISS) em um Imposto sobre Valor Agregado (IVA) de duas partes: a CBS (federal) e o IBS (estadual/municipal). A alíquota padrão estimada é de 26,5%.</p>
                <h4 className="font-semibold">Impactos práticos:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Não Cumulatividade Plena:</strong> Empresas no Lucro Presumido/Real poderão abater créditos de IVA de praticamente todas as suas despesas e insumos (exceto folha de pagamento), o que não ocorre hoje.</li>
                    <li><strong>Simples Nacional Híbrido:</strong> Empresas do Simples poderão optar por pagar o IVA por fora do DAS. Isso pode ser vantajoso para quem vende para outras empresas (B2B), pois permitirá repassar o crédito integral do IVA ao cliente.</li>
                    <li><strong>Transição Gradual:</strong> As mudanças serão implementadas progressivamente entre 2026 e 2033.</li>
                </ul>
            </div>
        )
    },
]


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
         {reformFaqData.map((faq, index) => (
          <AccordionItem value={`reform-item-${index + 1}`} key={index}>
            <AccordionTrigger className="text-lg font-semibold text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground text-left pt-4">
              {faq.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
