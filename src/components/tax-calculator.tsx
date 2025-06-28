
"use client";

import { useEffect, useState, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { BarChartBig, Rocket, Building2, Loader2, Lightbulb, TrendingUp, RefreshCw, AlertCircle, Briefcase, PlusCircle } from 'lucide-react';

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { getCnaeData } from '@/lib/calculations';
import { type CalculationResults, type TaxFormValues, TaxFormValuesSchema } from '@/lib/types';
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { getFiscalParameters } from '@/config/fiscal';
import { calculateTaxesOnServer } from '@/ai/flows/calculate-taxes-flow';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CnaeSelector } from './cnae-selector';
import { Separator } from './ui/separator';
import { ResultCard } from './result-card';
import { ActivityField } from './activity-field';


const fiscalConfig = getFiscalParameters();
const MINIMUM_WAGE = fiscalConfig.salario_minimo;

const formSchema = TaxFormValuesSchema.superRefine((data, ctx) => {
    const proLaborePerSocio = data.proLaborePerPartner;
    if (proLaborePerSocio > 0 && proLaborePerSocio < MINIMUM_WAGE) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `O pró-labore por sócio não pode ser inferior a ${formatCurrencyBRL(MINIMUM_WAGE)}.`,
            path: ["proLaborePerPartner"],
        });
    }
}).refine(data => {
    const totalRevenue = data.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + data.exportActivities.reduce((acc, act) => acc + act.revenue, 0);
    return totalRevenue > 0 || (data.proLaborePerPartner > 0);
}, {
    message: "Informe ao menos um valor de faturamento ou pró-labore.",
    path: ["domesticActivities"],
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
      domesticActivities: [{ code: '7020-4/00', revenue: 15000 }],
      exportActivities: [],
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLaborePerPartner: MINIMUM_WAGE,
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
    
    setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);

    const submissionValues: TaxFormValues = {
        ...values,
        exchangeRate: values.exportCurrency !== 'BRL' && values.exportActivities.length > 0 ? (values.exchangeRate ?? 1) : 1,
    };

    const calculatedResults = await calculateTaxesOnServer(submissionValues);
    setResults(calculatedResults);
    setIsLoading(false);
    
    const totalRevenue = values.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + (values.exportActivities.reduce((acc, act) => acc + act.revenue, 0) * (submissionValues.exchangeRate ?? 1));
    if (totalRevenue === 0 && values.proLaborePerPartner === 0) {
      return; // No need to call AI if there's no financial activity
    }

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
        totalProLabore: values.proLaborePerPartner * values.numberOfPartners,
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

  const displayedScenarios = useMemo(() => {
    if (!results) return [];

    const { domesticActivities, exportActivities } = form.getValues();
    const allActivities = [...domesticActivities, ...exportActivities];
    
    if (allActivities.length === 0) return [];
    
    const revenueSum = allActivities.reduce((sum, act) => sum + (act.revenue || 0), 0);
    if(revenueSum === 0 && form.getValues('proLaborePerPartner') === 0) return [];

    const mainActivity = allActivities.reduce((max, act) => (act.revenue || 0) > (max.revenue || 0) ? act : max, { revenue: -1, code: '' });
    if (!mainActivity.code) return [];

    const mainCnaeInfo = getCnaeData(mainActivity.code);
    if (!mainCnaeInfo) return [];

    const scenarios = [];

    const lucroPresumidoScenario = {
        ...results.lucroPresumido,
        regime: 'Lucro Presumido',
        annex: 'Alternativa de Regime'
    };

    if (mainCnaeInfo.requiresFatorR) {
        scenarios.push({
            ...results.simplesNacionalSemFatorR,
            regime: 'Simples Nacional sem Fator R',
            annex: 'Anexo V - Sem Utilizar o Fator R'
        });

        const cenarioOtimizado = results.simplesNacionalComFatorR;
        const proLaboreOtimizado = cenarioOtimizado.proLabore;
        const optimizationNote = `Para alcançar este cenário, seu pró-labore foi recalculado para ${formatCurrencyBRL(proLaboreOtimizado / (form.getValues().numberOfPartners || 1))} por sócio, garantindo um Fator R de 28% e uma tributação mais vantajosa.`;
        
        scenarios.push({
            ...cenarioOtimizado,
            regime: 'Simples Nacional com Fator R',
            annex: 'Anexo III - Usando Fator R',
            optimizationNote: optimizationNote
        });
        
        scenarios.push(lucroPresumidoScenario);

    } else { // Annex III, IV, or others
        const mainAnnex = results.simplesNacionalSemFatorR.annex || 'Padrão';
        const situacaoAtual = {
            ...results.simplesNacionalSemFatorR,
            regime: `Simples Nacional`,
            annex: mainAnnex
        };
        scenarios.push(situacaoAtual);
        scenarios.push(lucroPresumidoScenario);
    }
    
    const sortedScenarios = scenarios.sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);
    
    return sortedScenarios;

  }, [results, form]);

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

    if (!results || displayedScenarios.length === 0) {
      return null;
    }

    const cheapestScenario = displayedScenarios[0];

    const intelligentAlerts: {type: 'warning' | 'info' | 'success', title: string, description: string}[] = [];
    const fatorR = results.simplesNacionalSemFatorR.fatorR;
    if (fatorR !== undefined && fatorR < 0.28) {
      const requiredProLaboreTotal = (results.simplesNacionalSemFatorR.totalRevenue * 0.28 - (form.getValues('totalSalaryExpense')));
      const minProLaboreTotal = MINIMUM_WAGE * form.getValues('numberOfPartners');
      const requiredProLaborePerPartner = Math.max(requiredProLaboreTotal, minProLaboreTotal) / form.getValues('numberOfPartners');
      intelligentAlerts.push({
        type: 'warning',
        title: 'Pró-labore pode ser otimizado',
        description: `Seu Fator R está abaixo de 28%. Aumentando seu pró-labore para aproximadamente ${formatCurrencyBRL(requiredProLaborePerPartner)} por sócio, você pode reduzir sua alíquota no Simples Nacional.`
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
        <div id="results-section" className="mt-16 w-full">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Sua Análise Tributária</h2>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto font-serif">
                    Comparamos os regimes para encontrar o menor custo para sua empresa. A recomendação destaca o cenário mais econômico.
                </p>
            </div>

            {intelligentAlerts.length > 0 && (
                <div className="space-y-4 mb-8 max-w-4xl mx-auto">
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
            
            <div className="flex flex-wrap justify-center items-stretch gap-8">
                {displayedScenarios.map(scenario => (
                     <ResultCard 
                        key={scenario.regime} 
                        details={scenario} 
                        isCheapest={scenario.totalMonthlyCost === cheapestScenario.totalMonthlyCost && displayedScenarios.length > 1 && cheapestScenario.totalMonthlyCost > 0}
                        formValues={form.getValues()}
                    />
                ))}
            </div>

            {advice && (
                <Card className="mt-12 max-w-4xl mx-auto border-primary/20 bg-primary/5 shadow-lg">
                    <CardHeader className="flex-row items-center gap-4">
                        <Lightbulb className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-primary">Recomendação da IA</CardTitle>
                            <CardDescription className="text-primary/90">Análise e conselhos para otimizar seus impostos.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isAdviceLoading ? <Skeleton className="h-5 w-full mt-2" /> : <p className="font-serif text-primary/90">{advice}</p>}
                    </CardContent>
                </Card>
            )}
      </div>
    );
  };
  
  return (
    <FormProvider {...form}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-2xl">Simule Seus Impostos</CardTitle>
                    <CardDescription>
                       Preencha os campos abaixo para descobrir o regime tributário ideal para sua empresa de serviços e otimizar suas finanças.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Coluna Dados da Empresa */}
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2 border-b pb-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Dados da Empresa
                            </h3>
                            <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Despesa com Salários (CLT)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} /></FormControl>
                                    <FormDescription>
                                        Informe a despesa total com a folha de pagamento de funcionários (se houver).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="numberOfPartners" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Sócios</FormLabel>
                                    <FormControl><Input type="number" step="1" min="1" placeholder="1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="proLaborePerPartner" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pró-labore por Sócio</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder={formatCurrencyBRL(MINIMUM_WAGE)} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* Coluna Atividades e Faturamento */}
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2 border-b pb-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Atividades e Faturamento
                            </h3>
                           
                            <div>
                                <h4 className="font-medium text-md text-foreground mb-3 flex items-center gap-2"><BarChartBig className="h-5 w-5 text-primary/80" />Receitas Nacionais</h4>
                                {domesticFields.map((field, index) => (
                                    <ActivityField key={field.id} form={form} fieldName="domesticActivities" index={index} removeFn={removeDomestic} />
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setCnaeSelectorState({ open: true, target: 'domestic' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade Nacional
                                </Button>
                            </div>
                            
                            <Separator />

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
    </FormProvider>
  );
}
