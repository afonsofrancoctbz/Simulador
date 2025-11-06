"use client";

import Image from 'next/image';
import { Card, CardContent, CardTitle } from './ui/card';

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

export default function ContabilizeiMaisSection() {
    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                    Confira os conteúdos que você vai encontrar na Contabilizei Mais.
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Entenda como se posicionar, ganhar credibilidade, cuidar do seu dinheiro e construir uma carreira sólida.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {contentPillars.map((pillar, index) => (
                    <Card key={index} className="group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <CardContent className="p-6 text-center">
                            <CardTitle className="text-lg font-semibold text-foreground mb-4">{pillar.title}</CardTitle>
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
    );
}
