"use client";

import { AlertTriangle, Banknote, Building2, Coins, Wallet } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const capitalInfo = [
    {
        icon: Coins,
        title: "Capital Inicial",
        text: "Capital social é o investimento bruto inicial que uma empresa precisa para começar a funcionar e se manter até gerar lucro.",
        highlight: true // Para destacar o primeiro card se desejar
    },
    {
        icon: Banknote,
        title: "Depósito do Capital Social",
        text: "É a 1ª movimentação financeira da sua empresa e precisa ser depositado na sua conta bancária da empresa."
    },
    {
        icon: AlertTriangle,
        title: "Conta bancária CNPJ X CPF",
        text: "Use apenas a conta PJ para receber e pagar as operações da empresa. Receber na conta PF configura confusão patrimonial e gera risco."
    },
    {
        icon: Building2,
        title: "Conta Bancária PJ",
        text: "A conta bancária do seu CNPJ é essencial para todas as operações. Além disso precisa ser reportada a Contabilizei para registro correto da sua contabilidade.",
        borderClass: "border-cyan-400" // Exemplo de destaque visual
    }
];

export default function CapitalSocialSection() {
    return (
        <div className="w-full font-sans max-w-7xl mx-auto py-16 px-4">
            
            {/* Título Principal */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-[#002855] leading-tight">
                    Conta bancária e depósito do Capital Social: O que você precisa saber?
                </h2>
                <div className="w-24 h-1 bg-[#00d3b3] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Grid de Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {capitalInfo.map((item, idx) => (
                    <Card key={idx} className={`h-full hover:shadow-lg transition-shadow duration-300 border-t-4 ${item.borderClass || 'border-t-[#00d3b3]'} border-x-0 border-b-0 shadow-sm`}>
                        <CardContent className="p-6 flex flex-col items-center text-center h-full">
                            <div className="mb-4 p-3 bg-cyan-50 rounded-full text-[#002855]">
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-[#002855] mb-3">{item.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {item.text}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Box de Atenção */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#002855]"></div>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="bg-[#002855]/10 p-2 rounded-lg shrink-0">
                        <AlertTriangle className="w-6 h-6 text-[#002855]" />
                    </div>
                    <div>
                        <h4 className="text-[#002855] font-bold mb-2 uppercase tracking-wide text-sm">Atenção:</h4>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                            A definição do capital social <span className="font-bold text-[#00d3b3]">constará no seu contrato social</span>. Por isso, qualquer alteração solicitada após a assinatura do contrato será mediante a contratação do serviço avulso de <strong>ALTERAÇÃO CONTRATUAL</strong> (verificar valores), que leva cerca de 90 dias para ser concluído.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}