"use client";

import { Star } from "lucide-react";
import Image from 'next/image';

export default function BenefitsSection() {
    return (
        <div className="mt-12 w-full max-w-6xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
             <div className="text-left mb-12">
                 <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">Multibenefícios Contabilizei: confira todas as vantagens extras que você tem.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="border border-border rounded-xl p-6 shadow-md bg-card">
                    <div className="flex items-center gap-3 mb-4">
                        <Star className="h-6 w-6 text-primary fill-primary/20" strokeWidth="1.5" />
                        <span className="text-lg font-semibold text-foreground tracking-wider">TOTAL PASS</span>
                    </div>

                    <p className="text-muted-foreground font-serif text-base mb-6">
                        Você e 1 sócio + 1 dependente cada têm acesso ao TotalPass, um benefício exclusivamente corporativo de saúde e bem-estar:
                    </p>

                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-primary shrink-0" strokeWidth="1.5" />
                            <span className="font-serif text-base text-foreground">Mais de 15 mil academias</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-primary shrink-0" strokeWidth="1.5" />
                            <span className="font-serif text-base text-foreground">Mais de 5 mil psicólogos</span>
                        </li>
                    </ul>

                    <p className="text-muted-foreground font-serif text-base">
                        Dentro do app, você pode contratar planos de academias e estúdios por valores bem abaixo do mercado. São mais de 10 planos disponíveis para escolher o que mais combina com você!
                    </p>
                </div>

                {/* Image Content */}
                <div className="flex justify-center">
                    <Image
                        src="https://placehold.co/500x550.png"
                        alt="Promoção TotalPass na Contabilizei com uma mulher se exercitando"
                        width={500}
                        height={550}
                        className="w-full h-auto object-cover rounded-xl shadow-md"
                        data-ai-hint="woman exercising"
                    />
                </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground font-serif pt-8">
                <span className="font-bold">IMPORTANTE:</span> *Assim que seu CNPJ for emitido, você vai receber um e-mail com instruções para assinar digitalmente o contrato do Multibenefícios.
            </p>
        </div>
    );
}
