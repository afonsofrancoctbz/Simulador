"use client";

import { Card, CardContent } from './ui/card';
import { FileSignature, ShieldCheck, ThumbsUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const infoCards = [
    {
        icon: FileSignature,
        title: "O que é certificado digital",
        text: "É um arquivo digital que funciona como uma assinatura virtual da sua empresa e atesta a veracidade de transações e processos."
    },
    {
        icon: ShieldCheck,
        title: "Por que você precisa",
        text: "Traz maior segurança para suas informações, garante a entrega das obrigações do eSocial e permite acesso a funcionalidades exclusivas."
    },
    {
        icon: ThumbsUp,
        title: "Modelo aceito e funcionalidades",
        text: "Você precisa ter o modelo e-CNPJ A1, que servirá para emissão de notas fiscais, contratos, declarações e acesso a serviços da Receita Federal."
    }
];

export default function DigitalCertificateSection() {
    return (
        <div className="w-full font-sans py-16 px-4">
            
            {/* --- HERO BANNER UNIFICADO --- */}
            <div className="max-w-7xl mx-auto bg-[#0033a0] text-white relative overflow-hidden rounded-3xl shadow-xl mb-16">
                
                {/* Elementos Decorativos de Fundo */}
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[#002855] rounded-l-[10rem] hidden lg:block z-0 opacity-60"></div>
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#00d3b3] rounded-full opacity-10 blur-3xl z-0"></div>

                <div className="relative z-10 p-8 lg:p-16 grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* COLUNA 1: Benefícios e Contexto */}
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            Certificado digital para maior segurança na sua contabilidade.
                        </h2>
                        <p className="text-lg opacity-90 leading-relaxed">
                            Todos os clientes da Contabilizei precisam ter um certificado digital A1. Isso traz mais confiança para a sua gestão contábil e muitas facilidades para o seu dia a dia.
                        </p>
                        
                        {/* Lista rápida de vantagens visuais */}
                        <ul className="space-y-3 pt-2">
                            <li className="flex items-center gap-3 opacity-95">
                                <CheckCircle2 className="h-5 w-5 text-[#00d3b3]" />
                                <span>Assinatura com validade jurídica</span>
                            </li>
                            <li className="flex items-center gap-3 opacity-95">
                                <CheckCircle2 className="h-5 w-5 text-[#00d3b3]" />
                                <span>Segurança em transações online</span>
                            </li>
                        </ul>
                    </div>

                    {/* COLUNA 2: Card de Aviso IMPORTANTE */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden group hover:bg-white/15 transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00d3b3]"></div>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-8 w-8 text-[#00d3b3]" />
                            <h3 className="text-xl font-bold tracking-wide text-[#00d3b3] uppercase">Importante</h3>
                        </div>
                        
                        <p className="text-lg leading-relaxed font-medium text-white/95">
                            A não aquisição e upload do certificado digital na plataforma da Contabilizei pode impedir nossa equipe de entregar as obrigações de sua empresa, o que pode gerar <span className="text-[#00d3b3] font-bold underline decoration-[#00d3b3]/50 underline-offset-4">multas mensais</span>.
                        </p>
                    </div>

                </div>
            </div>

            {/* --- INFO CARDS --- */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#002855]">
                        Entenda a importância de se ter um certificado digital.
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {infoCards.map((card, idx) => (
                        <Card key={idx} className="border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group hover:-translate-y-1">
                            <CardContent className="p-8 space-y-6">
                                <div className="p-4 bg-blue-50 w-fit rounded-xl group-hover:bg-[#002855] transition-colors duration-300">
                                    <card.icon className="h-8 w-8 text-[#002855] group-hover:text-[#00d3b3] transition-colors duration-300" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-[#002855] mb-3">{card.title}</h4>
                                    <p className="text-slate-600 text-base leading-relaxed">
                                        {card.text}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* --- NOTA DE RODAPÉ (Facilidades) --- */}
                <div className="mt-16 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-2xl p-8 md:p-10 shadow-sm">
                    <h4 className="text-lg font-bold text-[#002855] mb-6 flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-[#00d3b3]" />
                        Facilidades na emissão
                    </h4>
                    <div className="grid md:grid-cols-2 gap-10 text-sm text-slate-700">
                        <div className="flex gap-4">
                            <div className="w-1 h-full min-h-[40px] bg-[#00d3b3] rounded-full shrink-0"></div>
                            <div>
                                <p className="font-bold text-[#002855] text-base mb-1">⚡ Tem CNH válida?</p>
                                <p className="leading-relaxed">Realize a entrevista de forma 100% online, tornando o processo mais rápido e prático.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1 h-full min-h-[40px] bg-slate-300 rounded-full shrink-0"></div>
                            <div>
                                <p className="font-bold text-[#002855] text-base mb-1">🧾 Não possui CNH?</p>
                                <p className="leading-relaxed">Neste caso, será necessário realizar a entrevista de forma presencial, conforme exigência da certificadora.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}