

"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { BarChart, Search, Globe, Percent, Banknote, Landmark, FileText, AlertTriangle, X } from 'lucide-react';
import { cn, formatCurrencyBRL, parseBRL } from "@/lib/utils";
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

interface FormSectionRevenueAndCnaeProps {
    year: number;
    onCnaeSelectorOpen: () => void;
}

export function FormSectionRevenueAndCnae({ year, onCnaeSelectorOpen }: FormSectionRevenueAndCnaeProps) {
    const form = useFormContext();
    const { fields, update, remove } = useFieldArray({
      control: form.control,
      name: "selectedCnaes",
    });

    const [exchangeRate, setExchangeRate] = useState<number|null>(null);
    const [debouncedCurrency, setDebouncedCurrency] = useState(form.watch('exportCurrency'));

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

    const removeCnae = (index: number) => {
        remove(index);
    };

    const handleRevenueChange = (value: number, type: 'domestic' | 'export') => {
      const cnaes: CnaeSelection[] = form.getValues('selectedCnaes');
      if (cnaes.length === 0) return;

      const revenuePerCnae = cnaes.length > 0 ? value / cnaes.length : 0;
      
      cnaes.forEach((cnae, index) => {
        const fieldToUpdate = type === 'domestic' ? 'domesticRevenue' : 'exportRevenue';
        update(index, { ...cnae, [fieldToUpdate]: revenuePerCnae });
      });
    };

    const totalDomesticRevenue = useMemo(() => {
        const cnaes: CnaeSelection[] = form.watch('selectedCnaes');
        return cnaes.reduce((sum, cnae) => sum + (cnae.domesticRevenue || 0), 0);
    }, [form.watch('selectedCnaes')]);

    const totalExportRevenue = useMemo(() => {
        const cnaes: CnaeSelection[] = form.watch('selectedCnaes');
        return cnaes.reduce((sum, cnae) => sum + (cnae.exportRevenue || 0), 0);
    }, [form.watch('selectedCnaes')]);

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
                    {fields && fields.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h4 className="font-semibold text-center text-muted-foreground">Atividades Selecionadas ({fields.length}/20):</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fields.map((cnaeItem, index) => {
                                    const cnae = getCnaeData(cnaeItem.code);
                                    if (!cnae) return null;

                                    const cnaeOptions = year >= 2026 ? getCnaeOptions(cnaeItem.code) : [];

                                    return (
                                        <div key={index} className="p-4 border rounded-lg bg-background/50 relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeCnae(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <p className="font-bold text-primary pr-8">{cnae.code}</p>
                                            <p className="text-sm text-muted-foreground">{cnae.description}</p>
                                            {year >= 2026 && cnaeOptions.length > 1 && (
                                                 <FormField
                                                    control={form.control}
                                                    name={`selectedCnaes.${index}.cClassTrib`}
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
                        fieldState.error ? <p className="text-sm font-medium text-destructive text-center">{fieldState.error.message}</p> : null
                    )} />
                </CardContent>
            </Card>

            {fields && fields.length > 0 && (
                <>
                    <Card className='shadow-lg overflow-hidden border bg-card'>
                        <CardHeader className='border-b bg-muted/30'>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Faturamento Mensal</CardTitle>
                                    <CardDescription>Informe sua receita esperada e a alíquota de ISS do seu município.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className='p-6 md:p-8 space-y-6'>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <FormItem>
                                    <FormLabel>Receita Nacional (em BRL)</FormLabel>
                                    <FormControl>
                                        <NumericFormat
                                            customInput={Input}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="R$ "
                                            decimalScale={2}
                                            fixedDecimalScale
                                            placeholder="R$ 0,00"
                                            value={totalDomesticRevenue}
                                            onValueChange={(values) => {
                                                handleRevenueChange(values.floatValue || 0, 'domestic');
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>

                                <FormItem>
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
                                    <FormControl>
                                        <NumericFormat
                                            customInput={Input}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix={form.watch('exportCurrency') === 'USD' ? '$ ' : form.watch('exportCurrency') === 'EUR' ? '€ ' : 'R$ '}
                                            decimalScale={2}
                                            fixedDecimalScale
                                            placeholder="0,00"
                                            value={totalExportRevenue}
                                            onValueChange={(values) => {
                                                handleRevenueChange(values.floatValue || 0, 'export');
                                            }}
                                        />
                                    </FormControl>
                                    {form.watch('exportCurrency') !== 'BRL' && (
                                        <p className="text-sm text-muted-foreground">
                                            Cotação ({form.watch('exportCurrency')}/BRL): {exchangeRate ? formatCurrencyBRL(exchangeRate) : 'Carregando...'}
                                        </p>
                                    )}
                                </FormItem>
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
                                                suffix="%"
                                                placeholder="Ex: 5,0"
                                                value={field.value}
                                                onValueChange={(values) => {
                                                    field.onChange(values.floatValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Informe a alíquota de ISS do seu município para serviços (entre 2% e 5%). Se não souber, use o padrão de 5%.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                        return (
                                            <FormItem>
                                                <FormLabel>Despesas que Geram Crédito de IVA</FormLabel>
                                                 <FormControl>
                                                    <NumericFormat
                                                        customInput={Input}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                        placeholder="R$ 0,00"
                                                        value={field.value}
                                                        onValueChange={(values) => {
                                                            field.onChange(values.floatValue || 0);
                                                        }}
                                                    />
                                                </FormControl>
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
