'use client';

import { formatCurrencyBRL } from "@/lib/utils";
import { ChartLine, TrendingUp, FileText, Briefcase, CheckCircle2, Info, User, Building2 } from 'lucide-react';
import { ComparisonTable } from '../comparison-table';
import type { CalculationResults, CalculationResults2026, TaxDetails } from '@/lib/types';
import { useMemo } from 'react';

interface PrintableReportProps {
    year: number;
    results: CalculationResults | CalculationResults2026 | null;
    formValues: any;
    scenariosToShow: TaxDetails[];
    cheapestScenario: TaxDetails | null;
}

// Glossário de siglas para o usuário leigo
const TAX_GLOSSARY: Record<string, string> = {
    'DAS': 'Guia única do Simples Nacional — reúne todos os impostos federais, estaduais e municipais em um só boleto',
    'INSS': 'Previdência Social — garante aposentadoria, auxílio-doença e outros benefícios ao sócio',
    'IRPJ': 'Imposto de Renda da Empresa — imposto federal sobre o lucro da empresa',
    'CSLL': 'Contribuição Social sobre o Lucro — tributo federal complementar ao IRPJ',
    'CPP': 'Contribuição Previdenciária Patronal — INSS que a empresa paga sobre a folha de salários',
    'PIS': 'Programa de Integração Social — contribuição federal sobre o faturamento',
    'COFINS': 'Contribuição para o Financiamento da Seguridade Social — contribuição federal sobre o faturamento',
    'ISS': 'Imposto Sobre Serviços — imposto municipal cobrado sobre prestação de serviços',
    'CBS': 'Contribuição sobre Bens e Serviços — novo imposto federal da Reforma Tributária (substitui PIS e COFINS)',
    'IBS': 'Imposto sobre Bens e Serviços — novo imposto estadual/municipal da Reforma Tributária (substitui ICMS e ISS)',
    'IRRF': 'Imposto de Renda Retido na Fonte — desconto do IR diretamente no pró-labore do sócio',
};

function getTaxAbbreviation(name: string): string | null {
    const upper = name.toUpperCase();
    for (const key of Object.keys(TAX_GLOSSARY)) {
        if (upper.startsWith(key)) return key;
    }
    return null;
}

export function PrintableReport({ year, results, formValues, scenariosToShow, cheapestScenario }: PrintableReportProps) {
    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const scenarios = useMemo(() => {
        if (!results) return [];
        let list: (TaxDetails | null)[] = [];
        if ('simplesNacionalBase' in results) {
            list = [results.simplesNacionalOtimizado, results.simplesNacionalBase, results.lucroPresumido];
        } else if ('simplesNacionalHibrido' in results || 'simplesNacionalTradicional' in results) {
            list = [
                results.simplesNacionalOtimizado,
                results.simplesNacionalOtimizadoHibrido,
                results.simplesNacionalTradicional,
                results.simplesNacionalHibrido,
                results.lucroPresumido,
            ] as (TaxDetails | null)[];
        }
        const valid = list.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || (s.proLabore ?? 0) > 0));
        valid.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        return valid;
    }, [results]);

    if (!results) return null;

    const totalRevenue = formValues.selectedCnaes.reduce(
        (acc: number, cnae: any) => acc + (cnae.domesticRevenue || 0) + (cnae.exportRevenue || 0),
        0
    );

    const cheapestCost = cheapestScenario?.totalMonthlyCost ?? 0;
    const mostExpensive = scenarios.reduce((max, s) => Math.max(max, s.totalMonthlyCost), 0);
    const potentialSaving = mostExpensive - cheapestCost;
    const proLabore = cheapestScenario?.proLabore ?? scenarios[0]?.proLabore ?? 0;
    const usesFatorR = cheapestScenario?.regime?.toLowerCase().includes('otimizado') ||
                       cheapestScenario?.regime?.toLowerCase().includes('fator r');
    const fatorRPercent = totalRevenue > 0 ? (proLabore / totalRevenue) * 100 : 0;

    const usedAbbreviations = useMemo(() => {
        const found = new Set<string>();
        scenarios.forEach(s => s.breakdown.forEach(item => {
            const abbr = getTaxAbbreviation(item.name);
            if (abbr) found.add(abbr);
        }));
        return Array.from(found);
    }, [scenarios]);

    return (
        <div className="bg-white text-slate-800 py-10 px-6 font-sans max-w-[210mm] mx-auto text-[12px] leading-relaxed print:py-6 print:px-4">

            {/* ── CABEÇALHO ── */}
            <header className="mb-8 pb-6 border-b-2 border-slate-200 flex justify-between items-end break-inside-avoid">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-1 h-8 rounded-full bg-blue-600" />
                        <h1 className="text-[26px] font-extrabold text-slate-900 uppercase tracking-tight leading-none">
                            Planejamento Tributário
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 ml-3 mt-1">Análise Comparativa • Exercício {year}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Gerado em</p>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                        {formatDate(new Date())}
                    </p>
                </div>
            </header>

            {/* ── INTRODUÇÃO PARA LEIGOS ── */}
            <section className="mb-7 break-inside-avoid">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[12px] font-bold text-blue-900 mb-1">O que é este relatório?</p>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                            Este documento compara quanto você pagaria de impostos e encargos em cada regime tributário disponível para a sua empresa.
                            O objetivo é identificar <strong>qual enquadramento gera menor custo mensal</strong>, mantendo tudo dentro da lei.
                            Os valores são simulações baseadas no seu faturamento informado e nas regras vigentes para {year}.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── DADOS DA EMPRESA ── */}
            <section className="mb-8 break-inside-avoid">
                <SectionTitle icon={<Briefcase className="h-4 w-4" />} title="Dados do Faturamento e Atividades" />

                <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-blue-600 text-white rounded-xl p-4 flex flex-col justify-between shadow">
                        <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80 mb-1">Faturamento Mensal</p>
                        <p className="text-2xl font-extrabold leading-none">{formatCurrencyBRL(totalRevenue)}</p>
                        <p className="text-[10px] opacity-70 mt-2">Toda a receita que sua empresa recebe por mês</p>
                    </div>

                    <div className="bg-slate-700 text-white rounded-xl p-4 flex flex-col justify-between shadow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <User className="h-3.5 w-3.5 opacity-80" />
                            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Pró-labore do Sócio</p>
                        </div>
                        <p className="text-2xl font-extrabold leading-none">{formatCurrencyBRL(proLabore)}</p>
                        <p className="text-[10px] opacity-70 mt-2">Salário mensal retirado pelo sócio da empresa</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700 mb-1">Economia Potencial</p>
                        <p className="text-2xl font-extrabold text-emerald-700 leading-none">{formatCurrencyBRL(potentialSaving)}</p>
                        <p className="text-[10px] text-emerald-600 mt-2">Valor que você pode economizar escolhendo o melhor regime</p>
                    </div>
                </div>

                {/* CNAEs com badge + descrição */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                            Atividades Econômicas da Empresa (CNAE)
                        </p>
                    </div>
                    <div className="space-y-2">
                        {formValues.selectedCnaes.map((cnae: any) => (
                            <div key={cnae.code} className="flex items-start gap-2">
                                <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5">
                                    {cnae.code}
                                </span>
                                <div>
                                    <p className="text-[11px] text-slate-800 font-semibold leading-snug">
                                        {cnae.name || 'Atividade não identificada'}
                                    </p>
                                    {cnae.description && (
                                        <p className="text-[10px] text-slate-400 leading-snug">{cnae.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                        💡 O CNAE é o código que classifica a atividade da sua empresa e define quais regras tributárias se aplicam ao seu negócio.
                    </p>
                </div>
            </section>

            {/* ── REGIME RECOMENDADO ── */}
            {cheapestScenario && (
                <section className="mb-8 break-inside-avoid">
                    <div className="rounded-xl overflow-hidden shadow border border-emerald-400">
                        <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-4">
                            <CheckCircle2 className="h-6 w-6 shrink-0" />
                            <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">Regime Recomendado — Menor Custo</p>
                                <p className="text-lg font-extrabold leading-tight">{cheapestScenario.regime}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest opacity-80">Custo Mensal Total</p>
                                <p className="text-xl font-extrabold">{formatCurrencyBRL(cheapestScenario.totalMonthlyCost)}</p>
                            </div>
                        </div>

                        {/* Explicação do Fator R */}
                        {usesFatorR && (
                            <div className="bg-amber-50 border-t border-amber-200 px-5 py-3 flex gap-2">
                                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold text-amber-800 mb-1">💡 O que é o Fator R?</p>
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        O <strong>Fator R</strong> é uma regra do Simples Nacional que permite reduzir a alíquota de impostos.
                                        Quando o pró-labore do sócio representa <strong>28% ou mais do faturamento mensal</strong>, a empresa
                                        passa a ser tributada pelo <strong>Anexo III</strong> (alíquotas mais baixas) em vez do Anexo V.
                                        No seu caso: pró-labore de <strong>{formatCurrencyBRL(proLabore)}</strong> ÷ faturamento de{' '}
                                        <strong>{formatCurrencyBRL(totalRevenue)}</strong> = <strong>{fatorRPercent.toFixed(1)}%</strong>.{' '}
                                        {fatorRPercent >= 28
                                            ? '✅ Você se qualifica para a alíquota reduzida!'
                                            : '⚠️ Abaixo de 28%, mas este ainda é o regime mais econômico para o seu perfil.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── ANÁLISE PROGRESSIVA ── */}
            <section className="mb-8 break-inside-avoid">
                <SectionTitle icon={<TrendingUp className="h-4 w-4" />} title="Evolução do Custo por Faixa de Faturamento" />
                <p className="text-[11px] text-slate-500 mt-1 mb-3 ml-1">
                    A tabela abaixo mostra como o custo mensal de cada regime muda conforme o faturamento da empresa cresce — útil para planejar qual regime será mais vantajoso no futuro.
                </p>
                <div className="print-table-wrapper">
                    <ComparisonTable currentYear={year} formValues={formValues} />
                </div>
            </section>

            {/* ── CENÁRIO PÓS-REFORMA (IVA) ── */}
            {year >= 2026 && (
                <section className="mb-8 break-inside-avoid">
                    <SectionTitle icon={<ChartLine className="h-4 w-4" />} title="Reforma Tributária — Novos Impostos (IVA)" />
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <div className="flex gap-2 mb-4">
                            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-blue-900 mb-1">O que mudou com a Reforma Tributária?</p>
                                <p className="text-[11px] text-blue-800 leading-relaxed">
                                    A partir de 2026 entram em vigor dois novos impostos: o <strong>CBS</strong> (federal — substitui PIS e COFINS)
                                    e o <strong>IBS</strong> (estadual/municipal — substitui ICMS e ISS). Empresas no <strong>Lucro Presumido</strong> pagam
                                    esses impostos separadamente. No <strong>Simples Nacional</strong>, eles já estão incluídos dentro do DAS, sem custo adicional.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {scenariosToShow
                                .filter(s => s.breakdown.some(b => b.name.includes('IBS') || b.name.includes('CBS')))
                                .map(scenario => {
                                    const cbs = scenario.breakdown.find(b => b.name.includes('CBS'))?.value || 0;
                                    const ibs = scenario.breakdown.find(b => b.name.includes('IBS'))?.value || 0;
                                    return (
                                        <div key={scenario.regime} className="bg-white rounded-lg border border-blue-100 p-3 shadow-sm break-inside-avoid">
                                            <h3 className="text-[11px] font-bold text-slate-800 mb-3 border-b pb-1.5 truncate" title={scenario.regime}>
                                                {scenario.regime}
                                            </h3>
                                            <TaxRow label="CBS (federal)" value={cbs} />
                                            <TaxRow label="IBS (estadual/mun.)" value={ibs} />
                                            <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between font-bold text-blue-700 text-[11px]">
                                                <span>Total IVA</span>
                                                <span className="font-mono">{formatCurrencyBRL(cbs + ibs)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── COMPARATIVO DETALHADO ── */}
            <section className="mb-6">
                <SectionTitle icon={<FileText className="h-4 w-4" />} title="Comparativo Detalhado por Regime" />
                <p className="text-[11px] text-slate-500 mt-1 mb-3 ml-1">
                    Todos os impostos e encargos de cada regime, calculados para o seu faturamento mensal de <strong>{formatCurrencyBRL(totalRevenue)}</strong>.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    {scenarios.map(scenario => {
                        const isCheapest = cheapestScenario?.regime === scenario.regime;
                        return (
                            <div
                                key={scenario.regime}
                                className={`rounded-xl overflow-hidden shadow-sm break-inside-avoid border ${isCheapest ? 'border-emerald-400' : 'border-slate-200'}`}
                            >
                                <div className={`px-4 py-2.5 flex items-center justify-between ${isCheapest ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                    <h3 className="text-[12px] font-bold truncate">{scenario.regime}</h3>
                                    {isCheapest && (
                                        <span className="text-[9px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide ml-2 shrink-0">
                                            ✅ Melhor opção
                                        </span>
                                    )}
                                </div>

                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Custo Total Mensal</p>
                                        <p className={`font-extrabold text-base whitespace-nowrap ${isCheapest ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            {formatCurrencyBRL(scenario.totalMonthlyCost)}
                                        </p>
                                    </div>
                                    {(scenario.proLabore ?? 0) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-slate-400">↳ Pró-labore do sócio (incluso)</p>
                                            <p className="text-[10px] font-mono text-slate-500">{formatCurrencyBRL(scenario.proLabore ?? 0)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-white space-y-0">
                                    {scenario.breakdown.map((item, idx) => {
                                        const isTest = item.name.includes('Teste') || item.name.includes('Compensável');
                                        return (
                                            <div
                                                key={item.name}
                                                className={`flex justify-between items-start py-1.5 gap-4 ${idx < scenario.breakdown.length - 1 ? 'border-b border-slate-100' : ''} ${isTest ? 'opacity-50' : ''}`}
                                            >
                                                <p className="text-[11px] text-slate-600 leading-tight flex-1">
                                                    {item.name}
                                                    {isTest && <span className="text-[9px] text-amber-600 ml-1">(compensável — não aumenta custo real)</span>}
                                                </p>
                                                <p className="text-[11px] font-mono font-semibold text-slate-900 whitespace-nowrap shrink-0">
                                                    {formatCurrencyBRL(item.value)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── GLOSSÁRIO ── */}
            {usedAbbreviations.length > 0 && (
                <section className="mb-8 break-inside-avoid">
                    <SectionTitle icon={<Info className="h-4 w-4" />} title="Glossário — O que significa cada imposto?" />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {usedAbbreviations.map(abbr => (
                            <div key={abbr} className="flex gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                                <span className="inline-block bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 h-fit">
                                    {abbr}
                                </span>
                                <p className="text-[10px] text-slate-600 leading-snug">{TAX_GLOSSARY[abbr]}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── RODAPÉ ── */}
            <footer className="mt-10 pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400 break-inside-avoid">
                <p>
                    <strong>Aviso Legal:</strong> Este relatório é uma simulação preliminar baseada nas informações fornecidas e na
                    legislação tributária vigente/projetada para o exercício de {year}. Valores sujeitos a alteração.
                    Este documento não substitui a análise jurídica e contábil detalhada para a tomada de decisão final.
                </p>
            </footer>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3 py-1 bg-slate-50 rounded-r-md">
            <span className="text-blue-600">{icon}</span>
            <h2 className="text-[13px] font-bold text-slate-800">{title}</h2>
        </div>
    );
}

function TaxRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between text-[11px] py-1">
            <span className="text-slate-500">{label}</span>
            <span className="font-mono font-medium text-slate-800">{formatCurrencyBRL(value)}</span>
        </div>
    );
}