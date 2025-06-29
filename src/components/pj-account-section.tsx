
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Banknote, Wallet, Link, TrendingUp, Zap, CreditCard, Globe } from "lucide-react";

const mainBankFeatures = [
    { icon: Wallet, title: "Conta PJ 100% Gratuita", description: "Abra e mantenha sua conta sem mensalidade, anuidade ou taxas escondidas." },
    { icon: Link, title: "Contabilidade Integrada", description: "Sua rotina financeira é automatizada com extratos integrados, eliminando o envio manual." },
    { icon: TrendingUp, title: "Débito Automático de Impostos", description: "Pague sua guia de impostos (DAS) automaticamente e evite multas por atraso." },
];

const otherBankFeatures = [
    { icon: Zap, title: "PIX e TEDs Gratuitos", description: "Realize transferências e pagamentos a qualquer momento, sem custo." },
    { icon: CreditCard, title: "Cartão de Débito Visa", description: "Use seu cartão para compras e saques em toda a rede Visa." },
    { icon: Globe, title: "Recebimento do Exterior", description: "Receba pagamentos internacionais com uma taxa de apenas 1% por operação." },
];


export default function PjAccountSection() {
    return (
        <div className="w-full max-w-6xl mx-auto">
            <Card className="bg-card shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Banknote className="text-primary" />
                        Conta PJ Integrada à sua Contabilidade
                    </CardTitle>
                    <CardDescription className="font-serif !mt-2">
                        Uma conta PJ gratuita e inteligente, que separa suas finanças e automatiza sua contabilidade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mainBankFeatures.map((feature, index) => (
                            <div key={index} className="flex flex-col text-left gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                                <feature.icon className="h-8 w-8 text-primary shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground font-serif">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t">
                         <h4 className="text-lg font-semibold text-center mb-6 text-foreground/90">E ainda mais vantagens para o seu negócio:</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {otherBankFeatures.map((feature, index) => (
                                 <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 text-left">
                                    <feature.icon className="h-8 w-8 text-accent shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground font-serif">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
