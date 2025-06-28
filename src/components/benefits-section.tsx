"use client";

import { Star } from "lucide-react";
import Image from 'next/image';

const AwardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L10 8H4L9 12L7 18L12 14L17 18L15 12L20 8H14L12 2Z" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2L13.895 6.8375H19.25L14.6775 9.875L16.5725 14.7125L12 11.675L7.4275 14.7125L9.3225 9.875L4.75 6.8375H10.105L12 2Z" fill="hsl(var(--primary))" fillOpacity="0.1"/>
        <path d="M6 20C6 18.8954 6.89543 18 8 18H16C17.1046 18 18 18.8954 18 20" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const TotalPassTextLogo = () => (
    // This is an approximation of the text logo for styling purposes
    <span className="text-2xl font-bold text-gray-700 tracking-wider">TOTAL PASS</span>
)

export default function BenefitsSection() {
    return (
        <div className="mt-12 w-full max-w-6xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
             <div className="text-left mb-12">
                 <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Multibenefícios Contabilizei: confira todas as vantagens extras que você tem.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="border border-primary rounded-2xl p-8 shadow-lg bg-card">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
                           <AwardIcon />
                        </div>
                        <TotalPassTextLogo />
                    </div>

                    <p className="text-muted-foreground font-serif text-lg mb-6">
                        Você e 1 sócio + 1 dependente cada têm acesso ao TotalPass, um benefício exclusivamente corporativo de saúde e bem-estar:
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <Star className="h-6 w-6 text-primary mt-1 shrink-0" />
                            <span className="font-serif text-lg text-foreground">Mais de 15 mil academias</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Star className="h-6 w-6 text-primary mt-1 shrink-0" />
                            <span className="font-serif text-lg text-foreground">Mais de 5 mil psicólogos</span>
                        </li>
                    </ul>

                    <p className="text-muted-foreground font-serif text-lg">
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
                        className="w-full h-auto object-cover rounded-lg shadow-xl"
                        data-ai-hint="woman exercising"
                    />
                </div>
            </div>
            
            <p className="text-center text-md text-foreground font-serif pt-8">
                <span className="font-bold">IMPORTANTE:</span> *Assim que seu CNPJ for emitido, você vai receber um e-mail com instruções para assinar digitalmente o contrato do Multibenefícios.
            </p>
        </div>
    );
}