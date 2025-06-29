
"use client";

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Hospital, Users, ShieldCheck, Clock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

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
        imageUrl: "https://placehold.co/200x200.png",
        imageAlt: "Doutora explicando plano para paciente",
        aiHint: "doctor patient"
    },
    {
        icon: Users,
        title: "Planos para dependentes",
        description: "Estenda os benefícios para sua família, com opções de inclusão de cônjuges e filhos, garantindo a tranquilidade de todos.",
        imageUrl: "https://placehold.co/200x200.png",
        imageAlt: "Família feliz e protegida pelo plano de saúde",
        aiHint: "happy family"
    },
    {
        icon: Clock,
        title: "Aproveitamento de carências",
        description: "Se você já possui um plano, pode ter isenção ou redução das carências ao trocar para um novo, aproveitando seus benefícios mais rápido.",
        imageUrl: "https://placehold.co/200x200.png",
        imageAlt: "Homem sorrindo enquanto usa notebook",
        aiHint: "man laptop"
    },
];

export default function BenefitsSection() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-16 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
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
                 <div className="max-w-3xl mx-auto">
                    <Alert variant="default" className="bg-green-100/80 border-green-200 text-green-900">
                        <AlertDescription className="text-center font-medium text-lg text-green-900/90">
                            Aqui na Contabilizei os Planos na Pessoa Jurídica são até 30% mais baratos do que para Pessoa Física e, além disso, você conta com vantagens exclusivas!
                        </AlertDescription>
                    </Alert>
                </div>
            </div>

            <div className="space-y-12">
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-foreground">Plano de saúde de acordo com a sua necessidade</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {features.map((feature, index) => (
                        <Card key={index} className="flex flex-col text-center overflow-hidden shadow-md hover:shadow-xl transition-shadow p-6 items-center">
                            <CardHeader className="p-0">
                                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                                    <feature.icon className="h-7 w-7 text-primary" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-4 flex-grow flex flex-col items-center">
                                <div className='relative w-48 h-48 rounded-full overflow-hidden my-4'>
                                    <Image
                                        src={feature.imageUrl}
                                        alt={feature.imageAlt}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={feature.aiHint}
                                    />
                                </div>
                                <CardDescription className="text-base mt-2 max-w-xs">
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
