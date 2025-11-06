"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from './ui/badge';
import { Scale, ShieldCheck, Calendar, Clock, BadgePercent, ArrowRight } from 'lucide-react';

const partnershipInfo = {
    title: "Informações da Parceria",
    logoUrl: "https://sociilaw.com/static/media/named-white.0a44d51b8aae4b9bd4dc74aef4f78564.svg",
    logoAlt: "SociiLaw e Contabilizei Parceria",
    services: {
        trademark: {
            title: "Registro de Marca",
            icon: ShieldCheck,
            description: "Garanta a exclusividade do uso da sua marca em todo o Brasil.",
            oldPrice: 399,
            newPrice: 299,
            priceNote: "Melhor preço do Brasil. Taxas do INPI (R$ 200-400) não inclusas.",
            details: [
                {
                    title: "O que é o Registro de Marca?",
                    text: "É a garantia legal, concedida pelo INPI, de que você é o único proprietário de uma marca, podendo usá-la com exclusividade. Sem ele, qualquer um pode copiar seu nome ou logo."
                },
                {
                    title: "Exemplo Prático: Cotonete®",
                    text: "Só a Johnson & Johnson pode usar o nome 'Cotonete'. Outras empresas vendem o mesmo produto como 'haste flexível com pontas de algodão'. Se usarem 'Cotonete', a J&J pode acioná-las judicialmente."
                },
                {
                    title: "Nosso Processo",
                    text: "Nossa assessoria cuida de tudo: fazemos a pesquisa de viabilidade, realizamos o pedido de registro e acompanhamos todo o processo até a concessão."
                }
            ],
            link: "https://sociilaw.com/rmcontabilizei"
        },
        contracts: {
            title: "Elaboração de Contratos",
            icon: Scale,
            description: "Proteja seu negócio com contratos elaborados por especialistas.",
            oldPrice: 399,
            newPrice: 199,
            priceNote: "Desconto de até 50% para clientes Contabilizei.",
             details: [
                {
                    title: "Segurança Jurídica para seu Negócio",
                    text: "Tenha contratos de prestação de serviços, termos de uso, políticas de privacidade e outros documentos essenciais, personalizados para sua empresa."
                },
                {
                    title: "Processo Ágil em 3 Etapas",
                    list: [
                        "Agendamento de reunião para entender suas necessidades.",
                        "Reunião com um especialista para alinhar os detalhes.",
                        "Receba seu contrato pronto em até 3 horas após a reunião."
                    ]
                }
            ],
            link: "https://sociilaw.com/contabilizei"
        }
    }
};

export default function SociiLawSection() {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <Card className="shadow-xl border-primary/20 bg-primary/5 overflow-hidden">
                <CardHeader className="text-center bg-card p-8">
                     <div className="flex justify-center items-center gap-4 mb-4">
                        <Image
                            src="https://sociilaw.com/static/media/named-orange.64b2bd20da2e71b0d6448f4fecf7e4c1.svg"
                            alt="Logo SociiLaw"
                            width={150}
                            height={40}
                            className="h-10"
                        />
                        <span className="text-2xl text-muted-foreground font-light">+</span>
                         <Image
                            src="https://www.contabilizei.com.br/_mobile/img/logo-contabilizei.edac969.svg"
                            alt="Logo Contabilizei"
                            width={180}
                            height={30}
                        />
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-primary tracking-tight">
                        {partnershipInfo.title}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Clientes Contabilizei têm acesso a serviços jurídicos essenciais com descontos exclusivos através da nossa parceria com a SociiLaw, uma startup de tecnologia e direito.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                     <Tabs defaultValue="trademark" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="trademark" className="h-12 text-md gap-2">
                                <ShieldCheck className="h-5 w-5" /> Registro de Marca
                            </TabsTrigger>
                            <TabsTrigger value="contracts" className="h-12 text-md gap-2">
                                <Scale className="h-5 w-5" /> Elaboração de Contratos
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="trademark" className="mt-6">
                            <div className="grid md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-foreground">{partnershipInfo.services.trademark.title}</h3>
                                    <p className="text-muted-foreground">{partnershipInfo.services.trademark.description}</p>
                                    <div className="bg-green-100/70 border border-green-200 rounded-lg p-4 space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <BadgePercent className="h-5 w-5 text-green-700" />
                                            <span className="text-lg font-semibold text-muted-foreground">De <span className="line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partnershipInfo.services.trademark.oldPrice)}</span></span>
                                        </div>
                                        <p className="text-3xl font-extrabold text-green-800">
                                            Por {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partnershipInfo.services.trademark.newPrice)}
                                        </p>
                                        <p className="text-xs text-muted-foreground pt-1">{partnershipInfo.services.trademark.priceNote}</p>
                                    </div>
                                    <Button asChild size="lg" className="w-full">
                                        <Link href={partnershipInfo.services.trademark.link} target="_blank">
                                            Garantir Desconto no Registro <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="space-y-4 text-sm bg-card p-6 rounded-lg border">
                                    {partnershipInfo.services.trademark.details.map((detail, i) => (
                                        <div key={i}>
                                            <h4 className="font-semibold text-primary">{detail.title}</h4>
                                            <p className="text-muted-foreground mt-1">{detail.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="contracts" className="mt-6">
                             <div className="grid md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-foreground">{partnershipInfo.services.contracts.title}</h3>
                                    <p className="text-muted-foreground">{partnershipInfo.services.contracts.description}</p>
                                    <div className="bg-green-100/70 border border-green-200 rounded-lg p-4 space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <BadgePercent className="h-5 w-5 text-green-700" />
                                            <span className="text-lg font-semibold text-muted-foreground">De <span className="line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partnershipInfo.services.contracts.oldPrice)}</span></span>
                                        </div>
                                        <p className="text-3xl font-extrabold text-green-800">
                                            A partir de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partnershipInfo.services.contracts.newPrice)}
                                        </p>
                                        <p className="text-xs text-muted-foreground pt-1">{partnershipInfo.services.contracts.priceNote}</p>
                                    </div>
                                     <Button asChild size="lg" className="w-full">
                                        <Link href={partnershipInfo.services.contracts.link} target="_blank">
                                            Garantir Desconto em Contratos <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                 <div className="space-y-4 text-sm bg-card p-6 rounded-lg border">
                                    {partnershipInfo.services.contracts.details.map((detail, i) => (
                                        <div key={i}>
                                            <h4 className="font-semibold text-primary">{detail.title}</h4>
                                            {detail.text && <p className="text-muted-foreground mt-1">{detail.text}</p>}
                                            {detail.list && (
                                                <ul className="mt-2 space-y-2">
                                                    {detail.list.map((item, j) => (
                                                        <li key={j} className="flex items-start gap-2">
                                                            <Clock className="h-4 w-4 text-primary mt-1 shrink-0" />
                                                            <span className="text-muted-foreground">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
