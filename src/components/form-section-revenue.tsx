

"use client";

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from "react-hook-form";
import { BarChartBig, Rocket, Briefcase, PlusCircle, XCircle, Percent, AlertTriangle, FileText, Banknote, Pencil, Info } from 'lucide-react';
import { getCnaeData } from '@/lib/cnae-helpers';
import type { Annex } from '@/lib/types';
import { formatCurrencyBRL, formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Slider } from './ui/slider';
import type { CalculatorFormValues } from './tax-calculator-form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface FormSectionRevenueProps {
    year: 2025 | 2026;
    onCnaeSelectorOpen: () => void;
}

export function FormSectionRevenue({ year, onCnaeSelectorOpen }: FormSectionRevenueProps) {
    const form = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
    const [isFetchingRate, setIsFetchingRate] = useState(false);
    const [showIssInput, setShowIssInput] = useState(false);
    
    const selectedCnaes = form.watch("selectedCnaes");

    const revenueGroups = useMemo(() => {
        const cnaesInfo = selectedCnaes.map(code => getCnaeData(code)).filter((c): c is any => !!c);
        const annexes = [...new Set(cnaesInfo.map(c => c.annex))];
        return annexes.sort();
    }, [selectedCnaes]);

    const fetchRates = async () => {
        setIsFetchingRate(true);
        try {
          const response = await fetch('/api/exchange-rate');
          if (!response.ok) {
            throw new Error('A resposta da API de câmbio não foi OK');
          }
          const data = await response.json();
          setExchangeRates(data);
          const currentCurrency = form.getValues('exportCurrency');
          if (data[currentCurrency]) {
            form.setValue('exchangeRate', data[currentCurrency], { shouldValidate: true });
          }
          return data;
        } catch (error) {
          console.error("Falha ao buscar taxas de câmbio", error);
          toast({
            title: "Erro de Conexão",
            description: "Não foi possível carregar as taxas de câmbio. Por favor, insira manualmente.",
            variant: "destructive",
          });
        } finally {
          setIsFetchingRate(false);
        }
        return null;
    };

    useEffect(() => {
        fetchRates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCnaeBadgeRemove = (codeToRemove: string) => {
        const newCnaes = selectedCnaes.filter(c => c !== codeToRemove);
        form.setValue('selectedCnaes', newCnaes, { shouldValidate: true });
    };

    const exportCurrency = form.watch("exportCurrency");

    return (
        <Card className='shadow-lg overflow-hidden border bg-card'>
            <CardHeader className='border-b bg-muted/30'>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Atividades e Faturamento Mensal</CardTitle>
                        <CardDescription>Selecione suas atividades e informe a estimativa de receita para o mês.</CardDescription>
                    </div>
                </div>
            </CardHeader>
             <CardContent className='p-6 md:p-8 space-y-8'>
                 <div>
                    <FormLabel>1. Selecione suas Atividades (CNAEs)</FormLabel>
                    <FormDescription className="text-xs mb-2">A escolha do CNAE define os anexos e as alíquotas de imposto aplicáveis.</FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md min-h-[44px] bg-background">
                        {selectedCnaes.length > 0 ? selectedCnaes.map(code => (
                            <Badge key={code} variant="secondary" className="text-sm">
                                {code}
                                <button type="button" className="ml-1 rounded-full p-0.5 hover:bg-destructive/20" onClick={() => handleCnaeBadgeRemove(code)}>
                                    <XCircle className="h-3.5 w-3.5 text-destructive/80" />
                                </button>
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground px-1">Nenhuma atividade selecionada.</p>}
                    </div>
                     <FormMessage className="mt-2">{form.formState.errors.selectedCnaes?.message}</FormMessage>
                    <Button type="button" variant="default" size="sm" className="mt-3" onClick={onCnaeSelectorOpen}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar / Editar Atividades
                    </Button>
                     {selectedCnaes.length === 0 && (
                         <p className='text-sm text-muted-foreground mt-4'>Selecione uma ou mais atividades para informar o faturamento.</p>
                    )}
                </div>
                
                {year === 2026 && (
                  <FormField
                    control={form.control}
                    name="b2bRevenuePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'><Percent className='h-4 w-4 text-primary' />% do Faturamento para Empresas (B2B)</FormLabel>
                        <div className='flex items-center gap-4'>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => field.onChange(value[0])}
                              defaultValue={[field.value ?? 50]}
                              className='flex-1'
                            />
                          </FormControl>
                          <span className='font-bold text-primary w-16 text-center'>{field.value ?? 50}%</span>
                        </div>
                        <FormDescription>
                          Informe a porcentagem do seu faturamento que vem de vendas para outras empresas (PJ).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {revenueGroups.length > 0 && <Separator />}

                {revenueGroups.length > 0 && (
                     <div className="space-y-6">
                        <h4 className="font-semibold text-lg text-foreground flex items-center gap-3">
                            <Banknote className="h-5 w-5 text-primary"/>
                            2. Informe o Faturamento Mensal Estimado
                        </h4>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8'>
                            <div className='space-y-6'>
                                <h4 className="font-medium text-md text-foreground flex items-center gap-2"><BarChartBig className="h-5 w-5 text-primary/80" />Receita Nacional (em R$)</h4>
                                {revenueGroups.map(annex => (
                                    <FormField
                                        key={`domestic_${annex}`}
                                        control={form.control}
                                        name={`revenues.domestic_${annex}`}
                                        render={({ field }) => {
                                            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                const { value } = e.target;
                                                const digitsOnly = value.replace(/\D/g, '');
                                                field.onChange(Number(digitsOnly) / 100);
                                            };
                                            return (
                                            <FormItem>
                                                <FormLabel>Faturamento do Mês (Anexo {annex})</FormLabel>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="0,00"
                                                            onChange={handleChange}
                                                            onBlur={field.onBlur}
                                                            value={field.value ? formatBRL(field.value) : ''}
                                                            name={field.name}
                                                            ref={field.ref}
                                                            className="pl-9"
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}} />
                                ))}
                                
                                <FormItem className="flex flex-row items-center gap-4 space-y-0">
                                    <FormLabel className="text-sm whitespace-nowrap pt-1">Alíquota de ISS (%)</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Switch
                                                checked={showIssInput}
                                                onCheckedChange={(checked) => {
                                                    setShowIssInput(checked);
                                                    if (!checked) {
                                                        form.setValue('issRate', undefined, { shouldValidate: true });
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        {showIssInput && (
                                            <FormField
                                                control={form.control}
                                                name="issRate"
                                                render={({ field }) => (
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="5"
                                                            step="0.01"
                                                            className="h-9 w-32"
                                                            {...field}
                                                            onChange={(e) => {
                                                                const value = parseFloat(e.target.value);
                                                                field.onChange(isNaN(value) ? undefined : value);
                                                            }}
                                                            value={field.value !== undefined ? field.value : ''}
                                                        />
                                                    </FormControl>
                                                )}
                                            />
                                        )}
                                    </div>
                                    <FormMessage>{form.formState.errors.issRate?.message}</FormMessage>
                                </FormItem>
                            </div>
                            
                            <div className='space-y-6'>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-md text-foreground flex items-center gap-2"><Rocket className="h-5 w-5 text-primary/80" />Receita de Exportação</h4>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger type='button'><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Receitas de exportação de serviços são isentas de PIS, COFINS e ISS,<br /> resultando em uma carga tributária menor.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <FormField control={form.control} name="exportCurrency" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moeda</FormLabel>
                                            <Select onValueChange={(value) => {
                                                field.onChange(value)
                                                if (exchangeRates[value]) {
                                                    form.setValue('exchangeRate', exchangeRates[value], { shouldValidate: true })
                                                } else if (value === 'BRL') {
                                                    form.setValue('exchangeRate', 1, { shouldValidate: true })
                                                }
                                            }} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                                                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    {exportCurrency !== 'BRL' && (
                                        <FormField control={form.control} name="exchangeRate" render={({ field }) => (
                                            <FormItem className='md:col-span-2'>
                                                <FormLabel>Taxa de Câmbio</FormLabel>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{exportCurrency}</span>
                                                    <FormControl><Input type="number" step="0.0001" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={isFetchingRate} className="pl-12"/></FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {revenueGroups.map(annex => (
                                        <FormField
                                            key={`export_${annex}`}
                                            control={form.control}
                                            name={`revenues.export_${annex}`}
                                            render={({ field }) => {
                                                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const { value } = e.target;
                                                    const digitsOnly = value.replace(/\D/g, '');
                                                    field.onChange(Number(digitsOnly) / 100);
                                                };
                                                return (
                                                <FormItem>
                                                    <FormLabel>Faturamento do Mês (Anexo {annex})</FormLabel>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{exportCurrency === 'BRL' ? 'R$' : exportCurrency}</span>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                inputMode="decimal"
                                                                placeholder="0,00"
                                                                onChange={handleChange}
                                                                onBlur={field.onBlur}
                                                                value={field.value ? formatBRL(field.value) : ''}
                                                                name={field.name}
                                                                ref={field.ref}
                                                                className="pl-10"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}} />
                                    ))}
                                </div>
                            </div>
                        </div>
                     </div>
                )}
            </CardContent>
        </Card>
    );
}

    
    