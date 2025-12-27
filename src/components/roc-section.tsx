"use client";

import { AlertTriangle, ShieldCheck, FileCheck, Banknote, CalendarClock, Building2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const steps = [
    {
        icon: Building2,
        title: "1. Conclusão da abertura",
        desc: "Finalização do processo de abertura da sua empresa."
    },
    {
        icon: FileCheck,
        title: "2. Solicitação do registro",
        desc: "Protocolo do registro da empresa no Conselho Profissional."
    },
    {
        icon: Banknote,
        title: "3. Pagamento de taxas",
        desc: "Processo e pagamento das taxas obrigatórias do Conselho."
    },
    {
        icon: ShieldCheck,
        title: "4. Liberação e Emissão",
        desc: "Liberação do registro e início da emissão de notas fiscais."
    }
];

export default function RocSection() {
    return (
        <div className="w-full font-sans max-w-7xl mx-auto py-16 px-4">
            
            <div className="text-center mb-12 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-[#002855] mb-4">
                    Registro em Órgão de Classe (ROC)
                </h2>
                <p className="text-slate-600 text-lg">
                    Entenda a importância de registrar sua empresa no Conselho Profissional (CRM, OAB, CREA, etc.) e como a Contabilizei te ajuda.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                
                {/* --- COLUNA ESQUERDA: Card Informativo Azul --- */}
                <div className="lg:col-span-1 bg-[#002855] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d3b3] rounded-full blur-[60px] opacity-20"></div>
                    
                    <ShieldCheck className="h-12 w-12 mb-6 text-[#00d3b3]" />
                    
                    <h3 className="text-xl font-bold mb-4">Quando solicitar?</h3>
                    <p className="text-white/90 leading-relaxed mb-8">
                        Se necessário, o Registro da empresa no Conselho Profissional da atividade será iniciado após a conclusão do Alvará na Prefeitura.
                    </p>

                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                        <h4 className="font-bold text-[#00d3b3] text-sm uppercase tracking-wide mb-2">Importante</h4>
                        <p className="text-sm text-white/80">
                            Nem todas as atividades exigem registro. Em caso de dúvidas, acione sua Consultoria de Abertura.
                        </p>
                    </div>
                </div>

                {/* --- COLUNA DIREITA: Conteúdo Detalhado --- */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Linha do Tempo (Steps) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-[#002855] mb-6">Etapas do Processo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-2 rounded-lg text-[#002855]">
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-[#002855]">{step.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Perguntas Frequentes */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-[#002855]">
                                Posso emitir notas fiscais sem o registro?
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                A legislação permite emitir notas assim que a abertura for finalizada. Porém, se sua atividade exige o registro, <strong>orientamos aguardar o protocolo</strong> ou a expedição do documento, pois o Conselho pode multar emissões ocorridas sem o registro.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-[#002855]">
                                A Contabilizei cobra pela emissão?
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                <strong>Não.</strong> A Contabilizei não cobra pelo serviço de solicitação. Porém, a taxa do Conselho Profissional é obrigatória e deve ser paga diretamente por você.
                            </p>
                        </div>
                    </div>

                    {/* Alerta de Atenção */}
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg flex items-start gap-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-amber-900 mb-1">ATENÇÃO</h4>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                A Contabilizei não faz a renovação anual do ROC (taxas e registros), que fica sob sua responsabilidade, de acordo com a validade do seu registro.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}