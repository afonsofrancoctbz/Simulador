"use client";

import Image from 'next/image';
import { Card, CardContent, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';

const contentPillars = [
    {
        title: "Eu, chefe de mim",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/eu-chefe-de-mim.194fca5.webp",
        imageAlt: "Logo do curso Eu, Chefe de Mim da Me Poupe!",
        aiHint: "logo purple"
    },
    {
        title: "Procurando ganhos",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/procurando-ganhos.75e2604.webp",
        imageAlt: "Logo do curso Procurando Ganhos da Me Poupe!",
        aiHint: "logo yellow"
    },
    {
        title: "Capacitação em IA",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/capacitacao-ia.eb0e8a8.webp",
        imageAlt: "Ilustração de um robô segurando um chip de IA",
        aiHint: "robot hand AI"
    },
    {
        title: "Finanças em dia",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/financas-em-dia.188375d.webp",
        imageAlt: "Moeda de um real em destaque",
        aiHint: "coin money"
    }
];

const topics = ["Finanças (em parceria com Me Poupe!)", "Carreira", "Marketing", "Inteligência Artificial", "Contabilidade"];

export default function ContabilizeiMaisSection() {
    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                        Apresentamos a Contabilizei Mais.
                    </h2>
                    <div className="space-y-4 text-lg text-muted-foreground">
                        <p>A plataforma de educação da Contabilizei, criada para apoiar o crescimento profissional dos nossos clientes.</p>
                        <p>Com conteúdos que ajudam a desenvolver o negócio, organizar a gestão e impulsionar a carreira, os materiais respondem suas dúvidas e respeitam o seu tempo.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-foreground mb-3">O que você vai encontrar:</h3>
                        <ul className="space-y-2">
                           {topics.map((topic, index) => (
                             <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>{topic}</span>
                             </li>
                           ))}
                        </ul>
                    </div>
                    <p className="text-md text-muted-foreground pt-4 border-t">
                        <strong>Apoio contínuo na jornada empreendedora:</strong> um canal permanente de desenvolvimento, independente do segmento ou estágio do negócio.
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    {contentPillars.map((pillar, index) => (
                        <Card key={index} className="group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                            <CardContent className="p-4 sm:p-6 text-center">
                                <CardTitle className="text-base sm:text-lg font-semibold text-foreground mb-4">{pillar.title}</CardTitle>
                                <div className="relative aspect-square">
                                    <Image
                                        src={pillar.imageUrl}
                                        alt={pillar.imageAlt}
                                        fill
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={pillar.aiHint}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}