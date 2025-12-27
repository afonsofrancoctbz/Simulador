"use client";

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
    BarChart3, 
    DollarSign, 
    Globe, 
    Wallet, 
    Users, 
    Award, 
    PlayCircle 
} from 'lucide-react';

// --- DADOS (Permanecem os mesmos) ---
const features = [
    {
        icon: BarChart3,
        title: "Planeje seu faturamento",
        text: "Saiba como calcular seus ganhos mensais com mais clareza."
    },
    {
        icon: DollarSign,
        title: "Precifique com segurança",
        text: "Descubra quanto cobrar pelos seus serviços de forma justa e segura."
    },
    {
        icon: Globe,
        title: "Aumente sua presença online",
        text: "Ganhe mais credibilidade e fortaleça sua imagem profissional no digital."
    },
    {
        icon: Wallet,
        title: "Organize suas finanças",
        text: "Dicas práticas para organizar sua vida financeira pessoal e profissional."
    },
    {
        icon: Users,
        title: "Atraia os clientes certos",
        text: "Aprenda a se posicionar e alcance quem precisa do seu trabalho."
    },
    {
        icon: Award,
        title: "Evolua como profissional",
        text: "Desenvolva novas habilidades e construa uma reputação sólida."
    }
];

const partners = [
    {
        name: "Me Poupe!",
        description: "Um dos maiores canais de finanças do mundo, a Me Poupe! produz conteúdos acessíveis que ajudam mais de 20 milhões de pessoas por mês a tomarem decisões mais acertadas com o próprio dinheiro.",
        image: "https://www.contabilizei.com.br/_mobile/img/me-poupe-desk.36ea54f.webp",
        bgClass: "bg-white"
    },
    {
        name: "Comunidade Sem Codar",
        description: "Parceiro no curso “Como implementar agentes de IA em seu negócio”, tem uma metodologia prática que torna simples a aplicação de IA mesmo para quem não tem conhecimento em programação.",
        image: "https://www.contabilizei.com.br/_mobile/img/parceiro-de-ia-desk.e78a692.webp",
        bgClass: "bg-white"
    }
];

const contents = [
    {
        title: "Eu, chefe de mim",
        image: "https://www.contabilizei.com.br/_mobile/img/eu-chefe-de-mim.194fca5.webp"
    },
    {
        title: "Procurando ganhos",
        image: "https://www.contabilizei.com.br/_mobile/img/procurando-ganhos.75e2604.webp"
    },
    {
        title: "Capacitação em IA",
        image: "https://www.contabilizei.com.br/_mobile/img/capacitacao-ia.eb0e8a8.webp"
    },
    {
        title: "Finanças em dia",
        image: "https://www.contabilizei.com.br/_mobile/img/financas-em-dia.188375d.webp"
    }
];
// ------------------------------------

export default function ContabilizeiMaisSection() {
    return (
        <div className="w-full font-sans">
            
            {/* --- HERO SECTION --- */}
            <div className="bg-[#002855] text-white py-20 px-4 md:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Texto do Hero */}
                    <div className="space-y-8 order-2 lg:order-1">
                        {/* Tema/Logo "Contabilizei Mais" adicionado */}
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">Contabilizei</span>
                            <span className="text-3xl font-bold text-[#00d3b3] bg-white/10 px-2 rounded-md">Mais</span>
                        </div>
                        
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                                Mais protagonismo para sua carreira: cursos <span className="text-[#00d3b3]">100% gratuitos</span>
                            </h1>
                            <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-xl">
                                Em parceria com grandes marcas, a Contabilizei Mais traz conteúdos exclusivos para profissionais que buscam aprendizado contínuo.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button size="lg" className="bg-[#00d3b3] text-[#002855] hover:bg-[#00d3b3]/90 font-bold text-lg px-10 rounded-full h-14 transition-all hover:scale-105">
                                Cadastrar-se
                            </Button>
                            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#002855] font-semibold text-lg px-10 rounded-full h-14 bg-transparent transition-all hover:scale-105">
                                Fazer login
                            </Button>
                        </div>
                    </div>
                    
                    {/* ÁREA DE IMAGEM HERO (NOVA IMAGEM) */}
                    <div className="hidden lg:flex items-center justify-center relative h-[500px] w-full order-1 lg:order-2 pl-12">
                         {/* Efeito de brilho sutil atrás da imagem principal */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00d3b3] opacity-20 blur-[120px] rounded-full z-0"></div>

                         {/* Container da imagem com visual moderno */}
                        <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-[3px] border-white/20 z-10 transform rotate-2 hover:rotate-0 transition-all duration-700">
                             {/* NOVA IMAGEM ESCOLHIDA: Profissional em ambiente de aprendizado/crescimento */}
                            <Image 
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                alt="Profissionais aprendendo e colaborando - Contabilizei Mais" 
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- O RESTANTE DO CÓDIGO PERMANECE O MESMO --- */}

            {/* --- FEATURES STRIP (Blue Bg) --- */}
            <div className="bg-[#002855] text-white py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="max-w-3xl">
                        <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                            O caminho certo para impulsionar sua jornada profissional.
                        </h3>
                        <p className="text-slate-300 text-xl">
                            Descubra como a Contabilizei Mais pode transformar sua atuação no dia a dia.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex gap-5 items-start group">
                                <div className="mt-1 bg-white/10 p-3 rounded-xl h-fit text-[#00d3b3] group-hover:bg-[#00d3b3] group-hover:text-[#002855] transition-colors duration-300">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-3 group-hover:text-[#00d3b3] transition-colors">{feature.title}</h4>
                                    <p className="text-slate-400 text-base leading-relaxed">{feature.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- PARTNERS SECTION --- */}
            <div className="bg-slate-50 py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                        <h3 className="text-3xl md:text-4xl font-bold text-[#002855]">Conheça nossos parceiros.</h3>
                        <p className="text-slate-600 text-xl leading-relaxed">
                            Em parceria com empresas referência, a Contabilizei Mais traz conhecimento para quem busca evoluir na carreira.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {partners.map((partner, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col-reverse lg:flex-row hover:shadow-xl transition-all duration-300 group">
                                <div className="p-10 flex-1 flex flex-col justify-center space-y-5">
                                    <h4 className="text-3xl font-bold text-[#002855] group-hover:text-[#00d3b3] transition-colors">{partner.name}</h4>
                                    <p className="text-slate-600 leading-relaxed text-base">
                                        {partner.description}
                                    </p>
                                </div>
                                <div className="relative w-full lg:w-2/5 min-h-[250px] bg-slate-100">
                                    <Image 
                                        src={partner.image}
                                        alt={partner.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CONTENT SHOWCASE --- */}
            <div className="py-24 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                        <h3 className="text-3xl md:text-4xl font-bold text-[#002855]">
                            Confira os conteúdos que você vai encontrar
                        </h3>
                        <p className="text-slate-600 text-xl leading-relaxed">
                            Entenda como se posicionar, ganhar credibilidade, cuidar do seu dinheiro e construir uma carreira sólida.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contents.map((content, idx) => (
                            <Card key={idx} className="border-0 shadow-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden group rounded-2xl">
                                <div className="relative h-56 w-full overflow-hidden">
                                    <Image 
                                        src={content.image}
                                        alt={content.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay com botão play */}
                                    <div className="absolute inset-0 bg-[#002855]/30 group-hover:bg-[#002855]/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <PlayCircle className="text-white h-16 w-16 drop-shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300" />
                                    </div>
                                </div>
                                <CardContent className="p-6 bg-white relative z-10">
                                    <h4 className="font-bold text-[#002855] text-xl group-hover:text-[#00d3b3] transition-colors">{content.title}</h4>
                                    <p className="text-sm text-[#00d3b3] font-bold mt-3 uppercase tracking-wider">Curso Gratuito</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Footer Banner */}
                    <div className="mt-20 bg-gradient-to-br from-blue-50 to-white rounded-[2.5rem] p-12 md:p-16 text-center border-2 border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d3b3]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h4 className="text-3xl md:text-4xl font-bold text-[#002855] mb-6 leading-tight">
                                100% gratuito, online e em parceria com grandes nomes
                            </h4>
                            <p className="text-slate-600 text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                                Uma oportunidade única para desenvolver seu potencial com o apoio de quem entende do assunto.
                            </p>
                            <Button className="bg-[#002855] text-white hover:bg-[#002855]/90 font-bold text-xl px-12 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                Acesse sem custo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}