import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CIDADES_ATENDIDAS } from "@/lib/cities"
import { Banknote, Building } from "lucide-react"

const faqBank = [
  {
    question: "O que é conta PJ?",
    answer: "É uma conta aberta em um banco e que atende empresas (pessoas jurídicas) tendo como identidade um CNPJ e não um CPF, como acontece nas contas bancárias para pessoas físicas. Com a conta bancária PJ, você separa suas finanças pessoais das corporativas e ainda tem acesso a outros serviços e benefícios que servirão para gerir as finanças do seu negócio."
  },
  {
    question: "Quais são as vantagens da conta bancária PJ do Contabilizei.bank?",
    answer: "São várias as vantagens! A principal delas é a praticidade da integração da rotina financeira com a contabilidade da sua empresa, a exemplo o processamento automático da guia de impostos, funcionando como se fosse um débito automático. Isto evita que você precise perder tempo com esta rotina. Outra grande vantagem é a integração automática das suas informações financeiras com a nossa plataforma de gestão contábil, além do Pix gratuito e ilimitado. Além disso, você também tem a facilidade de poder debitar sua mensalidade da Contabilizei automaticamente na sua conta sem você precisar se preocupar com taxas extras ou custos adicionais para realizar pagamentos automáticos."
  },
  {
    question: "Preciso ser cliente da Contabilizei para abrir uma conta no Contabilizei.bank?",
    answer: "Sim. A conta bancária PJ do Contabilizei.bank é um benefício oferecido exclusivamente para os nossos clientes."
  },
  {
    question: "Preciso pagar para abrir uma conta bancária PJ no Contabilizei.bank?",
    answer: "Não. A abertura da sua conta PJ no Contabilizei.bank é totalmente gratuita."
  },
  {
    question: "Como faço para abrir uma conta bancária PJ no Contabilizei.bank?",
    answer: "Abrir sua conta é muito fácil! Basta baixar o aplicativo do Contabilizei.bank, tirar uma foto do seu rosto e enviar uma foto de um documento pessoal, como por exemplo RG, CNH, passaporte ou algum documento de classe, através do aplicativo."
  },
  {
    question: "O Contabilizei.bank cobra alguma taxa para envio de Pix ou manutenção?",
    answer: "Não. Tanto a abertura da conta como a sua manutenção mensal são gratuitas no Contabilizei.bank. Você também pode enviar Pix ilimitados e sem cobrança de taxas."
  },
  {
    question: "O que está incluso no pacote de benefícios da conta bancária PJ do Contabilizei.bank?",
    answer: (
      <>
        <p className="mb-2">Confira o que faz parte do pacote*:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground font-serif">
          <li>Mensalidade zero;</li>
          <li>Cartão, físico e digital, bandeira Visa com zero anuidade;</li>
          <li>Pix ilimitados e gratuitos;</li>
          <li>10 TED gratuitos;</li>
          <li>Taxa zero por emissão de boletos;</li>
          <li>10 boletos compensados gratuitos;</li>
          <li>Saques na rede Banco24Horas R$6,50 por saque.</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground/80 font-serif">* Haverá a cobrança de R$3,49 por TED a partir do 11º bem como a cobrança de R$2,49 por boleto compensado acima do 10º.</p>
      </>
    )
  },
  {
    question: "Qual é o código do Contabilizei.bank?",
    answer: "Nossa processadora parceira é a DOCK IP, por isso o código de banco das contas é o 301. Você também pode consultar essa e outras informações sobre sua conta no aplicativo Contabilizei.bank acessando “Minha conta\" e depois “Ver dados bancários\"."
  }
];

export default function FaqSection() {
    return (
        <div className="mt-12 w-full max-w-6xl space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Banknote className="text-primary-foreground" />
                        Contabilizei Bank: A Conta PJ Integrada à sua Contabilidade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqBank.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent className="font-serif text-base">
                                    {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Building className="text-primary-foreground" />
                        Cidades Atendidas pela Contabilizei
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground font-serif">A Contabilizei oferece cobertura nacional, atendendo centenas de cidades em todos os estados do Brasil. Abaixo estão algumas das principais cidades onde atuamos:</p>
                    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-x-6">
                        {CIDADES_ATENDIDAS.map((cidade) => (
                            <p key={cidade} className="text-sm text-foreground mb-1 font-serif">{cidade}</p>
                        ))}
                    </div>
                     <p className="mt-4 text-sm text-muted-foreground font-serif">E muitas outras! Se sua cidade não está na lista, consulte-nos. Nosso serviço de contabilidade online nos permite alcançar empresas em todo o território nacional.</p>
                </CardContent>
            </Card>
        </div>
    )
}
