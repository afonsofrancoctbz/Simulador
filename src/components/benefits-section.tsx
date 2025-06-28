"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ShieldCheck, Award } from "lucide-react";
import Image from 'next/image';
import { Button } from './ui/button';

const StarLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F9A825" xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 ml-1">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
    </svg>
);


export default function BenefitsSection() {
    return (
        <div className="mt-12 w-full max-w-6xl mx-auto space-y-8 py-12 bg-muted/20 rounded-lg px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
                 <div className="inline-block bg-primary/20 p-3 rounded-lg mb-4">
                    <Award className="h-8 w-8 text-primary-foreground" />
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-bold">Benefícios Exclusivos para Clientes</h2>
                 <p className="text-muted-foreground mt-3 text-lg max-w-3xl mx-auto font-serif">Aproveite nossas parcerias para cuidar da sua saúde e bem-estar com condições especiais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Pacote Saúde */}
                <Card className="flex flex-col overflow-hidden shadow-lg transition-transform hover:scale-105">
                     <CardContent className="p-6 flex-grow">
                        <h3 className="text-xl font-bold text-primary-foreground">Pacote saúde</h3>
                        <p className="mt-2 text-muted-foreground font-serif min-h-[120px]">Cuide da saúde realizando consultas com psicólogos e nutricionistas e tenha desconto em exames e medicamentos.</p>
                        <div className="flex items-center mt-4 pt-4 border-t border-border/50">
                            <span className="text-sm text-muted-foreground">Nosso parceiro</span>
                            <div className="ml-auto flex items-center">
                                <span className="font-bold text-lg">Starbem</span>
                                <StarLogo />
                            </div>
                        </div>
                    </CardContent>
                    <div className="bg-card/50 p-4 aspect-[4/3] overflow-hidden">
                        <Image
                            src="https://placehold.co/400x300.png"
                            alt="Médica sorrindo para paciente"
                            width={400}
                            height={300}
                            className="w-full h-full object-cover rounded-md"
                            data-ai-hint="doctor patient"
                        />
                    </div>
                </Card>

                 {/* Academias e estúdios */}
                 <Card className="flex flex-col overflow-hidden shadow-lg transition-transform hover:scale-105">
                     <CardContent className="p-6 flex-grow">
                        <h3 className="text-xl font-bold text-primary-foreground">Academias e estúdios</h3>
                        <p className="mt-2 text-muted-foreground font-serif min-h-[120px]">Treine em mais de 20 mil academias e estúdios do Brasil todo e tenha acesso a mais de 250 modalidades de esportes.</p>
                        <div className="flex items-center mt-4 pt-4 border-t border-border/50">
                            <span className="text-sm text-muted-foreground">Nosso parceiro</span>
                            <div className="ml-auto">
                               <span className="font-bold text-lg tracking-wider bg-black text-white px-2 py-1 rounded-md">TOTALPASS</span>
                            </div>
                        </div>
                    </CardContent>
                     <div className="bg-card/50 p-4 aspect-[4/3] overflow-hidden">
                        <Image
                            src="https://placehold.co/400x300.png"
                            alt="Mulher sorrindo enquanto se exercita na academia"
                            width={400}
                            height={300}
                            className="w-full h-full object-cover rounded-md"
                            data-ai-hint="woman gym"
                        />
                    </div>
                </Card>

                {/* Plano de Saúde */}
                 <Card className="flex flex-col overflow-hidden shadow-lg transition-transform hover:scale-105 bg-primary/10 border-primary/20 md:col-span-2 lg:col-span-1">
                     <CardContent className="p-6 flex-grow">
                        <h3 className="text-xl font-bold text-primary-foreground">Plano de Saúde</h3>
                        <p className="mt-2 text-muted-foreground font-serif min-h-[120px]">Cliente Contabilizei conta com até <span className="font-bold text-primary">30% de desconto</span> na contratação de um plano de saúde a partir de 1 vida com as melhores operadoras do país.</p>
                         <div className="flex items-center mt-4 pt-4 border-t border-border/50">
                            <span className="text-sm text-muted-foreground">Benefício exclusivo</span>
                            <div className="ml-auto">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 bg-card/50">
                        <Button className="w-full" variant="default">
                            Consultar especialista
                        </Button>
                    </CardFooter>
                </Card>
            </div>
             <p className="text-center text-sm text-muted-foreground font-serif pt-4">* O pacote Starbem + TotalPass está incluso no plano Multibenefícios (adicional de R$30) e disponível para contratação no plano Experts.</p>
        </div>
    );
}
