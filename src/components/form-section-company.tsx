
"use client";

import { useEffect } from 'react';
import { useFormContext, useFieldArray } from "react-hook-form";
import { Building2 } from 'lucide-react';
import { getFiscalParameters } from '@/config/fiscal';
import { CIDADES_ATENDIDAS } from '@/lib/cities';
import { cn, formatBRL } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from './ui/switch';
import type { CalculatorFormValues } from './tax-calculator-form';

export function FormSectionCompany({ year }: { year: 2025 | 2026 }) {
    const form = useFormContext<CalculatorFormValues>();
    const fiscalConfig = getFiscalParameters(year);
    const MINIMUM_WAGE = fiscalConfig.salario_minimo;

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: "proLabores",
    });

    const numberOfPartners = form.watch("numberOfPartners");

    useEffect(() => {
        const currentProLabores = form.getValues('proLabores');
        if (currentProLabores.length !== numberOfPartners) {
            const newProLabores = Array.from({ length: numberOfPartners }, (_, i) => {
                return currentProLabores[i] || { value: MINIMUM_WAGE, hasOtherInssContribution: false, otherContributionSalary: 0 };
            });
            replace(newProLabores);
        }
    }, [numberOfPartners, replace, form, MINIMUM_WAGE]);


    return (
        <Card className='border-none shadow-none'>
            <CardHeader className='bg-muted/40 p-4 rounded-t-lg border-b'>
                 <h3 className="font-semibold text-lg text-foreground flex items-center gap-3">
                    <div className='p-2 bg-primary/10 rounded-md border border-primary/20'>
                       <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    1. Dados da Empresa e Folha
                </h3>
                <p className='text-base text-muted-foreground mt-1'>Informações sobre seus custos com pessoal e localização.</p>
            </CardHeader>
            <CardContent className='p-4 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='space-y-6'>
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Onde sua empresa será registrada?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma cidade" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {CIDADES_ATENDIDAS.map((city) => (
                                        <SelectItem key={city} value={city}>
                                        {city}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription className='text-sm'>
                                    Informação usada para taxas e prazos de abertura.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => {
                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = e.target;
                            const digitsOnly = value.replace(/\D/g, '');
                            field.onChange(Number(digitsOnly) / 100);
                        };
                        return (
                        <FormItem>
                            <FormLabel>Despesa com Salários (CLT)</FormLabel>
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
                            <FormDescription className='text-sm'>
                                Custo total mensal com funcionários.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        );
                    }} />
                     <FormField control={form.control} name="numberOfPartners" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Sócios</FormLabel>
                            <FormControl><Input type="number" step="1" min="1" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} /></FormControl>
                             <FormDescription className='text-sm'>
                                Quantos sócios administram a empresa.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="space-y-4">
                    <FormLabel>Pró-labore e Vínculos dos Sócios</FormLabel>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {fields.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-semibold text-foreground mb-4">Sócio {index + 1}</h4>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name={`proLabores.${index}.value`}
                                        render={({ field }) => {
                                            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                const { value } = e.target;
                                                const digitsOnly = value.replace(/\D/g, '');
                                                field.onChange(Number(digitsOnly) / 100);
                                            };
                                            return (
                                                <FormItem>
                                                <FormLabel>Pró-labore Mensal</FormLabel>
                                                <FormControl>
                                                    <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder={formatBRL(MINIMUM_WAGE)}
                                                    onChange={handleChange}
                                                    onBlur={field.onBlur}
                                                    value={field.value ? formatBRL(field.value) : ''}
                                                    name={field.name}
                                                    ref={field.ref}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`proLabores.${index}.hasOtherInssContribution`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-background">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Outro vínculo INSS?</FormLabel>
                                                        <FormDescription className='text-xs'>
                                                            Se já contribui como CLT, etc.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`proLabores.${index}.otherContributionSalary`}
                                            render={({ field }) => {
                                                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const { value } = e.target;
                                                    const digitsOnly = value.replace(/\D/g, '');
                                                    field.onChange(Number(digitsOnly) / 100);
                                                };
                                                return(
                                                <FormItem className={cn(!form.watch(`proLabores.${index}.hasOtherInssContribution`) && 'invisible h-0 opacity-0 transition-all')}>
                                                    <FormLabel>Salário de Contribuição</FormLabel>
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
                                                    <FormDescription className="text-xs">
                                                        Salário base no outro vínculo (teto {formatBRL(fiscalConfig.teto_inss)}).
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                                )
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
