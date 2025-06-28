"use client";

import { useEffect, useState, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { BarChartBig, Rocket, Building2, Loader2, Lightbulb, TrendingUp, Trash2, PlusCircle, RefreshCw, AlertCircle, Calculator, Info, BadgeCheck, Coins, Briefcase } from 'lucide-react';

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { calculateTaxes } from '@/lib/calculations';
import { type CalculationResults, type CnaeItem, type TaxFormValues, type TaxDetails } from '@/lib/types';
import { MINIMUM_WAGE, CNAE_DATA } from '@/lib/constants';
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CnaeSelector } from './cnae-selector';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

const formatCurrencyBRL = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`.replace('.', ',');
}

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
  const [cnaeSelectorState, setCnaeSelectorState] = useState({ open: false, target: 'domestic' as 'domestic' | 'export' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domesticActivities: [{ code: '7020-4/00', revenue: 15000 }], // Default to consultancy
      exportActivities: [],
      exportCurrency: 'BRL',
      totalSalaryExpense: 0,
      proLaborePartners: MINIMUM_WAGE,
      numberOfPartners: 1,
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

  const handleAddActivities = (codes: string[]) => {
    const targetFunction = cnaeSelectorState.target === 'domestic' ? appendDomestic : appendExport;
    codes.forEach(code => {
      targetFunction({ code: code, revenue: 0 });
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults(null);
    setAdvice(null);
    
    // Scroll to results section smoothly
    setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);

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
      
      const aiInput: TaxOptimizationInput = {
        activities: activitiesSummary,
        totalDomesticRevenue,
        totalExportRevenue,
        totalSalaryExpense: values.totalSalaryExpense,
        proLaborePartners: values.proLaborePartners,
        numberOfPartners: values.numberOfPartners,
        simplesNacionalSemFatorRBurden: calculatedResults.simplesNacionalSemFatorR.totalMonthlyCost,
        simplesNacionalComFatorRBurden: calculatedResults.simplesNacionalComFatorR.totalMonthlyCost,
        lucroPresumidoTaxBurden: calculatedResults.lucroPresumido.totalMonthlyCost,
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
        <div id="results-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 w-full">
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
      );
    }

    if (!results) {
      return null;
    }

    const allScenarios = [
        results.lucroPresumido,
        results.simplesNacionalSemFatorR,
        results.simplesNacionalComFatorR
    ];

    const uniqueScenarios = allScenarios.filter((scenario, index, self) =>
        index === self.findIndex((s) => (
            s.regime === scenario.regime && s.totalMonthlyCost === scenario.totalMonthlyCost
        ))
    );

    const sortedScenarios = uniqueScenarios.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);
    const cheapestScenario = sortedScenarios[0];

    const intelligentAlerts: {type: 'warning' | 'info' | 'success', title: string, description: string}[] = [];
    const fatorR = results.simplesNacionalSemFatorR.fatorR;
    if (fatorR !== undefined && fatorR < 0.28) {
      const requiredProLabore = (results.simplesNacionalSemFatorR.totalRevenue * 0.28 - (form.getValues('totalSalaryExpense') * 1.08));
      intelligentAlerts.push({
        type: 'warning',
        title: 'Pró-labore pode ser otimizado',
        description: `Seu Fator R está abaixo de 28%. Aumentando seu pró-labore para aproximadamente ${formatCurrencyBRL(Math.max(requiredProLabore, MINIMUM_WAGE))}, você pode reduzir sua alíquota no Simples Nacional.`
      });
    }

    const totalRevenue = results.lucroPresumido.totalRevenue;
    if (totalRevenue > 150000 && cheapestScenario.regime.includes('Simples')) {
      intelligentAlerts.push({
        type: 'info',
        title: 'Considere o Lucro Presumido',
        description: 'Para este nível de faturamento, o regime de Lucro Presumido pode se tornar mais vantajoso. Analise os cenários com atenção.'
      });
    }

    return (
        <div id="results-section" className="mt-12 w-full">
            <h2 className="text-3xl font-bold text-center mb-4">Resultados da Análise</h2>

            {intelligentAlerts.length > 0 && (
                <div className="space-y-4 mb-8">
                    {intelligentAlerts.map((alert, index) => (
                        <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'} className={cn(
                            alert.type === 'warning' && 'bg-amber-100 border-amber-300 text-amber-800 [&>svg]:text-amber-600',
                            alert.type === 'info' && 'bg-blue-100 border-blue-300 text-blue-800 [&>svg]:text-blue-600'
                        )}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">{alert.title}</AlertTitle>
                            <AlertDescription>{alert.description}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            <Card className="mb-8 border-primary/50 bg-card shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                        <Lightbulb />
                        Recomendação da IA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isAdviceLoading ? <Skeleton className="h-12 w-full" /> : <p className="text-foreground/90 font-medium text-lg font-serif">{advice}</p>}
                </CardContent>
            </Card>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sortedScenarios.length > 2 ? '3' : '2'} gap-8`}>
                {sortedScenarios.map(scenario => (
                     <ResultCard 
                        key={scenario.regime} 
                        details={scenario} 
                        isCheapest={scenario.regime === cheapestScenario.regime && sortedScenarios.length > 1}
                    />
                ))}
            </div>
      </div>
    );
  };
  
  return (
    <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-2xl">Perfil da Empresa</CardTitle>
                    <CardDescription>
                        Com essas informações, calcularemos o regime tributário ideal para o seu negócio.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coluna da Esquerda */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2 border-b pb-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Dados da Empresa
                            </h3>
                            <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Despesa com Salários (CLT)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} /></FormControl>
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
                            <FormField control={form.control} name="numberOfPartners" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Sócios</FormLabel>
                                    <FormControl><Input type="number" step="1" placeholder="1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* Coluna da Direita */}
                        <div className="lg:col-span-2 space-y-6">
                             <h3 className="font-semibold text-lg text-foreground flex items-center gap-2 border-b pb-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Atividades e Faturamento
                            </h3>
                           
                            {/* Receitas Nacionais */}
                            <div>
                                <h4 className="font-medium text-md text-foreground mb-3 flex items-center gap-2"><BarChartBig className="h-5 w-5 text-primary/80" />Receitas Nacionais</h4>
                                {domesticFields.map((field, index) => (
                                    <ActivityField key={field.id} form={form} fieldName="domesticActivities" index={index} removeFn={removeDomestic} />
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setCnaeSelectorState({ open: true, target: 'domestic' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade Nacional
                                </Button>
                                <FormMessage>{form.formState.errors.domesticActivities?.root?.message}</FormMessage>
                            </div>
                            
                            <Separator />

                            {/* Receitas de Exportação */}
                            <div>
                                <h4 className="font-medium text-md text-foreground mb-3 flex items-center gap-2"><Rocket className="h-5 w-5 text-primary/80" />Receitas de Exportação</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <FormField control={form.control} name="exportCurrency" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moeda</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                            <FormItem>
                                                <FormLabel>Taxa de Câmbio ({exportCurrency})</FormLabel>
                                                <div className="relative">
                                                    <FormControl><Input type="number" step="0.0001" {...field} value={field.value ?? ''} disabled={isFetchingRate} /></FormControl>
                                                     <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-muted-foreground" onClick={fetchRates} disabled={isFetchingRate}>
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
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setCnaeSelectorState({ open: true, target: 'export' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade de Exportação
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t p-6">
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto ml-auto bg-primary text-primary-foreground hover:bg-primary/90">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                      Analisar e Otimizar Impostos
                    </Button>
                </CardFooter>
            </Card>
            </form>
        </Form>
      
      <CnaeSelector
        open={cnaeSelectorState.open}
        onOpenChange={(open) => setCnaeSelectorState(s => ({ ...s, open }))}
        onConfirm={handleAddActivities}
      />

      {renderResults()}
    </div>
  );
}

const ActivityField = ({ form, fieldName, index, removeFn, isExport = false, exportCurrency = 'BRL' }: { form: any, fieldName: "domesticActivities" | "exportActivities", index: number, removeFn: (index: number) => void, isExport?: boolean, exportCurrency?: string }) => {
  const currencySymbols: { [key: string]: string } = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
  const placeholderText = isExport ? `${currencySymbols[exportCurrency] ?? 'R$'} 1.000,00` : "R$ 10.000,00";

  const cnaeCode = form.watch(`${fieldName}.${index}.code`);
  const selectedCnaeData = useMemo(() => CNAE_DATA.find((cnae) => cnae.code === cnaeCode), [cnaeCode]);

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-background/50 mb-2">
      <div className="flex flex-col sm:flex-row items-end gap-2">
          <div className="flex-1 w-full space-y-2">
              <Label>CNAE</Label>
              <div className="w-full justify-start text-left font-normal h-auto min-h-10 py-2 px-3 border rounded-md bg-muted/30">
                  {selectedCnaeData ? (
                      <div className="flex w-full flex-col items-start text-sm">
                          <span className="font-medium text-foreground">{selectedCnaeData.code}</span>
                          <span className="text-muted-foreground whitespace-normal">{selectedCnaeData.description}</span>
                      </div>
                  ) : (
                      <span className="text-destructive">CNAE não encontrado. Por favor, remova e adicione novamente.</span>
                  )}
              </div>
          </div>
          <FormField control={form.control} name={`${fieldName}.${index}.revenue`} render={({ field }) => (
              <FormItem className="w-full sm:w-48">
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
        <Alert variant="default" className="bg-amber-100 border-amber-300 text-amber-800 mt-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-semibold text-amber-700">Ponto de Atenção</AlertTitle>
            <AlertDescription className="text-amber-700/90 font-serif">{selectedCnaeData.notes}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const ResultCard = ({ details, isCheapest }: { details: TaxDetails, isCheapest: boolean }) => {
    const hasFatorR = details.fatorR !== undefined;

    return (
        <Card className={cn("flex flex-col shadow-lg transition-all duration-300 relative", isCheapest ? 'border-2 border-accent shadow-accent/20' : 'border-border')}>
            {isCheapest && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-bold text-sm px-3 py-1">🏆 MELHOR OPÇÃO</Badge>}
            
            <CardHeader className={cn(isCheapest ? 'bg-accent/10' : 'bg-muted/30', 'pt-8 pb-4')}>
                <CardTitle className="text-2xl text-center font-bold text-primary">{details.regime}</CardTitle>
                {details.annex && <CardDescription className='text-center font-semibold'>{details.annex}</CardDescription>}
            </CardHeader>

            <CardContent className="flex-grow p-4 space-y-4 flex flex-col">
                <div className="text-center">
                    <span className="text-2xl text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold text-foreground">{Math.floor(details.totalMonthlyCost).toLocaleString('pt-BR')}</span>
                    <span className="text-2xl text-muted-foreground">/mês</span>
                </div>
                
                <div className="bg-primary/5 rounded-md p-4 space-y-2 flex-grow font-serif">
                    {details.breakdown.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-mono font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                        </div>
                    ))}
                    <div className="border-t border-border/50 my-2 !mt-3 !mb-2"></div>
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-foreground">Total mensal</span>
                        <span className="font-mono text-foreground">{formatCurrencyBRL(details.totalMonthlyCost)}</span>
                    </div>
                </div>
                
                {hasFatorR && (
                    <div className={cn(
                        "text-center rounded-md p-2 mt-2", 
                        details.fatorR! >= 0.28 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                    )}>
                        <span className="font-semibold">Fator R: {formatPercent(details.fatorR!)}</span>
                        <p className="text-xs">{details.fatorR! >= 0.28 ? '✅ Alíquota reduzida aplicada' : '⚠️ Considere aumentar para otimizar'}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex-col items-center gap-2 p-4 border-t bg-muted/20 rounded-b-lg">
                {details.annualSavings && details.annualSavings > 0 && (
                <div className="font-bold text-lg text-green-700">
                    💰 Economia anual: {formatCurrencyBRL(details.annualSavings)}
                </div>
                )}
                <div className="w-full text-center text-xs text-muted-foreground mt-1 font-serif">
                Alíquota Efetiva: <span className="font-semibold text-foreground">{formatPercent(details.effectiveRate)}</span>
                </div>
            </CardFooter>
        </Card>
    );
};
