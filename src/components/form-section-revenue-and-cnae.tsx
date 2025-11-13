"use client";

import { useFormContext } from "react-hook-form";
import { BarChart, Search, Globe, Percent, Banknote, Landmark, FileText, AlertTriangle } from 'lucide-react';
import { cn, formatBRL, parseBRL, formatBRLFromCents } from "@/lib/utils";
import { getCnaeData } from "@/lib/cnae-helpers";
import { getFiscalParameters } from "@/config/fiscal";
import { CNAE_LC116_RELATIONSHIP } from "@/lib/cnae-data-2026";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useDebounce } from "react-use";
import { useEffect, useMemo, useState } from "react";
import type { Annex, CnaeSelection } from "@/lib/types";

// This is the new combined component for Step 4
// It includes CNAE selection and monthly revenue input

interface FormSectionRevenueAndCnaeProps {
    year: number;
    onCnaeSelectorOpen: () => void;
}

export function FormSectionRevenueAndCnae({ year, onCnaeSelectorOpen }: FormSectionRevenueAndCnaeProps) {
    const form = useFormContext();
    const selectedCnaes = form.watch("selectedCnaes");
    const [exchangeRate, setExchangeRate] = useState<number|null>(null);
    const [debouncedCurrency, setDebouncedCurrency] = useState(form.watch('exportCurrency'));

    const fiscalConfig = getFiscalParameters(year);

    useDebounce(() => {
        setDebouncedCurrency(form.watch('exportCurrency'));
    }, 500, [form.watch('exportCurrency')]);


    useEffect(() => {
        async function fetchExchangeRate() {
            if (debouncedCurrency !== 'BRL') {
                try {
                    const response = await fetch('/api/exchange-rate');
                    const data = await response.json();
                    const rate = data[debouncedCurrency];
                    if (rate) {
                        setExchangeRate(rate);
                        form.setValue('exchangeRate', rate);
                    }
                } catch (error) {
                    console.error("Failed to fetch exchange rate:", error);
                    setExchangeRate(null);
                }
            } else {
                 setExchangeRate(1);
                 form.setValue('exchangeRate', 1);
            }
        }
        fetchExchangeRate();
    }, [debouncedCurrency, form]);


    const annexes = useMemo(() => {
        const annexSet = new Set<Annex>();
        selectedCnaes.forEach((item: CnaeSelection) => {
            const cnae = getCnaeData(item.code);
            if (cnae) {
                annexSet.add(cnae.annex);
            }
        });
        return Array.from(annexSet).sort();
    }, [selectedCnaes]);

    const getCnaeOptions = (cnaeCode: string) => {
        const numericCode = cnaeCode.replace(/\D/g, '');
        return CNAE_LC116_RELATIONSHIP.filter(rel => rel.cnae === numericCode);
    };

    return (
        <div className="space-y-8">
            <Card className='shadow-lg overflow-hidden border bg-card'>
                <CardHeader className='border-b bg-muted/30'>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <BarChart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Atividades da Empresa (CNAE)</CardTitle>
                            <CardDescription>Selecione as atividades que sua empresa irá exercer. Isso definirá seus impostos.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='p-6 md:p-8 space-y-6'>
                    <div className="flex items-center justify-center">
                        <Button type="button" variant="outline" size="lg" onClick={onCnaeSelectorOpen}>
                            <Search className="mr-2 h-4 w-4" />
                            Selecionar ou Alterar CNAEs
                        </Button>
                    </div>
                    {selectedCnaes && selectedCnaes.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h4 className="font-semibold text-center">Atividades Selecionadas:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedCnaes.map((cnaeItem: CnaeSelection, index: number) => {
                                    const cnae = getCnaeData(cnaeItem.code);
                                    if (!cnae) return null;

                                    const cnaeOptions = year >= 2026 ? getCnaeOptions(cnae.code) : [];

                                    return (
                                        <div key={index} className="p-4 border rounded-lg bg-background/50">
                                            <p className="font-bold text-primary">{cnae.code}</p>
                                            <p className="text-sm text-muted-foreground">{cnae.description}</p>
                                            {year >= 2026 && cnaeOptions.length > 1 && (
                                                 <FormField
                                                    control={form.control}
                                                    name={`selectedCnaes.${index}.cClass`}
                                                    render={({ field }) => (
                                                        <FormItem className="mt-3">
                                                            <FormLabel>Tipo de Serviço (Tributação)</FormLabel>
                                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione a classificação do serviço..." />
                                                                </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                {cnaeOptions.map(opt => (
                                                                    <SelectItem key={opt.cClassTrib} value={opt.cClassTrib}>
                                                                        {opt.nbsDescription}
                                                                    </SelectItem>
                                                                ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                 />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    <FormField control={form.control} name="selectedCnaes" render={({ fieldState }) => (
                        fieldState.error ? <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p> : null
                    )} />
                </CardContent>
            </Card>

            {selectedCnaes && selectedCnaes.length > 0 && (
                <>
                    <Card className='shadow-lg overflow-hidden border bg-card'>
                        <CardHeader className='border-b bg-muted/30'>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Faturamento Mensal</CardTitle>
                                    <CardDescription>Informe sua receita mensal esperada, separada por tipo de anexo.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-6 md:p-8 space-y-6'>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-grow space-y-4">
                                    <Label>Receita Nacional (em BRL)</Label>
                                    {annexes.map(annex => (
                                        <FormField
                                            key={`domestic_${annex}`}
                                            control={form.control}
                                            name={`revenues.domestic_${annex}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-normal text-muted-foreground">Anexo {annex}</FormLabel>
                                                     <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                        <FormControl>
                                                            <Input type="text" inputMode="decimal" placeholder="0,00" {...field} onChange={e => field.onChange(parseBRL(e.target.value))} value={formatBRLFromCents(field.value) || ''} className="pl-9" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="exportCurrency">Receita de Exportação</Label>
                                        <Select name="exportCurrency" value={form.watch('exportCurrency')} onValueChange={(value) => form.setValue('exportCurrency', value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BRL">BRL</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {annexes.map(annex => (
                                         <FormField
                                            key={`export_${annex}`}
                                            control={form.control}
                                            name={`revenues.export_${annex}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-normal text-muted-foreground">Anexo {annex}</FormLabel>
                                                     <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{form.watch('exportCurrency') === 'USD' ? '$' : form.watch('exportCurrency') === 'EUR' ? '€' : 'R$'}</span>
                                                        <FormControl>
                                                            <Input type="text" inputMode="decimal" placeholder="0,00" {...field} onChange={e => field.onChange(parseBRL(e.target.value))} value={formatBRLFromCents(field.value) || ''} className="pl-9" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                     {form.watch('exportCurrency') !== 'BRL' && (
                                        <p className="text-sm text-muted-foreground">
                                            Cotação ({form.watch('exportCurrency')}/BRL): {exchangeRate ? formatBRL(exchangeRate) : 'Carregando...'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {year >= 2026 && (
                        <Card className='shadow-lg overflow-hidden border bg-card'>
                            <CardHeader className='border-b bg-muted/30'>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                        <Landmark className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Cenário Pós-Reforma (IVA)</CardTitle>
                                        <CardDescription>Informações adicionais para simular os cenários da Reforma Tributária.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className='p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                                <FormField
                                    control={form.control}
                                    name="b2bRevenuePercentage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Receita de Clientes PJ (B2B)</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input type="number" {...field} className="pr-8" />
                                                </FormControl>
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                            </div>
                                            <FormDescription>
                                                Percentual do faturamento que vem de outras empresas. Essencial para o cenário "Híbrido".
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="creditGeneratingExpenses"
                                    render={({ field }) => {
                                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const { value } = e.target;
                                            const digitsOnly = value.replace(/\D/g, '');
                                            field.onChange(Number(digitsOnly) / 100);
                                        };
                                        return (
                                            <FormItem>
                                                <FormLabel>Despesas que Geram Crédito de IVA</FormLabel>
                                                 <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <FormControl>
                                                        <Input type="text" inputMode="decimal" placeholder="0,00" onChange={handleChange} onBlur={field.onBlur} value={field.value ? formatBRL(field.value) : ''} name={field.name} ref={field.ref} className="pl-9" />
                                                    </FormControl>
                                                </div>
                                                <FormDescription>
                                                    Ex: aluguel, energia, softwares, insumos. Não inclua folha de pagamento.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
