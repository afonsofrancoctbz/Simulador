

"use client";

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from "react-hook-form";
import { BarChartBig, Rocket, Briefcase, PlusCircle, XCircle, Percent, AlertTriangle } from 'lucide-react';
import { getCnaeData } from '@/lib/cnae-helpers';
import type { Annex } from '@/lib/types';
import { formatCurrencyBRL, formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Slider } from './ui/slider';
import type { CalculatorFormValues } from './tax-calculator-form';
import { useToast } from '@/hooks/use-toast';

interface FormSectionRevenueProps {
    year: 2025 | 2026;
    onCnaeSelectorOpen: () => void;
}

export function FormSectionRevenue({ year, onCnaeSelectorOpen }: FormSectionRevenueProps) {
    const form = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
    const [isFetchingRate, setIsFetchingRate] = useState(false);
    
    const rbt12Value = form.watch("rbt12");
    const watchedRevenues = form.watch("revenues");
    const watchedExchangeRate = form.watch("exchangeRate");
    const watchedExportCurrency = form.watch("exportCurrency");
    const selectedCnaes = form.watch("selectedCnaes");

    const projectedAnnualRevenue = useMemo(() => {
        let domestic = 0;
        let exportRaw = 0;

        for (const key in watchedRevenues) {
            const revenue = watchedRevenues[key] || 0;
            if (key.startsWith('domestic_')) {
                domestic += revenue;
            } else if (key.startsWith('export_')) {
                exportRaw += revenue;
            }
        }
        
        const exportBRL = watchedExportCurrency !== 'BRL' ? exportRaw * watchedExchangeRate : exportRaw;
        return (domestic + exportBRL) * 12;
    }, [watchedRevenues, watchedExchangeRate, watchedExportCurrency]);
      
    const SIMPLES_NACIONAL_LIMIT = 4800000;
    const showSimplesLimitWarning = (rbt12Value ?? 0) === 0 && projectedAnnualRevenue > SIMPLES_NACIONAL_LIMIT;

    const exportCurrency = form.watch("exportCurrency");

    const revenueGroups = useMemo(() => {
        const cnaesInfo = selectedCnaes.map(code => getCnaeData(code)).filter((c): c is any => !!c);
        const annexes = [...new Set(cnaesInfo.map(c => c.annex))];
        return annexes;
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

    return (
        <Card className='border-none shadow-none'>
            <CardHeader className='bg-muted/40 p-4 rounded-t-lg border-b'>
                 <h3 className="font-semibold text-lg text-foreground flex items-center gap-3">
                     <div className='p-2 bg-primary/10 rounded-md border border-primary/20'>
                        <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    2. Atividades e Faturamento Mensal
                </h3>
                <p className='text-base text-muted-foreground mt-1'>Selecione suas atividades e informe a receita correspondente.</p>
            </CardHeader>
             <CardContent className='p-4 pt-6 space-y-8'>
                 <div>
                    <FormLabel>Atividades (CNAEs) da empresa</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md min-h-[40px] bg-background">
                        {selectedCnaes.length > 0 ? selectedCnaes.map(code => (
                            <Badge key={code} variant="secondary" className="text-sm">
                                {code}
                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => handleCnaeBadgeRemove(code)}>
                                    <XCircle className="h-3 w-3 text-destructive/80" />
                                </Button>
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground px-1">Nenhuma atividade selecionada.</p>}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onCnaeSelectorOpen}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar / Editar Atividades
                    </Button>
                    <FormMessage>{form.formState.errors.selectedCnaes?.message}</FormMessage>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="rbt12" render={({ field }) => {
                            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                const { value } = e.target;
                                const digitsOnly = value.replace(/\D/g, '');
                                field.onChange(Number(digitsOnly) / 100);
                            };
                            return (
                            <FormItem>
                                <FormLabel>Faturamento dos Últimos 12 Meses (RBT12)</FormLabel>
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
                                    />
                                </FormControl>
                                <FormDescription className='text-sm'>
                                    Para empresas com menos de 12 meses, calcule a média mensal desde a abertura e multiplique por 12. Se for o primeiro mês, pode deixar em R$ 0,00.
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
                                <FormLabel>Folha de Pagamento dos Últimos 12 Meses (FP12)</FormLabel>
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
                                    />
                                </FormControl>
                                <FormDescription className='text-sm'>
                                    Soma de salários e pró-labore do último ano.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            );
                        }} />
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
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6'>
                        <div className='space-y-4'>
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
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}} />
                            ))}
                        </div>
                        
                        <div className='space-y-4'>
                            <h4 className="font-medium text-md text-foreground flex items-center gap-2"><Rocket className="h-5 w-5 text-primary/80" />Receita de Exportação</h4>
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
                                            <FormLabel>Taxa de Câmbio ({exportCurrency})</FormLabel>
                                            <div className="relative">
                                                <FormControl><Input type="number" step="0.0001" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={isFetchingRate} /></FormControl>
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
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {revenueGroups.length === 0 && <p className='text-sm text-muted-foreground mt-4'>Selecione uma ou mais atividades para informar o faturamento.</p>}
            </CardContent>
        </Card>
    );
}
