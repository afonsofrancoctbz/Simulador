"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from 'react';

const bankFeatures = [
    {
        title: "Abertura de conta mais rápida",
        description: "Temos os documentos da sua empresa em primeira mão, deixando sua conta pronta para receber mais rápido.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-2.c6e92ae.webp",
        imageAlt: "Tela de login do Contabilizei Bank.",
        footnote: null,
        footnoteLocation: null,
    },
    {
        title: "Integração automática com a contabilidade",
        description: "Envie as informações financeiras automaticamente, sem que você precise enviar extratos bancários todo mês.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-1.5fed054.webp",
        imageAlt: "Tela do aplicativo Contabilizei Bank mostrando a integração com a contabilidade.",
        footnote: null,
        footnoteLocation: null,
    },
    {
        title: "Débito automático de impostos e da mensalidade",
        description: "O débito automático deixa a sua rotina mais prática. Pagamentos em dia e sua empresa sem multas.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-4.7502c59.webp",
        imageAlt: "Tela de débito automático do Contabilizei Bank.",
        footnote: null,
        footnoteLocation: null,
    },
    {
        title: "Pague o mínimo de impostos",
        description: "Receber valores da empresa na conta PF cria o risco de tributação de até 27,5%. Evite esse risco com a nossa conta PJ gratuita.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-3.6184503.webp",
        imageAlt: "Tela de extrato do Contabilizei Bank.",
        footnote: null,
        footnoteLocation: null,
    },
    {
        title: "Receba pagamentos do exterior",
        description: "Receba do exterior e saiba o valor que vai receber na hora, direto na sua conta, e sem taxas ocultas*.",
        footnote: "*Serviço oferecido em parceria com a Remessa Online, correspondente cambial especialista no assunto.",
        footnoteLocation: 'header',
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-7.825b79c.webp",
        imageAlt: "Tela do app Contabilizei mostrando simulação de recebimento do exterior."
    },
    {
        title: "Link de pagamento",
        description: "Cobre dos seus clientes via Pix, boleto bancário ou parcelado no cartão de crédito, recebendo seu pagamento em até 2 dias úteis.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-6.16a5c95.webp",
        imageAlt: "Tela do app Contabilizei mostrando a emissão de boleto.",
        footnote: null,
        footnoteLocation: null,
    },
    {
        title: "Cartão de débito Visa",
        description: "Pague as despesas da sua empresa com um cartão físico ou virtual, contrate serviços como o Google Workspace e participe do programa de benefícios Vai de Visa.",
        footnote: "*Sujeito a análise",
        footnoteLocation: 'content',
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-5.a97aa7e.webp",
        imageAlt: "Cartão de débito Visa da Contabilizei."
    }
];

export default function PjAccountSection() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    Abra uma conta digital PJ gratuita e integrada à sua contabilidade.
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    É a forma mais rápida para receber de seus clientes, pois já temos todos os documentos necessários para deixar a sua conta pronta. Baixe o app e conclua o cadastro assim que o seu CNPJ estiver disponível.
                </p>
            </div>
            
            {isClient && (
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full relative px-10"
                >
                    <CarouselContent className="-ml-4 items-stretch">
                        {bankFeatures.map((feature, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-card">
                                        <CardHeader className="pb-4 flex-shrink-0">
                                            <CardTitle className="text-lg font-semibold min-h-[40px]">{feature.title}</CardTitle>
                                            <CardDescription className="text-sm !mt-2 min-h-[80px]">{feature.description}</CardDescription>
                                            {feature.footnote && feature.footnoteLocation === 'header' && (
                                                <CardDescription className="!mt-2 !text-xs text-muted-foreground">{feature.footnote}</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-4 mt-auto flex-grow flex flex-col items-center justify-center relative">
                                            <Image
                                                src={feature.imageUrl}
                                                alt={feature.imageAlt}
                                                width={250}
                                                height={500}
                                                className="w-auto h-[300px] object-contain"
                                            />
                                            {feature.footnote && feature.footnoteLocation === 'content' && (
                                                <p className="absolute bottom-4 right-4 text-xs text-muted-foreground">{feature.footnote}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex" />
                </Carousel>
            )}
        </div>
    );
}
