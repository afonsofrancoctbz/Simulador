
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { BarChartBig, Rocket, Building2, Briefcase, PlusCircle, XCircle, Users, ListChecks, Percent, AlertTriangle } from 'lucide-react';

import { getCnaeData } from '@/lib/cnae-helpers';
import { type Annex, ProLaboreFormSchema, PlanEnumSchema } from '@/lib/types';
import { cn, formatCurrencyBRL, formatBRL } from "@/lib/utils";
import { getFiscalParameters } from '@/config/fiscal';
import { CIDADES_ATENDIDAS } from '@/lib/cities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

export const CalculatorFormSchema = z.object({
  city: z.string().optional().refine(val => !val || CIDADES_ATENDIDAS.includes(val), {
    message: "Por favor, selecione uma cidade válida da lista."
  }),
  selectedCnaes: z.array(z.string()).min(1, "Selecione ao menos uma atividade (CNAE)."),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  fp12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  revenues: z.record(z.string(), z.coerce.number().min(0).optional()),
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number(),
  totalSalaryExpense: z.coerce.number({ required_error: "Informe o custo com salários." }).min(0, "O valor não pode ser negativo."),
  proLabores: z.array(ProLaboreFormSchema).min(1),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive().int(),
  b2bRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
  selectedPlan: PlanEnumSchema.default('expertsEssencial'),
}).refine(data => {
    const totalRevenue = Object.values(data.revenues || {}).reduce((acc, revenue) => acc + (revenue || 0), 0);
    const totalProLabore = data.proLabores.reduce((acc, pl) => acc + (pl.value || 0), 0);
    return totalRevenue > 0 || totalProLabore > 0 || (data.rbt12 ?? 0) > 0 || data.selectedCnaes.length > 0;
}, {
    message: "Informe ao menos um valor de faturamento para calcular.",
    path: ["revenues"],
});

type CalculatorFormValues = z.infer<typeof CalculatorFormSchema>;

const planOptions = [
    { value: 'basico', title: 'Básico' },
    { value: 'padrao', title: 'Padrão' },
    { value: 'multibeneficios', title: 'Multibenefícios' },
    { value: 'expertsEssencial', title: 'Experts' },
];

interface TaxCalculatorFormProps {
    year: 2025 | 2026;
    onSubmit: (values: CalculatorFormValues) => void;
    isLoading: boolean;
    onCnaeSelectorOpen: () => void;
}

export default function TaxCalculatorForm({ year, onSubmit, isLoading, onCnaeSelectorOpen }: TaxCalculatorFormProps) {
    const form = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
    const [isFetchingRate, setIsFetchingRate] = useState(false);
    
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

    const isCommerceOnly = useMemo(() => {
        if (selectedCnaes.length === 0) return false;
        return selectedCnaes.every(code => getCnaeData(code)?.annex === 'I');
    }, [selectedCnaes]);
      
    useEffect(() => {
        if (isCommerceOnly && form.getValues('selectedPlan') === 'expertsEssencial') {
            form.setValue('selectedPlan', 'padrao');
            toast({
                title: "Plano ajustado",
                description: "O plano Experts não está disponível para atividades de comércio. Selecionamos o plano Padrão para você.",
                variant: "default",
            });
        }
    }, [isCommerceOnly, form, toast]);

    const fetchRates = async () => {
        setIsFetchingRate(true);
        try {
          const response = await fetch('/api/exchange-rate');
          if (response.ok) {
            const data = await response.json();
            setExchangeRates(data);
            const currentCurrency = form.getValues('exportCurrency');
            if (data[currentCurrency]) {
              form.setValue('exchangeRate', data[currentCurrency], { shouldValidate: true });
            }
            return data;
          }
        } catch (error) {
          console.error("Falha ao buscar taxas de câmbio", error);
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
        <form onSubmit={onSubmit} className="space-y-8 text-left">
            <Card className="shadow-xl overflow-hidden border bg-card max-w-7xl mx-auto">
                <CardContent className="p-6 md:p-8 space-y-8">
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
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                                Deixe R$ 0,00 se estiver abrindo a empresa agora.
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

                    <Card className='border-none shadow-none'>
                        <CardHeader className='bg-muted/40 p-4 rounded-t-lg border-b'>
                           <h3 className="font-semibold text-lg text-foreground flex items-center gap-3">
                                <div className='p-2 bg-primary/10 rounded-md border border-primary/20'>
                                    <ListChecks className="h-5 w-5 text-primary" />
                                </div>
                                3. Selecione o Plano Contabilizei
                            </h3>
                        </CardHeader>
                         <CardContent className='p-4 pt-6'>
                           <FormField
                              control={form.control}
                              name="selectedPlan"
                              render={({ field }) => (
                                  <FormItem>
                                       <FormLabel>Qual plano de contabilidade melhor se encaixa no seu perfil?</FormLabel>
                                      <FormControl>
                                          <RadioGroup
                                              onValueChange={field.onChange}
                                              value={field.value}
                                              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2"
                                          >
                                              {planOptions.map(plan => {
                                                  const isDisabled = plan.value === 'expertsEssencial' && isCommerceOnly;
                                                  const isExperts = plan.value === 'expertsEssencial';
                                                  return (
                                                      <FormItem key={plan.value} className="relative">
                                                          <FormControl>
                                                              <RadioGroupItem value={plan.value} id={plan.value} className="sr-only" disabled={isDisabled} />
                                                          </FormControl>
                                                          <Label
                                                              htmlFor={plan.value}
                                                              className={cn(
                                                                  "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all text-center h-full space-y-0",
                                                                  field.value === plan.value && "border-primary",
                                                                  isExperts && !isDisabled && "border-primary/70 shadow-md",
                                                                  isDisabled && "cursor-not-allowed opacity-50 bg-muted/50"
                                                              )}
                                                          >
                                                              <span className={cn(
                                                                  "font-semibold", 
                                                                  isExperts ? "font-bold text-base" : "text-sm"
                                                                )}>
                                                                  {plan.title}
                                                              </span>
                                                          </Label>
                                                      </FormItem>
                                                  );
                                              })}
                                          </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                        </CardContent>
                    </Card>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t p-6">
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      {isLoading ? "Analisando..." : "Analisar e Otimizar Impostos"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

    