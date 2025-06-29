"use client";

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
        title: "Diversas opções de cobertura",
        description: "Você pode escolher a melhor opção de cobertura do seu plano de saúde, aquela que se encaixa no seu perfil e na sua necessidade.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/opcoes-cobertura.a57458f.webp",
        imageAlt: "Doutora explicando plano de saúde para paciente",
        aiHint: "doctor patient"
    },
    {
        title: "Planos só para você ou com dependentes",
        description: "Conte com planos para apenas uma vida ou ainda para seus dependentes como filhos, cônjuges e outras pessoas vinculadas ao seu CNPJ.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/planos-dependentes.9f1b6d6.webp",
        imageAlt: "Mãe e filha sorrindo, representando plano de saúde para dependentes",
        aiHint: "mother daughter"
    },
    {
        title: "Orientação sobre as carência do plano",
        description: "Antes de qualquer decisão, orientamos você sobre possíveis carências e o aproveitamento delas caso você esteja pensando em mudar de plano de saúde.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/carencia-planos.36d2d42.webp",
        imageAlt: "Homem usando notebook, planejando plano de saúde",
        aiHint: "man laptop"
    },
];

export default function BenefitsSection() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-16 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Cliente Contabilizei tem plano de saúde PJ com condições exclusivas
                </h2>
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
                        <Card key={index} className="flex flex-col text-left overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-card">
                           <CardContent className="p-6 pb-4 flex-grow flex flex-col">
                                <CardTitle className="text-xl font-bold mb-2 text-primary">{feature.title}</CardTitle>
                                <CardDescription className="text-base text-muted-foreground">
                                    {feature.description}
                                </CardDescription>
                                <div className="relative mt-auto pt-4 h-48">
                                    <Image
                                        src={feature.imageUrl}
                                        alt={feature.imageAlt}
                                        fill
                                        className="object-contain"
                                        data-ai-hint={feature.aiHint}
                                    />
                                </div>
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
