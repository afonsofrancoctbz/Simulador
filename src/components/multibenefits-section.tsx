import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Check, Dumbbell, User, HeartPulse, ChevronRight } from 'lucide-react';

const benefitsData = [
    {
        title: "Academias e estúdios",
        description: "Treine em mais de 20 mil academias ou estúdios do Brasil todo e tenha mais de 250 modalidades de esportes para praticar.",
        image: "https://www.contabilizei.com.br/_mobile/img/academia-totalpass-desktop.19dd459.webp",
        partners: ["TotalPass"],
        color: "bg-blue-50" // Apenas decorativo
    },
    {
        title: "Psicólogos e nutricionistas",
        description: "Cuide da saúde realizando consultas com psicólogos e nutricionistas e tenha desconto em exames e medicamentos.",
        image: "https://www.contabilizei.com.br/_mobile/img/medico-starbem-desktop.06463b6.webp",
        partners: ["Starbem", "Conexa"]
    },
    {
        title: "Pronto atendimento digital",
        description: "Consultas online ilimitadas com médicos de forma rápida e prática para atendimentos de saúde de adultos e crianças.",
        image: "https://www.contabilizei.com.br/_mobile/img/medico-paciente-desktop.9ecee84.webp",
        partners: ["Starbem", "Conexa"]
    },
    {
        title: "Plano odontológico",
        description: "Cobertura para limpezas e procedimentos básicos para manter o seu sorriso sempre saudável.",
        image: "https://www.contabilizei.com.br/_mobile/img/plano-odontologico-desktop.be18eb8.webp",
        partners: ["MetLife"]
    },
    {
        title: "Seguro de vida",
        description: "Cobertura de até R$ 50 mil para morte e invalidez e R$ 7 mil para assistência funeral. É mais cuidado para você e sua família.",
        image: "https://www.contabilizei.com.br/_mobile/img/seguro-de-vida-desktop.6d70c96.webp",
        partners: ["bs2"]
    }
];

const highlights = [
    { icon: Dumbbell, title: "Você em foco", text: "Benefícios pensados para sua saúde e bem-estar." },
    { icon: User, title: "Personalize seu plano", text: "Escolha 2 benefícios que mais combinam com você." },
    { icon: HeartPulse, title: "PJ com benefícios", text: "Vantagens exclusivas semelhantes às do CLT." }
];

export default function MultibenefitsSection() {
    return (
        <div className="w-full font-sans">
            
            {/* --- HERO SECTION --- */}
            <section className="bg-[#002855] text-white pt-16 pb-32 px-4 relative overflow-hidden">
                {/* Background decorative curve could go here */}
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                            Conheça o plano <span className="text-[#00d3b3]">Multibenefícios</span>: contabilidade com benefícios que cuidam de você e do seu negócio.
                        </h2>
                        
                        <ul className="space-y-4">
                            {[
                                "Faça parte da contabilidade líder que mais cresce no Brasil",
                                "Escolha 2 dos 5 benefícios exclusivos disponíveis no plano",
                                "Economize até R$ 10 mil por ano com o Multibenefícios"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-1 bg-[#00d3b3] rounded-full p-0.5">
                                        <Check className="h-3 w-3 text-[#002855] stroke-[4]" />
                                    </div>
                                    <span className="text-lg font-medium opacity-90">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Imagem Hero (Opcional - usando placeholder se não houver URL específica do Hero) */}
                    <div className="hidden lg:block relative h-[500px]">
                         {/* Usando uma das imagens fornecidas como representação visual para o Hero, 
                             já que a imagem exata do homem correndo não foi fornecida como URL isolada */}
                        <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-l from-[#002855]/0 to-[#002855] z-10"></div>
                        <Image 
                            src="https://www.contabilizei.com.br/_mobile/img/academia-totalpass-desktop.19dd459.webp" 
                            alt="Hero Multibenefícios" 
                            fill
                            className="object-cover rounded-l-3xl opacity-60 mix-blend-overlay"
                        />
                    </div>
                </div>
            </section>

            {/* --- VALUE PROPS STRIP --- */}
            <div className="relative -mt-20 px-4 mb-20 z-20">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-slate-100">
                    <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {highlights.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 pt-4 md:pt-0 pl-0 md:pl-6 first:pl-0">
                                <div className="p-3 rounded-full bg-blue-50 text-[#002855]">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#002855] text-lg">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CARDS GRID --- */}
            <section className="max-w-7xl mx-auto px-4 pb-24 space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h3 className="text-3xl font-bold text-[#002855]">
                        Seu CNPJ nunca teve tantos benefícios.
                    </h3>
                    <p className="text-slate-600 text-lg">
                        Abra sua empresa com o plano Multibenefícios da Contabilizei e escolha <span className="font-bold text-[#002855]">2 dos 5 benefícios</span> abaixo de acordo com suas necessidades. Reduza custos e cuide de você!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {benefitsData.map((benefit, index) => (
                        <Card key={index} className="flex flex-col h-[480px] hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden group">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-bold text-[#002855] leading-tight">
                                    {benefit.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col relative p-0">
                                <div className="px-6 pb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                        {benefit.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nosso parceiro:</span>
                                        <div className="flex gap-2 font-bold text-[#002855] text-sm">
                                            {benefit.partners.join(" + ")}
                                        </div>
                                    </div>
                                </div>

                                {/* Imagem no rodapé com efeito de máscara/recorte */}
                                <div className="mt-auto relative w-full h-48 overflow-hidden">
                                    {/* Círculo decorativo de fundo para dar o efeito arredondado da marca */}
                                    <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[180%] bg-slate-100 rounded-full z-0 group-hover:bg-blue-50 transition-colors"></div>
                                    
                                    <div className="relative z-10 w-full h-full flex items-end justify-end">
                                         <Image 
                                            src={benefit.image} 
                                            alt={benefit.title} 
                                            width={300}
                                            height={300}
                                            className="object-contain object-bottom-right w-full h-full translate-y-2 translate-x-2"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* --- DISCLAIMER ALERT --- */}
                <div className="max-w-3xl mx-auto bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex gap-4 items-start">
                    <div className="bg-[#002855] text-white p-1 rounded-full shrink-0 mt-1">
                        <Check className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-[#002855]">
                        <p className="font-semibold mb-1">Informação Importante</p>
                        <p className="opacity-80 leading-relaxed">
                            Para adquirir o Multibenefícios é cobrado um valor adicional na mensalidade. 
                            Se contratar o plano de saúde com a Contabilizei, não há cobrança deste valor adicional.
                        </p>
                        <p className="mt-2 text-xs opacity-60">
                            *Assim que seu CNPJ for emitido, você receberá as instruções para selecionar seus 2 benefícios e assinar o contrato.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}