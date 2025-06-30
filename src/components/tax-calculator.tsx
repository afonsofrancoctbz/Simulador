
"use client";

import { useEffect, useState, useMemo, type ComponentType } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { BarChartBig, Rocket, Building2, Loader2, Lightbulb, TrendingUp, RefreshCw, Briefcase, PlusCircle, XCircle, MapPin, Ban } from 'lucide-react';

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { getCnaeData } from '@/lib/calculations';
import { type CalculationResults, type TaxFormValues, type CnaeItem, Annex, CnaeData } from '@/lib/types';
import { cn, formatCurrencyBRL, formatBRL, formatPercent } from "@/lib/utils";
import { getFiscalParameters } from '@/config/fiscal';
import { calculateTaxesOnServer } from '@/ai/flows/calculate-taxes-flow';
import { CIDADES_ATENDIDAS } from '@/lib/cities';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CnaeSelector } from './cnae-selector';
import { Separator } from './ui/separator';
import { ResultCard } from './result-card';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import CityInfoSection from './city-info-section';
import CuritibaInfoSection from './curitiba-info-section';
import RioInfoSection from './rio-info-section';
import BeloHorizonteInfoSection from './belo-horizonte-info-section';
import FlorianopolisInfoSection from './florianopolis-info-section';
import SalvadorInfoSection from './salvador-info-section';
import PortoAlegreInfoSection from './porto-alegre-info-section';
import FortalezaInfoSection from './fortaleza-info-section';
import RecifeInfoSection from './recife-info-section';
import BrasiliaInfoSection from './brasilia-info-section';
import GoianiaInfoSection from './goiania-info-section';
import ManausInfoSection from './manaus-info-section';
import CampinasInfoSection from './campinas-info-section';
import JundiaiInfoSection from './jundiai-info-section';
import UberlandiaInfoSection from './uberlandia-info-section';


const fiscalConfig = getFiscalParameters();
const MINIMUM_WAGE = fiscalConfig.salario_minimo;

const calculatorFormSchema = z.object({
  city: z.string().optional(),
  selectedCnaes: z.array(z.string()).min(1, "Selecione pelo menos um CNAE."),
  revenues: z.record(z.string(), z.coerce.number().optional()), // e.g. revenues['domestic_V']
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number(),
  totalSalaryExpense: z.coerce.number().min(0, "O valor deve ser positivo."),
  proLaborePerPartner: z.coerce.number().min(0, "O valor deve ser positivo."),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive(),
}).superRefine((data, ctx) => {
    const proLaborePerSocio = data.proLaborePerPartner;
    if (proLaborePerSocio > 0 && proLaborePerSocio < MINIMUM_WAGE) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `O pró-labore por sócio não pode ser inferior a ${formatCurrencyBRL(MINIMUM_WAGE)}.`,
            path: ["proLaborePerPartner"],
        });
    }
}).refine(data => {
    const totalRevenue = Object.values(data.revenues || {}).reduce((acc, revenue) => acc + (revenue || 0), 0);
    return totalRevenue > 0 || (data.proLaborePerPartner > 0);
}, {
    message: "Informe ao menos um valor de faturamento ou pró-labore.",
    path: ["revenues"],
});

type CalculatorFormValues = z.infer<typeof calculatorFormSchema>;

const cityInfoComponents: { [key: string]: ComponentType } = {
  'São Paulo - SP': CityInfoSection,
  'Curitiba - PR': CuritibaInfoSection,
  'Rio de Janeiro - RJ': RioInfoSection,
  'Belo Horizonte - MG': BeloHorizonteInfoSection,
  'Florianópolis - SC': FlorianopolisInfoSection,
  'Salvador - BA': SalvadorInfoSection,
  'Porto Alegre - RS': PortoAlegreInfoSection,
  'Fortaleza - CE': FortalezaInfoSection,
  'Recife - PE': RecifeInfoSection,
  'Brasília - DF': BrasiliaInfoSection,
  'Goiânia - GO': GoianiaInfoSection,
  'Manaus - AM': ManausInfoSection,
  'Campinas - SP': CampinasInfoSection,
  'Jundiaí - SP': JundiaiInfoSection,
  'Uberlândia - MG': UberlandiaInfoSection,
};

export default function TaxCalculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);

  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorFormSchema),
    defaultValues: {
      city: undefined,
      selectedCnaes: [],
      revenues: {},
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLaborePerPartner: MINIMUM_WAGE,
      numberOfPartners: 1,
    },
  });

  const selectedCnaes = form.watch("selectedCnaes");
  const exportCurrency = form.watch("exportCurrency");
  const selectedCity = form.watch("city");
  
  const revenueGroups = useMemo(() => {
    const cnaesInfo = selectedCnaes.map(code => getCnaeData(code)).filter((c): c is CnaeData => !!c);
    const annexes = [...new Set(cnaesInfo.map(c => c.annex))];
    return annexes;
  }, [selectedCnaes]);

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

  const handleCnaeConfirm = (codes: string[]) => {
    form.setValue('selectedCnaes', codes, { shouldValidate: true });
    // Reset revenues when CNAEs change, preserving only those for still-selected annexes
    const newRevenues: Record<string, number | undefined> = {};
    const newAnnexes = new Set(codes.map(code => getCnaeData(code)?.annex).filter(Boolean));
    const currentRevenues = form.getValues('revenues');
    for (const key in currentRevenues) {
        const annex = key.split('_')[1] as Annex;
        if(newAnnexes.has(annex)) {
            newRevenues[key] = currentRevenues[key];
        }
    }
    form.setValue('revenues', newRevenues);
  };
  
  const transformFormToSubmission = (values: CalculatorFormValues): TaxFormValues => {
    const domesticActivities: CnaeItem[] = [];
    const exportActivities: CnaeItem[] = [];

    const cnaesByAnnex: Record<string, string[]> = {};
    values.selectedCnaes.forEach(code => {
        const cnae = getCnaeData(code);
        if (cnae) {
            if (!cnaesByAnnex[cnae.annex]) cnaesByAnnex[cnae.annex] = [];
            cnaesByAnnex[cnae.annex].push(code);
        }
    });

    for (const key in values.revenues) {
        const revenue = values.revenues[key] || 0;
        if (revenue > 0) {
            const [type, annex] = key.split('_'); // e.g. "domestic", "V"
            const cnaesInGroup = cnaesByAnnex[annex] || [];
            if (cnaesInGroup.length > 0) {
                const revenuePerCnae = revenue / cnaesInGroup.length; // Evenly distribute revenue
                cnaesInGroup.forEach(code => {
                    const activity = { code, revenue: revenuePerCnae };
                    if (type === 'domestic') {
                        domesticActivities.push(activity);
                    } else {
                        exportActivities.push(activity);
                    }
                });
            }
        }
    }
    
    return {
        domesticActivities,
        exportActivities,
        exportCurrency: values.exportCurrency,
        exchangeRate: values.exportCurrency !== 'BRL' ? (values.exchangeRate ?? 1) : 1,
        totalSalaryExpense: values.totalSalaryExpense,
        proLaborePerPartner: values.proLaborePerPartner,
        numberOfPartners: values.numberOfPartners,
    };
  }

  async function onSubmit(values: CalculatorFormValues) {
    setIsLoading(true);
    setResults(null);
    setAdvice(null);
    
    setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);

    const submissionValues = transformFormToSubmission(values);

    const calculatedResults = await calculateTaxesOnServer(submissionValues);
    setResults(calculatedResults);
    setIsLoading(false);
    
    const totalRevenue = submissionValues.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + submissionValues.exportActivities.reduce((acc, act) => acc + (act.revenue * submissionValues.exchangeRate), 0);
    if (totalRevenue === 0 && values.proLaborePerPartner === 0) {
      return; // No need to call AI if there's no financial activity
    }

    setIsAdviceLoading(true);
    try {
        const totalDomesticRevenue = submissionValues.domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
        const totalExportRevenue = submissionValues.exportActivities.reduce((acc, act) => acc + (act.revenue * submissionValues.exchangeRate), 0);

        const activitiesSummary = [...submissionValues.domesticActivities, ...submissionValues.exportActivities]
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

    const { selectedCnaes } = form.getValues();
    if (selectedCnaes.length === 0) return [];

    const submissionValues = transformFormToSubmission(form.getValues());
    const totalRevenue = submissionValues.domesticActivities.reduce((sum, act) => sum + act.revenue, 0) + submissionValues.exportActivities.reduce((sum, act) => sum + act.revenue, 0);

    if (totalRevenue === 0 && form.getValues('proLaborePerPartner') === 0) return [];

    const scenarios = [];

    const lucroPresumidoScenario = {
        ...results.lucroPresumido,
        regime: 'Lucro Presumido',
        annex: 'Alternativa de Regime'
    };

    const hasAnnexVActivity = selectedCnaes.some(code => getCnaeData(code)?.requiresFatorR);

    if (hasAnnexVActivity) {
        scenarios.push({
            ...results.simplesNacionalSemFatorR,
            regime: 'Simples Nacional',
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
    const submissionValues = transformFormToSubmission(form.getValues());

    return (
        <div id="results-section" className="mt-16 w-full">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Sua Análise Tributária</h2>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Comparamos os regimes para encontrar o menor custo para sua empresa. A recomendação destaca o cenário mais econômico.
                </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-stretch gap-8">
                {displayedScenarios.map(scenario => (
                     <ResultCard 
                        key={scenario.regime} 
                        details={scenario} 
                        isCheapest={scenario.totalMonthlyCost === cheapestScenario.totalMonthlyCost && displayedScenarios.length > 1 && cheapestScenario.totalMonthlyCost > 0}
                        formValues={submissionValues}
                    />
                ))}
            </div>

            {advice && (
                <div className="mt-12 max-w-5xl mx-auto">
                    <Alert variant="default" className="bg-primary/5 border-primary/20">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <AlertTitle className="font-semibold text-primary">Recomendação da IA</AlertTitle>
                        <AlertDescription className="text-sm text-foreground/90">
                            {isAdviceLoading ? (
                                <div className="space-y-1.5 pt-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-11/12" />
                                </div>
                            ) : (
                                advice
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {cheapestScenario && (
                <div className="mt-12 max-w-4xl mx-auto">
                    <Card className="shadow-lg border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-foreground text-center">Demonstrativo de Lucro (Cenário Recomendado)</CardTitle>
                            <CardDescription className="text-center">
                                Uma visão simplificada do resultado da sua empresa no cenário mais econômico.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2 text-base">
                            {(() => {
                                const details = cheapestScenario;
                                const totalWithheldTaxes = details.breakdown
                                    .filter(item => ['INSS s/ Pró-labore (11%)', 'IRRF s/ Pró-labore'].includes(item.name))
                                    .reduce((sum, item) => sum + item.value, 0);

                                const proLaboreLiquido = details.proLabore - totalWithheldTaxes;
                                const lucroDisponivel = details.totalRevenue - details.totalTax - proLaboreLiquido - details.contabilizeiFee;

                                return (
                                    <>
                                        <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                                            <span className="text-muted-foreground">(+) Faturamento Mensal</span>
                                            <span className="font-semibold text-foreground">{formatCurrencyBRL(details.totalRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                                            <span className="text-muted-foreground">(-) Total de Impostos e Encargos</span>
                                            <span className="font-semibold text-foreground">-{formatCurrencyBRL(details.totalTax)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                                            <span className="text-muted-foreground">(-) Pró-labore (Líquido)</span>
                                            <span className="font-semibold text-foreground">-{formatCurrencyBRL(proLaboreLiquido)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                                            <span className="text-muted-foreground">(-) Mensalidade Contabilizei</span>
                                            <span className="font-semibold text-foreground">-{formatCurrencyBRL(details.contabilizeiFee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 mt-2 border-t font-bold text-lg">
                                            <span>(=) Lucro Disponível para Distribuição</span>
                                            <span className="text-primary">{formatCurrencyBRL(lucroDisponivel)}</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <p className="text-xs text-muted-foreground/80 text-center w-full">A distribuição de lucros é isenta de Imposto de Renda para o sócio (Lei 9.249/95 – Art.10).</p>
                        </CardFooter>
                    </Card>
                </div>
            )}
      </div>
    );
  };
  
  const CityComponent = selectedCity ? cityInfoComponents[selectedCity] : null;

  return (
    <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left">
        <Card className="shadow-xl overflow-hidden border bg-card max-w-7xl mx-auto">
            <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-8">
                    
                    <div className="space-y-6">
                        <div className='border-b pb-4'>
                            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                1. Dados da Empresa e Folha
                            </h3>
                            <p className='text-base text-muted-foreground mt-1'>Informações sobre seus custos com pessoal e localização.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-3">
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
                                            Selecionar a cidade nos permite fornecer informações mais precisas sobre taxas e prazos.
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
                                        Quantos sócios administram.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="proLaborePerPartner" render={({ field }) => {
                                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const { value } = e.target;
                                    const digitsOnly = value.replace(/\D/g, '');
                                    field.onChange(Number(digitsOnly) / 100);
                                };
                                return (
                                <FormItem>
                                    <FormLabel>Pró-labore por Sócio</FormLabel>
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
                                     <FormDescription className='text-sm'>
                                        Salário mensal de cada sócio.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                );
                            }} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className='border-b pb-4'>
                            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                2. Atividades e Faturamento Mensal
                            </h3>
                            <p className='text-base text-muted-foreground mt-1'>Selecione suas atividades e informe a receita correspondente.</p>
                        </div>
                       
                        <div>
                            <FormLabel>Atividades (CNAEs) da empresa</FormLabel>
                            <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md min-h-[40px] bg-background">
                                {selectedCnaes.length > 0 ? selectedCnaes.map(code => (
                                    <Badge key={code} variant="secondary" className="text-sm">
                                        {code}
                                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => handleCnaeConfirm(selectedCnaes.filter(c => c !== code))}>
                                            <XCircle className="h-3 w-3 text-destructive/80" />
                                        </Button>
                                    </Badge>
                                )) : <p className="text-base text-muted-foreground px-1">Nenhuma atividade selecionada.</p>}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setCnaeSelectorOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar / Editar Atividades
                            </Button>
                        </div>
                        
                        {revenueGroups.length > 0 && <Separator />}

                        {revenueGroups.length > 0 && (
                            <div className='space-y-8'>
                                <div>
                                    <h4 className="font-medium text-md text-foreground mb-4 flex items-center gap-2"><BarChartBig className="h-5 w-5 text-primary/80" />Receita Nacional (em R$)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        <FormLabel>Faturamento (Anexo {annex})</FormLabel>
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
                                
                                <div>
                                    <h4 className="font-medium text-md text-foreground mb-4 flex items-center gap-2"><Rocket className="h-5 w-5 text-primary/80" />Receita de Exportação</h4>
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
                                                    <FormLabel>Taxa de Câmbio ({exportCurrency} para BRL)</FormLabel>
                                                    <div className="relative">
                                                        <FormControl><Input type="number" step="0.0001" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={isFetchingRate} /></FormControl>
                                                         <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-muted-foreground" onClick={fetchRates} disabled={isFetchingRate}>
                                                            <RefreshCw className={cn("h-4 w-4", isFetchingRate && "animate-spin")} />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        <FormLabel>Faturamento (Anexo {annex})</FormLabel>
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
                        {revenueGroups.length === 0 && <p className='text-base text-muted-foreground mt-4'>Selecione uma ou mais atividades para informar o faturamento.</p>}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-6">
                <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  3. Analisar e Otimizar Impostos
                </Button>
            </CardFooter>
        </Card>
        </form>
      
        <CnaeSelector
            open={isCnaeSelectorOpen}
            onOpenChange={setCnaeSelectorOpen}
            onConfirm={handleCnaeConfirm}
            initialSelectedCodes={selectedCnaes}
        />
        
        {CityComponent && (
            <div className="mt-12">
                <CityComponent />
            </div>
        )}

        {renderResults()}
    </FormProvider>
  );
}
