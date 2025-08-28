"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import type { EmployeeCostResult } from "@/lib/employee-cost-calculations";
import { PiggyBank, HandCoins, Landmark, FileText, BadgePercent, Gift } from 'lucide-react';
import { Separator } from './ui/separator';

const CustomTooltip = ({ active, payload, label }: any) => {  
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-lg shadow-lg">
          <p className="font-bold text-lg">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={`item-${index}`} style={{ color: entry.fill }}>
                {`${entry.name}: ${formatCurrencyBRL(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
};

export default function EmployeeCostResults({ results }: { results: EmployeeCostResult }) {
    const { regime, totalCost, breakdown, salarioBase, totalBeneficios } = results;

    const chartData = [
        { name: 'Salário Base', value: salarioBase, fill: 'hsl(var(--chart-1))' },
        { name: 'Encargos', value: breakdown.encargos, fill: 'hsl(var(--chart-2))' },
        { name: 'Benefícios', value: totalBeneficios, fill: 'hsl(var(--chart-3))' },
    ];
    
    const tableData = [
        { item: 'Salário Base', value: salarioBase, icon: HandCoins },
        { item: 'Férias (Provisão 1/12)', value: breakdown.ferias, icon: FileText },
        { item: '13º Salário (Provisão 1/12)', value: breakdown.decimoTerceiro, icon: FileText },
        { item: 'FGTS', value: breakdown.fgts, icon: Landmark },
        { item: 'FGTS/Provisão de Multa Rescisória', value: breakdown.fgtsProvisaoRescisao, icon: Landmark },
        { item: 'Previdenciário (Férias, 13º, DSR)', value: breakdown.previdenciario, icon: Landmark },
        { item: 'INSS Patronal (CPP)', value: breakdown.cpp, icon: Landmark },
        { item: 'SAT/RAT', value: breakdown.rat, icon: Landmark },
        { item: 'Salário Educação', value: breakdown.salarioEducacao, icon: Landmark },
        { item: 'Sistema S (Terceiros)', value: breakdown.sistemaS, icon: Landmark },
        { item: 'Vale Transporte', value: breakdown.valeTransporte, icon: Gift },
        { item: 'Outros Benefícios', value: breakdown.outrosBeneficios, icon: Gift },
    ].filter(item => item.value > 0);

    const costMultiplier = (totalCost / salarioBase).toFixed(2);
    
    const getRegimeName = () => {
        switch(regime) {
            case 'simples': return 'Simples Nacional';
            case 'presumido': return 'Lucro Presumido / Real';
            case 'mei': return 'MEI';
        }
    }

    return (
        <div id="results-section" className="w-full space-y-12 mt-16">
            <Card className="shadow-2xl border-primary/20 overflow-hidden">
                 <CardHeader className="text-center bg-primary/5">
                    <PiggyBank className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-3xl font-bold text-primary">
                        Custo Total do Funcionário
                    </CardTitle>
                    <CardDescription className="text-lg mt-2 text-muted-foreground">
                        Análise para o regime: <strong>{getRegimeName()}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-2 space-y-6 text-center lg:text-left">
                            <div>
                                <p className="text-muted-foreground">Custo Mensal Total</p>
                                <p className="text-5xl font-extrabold text-primary">{formatCurrencyBRL(totalCost)}</p>
                            </div>
                             <Separator />
                            <div>
                                <p className="text-muted-foreground">Salário Base</p>
                                <p className="text-3xl font-bold text-foreground">{formatCurrencyBRL(salarioBase)}</p>
                            </div>
                            <div className="bg-amber-100/80 text-amber-900 p-4 rounded-lg border border-amber-200">
                                <BadgePercent className="mx-auto lg:mx-0 h-6 w-6 mb-2"/>
                                <p className="text-lg font-semibold">O custo total é <span className="font-extrabold text-2xl">{costMultiplier}x</span> o salário base.</p>
                                <p className="text-sm">Isso representa um acréscimo de <span className="font-bold">{formatPercent((totalCost / salarioBase) - 1)}</span> sobre o salário.</p>
                            </div>
                        </div>
                        <div className="lg:col-span-3 h-80">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => formatCurrencyBRL(value)} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}}/>
                                    <Bar dataKey="value" name="Custo" barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <LabelList key={`label-${index}`} dataKey="value" position="right" formatter={(value: number) => formatCurrencyBRL(value)} className="font-semibold" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl">
                 <CardHeader>
                    <CardTitle>Detalhamento dos Custos</CardTitle>
                    <CardDescription>Veja a composição do custo total do funcionário.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-3/5">Componente do Custo</TableHead>
                                <TableHead className="text-right">Valor Mensal</TableHead>
                                <TableHead className="text-right">% sobre Salário</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map(item => (
                                <TableRow key={item.item}>
                                    <TableCell className="font-medium flex items-center gap-3"><item.icon className="h-5 w-5 text-primary/70" />{item.item}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrencyBRL(item.value)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatPercent(item.value / salarioBase)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-primary/10 hover:bg-primary/20 font-bold text-primary">
                                <TableCell>CUSTO TOTAL MENSAL</TableCell>
                                <TableCell className="text-right font-mono text-lg">{formatCurrencyBRL(totalCost)}</TableCell>
                                <TableCell className="text-right font-mono text-lg">{formatPercent(totalCost / salarioBase)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
