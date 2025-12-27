"use client";

import { 
    Calendar, 
    CheckCircle2, 
    FileText, 
    DollarSign, 
    Clock, 
    AlertCircle, 
    Briefcase,
    TrendingUp,
    Landmark,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const calendarDates = [
    {
        day: "01-05",
        title: "Notas Fiscais",
        desc: "Limite para comunicar cancelamento e substituição de NFs.",
        icon: FileText
    },
    {
        day: "10",
        title: "Funcionários",
        desc: "Envio de exames e laudos de funcionários (se houver).",
        icon: Briefcase
    },
    {
        day: "15",
        title: "Extratos & Honorários",
        desc: "Envio dos extratos bancários PJ e vencimento da Contabilizei.",
        icon: Landmark
    },
    {
        day: "20",
        title: "Pagamento de Impostos",
        desc: "Vencimento do DAS, INSS, IRRF e FGTS.",
        icon: DollarSign
    },
    {
        day: "30",
        title: "Fechamento",
        desc: "Data limite para emissão de NFs e envio de notas de fornecedores.",
        icon: Clock
    }
];

const financialSteps = [
    { step: 1, text: "Pagamento dos impostos" },
    { step: 2, text: "Pagamento da mensalidade Contabilizei" },
    { step: 3, text: "Pagamento de despesas (aluguel, internet, etc)" },
    { step: 4, text: "Transferência do Pró-labore (líquido)" },
    { step: 5, text: "Transferência do Lucro (isento)" },
];

export default function LifeWithCNPJSection() {
    return (
        <div className="w-full font-sans max-w-7xl mx-auto py-16 px-4 space-y-16">
            
            {/* --- HERO HEADER --- */}
            <div className="text-center max-w-4xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#002855] text-sm font-semibold mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Jornada do Empreendedor
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#002855]">
                    A vida com CNPJ: <span className="text-[#00d3b3]">Sua nova rotina</span>
                </h2>
                <p className="text-slate-600 text-lg">
                    Agora que sua empresa está aberta, confira os passos essenciais para manter sua contabilidade em dia e evitar multas.
                </p>
            </div>

            {/* --- JORNADA ATÉ AQUI (TIMELINE) --- */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#00d3b3] md:w-full md:h-2 md:top-0 md:left-0"></div>
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    {[
                        "Cadastro inicial e conclusão da abertura",
                        "Liberação de emissão de NFs e Enquadramento",
                        "Início das rotinas contábeis (Você está aqui)"
                    ].map((step, idx) => (
                        <div key={idx} className="flex flex-col md:items-center md:text-center gap-4 group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-4 border-white ${idx === 2 ? 'bg-[#002855] text-white' : 'bg-[#00d3b3] text-[#002855]'}`}>
                                {idx === 2 ? <Briefcase className="h-6 w-6"/> : <CheckCircle2 className="h-6 w-6" />}
                            </div>
                            <p className={`font-medium ${idx === 2 ? 'text-[#002855] font-bold' : 'text-slate-500'}`}>{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- CALENDÁRIO --- */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="h-8 w-8 text-[#00d3b3]" />
                    <h3 className="text-2xl font-bold text-[#002855]">Calendário Mensal</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {calendarDates.map((item, idx) => (
                        <Card key={idx} className="border-slate-200 hover:border-[#00d3b3] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                            <CardContent className="p-6 flex flex-col h-full">
                                <span className="text-3xl font-extrabold text-[#002855] mb-2">{item.day}</span>
                                <div className="h-1 w-8 bg-[#00d3b3] mb-4"></div>
                                <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wide">{item.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-auto">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* --- ROTINAS E PRÓ-LABORE (GRID DUPLO) --- */}
            <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Lado Esquerdo: Abas de Rotinas (Cols 7) */}
                <div className="lg:col-span-7 space-y-6">
                    <Tabs defaultValue="mensal" className="w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h3 className="text-2xl font-bold text-[#002855]">Lista de Obrigações</h3>
                            <TabsList className="bg-slate-100 p-1">
                                <TabsTrigger value="mensal" className="data-[state=active]:bg-white data-[state=active]:text-[#002855] data-[state=active]:shadow-sm">Mensalmente</TabsTrigger>
                                <TabsTrigger value="anual" className="data-[state=active]:bg-white data-[state=active]:text-[#002855] data-[state=active]:shadow-sm">Anualmente</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <TabsContent value="mensal">
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        "Emissão de Notas Fiscais (Prestação de Serviços).",
                                        "Envio de Notas Fiscais recebidas (Fornecedores).",
                                        "Pagamento das guias (DAS, INSS, IRRF).",
                                        "Envio de extratos bancários PJ e investimentos.",
                                        "Classificação financeira na plataforma."
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="bg-blue-100 p-2 rounded-full text-[#002855] shrink-0 mt-0.5">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <span className="text-slate-700 text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="anual">
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        "Renovação do Alvará de Funcionamento.",
                                        "Renovação do Certificado Digital e-CNPJ.",
                                        "Pagamento da TFF/TFE (Taxa municipal).",
                                        "Renovação no Conselho de Classe (CRM, CREA, etc).",
                                        "Revisão do enquadramento tributário (Janeiro)."
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="bg-amber-100 p-2 rounded-full text-amber-700 shrink-0 mt-0.5">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <span className="text-slate-700 text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Card de Fluxo Financeiro */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h4 className="font-bold text-[#002855] mb-4 flex items-center gap-2">
                            <ArrowRight className="h-5 w-5 text-[#00d3b3]" /> Fluxo Ideal do Dinheiro
                        </h4>
                        <div className="space-y-3">
                            {financialSteps.map((step) => (
                                <div key={step.step} className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-6 h-6 rounded-full bg-[#002855] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                        {step.step}
                                    </span>
                                    {step.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Pró-labore e Alertas (Cols 5) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Card Pró-labore */}
                    <div className="bg-[#002855] text-white rounded-2xl p-8 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d3b3] rounded-full blur-[100px] opacity-20"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-[#00d3b3]" />
                                </div>
                                <h3 className="text-xl font-bold">Entenda o Pró-labore</h3>
                            </div>
                            
                            <p className="text-white/80 text-sm leading-relaxed mb-6">
                                É o salário do sócio. Sobre ele incide INSS (11%) para aposentadoria. É diferente da distribuição de lucros (que é isenta).
                            </p>
                            
                            <div className="bg-white text-[#002855] rounded-xl p-5 shadow-lg">
                                <h4 className="font-bold text-sm mb-3 border-b border-slate-100 pb-2">Exemplo (Salário Mínimo)</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Valor Bruto:</span>
                                        <span className="font-semibold">R$ 1.412,00</span>
                                    </div>
                                    <div className="flex justify-between text-red-500">
                                        <span>INSS (11%):</span>
                                        <span>- R$ 155,32</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-100 mt-2">
                                        <span>Líquido:</span>
                                        <span className="text-green-600">R$ 1.256,68</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 text-center">*Valores de referência. O IRRF incide se o valor for maior.</p>
                            </div>
                        </div>
                    </div>

                    {/* Alerta de Boas Práticas */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Atenção: Princípio da Entidade</h4>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    <strong>Nunca misture as contas!</strong> Use a conta PJ exclusivamente para a empresa. Pagar contas pessoais com dinheiro da empresa gera riscos fiscais (Confusão Patrimonial). Transfira o lucro para sua PF antes de usar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}