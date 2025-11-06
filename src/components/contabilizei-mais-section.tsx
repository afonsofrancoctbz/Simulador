"use client";

import Image from 'next/image';
import { Card, CardContent, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';

const topics = [
    "Finanças (em parceria com Me Poupe!)", 
    "Carreira", 
    "Marketing", 
    "Inteligência Artificial", 
    "Contabilidade"
];

const contentCards = [
    {
        title: "Eu, chefe de mim",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/eu-chefe-de-mim.194fca5.webp",
        imageAlt: "Eu, chefe de mim",
        aiHint: "person planning"
    },
    {
        title: "Procurando ganhos",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/procurando-ganhos.75e2604.webp",
        imageAlt: "Procurando ganhos",
        aiHint: "business growth"
    },
    {
        title: "Capacitação em IA",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/capacitacao-ia.eb0e8a8.webp",
        imageAlt: "Capacitação em IA",
        aiHint: "artificial intelligence"
    },
    {
        title: "Finanças em dia",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/financas-em-dia.188375d.webp",
        imageAlt: "Finanças em dia",
        aiHint: "financial planning"
    }
];

export default function ContabilizeiMaisSection() {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-8">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                        Apresentamos a Contabilizei Mais.
                    </h2>
                    <p className="mt-4 text-base text-foreground/90 text-justify leading-relaxed">
                        A plataforma de educação da Contabilizei, criada para apoiar o crescimento profissional dos nossos clientes. Com conteúdos que ajudam a desenvolver o negócio, organizar a gestão e impulsionar a carreira, os materiais respondem suas dúvidas e respeitam o seu tempo.
                    </p>
                </div>
                 <div className='bg-muted/30 p-6 rounded-lg border'>
                    <h3 className="font-semibold text-lg text-foreground mb-4">Confira os conteúdos que você vai encontrar:</h3>
                     <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-left">
                       {topics.map((topic, index) => (
                         <li key={index} className="flex items-center gap-3 text-foreground">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                            <span>{topic}</span>
                         </li>
                       ))}
                    </ul>
                </div>
                 <p className="text-base text-foreground/90 text-justify border-t border-border pt-6">
                    <strong>Apoio contínuo na jornada empreendedora:</strong> um canal permanente de desenvolvimento, independente do segmento ou estágio do negócio.
                </p>
            </div>
            
            <div className="text-center">
                 <h3 className="text-2xl font-bold text-foreground mb-8">
                    Entenda como se posicionar, ganhar credibilidade, cuidar do seu dinheiro e construir uma carreira sólida.
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {contentCards.map((card, index) => (
                        <Card key={index} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                             <CardContent className="p-0">
                                <div className="relative h-48 w-full overflow-hidden">
                                     <Image
                                        src={card.imageUrl}
                                        alt={card.imageAlt}
                                        fill
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={card.aiHint}
                                    />
                                </div>
                                <div className="p-4 bg-card">
                                    <CardTitle className="text-lg font-semibold text-foreground">{card.title}</CardTitle>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
