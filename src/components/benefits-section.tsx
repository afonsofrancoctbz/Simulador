"use client";

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Hospital, Users, ShieldCheck, Clock } from 'lucide-react';

const partners = [
    { name: 'Alice', logo: 'https://www.contabilizei.com.br/_mobile/img/alice.bd17484.webp' },
    { name: 'Sami', logo: 'https://www.contabilizei.com.br/_mobile/img/sami.4957992.webp' },
    { name: 'Amil', logo: 'https://www.contabilizei.com.br/_mobile/img/amil.59868e8.webp' },
    { name: 'SulAmérica', logo: 'https://www.contabilizei.com.br/_mobile/img/sulamerica.7f4592a.webp' },
    { name: 'Bradesco Saúde', logo: 'https://www.contabilizei.com.br/_mobile/img/bradesco.114471e.webp' },
    { name: 'Unimed', logo: 'https://www.contabilizei.com.br/_mobile/img/unimed.85e006d.webp' },
];

const features = [
    {
        icon: Hospital,
        title: "Opções de cobertura",
        description: "Encontre planos com a cobertura ideal para suas necessidades, desde consultas e exames até internações e cirurgias.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/opcoes-cobertura.a57458f.webp",
        imageAlt: "Ícones representando diferentes tipos de cobertura de saúde"
    },
    {
        icon: Users,
        title: "Planos para dependentes",
        description: "Estenda os benefícios para sua família, com opções de inclusão de cônjuges e filhos, garantindo a tranquilidade de todos.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/planos-dependentes.9f1b6d6.webp",
        imageAlt: "Família feliz e protegida pelo plano de saúde"
    },
    {
        icon: Clock,
        title: "Aproveitamento de carências",
        description: "Se você já possui um plano, pode ter isenção ou redução das carências ao trocar para um novo, aproveitando seus benefícios mais rápido.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/carencia-planos.36d2d42.webp",
        imageAlt: "Calendário com marcação de tempo reduzido, simbolizando aproveitamento de carências"
    },
];

export default function BenefitsSection() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-16 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center gap-3">
                   <div className="bg-primary/10 p-3 rounded-full">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                        Cliente Contabilizei tem plano de saúde PJ com condições exclusivas
                    </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Conte com as melhores condições nas maiores operadoras de saúde do Brasil, inclusive com a opção de plano de saúde a partir de uma vida.
                </p>
            </div>

            <div className="space-y-12">
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-foreground">Plano de saúde de acordo com a sua necessidade</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {features.map((feature, index) => (
                        <Card key={index} className="flex flex-col h-full text-center overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                                    <feature.icon className="h-7 w-7 text-primary" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <Image
                                    src={feature.imageUrl}
                                    alt={feature.imageAlt}
                                    width={300}
                                    height={200}
                                    className="w-full h-auto object-contain rounded-md"
                                />
                                <CardDescription className="mt-4 text-base">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Card className="bg-card shadow-lg overflow-hidden">
                <CardContent className="p-8 md:p-12 text-center">
                    <h3 className="text-2xl font-semibold text-foreground">
                        Planos com os melhores hospitais, clínicas, médicos e laboratórios do Brasil
                    </h3>
                    <p className="mt-2 text-muted-foreground">Conheça alguns dos nossos parceiros:</p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {partners.map((partner) => (
                            <Image
                                key={partner.name}
                                src={partner.logo}
                                alt={`Logo ${partner.name}`}
                                width={120}
                                height={40}
                                className="object-contain"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Quero uma cotação de plano de saúde
                </Button>
            </div>
        </div>
    );
}
