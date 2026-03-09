'use client';

import { formatCurrencyBRL } from "@/lib/utils";
import { ChartLine, TrendingUp, FileText, Briefcase } from 'lucide-react';
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

export function PrintableReport({ year, results, formValues, scenariosToShow, cheapestScenario }: PrintableReportProps) {
    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const scenarios = useMemo(() => {
        if (!results) return [];
        let scenarios: (TaxDetails | null)[] = [];
        if ('simplesNacionalBase' in results) {
            scenarios = [results.simplesNacionalOtimizado, results.simplesNacionalBase, results.lucroPresumido];
        } else if ('simplesNacionalHibrido' in results || 'simplesNacionalTradicional' in results) {
            scenarios = [results.simplesNacionalOtimizado, results.simplesNacionalOtimizadoHibrido, results.simplesNacionalTradicional, results.simplesNacionalHibrido, results.lucroPresumido] as (TaxDetails | null)[];
        }
        const validScenarios = scenarios.filter((s): s is TaxDetails => s !== null && (s.totalRevenue > 0 || (s.proLabore ?? 0) > 0));
        validScenarios.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        return validScenarios;
    }, [results]);

    if (!results) {
        return null;
    }

    return (
        <div className="bg-white text-slate-800 py-8 px-4 font-sans max-w-[210mm] mx-auto text-[12px] leading-relaxed">
            {/* Cabeçalho */}
            <header className="border-b-2 border-slate-300 pb-6 mb-6 flex justify-between items-end break-inside-avoid">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">Planejamento Tributário</h1>
                    <p className="text-lg text-slate-500 mt-1">Análise Comparativa • Exercício {year}</p>
                </div>
                <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md font-medium border border-slate-200">
                    Gerado em: {formatDate(new Date())}
                </div>
            </header>

            {/* Resumo da Empresa */}
            <section className="mb-8 break-inside-avoid">
                <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center border-l-4 border-primary pl-3 bg-slate-50 py-1.5"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Dados do Faturamento e Atividades</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Faturamento Mensal Total</p>
                        <p className="text-2xl font-extrabold text-slate-900">
                            {formatCurrencyBRL(formValues.selectedCnaes.reduce((acc: number, cnae: any) => acc + (cnae.domesticRevenue || 0) + (cnae.exportRevenue || 0), 0))}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Atividades Selecionadas (CNAE)</p>
                        <div className="space-y-1">
                            {formValues.selectedCnaes.map((cnae: any) => (
                                <p key={cnae.code} className="text-xs text-slate-700 font-medium truncate">
                                    • {cnae.code} {cnae.name && `- ${cnae.name}`}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Tabela Comparativa */}
            <section className="mb-8 break-inside-avoid">
                 <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center border-l-4 border-primary pl-3 bg-slate-50 py-1.5"><TrendingUp className="mr-2 h-5 w-5 text-primary" /> Análise Progressiva (Evolução)</h2>
                {/* O Wrapper abaixo ativa as regras do CSS para espremer a tabela no PDF */}
                <div className="print-table-wrapper">
                    <ComparisonTable currentYear={year} formValues={formValues} />
                </div>
            </section>

            {/* Detalhamento IVA (Apenas anos 2026+) */}
            {year >= 2026 && (
                <section className="mb-8 break-inside-avoid">
                    <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center border-l-4 border-primary pl-3 bg-slate-50 py-1.5"><ChartLine className="mr-2 h-5 w-5 text-primary"/> Cenário Pós-Reforma (IVA)</h2>
                    <div className="bg-blue-50/50 border border-blue-200 p-5 rounded-lg">
                        <p className="text-xs text-blue-900 mb-4 leading-relaxed text-justify">
                            A Reforma Tributária institui o Imposto sobre Valor Agregado (IVA) dual, composto por CBS (federal) e IBS (estadual/municipal). O cálculo abaixo projeta o impacto desses novos tributos nos regimes que os pagam "por fora" do DAS.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             {scenariosToShow.filter(s => s.breakdown.some(b => b.name.includes("IBS") || b.name.includes("CBS"))).map(scenario => {
                                const cbs = scenario.breakdown.find(b => b.name.includes("CBS"))?.value || 0;
                                const ibs = scenario.breakdown.find(b => b.name.includes("IBS"))?.value || 0;
                                return (
                                    <div key={scenario.regime} className="bg-white p-3 rounded border border-blue-100 shadow-sm break-inside-avoid">
                                        <h3 className="text-sm font-bold text-slate-800 mb-2 truncate" title={scenario.regime}>{scenario.regime}</h3>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">CBS:</span>
                                            <span className="font-mono font-medium whitespace-nowrap">{formatCurrencyBRL(cbs)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-slate-500">IBS:</span>
                                            <span className="font-mono font-medium whitespace-nowrap">{formatCurrencyBRL(ibs)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-blue-50 pt-1 font-bold text-blue-800">
                                            <span>Total IVA:</span>
                                            <span className="font-mono whitespace-nowrap">{formatCurrencyBRL(cbs + ibs)}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Resultado Detalhado dos Impostos */}
            <section className="mb-4">
                 <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center border-l-4 border-primary pl-3 bg-slate-50 py-1.5"><FileText className="mr-2 h-5 w-5 text-primary"/> Memória de Cálculo Detalhada</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scenarios.map(scenario => (
                        <div key={scenario.regime} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm break-inside-avoid">
                            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                                <h3 className="text-base font-bold text-center text-slate-800">{scenario.regime}</h3>
                            </div>
                            
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <p className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Custo Total Mensal</p>
                                <p className="font-extrabold text-lg text-primary whitespace-nowrap">{formatCurrencyBRL(scenario.totalMonthlyCost)}</p>
                            </div>

                            <div className="p-4 space-y-1 bg-white">
                                {scenario.breakdown.map(item => (
                                    // AQUI ESTÁ A CORREÇÃO: flex-1 no texto e shrink-0 no valor para alinhamento perfeito
                                    <div key={item.name} className="flex justify-between items-start py-1.5 border-b border-slate-100 last:border-0 gap-4">
                                        <p className="text-xs text-slate-600 font-medium leading-tight flex-1">{item.name}</p>
                                        <p className="text-xs font-mono font-semibold text-slate-900 whitespace-nowrap shrink-0">{formatCurrencyBRL(item.value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="text-center mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-400 break-inside-avoid">
                <p>Aviso Legal: Este relatório é uma simulação preliminar baseada nas informações fornecidas e na legislação tributária vigente/projetada para o exercício de {year}. Valores sujeitos a alteração. Este documento não substitui a análise jurídica e contábil detalhada para a tomada de decisão final.</p>
            </footer>
        </div>
    );
}