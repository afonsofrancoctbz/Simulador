"use client";

import { useEffect, useState, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Bot, BarChartBig, Rocket, Building2, Loader2, Lightbulb, TrendingUp, Trash2, PlusCircle, Check, ChevronsUpDown, RefreshCw, AlertCircle, HeartPulse } from 'lucide-react';

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { calculateTaxes } from '@/lib/calculations';
import { type CalculationResults, type CnaeItem, type TaxFormValues } from '@/lib/types';
import { MINIMUM_WAGE, CNAE_DATA } from '@/lib/constants';
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrencyBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formSchema = z.object({
  domesticActivities: z.array(z.object({
    code: z.string().min(1, "Selecione um CNAE."),
    revenue: z.coerce.number().min(0, "O valor deve ser positivo."),
  })),
  exportActivities: z.array(z.object({
    code: z.string().min(1, "Selecione um CNAE."),
    revenue: z.coerce.number().min(0, "O valor deve ser positivo."),
  })),
  exportCurrency: z.string().default('BRL'),
  exchangeRate: z.coerce.number().optional(),
  totalSalaryExpense: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo."),
  proLaborePartners: z.coerce.number({ required_error: "Campo obrigatório" }).min(MINIMUM_WAGE, `O valor deve ser no mínimo ${formatCurrencyBRL(MINIMUM_WAGE)}.`),
  numberOfPartners: z.coerce.number({ required_error: "Campo obrigatório" }).int("Deve ser um número inteiro.").min(1, "Mínimo de 1 sócio."),
  municipalISSRate: z.coerce.number({ required_error: "Campo obrigatório" }).min(2, "A alíquota mínima é 2%.").max(5, "A alíquota máxima é 5%."),
  healthPlanCost: z.coerce.number().min(0, "O valor deve ser positivo.").optional(),
}).refine(data => {
    if (data.domesticActivities.length === 0 && data.exportActivities.length === 0) {
        return false;
    }
    return true;
}, {
    message: "Adicione pelo menos uma atividade de faturamento.",
    path: ["domesticActivities"],
}).refine(data => {
    if (data.exportCurrency !== 'BRL' && data.exportActivities.length > 0) {
        return data.exchangeRate && data.exchangeRate > 0;
    }
    return true;
}, {
    message: "A taxa de câmbio é obrigatória para faturamento em moeda estrangeira.",
    path: ["exchangeRate"],
});

export default function TaxCalculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domesticActivities: [{ code: '6201-5/01', revenue: 10000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      totalSalaryExpense: 1500,
      proLaborePartners: MINIMUM_WAGE,
      numberOfPartners: 1,
      municipalISSRate: 2,
      healthPlanCost: 0,
    },
  });

  const { fields: domesticFields, append: appendDomestic, remove: removeDomestic } = useFieldArray({
    control: form.control,
    name: "domesticActivities"
  });
  
  const { fields: exportFields, append: appendExport, remove: removeExport } = useFieldArray({
    control: form.control,
    name: "exportActivities"
  });

  const exportCurrency = form.watch("exportCurrency");

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
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults(null);
    setAdvice(null);

    const submissionValues: TaxFormValues = {
        ...values,
        exchangeRate: values.exportCurrency !== 'BRL' && values.exportActivities.length > 0 ? values.exchangeRate! : 1,
    };

    const calculatedResults = calculateTaxes(submissionValues);
    setResults(calculatedResults);
    setIsLoading(false);
    
    setIsAdviceLoading(true);
    try {
        const totalDomesticRevenue = values.domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
        let totalExportRevenue = values.exportActivities.reduce((acc, act) => acc + act.revenue, 0);
        if (values.exportCurrency !== 'BRL' && values.exchangeRate) {
            totalExportRevenue *= values.exchangeRate;
        }

        const activitiesSummary = [...values.domesticActivities, ...values.exportActivities]
            .map(a => `${a.code} (R$ ${a.revenue.toFixed(2)})`)
            .join(', ');
      
      const simplesTax = calculatedResults.simplesNacional.totalTax;

      const aiInput: TaxOptimizationInput = {
        activities: activitiesSummary,
        totalDomesticRevenue,
        totalExportRevenue,
        totalSalaryExpense: values.totalSalaryExpense,
        proLaborePartners: values.proLaborePartners,
        numberOfPartners: values.numberOfPartners,
        municipalISSRate: values.municipalISSRate,
        simplesNacionalTaxBurden: simplesTax,
        lucroPresumidoTaxBurden: calculatedResults.lucroPresumido.totalTax,
        healthPlanCost: values.healthPlanCost ?? 0,
      };
      const aiResult = await getTaxOptimizationAdvice(aiInput);
      setAdvice(aiResult.advice);
    } catch (error) {
      console.error("Error fetching AI advice:", error);
      setAdvice("Não foi possível obter a recomendação da IA no momento.");
    } finally {
      setIsAdviceLoading(false);
    }
  }

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 w-full max-w-6xl">
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
      );
    }

    if (!results) {
      return null;
    }

    const simplesIsCheaper = results.simplesNacional.totalMonthlyCost <= results.lucroPresumido.totalMonthlyCost;
    const cheapestRegime = simplesIsCheaper ? 'Simples Nacional' : 'Lucro Presumido';

    return (
      <div className="mt-12 w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8">Resultados da Análise</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResultCard regime="Simples Nacional" details={results.simplesNacional} isCheapest={cheapestRegime === 'Simples Nacional'} />
          <ResultCard regime="Lucro Presumido" details={results.lucroPresumido} isCheapest={cheapestRegime === 'Lucro Presumido'} />
        </div>
        
        <Card className="mt-8 border-primary/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Lightbulb />
              Recomendação da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAdviceLoading ? <Skeleton className="h-12 w-full" /> : <p className="text-foreground/90 font-medium text-lg">{advice}</p>}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-12">
            <div className="inline-block bg-primary/10 p-3 rounded-lg mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">Simulador Tributário Inteligente</h1>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">Análise Comparativa de Regimes Tributários com IA para otimizar suas finanças.</p>
        </header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="shadow-lg lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3"><Building2 className="text-primary" />Dados da Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Despesa com Salários (CLT)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="R$ 1.500,00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="proLaborePartners" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pró-labore Total dos Sócios</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder={formatCurrencyBRL(MINIMUM_WAGE)} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="healthPlanCost" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plano de Saúde (Pago pela Empresa)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="numberOfPartners" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Sócios</FormLabel>
                                <FormControl><Input type="number" step="1" placeholder="1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="municipalISSRate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alíquota de ISS Municipal (%)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="2 a 5" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-3"><BarChartBig className="text-primary" />Receitas Nacionais</CardTitle>
                            <CardDescription>Adicione as atividades que geram faturamento no Brasil.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {domesticFields.map((field, index) => (
                                <ActivityField key={field.id} form={form} fieldName="domesticActivities" index={index} removeFn={removeDomestic} />
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendDomestic({ code: '', revenue: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade Nacional
                            </Button>
                            <FormMessage>{form.formState.errors.domesticActivities?.root?.message}</FormMessage>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-3"><Rocket className="text-primary" />Receitas de Exportação</CardTitle>
                            <CardDescription>Adicione as atividades de exportação de serviços ou produtos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="exportCurrency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Moeda do Faturamento</FormLabel>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                if (value !== 'BRL' && exchangeRates[value]) {
                                                    form.setValue('exchangeRate', exchangeRates[value], { shouldValidate: true });
                                                } else if (value === 'BRL') {
                                                    form.setValue('exchangeRate', undefined);
                                                }
                                            }} 
                                            defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a moeda" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="BRL">Real (BRL)</SelectItem>
                                                <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {exportCurrency !== 'BRL' && exportFields.length > 0 && (
                                    <FormField control={form.control} name="exchangeRate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taxa de Câmbio ({exportCurrency} para BRL)</FormLabel>
                                            <div className="relative flex items-center">
                                                <FormControl>
                                                    <Input type="number" step="0.0001" placeholder={isFetchingRate ? "Buscando..." : "Cotação atual"} {...field} value={field.value ?? ''} disabled={isFetchingRate} className="pr-10" />
                                                </FormControl>
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-0 h-10 w-10 text-muted-foreground" onClick={fetchRates} disabled={isFetchingRate} aria-label="Atualizar cotação">
                                                    <RefreshCw className={cn("h-4 w-4", isFetchingRate && "animate-spin")} />
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                            </div>
                            {exportFields.map((field, index) => (
                                <ActivityField key={field.id} form={form} fieldName="exportActivities" index={index} removeFn={removeExport} isExport exportCurrency={exportCurrency} />
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendExport({ code: '', revenue: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade de Exportação
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button type="submit" size="lg" disabled={isLoading} className="w-full max-w-md">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Analisar e Otimizar Impostos
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {renderResults()}
       <footer className="py-6 mt-12 text-center text-sm text-muted-foreground">
        <p>IntelliTax © {new Date().getFullYear()}.</p>
        <p className="text-xs mt-2">Aviso: Esta ferramenta destina-se apenas a fins de estimativa. Consulte um contador para aconselhamento preciso.</p>
      </footer>
    </>
  );
}

const ActivityField = ({ form, fieldName, index, removeFn, isExport = false, exportCurrency = 'BRL' }: { form: any, fieldName: "domesticActivities" | "exportActivities", index: number, removeFn: (index: number) => void, isExport?: boolean, exportCurrency?: string }) => {
  const currencySymbols: { [key: string]: string } = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
  const placeholderText = isExport ? `${currencySymbols[exportCurrency] ?? 'R$'} 1.000,00` : "R$ 10.000,00";

  const cnaeCode = form.watch(`${fieldName}.${index}.code`);
  const selectedCnaeData = useMemo(() => CNAE_DATA.find((cnae) => cnae.code === cnaeCode), [cnaeCode]);

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-background/50">
      <div className="flex flex-col sm:flex-row items-end gap-2">
          <FormField control={form.control} name={`${fieldName}.${index}.code`} render={({ field }) => (
              <FormItem className="flex-1 w-full">
                  <FormLabel>CNAE</FormLabel>
                  <CnaeCombobox value={field.value} onChange={field.onChange} />
                  <FormMessage />
              </FormItem>
          )} />
          <FormField control={form.control} name={`${fieldName}.${index}.revenue`} render={({ field }) => (
              <FormItem className="flex-1 w-full sm:w-auto">
                  <FormLabel>Faturamento Mensal</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder={placeholderText} {...field} /></FormControl>
                  <FormMessage />
              </FormItem>
          )} />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeFn(index)} className="shrink-0 mb-1">
              <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
      </div>
      {selectedCnaeData?.notes && (
        <Alert variant="default" className="bg-yellow-900/20 border-yellow-700/50 text-yellow-300 mt-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="font-semibold text-yellow-400">Ponto de Atenção</AlertTitle>
            <AlertDescription className="text-yellow-400/90">{selectedCnaeData.notes}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const CnaeCombobox = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-muted-foreground font-normal">
            {value ? CNAE_DATA.find((cnae) => cnae.code === value)?.code : "Selecione o CNAE..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
          <Command>
            <CommandInput placeholder="Buscar CNAE por código ou descrição..." />
            <CommandList>
                <CommandEmpty>Nenhum CNAE encontrado.</CommandEmpty>
                <CommandGroup>
                {CNAE_DATA.map((cnae) => (
                    <CommandItem key={cnae.code} value={`${cnae.code} - ${cnae.description}`} onSelect={() => { onChange(cnae.code); setOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", value === cnae.code ? "opacity-100" : "opacity-0")} />
                        <div>
                            <p className="font-semibold">{cnae.code}</p>
                            <p className="text-xs text-muted-foreground">{cnae.description}</p>
                        </div>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
};

const ResultCard = ({ regime, details, isCheapest }: { regime: string, details: CalculationResults['simplesNacional'], isCheapest: boolean }) => (
    <Card className={cn("flex flex-col", isCheapest ? 'border-accent shadow-accent/20 shadow-lg' : 'border-border')}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          {regime}
          {isCheapest && <Badge variant="default" className="bg-accent text-accent-foreground">Mais Vantajoso</Badge>}
        </CardTitle>
        <CardDescription>Custo total mensal estimado</CardDescription>
        <p className="text-4xl font-bold text-primary">{formatCurrencyBRL(details.totalMonthlyCost)}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="font-semibold mb-2 text-foreground/90">Detalhamento dos Impostos:</h4>
        <div className="space-y-2">
            {details.breakdown.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm p-2 rounded-md bg-card-foreground/5">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-mono font-medium">{formatCurrencyBRL(item.value)}</span>
              </div>
            ))}
        </div>
      </CardContent>
      {details.notes && details.notes.length > 0 && (
          <CardFooter>
            <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary-foreground/80 w-full">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary/90">Observações Importantes</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                        {details.notes.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>
          </CardFooter>
      )}
    </Card>
);
