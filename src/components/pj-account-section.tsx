"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

// --- DADOS BANCÁRIOS ---
const bankFeatures = [
    {
        title: "Integração automática com a contabilidade",
        description: "Envie as informações financeiras automaticamente, sem que você precise enviar extratos bancários todo mês.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-1.5fed054.webp",
        imageAlt: "Integração contábil",
    },
    {
        title: "Abertura de conta mais rápida",
        description: "Temos os documentos da sua empresa em primeira mão, deixando sua conta pronta para receber mais rápido.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-2.c6e92ae.webp",
        imageAlt: "Abertura rápida",
    },
    {
        title: "Pague o mínimo de impostos",
        description: "Receber valores da empresa na conta PF cria o risco de tributação de até 27,5%. Evite esse risco com a nossa conta PJ gratuita.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-3.6184503.webp",
        imageAlt: "Economia de impostos",
    },
    {
        title: "Débito automático de impostos e da mensalidade",
        description: "O débito automático deixa a sua rotina mais prática. Pagamentos em dia e sua empresa sem multas.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-4.7502c59.webp",
        imageAlt: "Débito automático",
    },
    {
        title: "Receba pagamentos do exterior",
        description: "Receba do exterior e saiba o valor que vai receber na hora, direto na sua conta, e sem taxas ocultas*.",
        imageUrl: "https://www.contabilizei.com.br/_mobile/img/image-card-7.825b79c.webp",
        imageAlt: "Recebimento exterior",
        footnote: "*Serviço oferecido em parceria com a Remessa Online."
    },
];

// --- PARCEIROS (URLs Atualizadas) ---
const partners = [
    {
        name: "Google Workspace",
        offer: "20% de desconto",
        description: "Contrate o pacote de ferramentas do maior site de busca do mundo com desconto.",
        // URL Atualizada
        logo: "https://cdn.melhoreshospedagem.com/wp/wp-content/uploads/2022/05/google-workspace-logotipo.jpg",
        borderClass: "border-gray-200"
    },
    {
        name: "Dell Technologies",
        offer: "Até R$ 2 mil em desconto",
        description: "Para adquirir computadores, servidores e acessórios da marca Dell.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg",
        borderClass: "border-blue-100"
    },
    {
        name: "Conquer Plus",
        offer: "33% de desconto",
        description: "Faça cursos em uma das maiores plataformas de aprendizagem contínua.",
        // URL Atualizada
        logo: "https://www.contabilizei.com.br/_mobile/img/image-card-conquerplus-discount.4c08950.webp",
        borderClass: "border-green-100"
    }
];

// QR Code Base64
const qrCodeBase64 = "data:image/webp;base64,UklGRooCAABXRUJQVlA4TH4CAAAv6UF6AA8w//M///MfeJCdSJIlSQEtQIvUqrdILUBDclPhUXPsX9yDiP7DYdtIkqROO9A+9nT1LXD5/Ow6/tuFsO7FJb3L5T21DC7NkaxOKr69wR3m/EXS/HCP7fuw9j2XTM1Mu8NpmsgA/N1AgsFceCXSXSFSG1/cyjRYBc9UiVjJrnmYK19Ei5j5RikZPCsh+dzQHSQJe8/f3Md5qDVslnmFIs6LgQmrPEibp7xkHczBmdMz1JoD0vDx0nv62dINbet3Bnp7gySFvQiHBQHLEzKhjevDHTXDRLOig1ey8e8OWdOHZDfw5t28iJt/xe0OWVPYmgx4cTiXYNAbZtwGpbv8zdANrKuxjwlpDtj7bJ/3mGNQzjx5IjXNYa54+Yf6TVc4zxVTY/794TUDBIYuTuxqDj29YSYmRCkrvAaMsw0Onc1habJlU0LseS8YxpcztrU3pPnY5V568USZh2mUc2/g/Yz3shNmm3w1M4xOd1BKCA6YIQ2WGktI+hVLe5AQk/iovydNyr71SOVcHr65C5RydFjYOBzUhui1SjdcOXsQQjnDz578zYFKt7WxHzW3vyuGFcJRHNC85mrwQtD8JwYmJ6k32Jceey0rJpU6OBqEAbs5bBLCcZn7juByPFCrDelLf0rhkmbhrkEj8Ex5OCHHqr2iBqzoj1GnN9iXPrWsaaYBB238UUtb9XaG3dK7vSS0SGxcbV9zEBYiYW3MF4H63aWmOYQOXjYoZ+/g8Ep8Zo5W0xw2X39ONCEIJJ8bGsTMGdJguGuwYk23iAmXNE986AeXZXZK3WGWDbG9G+7JNzUqD5LEW5nUwV7Om0Png3Ke6Qo//Z9P/t/FAQ==";

export default function PjAccountSection() {
    return (
        <div className="w-full font-sans">
            
            {/* --- HERO SECTION --- */}
            <section className="bg-gradient-to-r from-[#002855] to-[#0044cc] text-white py-16 px-4 md:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                            Abra uma conta digital PJ <span className="text-[#00d3b3]">gratuita</span> e integrada à sua contabilidade.
                        </h2>
                        <p className="text-lg opacity-90 leading-relaxed max-w-lg">
                            É a forma mais rápida para receber de seus clientes, pois já temos todos os documentos necessários para deixar a sua conta pronta.
                        </p>
                        <Button size="lg" className="bg-[#00d3b3] text-[#002855] hover:bg-[#00d3b3]/90 font-bold text-lg px-8 rounded-full h-14 mt-4">
                            ABRA SUA CONTA PJ GRÁTIS
                        </Button>
                    </div>
                    
                    {/* Imagem Hero Circular */}
                    <div className="hidden lg:flex justify-center relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] border-2 border-[#00d3b3]/30 rounded-full animate-pulse"></div>
                        <div className="relative z-10 w-[380px] h-[380px] bg-white rounded-full overflow-hidden border-4 border-[#00d3b3] shadow-2xl">
                             <Image 
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1632&auto=format&fit=crop" 
                                alt="Empresário com celular" 
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Faixa de Ícones */}
                <div className="max-w-5xl mx-auto mt-12 bg-white rounded-xl shadow-lg text-[#002855] py-6 px-8 flex flex-col md:flex-row justify-between gap-6 relative z-20">
                    {[
                        { title: "Pix gratuitos e ilimitados", desc: "Para seus clientes e para levar seu dinheiro para sua conta PF." },
                        { title: "Conta PJ gratuita", desc: "Você não paga taxas de abertura e manutenção da sua conta PJ." },
                        { title: "Segurança garantida", desc: "Dados e transações asseguradas com processos de segurança." }
                    ].map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start flex-1">
                            <CheckCircle2 className="h-6 w-6 text-[#00d3b3] shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-sm md:text-base">{item.title}</h4>
                                <p className="text-xs md:text-sm text-slate-500 leading-snug">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- OUTRAS VANTAGENS (CARROSSEL) --- */}
            <section className="bg-slate-50 py-20 px-4">
                <div className="max-w-7xl mx-auto space-y-10">
                    <div className="text-center space-y-4">
                        <h3 className="text-3xl font-bold text-[#002855]">Confira outras vantagens da nossa conta</h3>
                        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-2"><CheckCircle2 className="text-[#00d3b3] h-5 w-5"/> Pix gratuitos</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="text-[#00d3b3] h-5 w-5"/> 10 TEDs grátis/mês</span>
                            <span className="flex items-center gap-2"><CheckCircle2 className="text-[#00d3b3] h-5 w-5"/> Saques na rede 24h</span>
                        </div>
                    </div>

                    <div className="px-4 md:px-12">
                        <Carousel opts={{ align: "start", loop: true }} className="w-full">
                            <CarouselContent className="-ml-4 pb-4">
                                {bankFeatures.map((feature, index) => (
                                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                                            <CardHeader className="bg-white pb-3">
                                                <CardTitle className="text-lg font-bold text-[#002855] leading-tight min-h-[50px] flex items-center">
                                                    {feature.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-grow p-0 relative bg-slate-50 flex flex-col">
                                                <div className="px-6 pt-2 pb-6 min-h-[100px]">
                                                    <CardDescription className="text-sm text-slate-600 leading-relaxed">
                                                        {feature.description}
                                                    </CardDescription>
                                                </div>
                                                <div className="relative h-64 w-full mt-auto bg-gradient-to-b from-transparent to-slate-100">
                                                    <Image 
                                                        src={feature.imageUrl} 
                                                        alt={feature.imageAlt}
                                                        fill
                                                        className="object-contain object-bottom p-4 transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                                {feature.footnote && (
                                                    <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 bg-white/80 px-2 py-1 rounded">
                                                        {feature.footnote}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex -left-4 bg-white border-slate-200 text-[#002855]" />
                            <CarouselNext className="hidden md:flex -right-4 bg-white border-slate-200 text-[#002855]" />
                        </Carousel>
                    </div>
                </div>
            </section>

            {/* --- PARCEIROS (COM LOGOS CORRIGIDOS) --- */}
            <section className="bg-white py-16 px-4 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-[#002855]">
                            Nossa missão é simplificar a sua jornada em busca de sucesso.
                        </h3>
                        <p className="text-slate-500 mt-2">
                            No Contabilizei.bank você e sua empresa contam com benefícios exclusivos:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {partners.map((partner, idx) => (
                            <div key={idx} className={`border ${partner.borderClass} bg-white rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300`}>
                                <div className="h-16 w-full relative mb-6 flex items-center justify-center">
                                    <Image 
                                        src={partner.logo} 
                                        alt={partner.name} 
                                        width={160}
                                        height={60}
                                        className="object-contain max-h-12 w-auto"
                                    />
                                </div>
                                <h4 className="font-extrabold text-lg text-[#002855] mb-2">{partner.offer}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {partner.description}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <p className="text-center text-xs text-slate-400 mt-8">Benefícios sujeitos a alteração.</p>
                </div>
            </section>

            {/* --- APP DOWNLOAD --- */}
            <section className="bg-[#002855] py-10 px-4 relative overflow-hidden">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex-1 text-white text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="space-y-4 max-w-sm">
                            <h3 className="text-3xl font-bold leading-tight">App Contabilizei evoluiu.</h3>
                            <p className="opacity-80 text-base">
                                Focado no que importa para sua empresa, sem confusão. Baixe agora e redescubra a gestão do seu negócio.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                            <div className="bg-white p-1.5 rounded-lg shrink-0">
                                <img 
                                    src={qrCodeBase64} 
                                    alt="QR Code App" 
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <a href="#" className="hover:brightness-110 transition-all">
                                    <Image 
                                        src="https://www.contabilizei.com.br/_mobile/img/google-play-store.f800fb9.webp"
                                        alt="Google Play"
                                        width={120}
                                        height={36}
                                        className="h-9 w-auto"
                                    />
                                </a>
                                <a href="#" className="hover:brightness-110 transition-all">
                                    <Image 
                                        src="https://www.contabilizei.com.br/_mobile/img/app-store.5d3f351.webp"
                                        alt="App Store"
                                        width={120}
                                        height={36}
                                        className="h-9 w-auto"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-[280px] h-[350px] shrink-0 mt-4 md:mt-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00d3b3] rounded-full opacity-15 blur-[60px]"></div>
                        <Image 
                            src="https://www.contabilizei.com.br/_mobile/img/mockup-callout.79a086e.webp" 
                            alt="Mockup App Contabilizei"
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}