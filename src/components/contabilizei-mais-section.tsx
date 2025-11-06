"use client";

import Image from 'next/image';
import { Button } from './ui/button';

export default function ContabilizeiMaisSection() {
    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                        Apresentamos a Contabilizei Mais.
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        A plataforma de educação da Contabilizei, criada para apoiar o crescimento profissional dos nossos clientes.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        Com conteúdos que ajudam a desenvolver o negócio, organizar a gestão e impulsionar a carreira, os materiais respondem suas dúvidas e respeitam o seu tempo.
                    </p>
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">O que você vai encontrar:</h3>
                        <p className="text-lg text-muted-foreground">
                            Cursos, vídeos, planilhas e artigos sobre finanças (em parceria com a Nath Finanças), carreira, marketing, vendas, inteligência artificial e contabilidade.
                        </p>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Apoio contínuo na jornada empreendedora: um canal permanente de desenvolvimento, independente do segmento ou estágio do negócio.
                    </p>
                     <div className='flex flex-col sm:flex-row items-center gap-8 pt-4'>
                        <Image
                            src="/Imagem/unnamed (4).png"
                            alt="QR Code para Contabilizei Mais"
                            width={120}
                            height={120}
                            data-ai-hint="qr code"
                        />
                         <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-7 px-10">
                            A Contabilizei Mais é gratuita para clientes
                        </Button>
                    </div>
                </div>
                 <div className="flex items-center justify-center">
                    <Image
                        src="https://storage.googleapis.com/stabl-aec9b.appspot.com/project-1721861545638/contabilizei-mais-screens.png"
                        alt="Telas da plataforma Contabilizei Mais"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-2xl"
                        data-ai-hint="laptop mobile app"
                    />
                </div>
            </div>
        </div>
    );
}