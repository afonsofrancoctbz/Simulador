"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Check } from 'lucide-react';

const services = [
    { name: "Elaboração de contratos" },
    { name: "Revisão de contratos" },
    { name: "Registro de marca" },
];

const links = {
    "Registro de marca": "https://sociilaw.com/rmcontabilizeipromo",
    "Contratos": "https://sociilaw.com/contabilizeipromo"
};

export default function SociiLawSection() {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <Card className="shadow-lg border overflow-hidden">
                <div className="grid md:grid-cols-2 items-center">
                    <div className="p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-foreground mb-6">
                            Quem é a <span className="text-primary">Socii Law</span>?
                        </h2>
                        <div className="space-y-6 text-lg">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Check className="h-6 w-6 text-primary" />
                                    Startup Legal Tech
                                </h3>
                                <p className="text-muted-foreground ml-8">Tecnologia + Direito</p>
                            </div>
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Check className="h-6 w-6 text-primary" />
                                    Serviços
                                </h3>
                                <ul className="text-muted-foreground ml-8 space-y-1 mt-2">
                                    {services.map((service) => (
                                        <li key={service.name} className="flex items-center">
                                            <span className="mr-2">-</span>{service.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                         <div className="mt-8 flex flex-wrap gap-4">
                            <Button asChild size="lg">
                                <Link href={links["Registro de marca"]} target="_blank">Registrar Marca</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href={links["Contratos"]} target="_blank">Ver Contratos</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="bg-[#E56A25] p-8 md:p-12 text-white text-center flex flex-col items-center justify-center h-full">
                        <div className="relative w-full max-w-[250px] mx-auto">
                             <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <h3 className="text-3xl font-extrabold tracking-tight">NUNCA FOI TÃO FÁCIL SOLICITAR</h3>
                                <h4 className="text-2xl font-semibold">SERVIÇOS JURÍDICOS</h4>
                                <Button variant="secondary" className="mt-6" asChild>
                                    <Link href="https://app.sociilaw.com" target="_blank">Acesse</Link>
                                </Button>
                                <p className="mt-2 text-sm">app.sociilaw.com</p>
                             </div>
                             <Image 
                                src="https://picsum.photos/seed/sociilaw/300/600"
                                alt="Socii Law App"
                                width={300}
                                height={600}
                                className="rounded-2xl shadow-2xl invisible"
                                data-ai-hint="smartphone app"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
