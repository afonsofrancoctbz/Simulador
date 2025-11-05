

"use client";

import { useFormContext } from "react-hook-form";
import { FileText, AlertTriangle } from 'lucide-react';
import { formatCurrencyBRL, formatBRL } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import type { CalculatorFormValues } from './tax-calculator-form';
import { useMemo } from "react";

export function FormSectionAnnualRevenue() {
    const form = useFormContext<CalculatorFormValues>();

    const rbt12Value = form.watch("rbt12");
    const watchedRevenues = form.watch("revenues");

    const projectedAnnualRevenue = useMemo(() => {
        const domestic = Object.keys(watchedRevenues)
            .filter(k => k.startsWith('domestic_'))
            .reduce((sum, k) => sum + (watchedRevenues[k] || 0), 0);
        
        const exportVal = Object.keys(watchedRevenues)
            .filter(k => k.startsWith('export_'))
            .reduce((sum, k) => sum + (watchedRevenues[k] || 0), 0);

        const exchangeRate = form.getValues('exportCurrency') !== 'BRL' ? (form.getValues('exchangeRate') || 1) : 1;
        
        return (domestic + (exportVal * exchangeRate)) * 12;
    }, [watchedRevenues, form]);
      
    const SIMPLES_NACIONAL_LIMIT = 4800000;
    const showSimplesLimitWarning = (rbt12Value ?? 0) === 0 && projectedAnnualRevenue > SIMPLES_NACIONAL_LIMIT;

    return (
        <Card className='shadow-lg overflow-hidden border bg-card'>
            <CardHeader className='border-b bg-muted/30'>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Receita Anual</CardTitle>
                        <CardDescription>Esta informação é crucial para determinar a alíquota correta do Simples Nacional.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6 md:p-8'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                    <FormField control={form.control} name="rbt12" render={({ field }) => {
                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = e.target;
                            const digitsOnly = value.replace(/\D/g, '');
                            field.onChange(Number(digitsOnly) / 100);
                        };
                        return (
                            <FormItem>
                                <FormLabel>Faturamento Total (RBT12)</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Ex: 250.000,00"
                                            onChange={handleChange}
                                            onBlur={field.onBlur}
                                            value={field.value ? formatBRL(field.value) : ''}
                                            name={field.name}
                                            ref={field.ref}
                                            className="pl-9"
                                        />
                                    </FormControl>
                                </div>
                                <FormDescription>
                                    Receita Bruta dos últimos 12 meses. Se for o primeiro mês, pode deixar em R$ 0,00.
                                </FormDescription>
                                <FormMessage />
                                {showSimplesLimitWarning && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Atenção: Limite do Simples Nacional</AlertTitle>
                                        <AlertDescription>
                                            Sua receita anual projetada ({formatCurrencyBRL(projectedAnnualRevenue)}) ultrapassa o teto de R$ 4,8 milhões.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </FormItem>
                        );
                    }} />
                    <FormField control={form.control} name="fp12" render={({ field }) => {
                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = e.target;
                            const digitsOnly = value.replace(/\D/g, '');
                            field.onChange(Number(digitsOnly) / 100);
                        };
                        return (
                            <FormItem>
                                <FormLabel>Folha de Pagamento (FP12)</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Ex: 70.000,00"
                                            onChange={handleChange}
                                            onBlur={field.onBlur}
                                            value={field.value ? formatBRL(field.value) : ''}
                                            name={field.name}
                                            ref={field.ref}
                                            className="pl-9"
                                        />
                                    </FormControl>
                                </div>
                                <FormDescription>
                                    Soma de salários e pró-labore dos últimos 12 meses. Essencial para o Fator R.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }} />
                </div>
            </CardContent>
        </Card>
    );
}

    