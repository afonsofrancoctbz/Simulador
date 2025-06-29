"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Banknote } from 'lucide-react';

const bankFeatures = [
    {
        title: "Integração automática com a contabilidade",
        description: "Envie as informações financeiras automaticamente, sem que você precise enviar extratos bancários todo mês.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-1.5fed054.webp",
        imageAlt: "Tela do aplicativo Contabilizei Bank mostrando a integração com a contabilidade."
    },
    {
        title: "Abertura de conta mais rápida",
        description: "Temos os documentos da sua empresa em primeira mão, deixando sua conta pronta para receber mais rápido.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-2.c6e92ae.webp",
        imageAlt: "Tela de login do Contabilizei Bank."
    },
    {
        title: "Pague o mínimo de impostos",
        description: "Receber valores da empresa na conta PF cria o risco de tributação de até 27,5%. Evite esse risco com a nossa conta PJ gratuita.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-3.6184503.webp",
        imageAlt: "Tela de extrato do Contabilizei Bank."
    },
    {
        title: "Débito automático de impostos e da mensalidade",
        description: "O débito automático deixa a sua rotina mais prática. Pagamentos em dia e sua empresa sem multas.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-4.7502c59.webp",
        imageAlt: "Tela de débito automático do Contabilizei Bank."
    }
];

export default function PjAccountSection() {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-4 justify-center">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Banknote className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                        A conta PJ feita para o seu negócio
                    </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Com o Contabilizei Bank, sua rotina financeira e contábil é integrada e automatizada, para você focar no que realmente importa.
                </p>
            </div>
            
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full relative px-10"
            >
                <CarouselContent className="-ml-4">
                    {bankFeatures.map((feature, index) => (
                        <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/4">
                            <div className="p-1 h-full">
                                <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-card">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold h-12">{feature.title}</CardTitle>
                                        <CardDescription className="text-sm !mt-2 h-24">{feature.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 mt-auto flex-grow flex items-end justify-center bg-slate-50/50 rounded-b-lg">
                                        <Image
                                            src={feature.imageUrl}
                                            alt={feature.imageAlt}
                                            width={250}
                                            height={500}
                                            className="w-auto h-[300px] object-contain"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex" />
            </Carousel>
        </div>
    );
}