

"use client";

import { useEffect } from 'react';
import { useFormContext, useFieldArray } from "react-hook-form";
import { Users, Wallet, Plus, Minus } from 'lucide-react';
import { getFiscalParameters } from '@/config/fiscal';
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from './ui/switch';
import type { CalculatorFormValues } from './tax-calculator-form';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function FormSectionPayroll({ year }: { year: 2025 | 2026 }) {
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
        const numPartners = isNaN(numberOfPartners) ? 1 : Math.max(1, numberOfPartners);

        if (currentProLabores.length !== numPartners) {
            const newProLabores = Array.from({ length: numPartners }, (_, i) => {
                return currentProLabores[i] || { value: MINIMUM_WAGE, hasOtherInssContribution: false, otherContributionSalary: 0 };
            });
            replace(newProLabores);
        }
    }, [numberOfPartners, replace, form, MINIMUM_WAGE]);


    return (
        <Card className='shadow-lg overflow-hidden border bg-card'>
            <CardHeader className='border-b bg-muted/30'>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Folha e Sócios</CardTitle>
                        <CardDescription>Informações sobre sua folha de pagamento e sócios.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6 md:p-8 space-y-8'>
                <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => {
                    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const { value } = e.target;
                        const digitsOnly = value.replace(/\D/g, '');
                        field.onChange(Number(digitsOnly) / 100);
                    };
                    return (
                    <FormItem>
                        <FormLabel>Despesa com Salários (CLT)</FormLabel>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                            <FormControl>
                                <Input 
                                    type="text" 
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    onChange={handleChange}
                                    onBlur={field.onBlur}
                                    value={field.value ? formatCurrencyBRL(field.value) : ''}
                                    name={field.name}
                                    ref={field.ref}
                                    className="pl-9"
                                />
                            </FormControl>
                        </div>
                            <FormDescription>
                            Custo total mensal com funcionários.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    );
                }} />

                 <Separator />
                 
                 <div className="space-y-6">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 items-center'>
                         <div>
                            <h4 className="font-semibold text-lg text-foreground flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary"/>
                                Quadro Societário
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">Configure o pró-labore e os vínculos de cada sócio.</p>
                        </div>
                        <FormField control={form.control} name="numberOfPartners" render={({ field }) => (
                            <FormItem className="w-full sm:w-auto sm:justify-self-end">
                                <FormLabel>Número de Sócios</FormLabel>
                                <div className="flex items-center gap-2">
                                     <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))} disabled={field.value <= 1}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <FormControl>
                                        <Input type="number" className="w-20 text-center" step="1" min="1" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} />
                                    </FormControl>
                                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => field.onChange((field.value || 0) + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 -mr-2">
                        {fields.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-lg bg-muted/20">
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
                                                <div className="relative">
                                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <FormControl>
                                                        <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder={formatCurrencyBRL(MINIMUM_WAGE)}
                                                        onChange={handleChange}
                                                        onBlur={field.onBlur}
                                                        value={field.value ? formatCurrencyBRL(field.value) : ''}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        className="pl-9"
                                                        />
                                                    </FormControl>
                                                </div>
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
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-background shadow-sm">
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
                                        <div className={cn("space-y-2 transition-all duration-300", !form.watch(`proLabores.${index}.hasOtherInssContribution`) ? 'h-0 opacity-0 invisible' : 'h-auto opacity-100 visible' )}>
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
                                                    <FormItem>
                                                        <FormLabel>Salário de Contribuição no outro vínculo</FormLabel>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                            <FormControl>
                                                                <Input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    placeholder="0,00"
                                                                    onChange={handleChange}
                                                                    onBlur={field.onBlur}
                                                                    value={field.value ? formatCurrencyBRL(field.value) : ''}
                                                                    name={field.name}
                                                                    ref={field.ref}
                                                                    className="pl-9"
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormDescription className="text-xs">
                                                            Salário base no outro vínculo (teto {formatCurrencyBRL(fiscalConfig.teto_inss)}).
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )
                                                }}
                                            />
                                        </div>
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

    

    