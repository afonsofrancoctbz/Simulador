"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { BarChart, Search, Globe, Percent, Banknote, Landmark, FileText, AlertTriangle, X, Info, BadgeCheck, DollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getCnaeData } from "@/lib/cnae-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState, useRef } from "react";
import type { CnaeSelection } from "@/lib/types";
import { Slider } from "./ui/slider";
import { NumericFormat } from "react-number-format";
import { getIvaReductionByCnae, getNBSOptionsByCnae } from "@/lib/cnae-reductions-2026";
import type { CnaeRelationship2026 } from "@/lib/cnae-data-2026";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";


// ======================================================================================
// 1. CnaeActivityCard: Componente para gerenciar CNAE e seleção de NBS
// ======================================================================================

interface CnaeActivityCardProps {
    index: number;
    year: number;
    onRemove: () => void;
}

function CnaeActivityCard({ index, year, onRemove }: CnaeActivityCardProps) {
    const form = useFormContext();
    const cnaeItem: CnaeSelection = form.watch(`selectedCnaes.${index}`);
    const cnaeData = getCnaeData(cnaeItem.code);

    const isPostReforma = year >= 2026;

    // Busca opções de NBS para o CNAE
    const nbsOptions: CnaeRelationship2026[] = useMemo(() => {
        if (!isPostReforma) return [];
        return getNBSOptionsByCnae(cnaeItem.code);
    }, [cnaeItem.code, isPostReforma]);

    // Auto-seleciona NBS se houver apenas uma opção
    useEffect(() => {
        if (isPostReforma && nbsOptions.length === 1 && cnaeItem.nbsCode !== nbsOptions[0].nbs) {
            form.setValue(`selectedCnaes.${index}.nbsCode`, nbsOptions[0].nbs, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [isPostReforma, nbsOptions, cnaeItem.nbsCode, form, index]);
    
    const definitiveNbsCode = form.watch(`selectedCnaes.${index}.nbsCode`);
    const ivaReduction = getIvaReductionByCnae(cnaeItem.code, definitiveNbsCode);
    const selectedNbsOption = useMemo(() => nbsOptions.find(opt => opt.nbs === definitiveNbsCode), [nbsOptions, definitiveNbsCode]);


    if (!cnaeData) return null;

    const renderNbsContent = () => {
        if (!isPostReforma) return null;

        if (nbsOptions.length > 1) {
            return (
                <FormField
                    control={form.control}
                    name={`selectedCnaes.${index}.nbsCode`}
                    render={({ field }) => (
                        <FormItem className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200">
                            <FormLabel className="flex items-center gap-2 text-amber-900 font-semibold">
                                <AlertTriangle className="h-4 w-4" />
                                Ação Requerida: Selecione o Tipo de Serviço
                            </FormLabel>
                            <Select onValueChange={(value) => form.setValue(`selectedCnaes.${index}.nbsCode`, value)} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Defina a tributação deste CNAE..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {nbsOptions.map((opt) => (
                                        <SelectItem key={`${opt.cnae}-${opt.nbs}`} value={opt.nbs}>
                                            {`${opt.nbsDescription}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription className="text-amber-800 text-xs">
                                Esta atividade requer uma seleção para determinar as reduções de impostos.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            );
        }
        
        if (selectedNbsOption) {
            return (
                <div className="mt-4">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-900 text-sm w-full">
                                    <div className="flex items-center font-semibold mb-1">
                                        <BadgeCheck className="h-4 w-4 mr-2 shrink-0"/>
                                        <span>Tributação de IVA (Auto-Aplicada)</span>
                                    </div>
                                    <p className="font-normal text-xs pl-6">{selectedNbsOption.nbsDescription}</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-center bg-foreground text-background">
                                <p>Este benefício fiscal foi aplicado automaticamente com base na classificação do seu CNAE, garantindo conformidade e o cálculo correto dos impostos.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-4 border rounded-lg bg-card/60 relative space-y-4">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onRemove}
            >
                <X className="h-4 w-4" />
            </Button>
            
            <div>
              <p className="font-bold text-primary pr-8">{cnaeData.code}</p>
              <p className="text-sm text-muted-foreground">{cnaeData.description}</p>
            </div>
            
            {isPostReforma && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ivaReduction.reducaoIBS > 0 && (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80">
                              Redução IBS: {ivaReduction.reducaoIBS}%
                          </Badge>
                      )}
                      {ivaReduction.reducaoCBS > 0 && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80">
                              Redução CBS: {ivaReduction.reducaoCBS}%
                          </Badge>
                      )}
                      {ivaReduction.reducaoIBS === 0 && ivaReduction.reducaoCBS === 0 && (
                           <Badge variant="secondary">
                              Sem redução de IBS/CBS
                          </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-foreground text-background">
                    <p>As reduções de IBS e CBS são definidas por lei com base na classificação NBS do seu serviço.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {renderNbsContent()}

            <div className="grid grid-cols-2 gap-4 pt-2">
                <FormField
                    control={form.control}
                    name={`selectedCnaes.${index}.domesticRevenue`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Receita Nacional</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    customInput={Input}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    decimalScale={2}
                                    fixedDecimalScale
                                    value={field.value || ''}
                                    onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                    placeholder="R$ 0,00"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`selectedCnaes.${index}.exportRevenue`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Receita Exportação</FormLabel>
                            <FormControl>
                                 <NumericFormat
                                    customInput={Input}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix={form.watch('exportCurrency') === 'USD' ? '$ ' : form.watch('exportCurrency') === 'EUR' ? '€ ' : 'R$ '}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    value={field.value || ''}
                                    onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                    placeholder="0,00"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}


// ======================================================================================
// 2. FormSectionRevenueAndCnae: Componente Principal
// ======================================================================================

interface FormSectionRevenueAndCnaeProps {
    year: number;
    onCnaeSelectorOpen: () => void;
}

export function FormSectionRevenueAndCnae({ year, onCnaeSelectorOpen }: FormSectionRevenueAndCnaeProps) {
    const form = useFormContext();
    const { fields, remove } = useFieldArray({
      control: form.control,
      name: "selectedCnaes",
    });

    const selectedCnaes = form.watch('selectedCnaes') as CnaeSelection[];

    const totalDomesticRevenue = (selectedCnaes || []).reduce((sum, cnae) => sum + (cnae.domesticRevenue || 0), 0);
    const totalExportRevenue = (selectedCnaes || []).reduce((sum, cnae) => sum + (cnae.exportRevenue || 0), 0);

    return (
        <div className="space-y-8">
            <Card className='shadow-lg overflow-hidden border bg-card'>
                <CardHeader className='border-b bg-muted/30'>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <BarChart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Atividades e Faturamento Mensal</CardTitle>
                            <CardDescription>Selecione as atividades e informe a receita correspondente a cada uma.</CardDescription>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fields.map((cnaeItem, index) => (
                                    <CnaeActivityCard
                                        key={cnaeItem.id}
                                        index={index}
                                        year={year}
                                        onRemove={() => remove(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <FormField control={form.control} name="selectedCnaes" render={({ fieldState }) => (
                        fieldState.error ? <p className="text-sm font-medium text-destructive text-center">{fieldState.error.message}</p> : null
                    )} />

                    {fields.length > 0 && (
                        <>
                         <div className="!mt-8">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><DollarSign className="h-5 w-5"/>Resumo do Faturamento Mensal</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                        <p className="text-xs font-semibold text-muted-foreground">Receita Nacional</p>
                                        <p className="text-lg font-bold text-foreground">
                                             <NumericFormat value={totalDomesticRevenue} displayType="text" thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale />
                                        </p>
                                    </div>
                                     <div className="p-3 rounded-lg bg-muted/50 border">
                                        <p className="text-xs font-semibold text-muted-foreground">Receita Exportação</p>
                                        <p className="text-lg font-bold text-foreground">
                                             <NumericFormat value={totalExportRevenue} displayType="text" thousandSeparator="." decimalSeparator="," prefix={form.watch('exportCurrency') === 'USD' ? '$ ' : form.watch('exportCurrency') === 'EUR' ? '€ ' : 'R$ '} decimalScale={2} fixedDecimalScale />
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                        <FormLabel>Moeda Exportação</FormLabel>
                                        <Select value={form.watch('exportCurrency')} onValueChange={(value) => form.setValue('exportCurrency', value, {shouldValidate: true})}>
                                            <SelectTrigger className="h-9 mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BRL">BRL</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
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
                            )}/>
                        </>
                    )}
                </CardContent>
            </Card>
            
            {fields && fields.length > 0 && year >= 2026 && (
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
                                            value={[field.value ?? 50]}
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
                                const inputRef = useRef<HTMLInputElement>(null);
                                return (
                                    <FormItem>
                                        <FormLabel>Despesas que Geram Crédito de IVA</FormLabel>
                                            <FormControl>
                                            <NumericFormat
                                                customInput={Input}
                                                getInputRef={inputRef}
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
                                                onFocus={() => inputRef.current?.select()}
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
        </div>
    );
}
    

    
    