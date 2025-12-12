
"use client";

import { useFormContext } from "react-hook-form";
import { BarChart, Search, Globe, Percent, Banknote, Landmark, FileText, AlertTriangle, X, Info } from 'lucide-react';
import { cn, formatCurrencyBRL, parseBRL, formatPercent } from "@/lib/utils";
import { getCnaeData, getCnaeOptions } from "@/lib/cnae-helpers";
import { getFiscalParameters } from "@/config/fiscal";
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
import { Slider } from "./ui/slider";
import { NumericFormat } from "react-number-format";
import { CNAE_CLASSES_2026_MAP } from "@/lib/cnae-data-2026";
import { getIvaReductionByCnae } from "@/lib/cnae-reductions-2026";
import { Badge } from "./ui/badge";

interface FormSectionRevenueAndCnaeProps {
    year: number;
    onCnaeSelectorOpen: () => void;
}

export function FormSectionRevenueAndCnae({ year, onCnaeSelectorOpen }: FormSectionRevenueAndCnaeProps) {
    const form = useFormContext();
    const selectedCnaes = form.watch("selectedCnaes");
    const [exchangeRate, setExchangeRate] = useState<number|null>(null);
    const [debouncedCurrency, setDebouncedCurrency] = useState(form.watch('exportCurrency'));

    // fiscalConfig pode ser usado futuramente ou removido se não usado neste componente
    const fiscalConfig = getFiscalParameters(year as 2025 | 2026);

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

    const removeCnae = (codeToRemove: string) => {
        const updatedCnaes = selectedCnaes.filter((cnae: CnaeSelection) => cnae.code !== codeToRemove);
        form.setValue('selectedCnaes', updatedCnaes, { shouldValidate: true, shouldDirty: true });
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
                         <Button type="button" variant="default" size="lg" onClick={onCnaeSelectorOpen} className="w-full max-w-sm text-base py-6">
                            <Search className="mr-2 h-5 w-5" />
                            Selecionar ou Alterar CNAEs
                        </Button>
                    </div>
                    {selectedCnaes && selectedCnaes.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h4 className="font-semibold text-center text-muted-foreground">Atividades Selecionadas ({selectedCnaes.length}/20):</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedCnaes.map((cnaeItem: CnaeSelection, index: number) => {
                                    const cnae = getCnaeData(cnaeItem.code);
                                    if (!cnae) return null;

                                    const cnaeOptions = year >= 2026 ? getCnaeOptions(cnaeItem.code) : [];
                                    const reduction = getIvaReductionByCnae(cnaeItem.code, cnaeItem.cClassTrib);

                                    return (
                                        <div key={index} className="p-4 border rounded-lg bg-background/50 relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeCnae(cnaeItem.code)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <p className="font-bold text-primary pr-8">{cnae.code}</p>
                                            <p className="text-sm text-muted-foreground">{cnae.description}</p>
                                            
                                            <div className="mt-4 space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`selectedCnaes.${index}.domesticRevenue`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Receita Nacional (BRL)</FormLabel>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                                <FormControl>
                                                                    <NumericFormat
                                                                        customInput={Input}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        prefix=""
                                                                        inputMode="decimal"
                                                                        placeholder="0,00"
                                                                        value={field.value}
                                                                        onValueChange={(values) => field.onChange(values.floatValue)}
                                                                        className="pl-9"
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`selectedCnaes.${index}.exportRevenue`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Receita Exportação</FormLabel>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{form.watch('exportCurrency') === 'USD' ? '$' : form.watch('exportCurrency') === 'EUR' ? '€' : 'R$'}</span>
                                                                <FormControl>
                                                                    <NumericFormat
                                                                        customInput={Input}
                                                                        thousandSeparator="."
                                                                        decimalSeparator=","
                                                                        prefix=""
                                                                        inputMode="decimal"
                                                                        placeholder="0,00"
                                                                        value={field.value}
                                                                        onValueChange={(values) => field.onChange(values.floatValue)}
                                                                        className="pl-9"
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {cnae.isRegulated && (
                                                <Badge variant="outline" className="mt-2 text-amber-600 border-amber-500">Atividade Regulamentada</Badge>
                                            )}
                                            
                                            {year >= 2026 && (
                                                <div className="mt-3 space-y-3">
                                                    {cnaeOptions.length > 1 && (
                                                        <FormField
                                                            control={form.control}
                                                            name={`selectedCnaes.${index}.cClassTrib`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-semibold">Classificação do Serviço (Tributação)</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Selecione a classificação..." />
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
                                                     <div className="p-3 bg-primary/5 border border-dashed border-primary/20 rounded-lg text-sm">
                                                        <p className="font-bold text-primary mb-1">Reduções de IVA (IBS/CBS)</p>
                                                        <div className="flex justify-between">
                                                            <span>Redução IBS:</span>
                                                            <span className="font-semibold">{formatPercent(reduction.reducaoIBS / 100)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Redução CBS:</span>
                                                            <span className="font-semibold">{formatPercent(reduction.reducaoCBS / 100)}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {cnaeItem.cClassTrib && CNAE_CLASSES_2026_MAP[cnaeItem.cClassTrib]?.description 
                                                                ? CNAE_CLASSES_2026_MAP[cnaeItem.cClassTrib]?.description 
                                                                : 'Tributação padrão.'}
                                                        </p>
                                                     </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* CORREÇÃO AQUI: Substituímos o render condicional manual por FormItem + FormMessage */}
                    <FormField 
                        control={form.control} 
                        name="selectedCnaes" 
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )} 
                    />
                </CardContent>
            </Card>

            {(selectedCnaes && selectedCnaes.length > 0) && (
                 <Card className='shadow-lg overflow-hidden border bg-card'>
                    <CardHeader className='border-b bg-muted/30'>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <Landmark className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Configurações Globais</CardTitle>
                                <CardDescription>Ajustes que afetam o cálculo de todos os CNAEs.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                        <div className="space-y-2">
                            <Label htmlFor="exportCurrency">Moeda da Exportação</Label>
                            <Select name="exportCurrency" value={form.watch('exportCurrency')} onValueChange={(value) => form.setValue('exportCurrency', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BRL">BRL (Real)</SelectItem>
                                    <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                </SelectContent>
                            </Select>
                             {form.watch('exportCurrency') !== 'BRL' && (
                                <p className="text-sm text-muted-foreground">
                                    Cotação ({form.watch('exportCurrency')}/BRL): {exchangeRate ? formatCurrencyBRL(exchangeRate) : 'Carregando...'}
                                </p>
                            )}
                        </div>
                         <FormField
                            control={form.control}
                            name="issRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alíquota de ISS (%)</FormLabel>
                                    <FormControl>
                                            <NumericFormat
                                            customInput={Input}
                                            decimalSeparator=","
                                            decimalScale={2}
                                            fixedDecimalScale={false}
                                            placeholder="Ex: 5,0"
                                            value={field.value}
                                            onValueChange={(values) => {
                                                field.onChange(values.floatValue);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        A alíquota de ISS do seu município (entre 2% e 5%).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {year >= 2026 && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="b2bRevenuePercentage"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Receita de Clientes PJ (B2B)</FormLabel>
                                                <span className="text-sm font-semibold w-20 text-right bg-muted/50 px-2 py-1 rounded-md border">{field.value?.toFixed(0) ?? '0'}%</span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    defaultValue={[50]}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={(value) => field.onChange(value[0])}
                                                    className="pt-2"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Percentual do faturamento que vem de outras empresas.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="creditGeneratingExpenses"
                                    render={({ field }) => {
                                        return (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Despesas que Geram Crédito de IVA</FormLabel>
                                                    <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <FormControl>
                                                         <NumericFormat
                                                            customInput={Input}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix=""
                                                            inputMode="decimal"
                                                            placeholder="0,00"
                                                            value={field.value}
                                                            onValueChange={(values) => field.onChange(values.floatValue)}
                                                            className="pl-9"
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormDescription className="text-xs">
                                                    Ex: aluguel, energia, softwares. Não inclua folha de pagamento.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
    