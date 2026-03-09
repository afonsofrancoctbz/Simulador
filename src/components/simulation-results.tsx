"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { CalendarClock, ChevronDown, ChevronUp, Calendar, AlertTriangle, RefreshCcw } from "lucide-react";
import { runNewCompanySimulation, type SimulationMonth } from "@/lib/simulation";
import type { CalculatorFormValues } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SimulationResultsProps {
  formValues: CalculatorFormValues;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i);

// 1. Tooltip da Memória de Cálculo (Completo com Cenário e IVA)
function BreakdownTooltip({ data, scenario }: { data: SimulationMonth['simples']['breakdown'] | undefined, scenario: string }) {
    if (!data) return <span className="text-xs text-muted-foreground">Dados indisponíveis</span>;

    // Simplifica o nome do cenário para caber no visual
    const shortScenario = scenario.replace("Simples Nacional ", "");

    return (
        <div className="space-y-2 text-xs min-w-[220px]">
            <div className="border-b pb-1 mb-2">
                <p className="font-bold text-primary">Memória de Cálculo (Simples)</p>
                <p className="text-[10px] text-muted-foreground truncate" title={scenario}>
                   Estratégia: <span className="font-medium text-slate-700">{shortScenario}</span>
                </p>
            </div>
            
            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
                <span className="text-muted-foreground">DAS ({formatPercent(data.dasRate)})</span>
                <span className="font-mono text-right">{formatCurrencyBRL(data.dasValue)}</span>
                
                {data.ivaValue > 0 && (
                    <>
                         <span className="text-muted-foreground">IVA Externo ({formatPercent(data.ivaRate)})</span>
                         <span className="font-mono text-right text-purple-700">{formatCurrencyBRL(data.ivaValue)}</span>
                    </>
                )}

                {data.inssValue > 0 && (
                    <>
                        <span className="text-muted-foreground">
                            INSS Pró-labore ({formatPercent(data.inssRate > 0 ? data.inssRate : 0.11)})
                        </span>
                        <span className="font-mono text-right">{formatCurrencyBRL(data.inssValue)}</span>
                    </>
                )}
                
                {data.irrfValue > 0 && (
                    <>
                        <span className="text-muted-foreground">IRRF Pró-labore</span>
                        <span className="font-mono text-right">{formatCurrencyBRL(data.irrfValue)}</span>
                    </>
                )}
                
                <div className="col-span-2 border-t my-1"></div>
                
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold font-mono text-right">{formatCurrencyBRL(data.total)}</span>
            </div>
        </div>
    );
}

function JanuaryComparisonTooltip({ simples, presumido }: { simples: number, presumido: number }) {
    const diff = Math.abs(simples - presumido);
    const winner = simples < presumido ? 'Simples' : 'Presumido';
    
    return (
        <div className="space-y-2 text-xs min-w-[220px]">
            <div className="flex items-center gap-2 border-b pb-2 mb-2">
                <RefreshCcw className="h-4 w-4 text-amber-600" />
                <div>
                    <p className="font-bold text-amber-800">Janela de Troca</p>
                    <p className="text-[10px] text-amber-700/80">Comparativo para decisão (Mês Jan)</p>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Custo Simples:</span>
                    <span className={`font-mono font-medium ${winner === 'Simples' ? 'text-green-700' : 'text-slate-600'}`}>
                        {formatCurrencyBRL(simples)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Custo Presumido:</span>
                    <span className={`font-mono font-medium ${winner === 'Presumido' ? 'text-green-700' : 'text-slate-600'}`}>
                        {formatCurrencyBRL(presumido)}
                    </span>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-100 bg-amber-50/50 -mx-2 px-2 py-1 rounded">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">Economia no {winner}:</span>
                        <Badge variant="outline" className="bg-white border-green-200 text-green-700 font-mono shadow-sm">
                            {formatCurrencyBRL(diff)}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getZeroedMonth(monthIndex: number, label: string): SimulationMonth {
    return {
        monthIndex,
        monthLabel: label,
        isJanuary: false,
        revenue: 0,
        accumulatedRevenue: 0,
        effectiveRBT12: 0,
        simples: { 
            tax: 0, 
            rate: 0, 
            annex: '-', 
            scenarioLabel: '-', 
            breakdown: { dasValue: 0, dasRate: 0, inssValue: 0, inssRate: 0, irrfValue: 0, ivaValue: 0, ivaRate: 0, total: 0 } 
        },
        presumido: { tax: 0, rate: 0 },
        winner: 'SN'
    };
}

export function SimulationResults({ formValues }: SimulationResultsProps) {
  // Inicia com false para começar minimizado
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = new Date();
  const [startMonth, setStartMonth] = useState(String(initialDate.getMonth()));
  const [startYear, setStartYear] = useState(String(initialDate.getFullYear()));
  
  const [billingMonth, setBillingMonth] = useState(String(initialDate.getMonth()));
  const [billingYear, setBillingYear] = useState(String(initialDate.getFullYear()));

  const data = useMemo(() => {
      const start = new Date(Number(startYear), Number(startMonth), 1);
      const billing = new Date(Number(billingYear), Number(billingMonth), 1);
      
      if (billing < start) {
          return Array.from({ length: 12 }, (_, i) => {
             const date = new Date(start);
             date.setMonth(start.getMonth() + i);
             const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
             return getZeroedMonth(i + 1, label);
          });
      }

      return runNewCompanySimulation(formValues, start, billing);
  }, [formValues, startMonth, startYear, billingMonth, billingYear]);

  if (!data || data.length === 0) return null;

  const totalSimples = data.reduce((acc, m) => acc + m.simples.tax, 0);
  const totalLP = data.reduce((acc, m) => acc + m.presumido.tax, 0);
  const bestRegimeOverall = totalSimples < totalLP ? 'Simples Nacional' : 'Lucro Presumido';
  const totalEconomy = Math.abs(totalSimples - totalLP);
  const isZeroed = totalSimples === 0 && totalLP === 0;

  return (
    <Card className="border-blue-100 shadow-md bg-white overflow-hidden mt-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-blue-700" />
                    <CardTitle className="text-xl text-blue-900">Projeção Detalhada: Primeiros 12 Meses</CardTitle>
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CardDescription>
              Simule o impacto do início das atividades. Ajuste as datas abaixo para ver como o "fator tempo" dilui a alíquota do Simples.
            </CardDescription>
          </CardHeader>
          
          <CollapsibleContent>
              <CardContent className="p-0">
                <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" /> Data de Abertura (CNPJ)
                        </Label>
                        <div className="flex gap-2">
                            <Select value={startMonth} onValueChange={setStartMonth}>
                                <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Mês" /></SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={startYear} onValueChange={setStartYear}>
                                <SelectTrigger className="w-24 bg-white"><SelectValue placeholder="Ano" /></SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                             <Calendar className="h-3.5 w-3.5" /> Data do 1º Faturamento
                        </Label>
                        <div className="flex gap-2">
                            <Select value={billingMonth} onValueChange={setBillingMonth}>
                                <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Mês" /></SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={billingYear} onValueChange={setBillingYear}>
                                <SelectTrigger className="w-24 bg-white"><SelectValue placeholder="Ano" /></SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {isZeroed && (
                     <div className="px-6 pt-4">
                        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-sm font-bold text-red-800">Datas Inválidas</AlertTitle>
                            <AlertDescription className="text-xs leading-relaxed opacity-90">
                                A data do primeiro faturamento não pode ser anterior à data de abertura do CNPJ.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {!isZeroed && (
                    <div className="p-6 bg-white border-b border-slate-100 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Custo Anual (Simples)</p>
                                <p className="text-2xl font-bold text-slate-700">{formatCurrencyBRL(totalSimples)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Custo Anual (Presumido)</p>
                                <p className="text-2xl font-bold text-slate-700">{formatCurrencyBRL(totalLP)}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs font-bold text-green-800 uppercase mb-1">Melhor Regime (12 meses)</p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-green-700 text-lg leading-tight">{bestRegimeOverall}</span>
                                    <Badge className="bg-green-600 hover:bg-green-700 whitespace-nowrap text-[10px]">Econ: {formatCurrencyBRL(totalEconomy)}</Badge>
                                </div>
                            </div>
                        </div>
                        
                        {/* DISCLAIMER INSERIDO AQUI - MANTENDO ESTRUTURA ORIGINAL */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                                <p>
                                    <strong>Aviso Importante:</strong> A presente simulação considera exclusivamente os valores de impostos. 
                                    <span className="opacity-90"> Não estão inclusos no cálculo valores referentes a mensalidade de Contabilidade ou outros custos operacionais.</span>
                                </p>
                            </div>
                        </div>
                        {/* FIM DO DISCLAIMER */}

                    </div>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-center w-[120px]">Mês</TableHead>
                        <TableHead className="text-right">Faturamento</TableHead>
                        <TableHead className="text-right text-muted-foreground hidden md:table-cell">RBT12 (Base)</TableHead>
                        <TableHead className="text-center">Alíquota Efetiva (SN)</TableHead>
                        <TableHead className="text-right font-semibold text-blue-700">Imposto Simples</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Imposto Presumido</TableHead>
                        <TableHead className="text-center">Melhor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.monthIndex} className={row.isJanuary ? "bg-amber-50 hover:bg-amber-100/50" : "hover:bg-blue-50/30 transition-colors"}>
                          <TableCell className="text-center font-medium text-xs whitespace-nowrap">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <span>{row.monthLabel}</span>
                                {row.isJanuary && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                 <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 cursor-help hover:bg-amber-200 transition-colors">
                                                    <RefreshCcw className="h-3 w-3" />
                                                    <span className="text-[9px] font-bold uppercase">Troca</span>
                                                 </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="p-4 bg-white border border-amber-200 shadow-xl z-50">
                                                <JanuaryComparisonTooltip simples={row.simples.tax} presumido={row.presumido.tax} />
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrencyBRL(row.revenue)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground hidden md:table-cell">
                            {formatCurrencyBRL(row.effectiveRBT12)}
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                        <div className="flex flex-col items-center">
                                            <Badge variant="outline" className="font-mono text-xs hover:bg-slate-100 transition-colors">
                                                {formatPercent(row.simples.rate)}
                                            </Badge>
                                            <span className="text-[9px] text-muted-foreground mt-0.5 block">{row.simples.annex}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="p-4 bg-white border border-slate-200 shadow-xl z-50">
                                        <BreakdownTooltip data={row.simples.breakdown} scenario={row.simples.scenarioLabel} />
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                          </TableCell>

                          <TableCell className="text-right font-semibold text-blue-600">
                            {formatCurrencyBRL(row.simples.tax)}
                          </TableCell>
                          <TableCell className="text-right text-slate-600">
                            {formatCurrencyBRL(row.presumido.tax)}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.winner === 'SN' ? (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none shadow-none text-[10px]">Simples</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-[10px]">Presumido</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
          </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}