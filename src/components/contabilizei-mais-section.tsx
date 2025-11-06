
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
            <div className="text-center space-y-8 mb-12">
                <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-primary">
                        Apresentamos a Contabilizei Mais.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        A plataforma de educação da Contabilizei, criada para apoiar o crescimento profissional dos nossos clientes. Com conteúdos que ajudam a desenvolver o negócio, organizar a gestão e impulsionar a carreira, os materiais respondem suas dúvidas e respeitam o seu tempo.
                    </p>
                </div>
                <div className="max-w-2xl mx-auto">
                    <h3 className="font-semibold text-xl text-foreground mb-3">Confira os conteúdos que você vai encontrar:</h3>
                     <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                       {topics.map((topic, index) => (
                         <div key={index} className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>{topic}</span>
                         </div>
                       ))}
                    </div>
                </div>
                 <p className="text-md text-muted-foreground pt-4 border-t max-w-3xl mx-auto">
                    <strong>Apoio contínuo na jornada empreendedora:</strong> um canal permanente de desenvolvimento, independente do segmento ou estágio do negócio.
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {contentPillars.map((pillar, index) => (
                    <Card key={index} className="group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-0">
                        <CardContent className="p-4 text-center">
                            <div className="relative h-28 mb-4">
                                <Image
                                    src={pillar.imageUrl}
                                    alt={pillar.imageAlt}
                                    fill
                                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={pillar.aiHint}
                                />
                            </div>
                            <CardTitle className="text-lg font-semibold text-foreground">{pillar.title}</CardTitle>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
