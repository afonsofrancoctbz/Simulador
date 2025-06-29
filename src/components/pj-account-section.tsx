"use client";

import { Card } from "./ui/card";
import { Banknote, ShieldCheck, Zap, TrendingUp, Link, CreditCard, Globe, ArrowRight } from "lucide-react";
import Image from 'next/image';
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const features = [
    { icon: ShieldCheck, text: "Conta PJ 100% digital e gratuita, sem taxas escondidas." },
    { icon: Zap, text: "PIX e TEDs ilimitados e gratuitos para agilizar seus pagamentos." },
    { icon: TrendingUp, text: "Débito automático da sua guia de impostos (DAS) para evitar multas.", highlighted: true },
    { icon: Link, text: "Extrato integrado em tempo real com sua contabilidade.", highlighted: true },
    { icon: CreditCard, text: "Cartão de débito Visa sem anuidade para suas compras e saques." },
    { icon: Globe, text: "Receba pagamentos de clientes do exterior com as melhores taxas do mercado." },
];

export default function PjAccountSection() {
    return (
        <div className="w-full max-w-6xl mx-auto">
            <Card className="bg-card shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2 items-center">
                    {/* Left Column: Content */}
                    <div className="p-8 md:p-12 order-2 md:order-1">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="bg-primary/10 p-3 rounded-full">
                                <Banknote className="h-7 w-7 text-primary" />
                            </div>
                             <h2 className="text-3xl font-bold text-foreground">
                                A conta PJ feita para o seu negócio
                            </h2>
                        </div>
                        <p className="text-lg text-muted-foreground mb-8">
                            Com o Contabilizei Bank, sua rotina financeira e contábil é integrada e automatizada, para você focar no que realmente importa: o crescimento da sua empresa.
                        </p>
                        
                        <ul className="space-y-3 mb-6">
                            {features.map((feature, index) => (
                                <li key={index} className={cn(
                                    "flex items-start gap-4 p-3 rounded-lg transition-colors", 
                                    feature.highlighted && "bg-primary/5"
                                )}>
                                    <div className={cn(
                                        "p-1.5 rounded-full mt-1 shrink-0",
                                        feature.highlighted ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                                    )}>
                                      <feature.icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn("text-base text-foreground/90", feature.highlighted && "font-semibold text-foreground")}>{feature.text}</span>
                                </li>
                            ))}
                        </ul>

                         <p className="text-xs text-muted-foreground/80 mb-10">
                            *Serviço de recebimento do exterior oferecido em parceria com a Remessa Online, correspondente cambial especialista no assunto.
                        </p>

                        <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                            Quero a conta PJ gratuita
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    {/* Right Column: Image */}
                    <div className="bg-primary/5 h-full flex items-center justify-center p-8 order-1 md:order-2">
                        <Image
                            src="https://placehold.co/400x500.png"
                            alt="Interface do aplicativo Contabilizei Bank em um smartphone"
                            width={400}
                            height={500}
                            className="rounded-xl shadow-2xl transform transition-transform hover:scale-105"
                            data-ai-hint="banking app smartphone"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
