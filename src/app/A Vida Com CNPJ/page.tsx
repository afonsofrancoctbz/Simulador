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
    ArrowRight,
    ListChecks,
    LayoutDashboard,
    FileSpreadsheet,
    Users,
    Globe,
    Calculator,
    CreditCard,
    Mail,
    MessageCircle,
    Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

// --- DADOS ---

const topics = [
    { icon: LayoutDashboard, title: "Conhecendo a plataforma" },
    { icon: ListChecks, title: "Principais rotinas" },
    { icon: FileText, title: "Emissão de Notas Fiscais" },
    { icon: Users, title: "Cadastro de Pró-labore" },
    { icon: Calculator, title: "Cálculo de Impostos" },
    { icon: Briefcase, title: "Contratação de Serviços" },
    { icon: Landmark, title: "Envio de Extratos" },
    { icon: Globe, title: "Exportação de Serviços" },
];

const calendarDates = [
    { day: "01-05", title: "Notas Fiscais", desc: "Limite para comunicar cancelamento e substituição.", icon: FileText },
    { day: "10", title: "Funcionários", desc: "Envio de exames e laudos (se houver).", icon: Briefcase },
    { day: "15", title: "Extratos & Honorários", desc: "Envio dos extratos PJ e vencimento da mensalidade.", icon: Landmark },
    { day: "20", title: "Impostos", desc: "Vencimento do DAS, INSS, IRRF e FGTS.", icon: DollarSign },
    { day: "30", title: "Fechamento", desc: "Limite para emissão de NFs e envio de notas de tomados.", icon: Clock }
];

const financialSteps = [
    { step: 1, title: "Pagamento de Impostos", desc: "Prioridade número 1." },
    { step: 2, title: "Mensalidade Contabilizei", desc: "Mantenha a contabilidade ativa." },
    { step: 3, title: "Pró-labore (Líquido)", desc: "Transfira para sua PF." },
    { step: 4, title: "Despesas Operacionais", desc: "Aluguel, internet, softwares." },
    { step: 5, title: "Distribuição de Lucros", desc: "Isento de impostos (Pode antecipar)." },
];

export default function LifeWithCNPJSection() {
    return (
        <div className="w-full font-sans max-w-7xl mx-auto py-12 px-4 space-y-20 bg-slate-50/50">
            
            {/* --- 1. HERO & JORNADA --- */}
            <div className="space-y-8">
                <div className="text-center max-w-4xl mx-auto space-y-4">
                    <Badge className="bg-blue-50 text-[#002855] hover:bg-blue-100 border-none px-4 py-1 text-sm">
                        Jornada Experts
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#002855]">
                        A vida com CNPJ: <span className="text-[#00d3b3]">Sua nova rotina</span>
                    </h2>
                    <p className="text-slate-600 text-lg">
                        [cite_start]Guia completo para manter sua contabilidade em dia, evitar multas e aproveitar os benefícios da sua empresa[cite: 1, 3].
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#00d3b3] md:w-full md:h-2 md:top-0 md:left-0"></div>
                    <div className="grid md:grid-cols-3 gap-8 relative z-10 pt-4 md:pt-6">
                        {[
                            "Cadastro inicial e conclusão da abertura",
                            "Liberação de emissão de NFs e Enquadramento",
                            "Início das rotinas contábeis (Você está aqui)"
                        ].map((step, idx) => (
                            <div key={idx} className="flex flex-col md:items-center md:text-center gap-4 group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-4 border-white ${idx === 2 ? 'bg-[#002855] text-white' : 'bg-[#00d3b3] text-[#002855]'}`}>
                                    {idx === 2 ? <Briefcase className="h-6 w-6"/> : <CheckCircle2 className="h-6 w-6" />}
                                </div>
                                <p className={`font-medium ${idx === 2 ? [cite_start]'text-[#002855] font-bold' : 'text-slate-500'}`}>{step} [cite: 15-18]</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- 2. O QUE VAMOS VER (TÓPICOS) --- */}
            <div>
                [cite_start]<h3 className="text-2xl font-bold text-[#002855] mb-8">O que vamos ver [cite: 19]</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {topics.map((item, idx) => (
                        <Card key={idx} className="border-slate-200 hover:border-[#00d3b3] hover:shadow-md transition-all cursor-default group bg-white">
                            <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center gap-3">
                                <div className="bg-blue-50 p-3 rounded-full text-[#002855] group-hover:bg-[#002855] group-hover:text-[#00d3b3] transition-colors">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* --- 3. CALENDÁRIO --- */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="h-8 w-8 text-[#00d3b3]" />
                    [cite_start]<h3 className="text-2xl font-bold text-[#002855]">Calendário das Obrigações [cite: 53]</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {calendarDates.map((item, idx) => (
                        <Card key={idx} className="border-slate-200 hover:border-[#00d3b3] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                            <CardContent className="p-6 flex flex-col h-full bg-white rounded-xl">
                                <span className="text-3xl font-extrabold text-[#002855] mb-2">{item.day}</span>
                                <div className="h-1 w-8 bg-[#00d3b3] mb-4"></div>
                                <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wide">{item.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-auto">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                [cite_start]<p className="mt-4 text-xs text-slate-500">* Datas podem ser antecipadas ou postergadas em caso de fins de semana/feriados[cite: 54].</p>
            </div>

            {/* --- 4. ROTINAS (TABS) --- */}
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                    <Tabs defaultValue="mensal" className="w-full">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <span className="font-bold text-[#002855] ml-2 flex items-center gap-2"><ListChecks className="h-5 w-5"/> Visualize suas rotinas:</span>
                            <TabsList className="bg-slate-100">
                                [cite_start]<TabsTrigger value="mensal" className="data-[state=active]:bg-[#002855] data-[state=active]:text-[#00d3b3]">Mensalmente [cite: 40]</TabsTrigger>
                                [cite_start]<TabsTrigger value="anual" className="data-[state=active]:bg-[#002855] data-[state=active]:text-[#00d3b3]">Anualmente [cite: 47]</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <TabsContent value="mensal" className="grid md:grid-cols-2 gap-6">
                            <Card className="border-l-4 border-l-[#00d3b3] shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-[#002855]">Rotinas Operacionais</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        "Emissão de Notas Fiscais.",
                                        "Envio de Notas Fiscais recebidas (Fornecedores).",
                                        "Pagamento das guias de impostos.",
                                        "Envio dos extratos bancários PJ e investimentos.",
                                        "Envio de exames e laudos (se houver funcionários)."
                                    ].map((t, i) => <li key={i} className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-[#00d3b3] shrink-0"/>{t}</li>)}
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-[#002855] shadow-sm">
                                <CardHeader><CardTitle className="text-lg text-[#002855]">Documentos Essenciais</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        "Extratos de bancos nacionais e internacionais.",
                                        "Extratos de investimentos e aplicações.",
                                        "Contratos de câmbio (para exportadores).",
                                        "Documentos de compra/venda de bens."
                                    [cite_start]].map((t, i) => <li key={i} className="flex gap-2 text-sm text-slate-600"><FileText className="w-4 h-4 text-[#002855] shrink-0"/>{t} [cite: 285-291]</li>)}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="anual">
                            <Card className="border-l-4 border-l-amber-500 shadow-sm">
                                <CardHeader><CardTitle className="text-[#002855]">Obrigações Anuais</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        "Renovação do Alvará de Funcionamento.",
                                        "Renovação do Certificado Digital e-CNPJ.",
                                        "Renovação do Registro em Conselho Profissional.",
                                        "Enquadramento no Simples Nacional (Janeiro).",
                                        "Pagamento da TFF/TFE municipal."
                                    [cite_start]].map((t, i) => <li key={i} className="flex gap-2 text-sm text-slate-600"><Clock className="w-4 h-4 text-amber-500 shrink-0"/>{t} [cite: 48-52]</li>)}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* --- 5. EMISSÃO DE NOTAS --- */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                [cite_start]<h3 className="text-2xl font-bold text-[#002855] mb-6">Como emitir ou solicitar notas fiscais? [cite: 84]</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageCircle className="h-6 w-6 text-green-600"/>
                            <h4 className="font-bold text-green-800">Via WhatsApp</h4>
                        </div>
                        [cite_start]<p className="text-sm text-green-700">Mande um "Oi", escolha <strong>"1 - Quero emitir nota fiscal"</strong> e envie os dados. [cite: 86]</p>
                        [cite_start]<p className="mt-2 font-bold text-green-800">(41) 4101-0021 [cite: 4]</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="h-6 w-6 text-blue-600"/>
                            <h4 className="font-bold text-blue-800">Via E-mail</h4>
                        </div>
                        [cite_start]<p className="text-sm text-blue-700">Envie os dados para: <br/><strong className="break-all">atendimento.experts@contabilizei.com.br</strong> [cite: 89]</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Monitor className="h-6 w-6 text-slate-600"/>
                            <h4 className="font-bold text-slate-800">Via Plataforma</h4>
                        </div>
                        [cite_start]<p className="text-sm text-slate-700">Acesse a plataforma Contabilizei e siga o passo a passo para emissão. [cite: 91]</p>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-600 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>
                    <p>
                        [cite_start]<strong>Tenha em mãos:</strong> CNPJ/CPF do cliente, Razão Social/Nome, Valor, CNAE e descrição do serviço [cite: 92-97]. <br/>
                        [cite_start]*No plano Experts Essencial, você tem até 35 notas gratuitas pela assessoria. [cite: 99]
                    </p>
                </div>
            </div>

            {/* --- 6. PRÓ-LABORE --- */}
            <div className="bg-[#002855] text-white rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-[#00d3b3]" />
                            [cite_start]Entenda o Pró-labore [cite: 138]
                        </h3>
                        <p className="text-white/90 text-lg leading-relaxed mb-6">
                            É o salário mensal do sócio. Sobre ele incidem tributos como INSS (11%) e IRRF. [cite_start]É obrigatório para o cálculo correto da previdência e aposentadoria. [cite: 137, 141]
                        </p>
                        <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                            <h4 className="font-bold text-[#00d3b3] mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4"/> Importante: Duplo Vínculo</h4>
                            [cite_start]<p className="text-sm text-white/80">Se você já contribui para o INSS (CLT ou outra empresa), envie seu holerite para evitar pagamentos duplicados. [cite: 162]</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Exemplo 1 - Mínimo */}
                        <div className="bg-white text-[#002855] rounded-xl p-5 shadow-lg">
                            [cite_start]<h4 className="font-bold text-sm mb-3 border-b border-slate-100 pb-2">Exemplo 1: Salário Mínimo (2025) [cite: 143]</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Pró-labore Bruto:</span>
                                    <span className="font-bold">R$ 1.518,00</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>INSS (11%):</span>
                                    <span>- R$ 166,98</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-100 bg-green-50 p-2 rounded">
                                    <span>Líquido a receber:</span>
                                    <span className="text-green-700">R$ 1.351,02</span>
                                </div>
                            </div>
                            [cite_start]<div className="mt-2 text-xs text-slate-500 text-right">Guia DARF Unificado: R$ 166,98 [cite: 155]</div>
                        </div>

                        {/* Exemplo 2 - Teto */}
                        <div className="bg-white/5 border border-white/20 text-white rounded-xl p-5">
                            [cite_start]<h4 className="font-bold text-sm mb-3 border-b border-white/10 pb-2">Exemplo 2: Pelo Teto do INSS [cite: 144]</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="opacity-80">Pró-labore Bruto:</span>
                                    <span className="font-bold">R$ 8.157,41</span>
                                </div>
                                <div className="flex justify-between text-[#00d3b3]">
                                    <span>INSS (11% Teto):</span>
                                    <span>- R$ 897,32</span>
                                </div>
                                <div className="flex justify-between text-[#00d3b3]">
                                    <span>IRRF:</span>
                                    <span>- R$ 1.087,80</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10 mt-2">
                                    <span>Líquido a receber:</span>
                                    <span>R$ 6.172,29</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 7. CÁLCULO DE IMPOSTOS --- */}
            <div>
                <h3 className="text-2xl font-bold text-[#002855] mb-6">Como os impostos são calculados? (Simples Nacional) [cite_start][cite: 189]</h3>
                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        { step: 1, title: "Identificação", text: "Enquadramento no Anexo 3, 4 ou 5." },
                        { step: 2, title: "Receita (RBT12)", text: "Soma do faturamento dos últimos 12 meses." },
                        { step: 3, title: "Alíquota Efetiva", text: "Cálculo baseado na tabela do anexo." },
                        { step: 4, title: "Cálculo do DAS", text: "Faturamento mês x Alíquota efetiva." }
                    ].map((s) => (
                        <Card key={s.step} className="border-t-4 border-t-[#00d3b3]">
                            <CardContent className="p-4">
                                <span className="text-xs font-bold text-[#00d3b3] uppercase tracking-wide">Passo {s.step}</span>
                                <h4 className="font-bold text-[#002855] mt-1">{s.title}</h4>
                                <p className="text-xs text-slate-500 mt-2">{s.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                {/* Fator R e Anexo 4 */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-[#002855] flex items-center gap-2 mb-2">
                            [cite_start]<Calculator className="h-5 w-5"/> Fator R (Folha ÷ Faturamento) [cite: 202]
                        </h4>
                        <ul className="text-sm space-y-1 mt-3">
                            <li className="flex items-center gap-2 mb-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> <strong>Resultado ≥ 28%:</strong> A empresa vai para o Anexo 3 (Alíquota menor).</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span> <strong>Resultado &lt; 28%:</strong> Permanece no Anexo 5 (Alíquota maior).</li>
                        </ul>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                            [cite_start]<AlertCircle className="h-5 w-5"/> Especificidade do Anexo 4 [cite: 199]
                        </h4>
                        <p className="text-sm text-amber-900 leading-relaxed">
                            Empresas do Anexo 4 recolhem o <strong>INSS Patronal (20%) separadamente</strong>, fora da guia DAS. Essa contribuição não está incluída no boleto único do Simples.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- 8. SERVIÇOS & EXPORTAÇÃO --- */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    [cite_start]<CardHeader><CardTitle className="text-[#002855] flex items-center gap-2"><Briefcase className="h-5 w-5"/> Contratação de Serviços [cite: 226]</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="pj">
                                <AccordionTrigger className="font-bold text-slate-700">Prestador PJ (CNPJ)</AccordionTrigger>
                                <AccordionContent className="text-slate-600 text-sm bg-slate-50 p-3 rounded">
                                    Valor pago = Total da nota - retenções (se houver). Atenção ao regime tributário do fornecedor. [cite_start]Pode haver retenção de IRRF e ISS que sua empresa deve recolher. [cite: 228-232]
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="rpa">
                                <AccordionTrigger className="font-bold text-slate-700">Autônomo (RPA - Pessoa Física)</AccordionTrigger>
                                <AccordionContent className="text-slate-600 text-sm bg-slate-50 p-3 rounded">
                                    Antes de pagar, deve-se descontar INSS (11%), IRRF e ISS. A empresa pode ter que pagar +20% de INSS Patronal (se Anexo 4). [cite_start]<strong>O RPA é obrigatório.</strong> [cite: 234-237]
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    [cite_start]<CardHeader><CardTitle className="text-[#002855] flex items-center gap-2"><Globe className="h-5 w-5 text-[#00d3b3]"/> Exportação de Serviços [cite: 101]</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="bg-green-50 text-green-800 p-2 rounded text-center font-semibold">
                            [cite_start]Benefício: Isenção de PIS, COFINS e ISS [cite: 102]
                        </div>
                        <p className="font-semibold text-[#002855] mt-2">Requisitos Obrigatórios:</p>
                        <ul className="list-disc pl-5 text-slate-600 space-y-1">
                            [cite_start]<li>Cliente domiciliado no exterior[cite: 104].</li>
                            [cite_start]<li>Resultado do serviço ocorre fora do Brasil[cite: 105].</li>
                            [cite_start]<li>Pagamento em moeda estrangeira conversível[cite: 106].</li>
                        </ul>
                        <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                            <strong>Atenção Contábil:</strong> Necessário apurar variação cambial (Diferença entre valor da Invoice e Recebimento). [cite_start]Positiva = Receita / Negativa = Despesa [cite: 293-301].
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 9. FLUXO FINANCEIRO --- */}
            <div className="space-y-6">
                [cite_start]<h3 className="text-2xl font-bold text-[#002855]">Fluxo Financeiro Ideal [cite: 164]</h3>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {financialSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white border rounded-lg p-3 shadow-sm min-w-[200px] hover:border-[#00d3b3] transition-colors">
                            <span className="bg-[#002855] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{step.step}</span>
                            <div>
                                <p className="text-xs font-bold text-[#002855]">{step.title}</p>
                                <p className="text-[10px] text-slate-500">{step.desc}</p>
                            </div>
                            {i < 4 && <ArrowRight className="h-4 w-4 text-slate-300 ml-auto hidden md:block"/>}
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm mt-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            [cite_start]<h4 className="font-bold text-amber-900 mb-1">Princípio da Entidade (Não misture as contas!) [cite: 313]</h4>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                Use a conta PJ exclusivamente para movimentações da empresa. Receber na conta PF ou pagar contas pessoais pela PJ gera "Confusão Patrimonial" e riscos fiscais. [cite_start]Transfira o lucro para sua PF antes de gastar. [cite: 314]
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 10. CONTABILIZEI BANK --- */}
            <div className="bg-[#002855] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-[#00d3b3]"/> Contabilizei.bank
                    </h3>
                    <p className="text-white/80">Evite multas e atrasos. A conta PJ integrada com a contabilidade.</p>
                    <ul className="space-y-2 text-sm">
                        [cite_start]<li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#00d3b3]"/> Débito automático de impostos[cite: 256].</li>
                        [cite_start]<li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#00d3b3]"/> Extratos integrados (sem envio manual)[cite: 254].</li>
                        [cite_start]<li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#00d3b3]"/> Recebimento do exterior (FX)[cite: 258].</li>
                    </ul>
                </div>
                <div className="bg-white/10 p-6 rounded-xl border border-white/20 md:w-1/3">
                    <p className="text-sm font-bold text-[#00d3b3] mb-2">Dica de Ouro</p>
                    [cite_start]<p className="text-xs text-white">Ative o débito automático da sua mensalidade e impostos diretamente no App para garantir que sua empresa esteja sempre em dia[cite: 271].</p>
                </div>
            </div>

        </div>
    );
}