"use client";

import { useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from "react-hook-form";
import { Users, Wallet, Plus, Minus, Info } from 'lucide-react';
import { getFiscalParameters } from '@/config/fiscal';
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from './ui/switch';
import type { CalculatorFormValues } from './tax-calculator-form';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { NumericFormat } from 'react-number-format';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';

// Alterado o tipo para number para aceitar anos futuros (2027, 2028...)
export function FormSectionPayroll({ year }: { year: number }) {
    const form = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    
    // --- FIX: LÓGICA DE ANO BASE ---
    // Se o ano for 2026 ou maior (ex: 2027, 2030), usamos a base fiscal de 2026.
    // Caso contrário, usamos a base de 2025.
    const fiscalBaseYear = year >= 2026 ? 2026 : 2025;
    
    const fiscalConfig = getFiscalParameters(fiscalBaseYear);
    const MINIMUM_WAGE = fiscalConfig.salario_minimo;
    const TETO_INSS = fiscalConfig.teto_inss;
    const ALIQUOTA_INSS = fiscalConfig.aliquota_inss_prolabore;
    // -------------------------------
    
    // Cálculos para o texto informativo dinâmico
    const valorMaximoInss = TETO_INSS * ALIQUOTA_INSS;

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: "proLabores",
    });

    const numberOfPartners = form.watch("numberOfPartners");

    // Sincroniza o número de campos de pró-labore com o número de sócios
    useEffect(() => {
        const currentProLabores = form.getValues('proLabores');
        const numPartners = isNaN(numberOfPartners) ? 1 : Math.max(1, numberOfPartners);

        // Se a quantidade de sócios mudou, ajusta o array
        if (currentProLabores.length !== numPartners) {
            const newProLabores = Array.from({ length: numPartners }, (_, i) => {
                // Mantém o valor existente ou cria um novo com o MÍNIMO DO ANO CORRETO
                return currentProLabores[i] || { value: MINIMUM_WAGE, hasOtherInssContribution: false, otherContributionSalary: 0 };
            });
            replace(newProLabores);
        }
    }, [numberOfPartners, replace, form, MINIMUM_WAGE]);

    // Função de Trava: Executada quando o usuário sai do campo (onBlur)
    const handleProLaboreBlur = (index: number, currentValue: number) => {
        // Se for 0, permitimos (pois o sistema calcula a otimização automática)
        if (currentValue === 0) return;

        // Se for maior que 0 e menor que o mínimo, forçamos o mínimo
        if (currentValue < MINIMUM_WAGE) {
            form.setValue(`proLabores.${index}.value`, MINIMUM_WAGE, { shouldValidate: true });
            
            toast({
                title: "Valor Ajustado",
                description: `O pró-labore não pode ser inferior ao salário mínimo vigente (${formatCurrencyBRL(MINIMUM_WAGE)}). Ajustamos para você.`,
                variant: "default", 
            });
        }
    };

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
                
                {/* --- Alerta Informativo (Solicitado) --- */}
                <Alert className="bg-blue-50/80 border-blue-200 text-blue-900">
                    <Info className="h-5 w-5 text-blue-700" />
                    <AlertTitle className="text-blue-800 font-bold mb-2">Entenda o Pró-labore</AlertTitle>
                    <AlertDescription className="space-y-3 text-sm leading-relaxed">
                        <p>
                            Pró-labore é a sua remuneração mensal como sócio da empresa. O valor que você define gera a guia de impostos com duas cobranças principais:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>INSS:</strong> Contribuição de <strong>{(ALIQUOTA_INSS * 100).toFixed(0)}%</strong> sobre o pró-labore. O valor máximo que você paga é <strong>{formatCurrencyBRL(valorMaximoInss)}</strong> (teto da Previdência).
                            </li>
                            <li>
                                <strong>IRRF (Imposto de Renda):</strong> A cobrança de Imposto de Renda é aplicada somente para pró-labore acima de R$ 5.000,00.).
                            </li>
                        </ul>
                        <p className="text-xs font-semibold mt-2 pt-2 border-t border-blue-200">
                            * O valor mínimo permitido por lei é de 1 salário mínimo ({formatCurrencyBRL(MINIMUM_WAGE)}). Se deixar R$ 0,00, calcularemos automaticamente o melhor cenário (Fator R ou Mínimo).
                        </p>
                    </AlertDescription>
                </Alert>

                <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => {
                    const inputRef = useRef<HTMLInputElement>(null);
                    return (
                        <FormItem>
                            <FormLabel>Despesa com Salários (CLT)</FormLabel>
                            <FormControl>
                                <NumericFormat
                                    customInput={Input}
                                    getInputRef={inputRef}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    value={field.value}
                                    onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                    onFocus={() => inputRef.current?.select()}
                                    placeholder="R$ 0,00"
                                />
                            </FormControl>
                            <FormDescription>
                                Custo total mensal com funcionários (se houver).
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
                                             const inputRef = useRef<HTMLInputElement>(null);
                                            return (
                                                <FormItem>
                                                    <FormLabel>Pró-labore Mensal</FormLabel>
                                                    <FormControl>
                                                        <NumericFormat
                                                            customInput={Input}
                                                            getInputRef={inputRef}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="R$ "
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                            allowNegative={false}
                                                            value={field.value}
                                                            onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                                            onBlur={() => handleProLaboreBlur(index, field.value)} // TRAVA APLICADA AQUI
                                                            onFocus={() => inputRef.current?.select()}
                                                            placeholder={formatCurrencyBRL(MINIMUM_WAGE)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-muted-foreground">
                                                        Mínimo: {formatCurrencyBRL(MINIMUM_WAGE)}. Deixe R$ 0,00 para cálculo automático do Fator R.
                                                    </FormDescription>
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
                                                            Se já contribui como CLT em outra empresa.
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
                                                    const inputRef = useRef<HTMLInputElement>(null);
                                                    return(
                                                    <FormItem>
                                                        <FormLabel>Salário de Contribuição no outro vínculo</FormLabel>
                                                         <FormControl>
                                                            <NumericFormat
                                                                customInput={Input}
                                                                getInputRef={inputRef}
                                                                thousandSeparator="."
                                                                decimalSeparator=","
                                                                prefix="R$ "
                                                                decimalScale={2}
                                                                fixedDecimalScale
                                                                allowNegative={false}
                                                                value={field.value}
                                                                onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                                                onFocus={() => inputRef.current?.select()}
                                                                placeholder="R$ 0,00"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            Salário base no outro vínculo (teto {formatCurrencyBRL(TETO_INSS)}).
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