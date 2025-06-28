"use client";

import { ActivitySquare, HeartPulse, ShieldCheck } from "lucide-react";
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export default function BenefitsSection() {
    return (
        <div className="mt-12 w-full max-w-6xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-4">
                 <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">Multibenefícios Contabilizei</h2>
                 <p className="text-muted-foreground mt-2 text-lg font-serif">Vantagens exclusivas para sua empresa e bem-estar.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* Starbem Card */}
                <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="bg-primary/10 p-2 rounded-lg">
                                <HeartPulse className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Parceria Starbem</CardTitle>
                        </div>
                        <CardDescription className="font-serif">
                            Cuidado completo com sua saúde: consultas online com psicólogos, nutricionistas e descontos em exames e medicamentos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                       <Image
                            src="https://placehold.co/600x400.png"
                            alt="Mulher sorrindo durante uma consulta de telemedicina"
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover rounded-md mt-auto"
                            data-ai-hint="woman telemedicine"
                        />
                    </CardContent>
                </Card>

                {/* TotalPass Card */}
                <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                     <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="bg-primary/10 p-2 rounded-lg">
                                <ActivitySquare className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Parceria TotalPass</CardTitle>
                        </div>
                         <CardDescription className="font-serif">
                            Acesso a mais de 20 mil academias e 250 modalidades esportivas em todo o Brasil, com planos flexíveis e descontos exclusivos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                        <Image
                            src="https://placehold.co/600x400.png"
                            alt="Pessoa se exercitando em uma academia moderna"
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover rounded-md mt-auto"
                            data-ai-hint="gym workout"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Health Plan Card */}
            <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-card">
                 <div className="grid md:grid-cols-2 items-center">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="bg-accent/10 p-2 rounded-lg">
                                <ShieldCheck className="h-6 w-6 text-accent" />
                            </div>
                            <CardTitle>Plano de Saúde com Desconto</CardTitle>
                        </div>
                         <CardDescription className="!mt-4 font-serif text-base">
                            Clientes Contabilizei têm <span className="font-bold text-accent">até 30% de desconto</span> na contratação de planos de saúde para você e sua empresa, a partir de 1 vida e com as melhores operadoras do país.
                        </CardDescription>
                        <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                            Consultar um especialista
                        </Button>
                    </div>
                    <div className="hidden md:block">
                         <Image
                            src="https://placehold.co/600x400.png"
                            alt="Médico e paciente conversando"
                            width={600}
                            height={400}
                            className="w-full h-full object-cover rounded-r-lg"
                            data-ai-hint="doctor patient"
                        />
                    </div>
                 </div>
            </Card>
            
             <p className="text-center text-sm text-muted-foreground font-serif pt-2">
                <span className="font-bold">IMPORTANTE:</span> *Benefícios e condições sujeitos aos termos de cada plano. Consulte nossos especialistas para mais detalhes.
            </p>
        </div>
    );
}
