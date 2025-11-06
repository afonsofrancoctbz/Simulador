
"use client";

import Image from 'next/image';
import { Card, CardContent, CardTitle, CardHeader } from './ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

const topics = ["Finanças (em parceria com Me Poupe!)", "Carreira", "Marketing", "Inteligência Artificial", "Contabilidade"];

export default function ContabilizeiMaisSection() {
    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Main Introduction Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                        Apresentamos a Contabilizei Mais.
                    </h2>
                    <p className="text-base text-foreground text-justify leading-relaxed">
                        A plataforma de educação da Contabilizei, criada para apoiar o crescimento profissional dos nossos clientes. Com conteúdos que ajudam a desenvolver o negócio, organizar a gestão e impulsionar a carreira, os materiais respondem suas dúvidas e respeitam o seu tempo.
                    </p>
                    <div className="space-y-3">
                         <h3 className="font-semibold text-lg text-foreground">Confira os conteúdos que você vai encontrar:</h3>
                         <ul className="space-y-2">
                           {topics.map((topic, index) => (
                             <li key={index} className="flex items-center gap-3 text-foreground">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>{topic}</span>
                             </li>
                           ))}
                        </ul>
                    </div>
                     <p className="text-base text-foreground text-justify pt-4 border-t border-border">
                        <strong>Apoio contínuo na jornada empreendedora:</strong> um canal permanente de desenvolvimento, independente do segmento ou estágio do negócio.
                    </p>
                </div>
                <div className="flex items-center justify-center">
                    <Card className="overflow-hidden shadow-lg w-full max-w-sm text-center border-0">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Acesse pelo App</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Image
                                src="https://www.contabilizei.com.br/wp-content/uploads/2023/07/qr-code-contabilizei.png"
                                alt="QR Code para baixar o app Contabilizei"
                                width={250}
                                height={250}
                                className="mx-auto"
                            />
                            <Button variant="link" className="mt-4">
                                Baixe o App e comece a aprender
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
        </div>
    );
}
