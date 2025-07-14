
"use client";

import { useEffect, useState, useMemo, type ComponentType } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { BarChartBig, Rocket, Building2, Loader2, Lightbulb, TrendingUp, RefreshCw, Briefcase, PlusCircle, XCircle, Users, ListChecks, Percent, AlertTriangle } from 'lucide-react';

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { getCnaeData, _calculatePartnerTaxes } from '@/lib/calculations';
import { type CalculationResults, type CalculationResults2026, type TaxFormValues, type CnaeItem, Annex, CnaeData, TaxDetails, ProLaboreFormSchema, TaxDetails2026, PlanEnumSchema, TaxDetailsSchema } from '@/lib/types';
import { cn, formatCurrencyBRL, formatBRL, formatPercent } from "@/lib/utils";
import { getFiscalParameters } from '@/config/fiscal';
import { calculateTaxesOnServer } from '@/ai/flows/calculate-taxes-flow';
import { calculateTaxes2026OnServer } from '@/ai/flows/calculate-taxes-2026-flow';
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
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import CityInfoRenderer from './city-info-renderer';
import HealthInfoSection from './health-info-section';
import OdontologyInfoSection from './odontology-info-section';
import RocSection from './roc-section';


const fiscalConfig2025 = getFiscalParameters(2025);
const MINIMUM_WAGE_2025 = fiscalConfig2025.salario_minimo;

const CalculatorFormSchema = z.object({
  city: z.string({ required_error: "Por favor, selecione uma cidade." }).optional(),
  selectedCnaes: z.array(z.string()).min(1, "Selecione ao menos uma atividade (CNAE)."),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  revenues: z.record(z.string(), z.coerce.number().min(0).optional()),
  exportCurrency: z.string(),
  exchangeRate: z.coerce.number(),
  totalSalaryExpense: z.coerce.number().min(0, "O valor deve ser positivo."),
  proLabores: z.array(ProLaboreFormSchema),
  numberOfPartners: z.coerce.number().min(1, "O número de sócios deve ser no mínimo 1.").positive(),
  b2bRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
  selectedPlan: PlanEnumSchema.default('expertsEssencial'),
}).superRefine((data, ctx) => {
    const fiscalConfig = getFiscalParameters(); // Using current year for validation
    data.proLabores.forEach((proLabore, index) => {
      if (proLabore.value > 0 && proLabore.value < fiscalConfig.salario_minimo) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `O pró-labore não pode ser inferior a ${formatCurrencyBRL(fiscalConfig.salario_minimo)}.`,
              path: [`proLabores.${index}.value`],
          });
      }
      if (proLabore.hasOtherInssContribution && (proLabore.otherContributionSalary === undefined || proLabore.otherContributionSalary <= 0)) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Informe um valor de contribuição positivo.',
              path: [`proLabores.${index}.otherContributionSalary`],
          });
      }
    });
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

export default function TaxCalculator({ year }: { year: 2025 | 2026 }) {
  const [results, setResults] = useState<CalculationResults | CalculationResults2026 | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [isCnaeSelectorOpen, setCnaeSelectorOpen] = useState(false);
  const { toast } = useToast();

  const fiscalConfig = getFiscalParameters(year);
  const MINIMUM_WAGE = fiscalConfig.salario_minimo;

  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(CalculatorFormSchema),
    defaultValues: {
      city: undefined,
      selectedCnaes: [],
      rbt12: 0,
      revenues: {},
      exportCurrency: 'BRL',
      exchangeRate: 1,
      totalSalaryExpense: 0,
      proLabores: [{ value: MINIMUM_WAGE, hasOtherInssContribution: false, otherContributionSalary: 0 }],
      numberOfPartners: 1,
      b2bRevenuePercentage: 50,
      selectedPlan: 'expertsEssencial',
    },
  });

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
  const selectedCity = form.watch("city");
  
  const revenueGroups = useMemo(() => {
    const cnaesInfo = selectedCnaes.map(code => getCnaeData(code)).filter((c): c is CnaeData => !!c);
    const annexes = [...new Set(cnaesInfo.map(c => c.annex))];
    return annexes;
  }, [selectedCnaes]);

  const isCommerceOnly = useMemo(() => {
    if (selectedCnaes.length === 0) return false;
    return selectedCnaes.every(code => getCnaeData(code)?.annex === 'I');
  }, [selectedCnaes]);
  
  useEffect(() => {
      if (isCommerceOnly && form.getValues('selectedPlan') === 'expertsEssencial') {
          form.setValue('selectedPlan', 'padrao'); // Switch to a default available plan
          toast({
              title: "Plano ajustado",
              description: "O plano Experts não está disponível para atividades de comércio. Selecionamos o plano Padrão para você.",
              variant: "default",
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommerceOnly, form]);

    const hasHealthOrVetCnae = useMemo(() => {
        return selectedCnaes.some(code => {
            const cnae = getCnaeData(code);
            return cnae?.category === 'Saúde e Bem-estar' || cnae?.category === 'Veterinária';
        });
    }, [selectedCnaes]);

    const hasOdontologyCnae = useMemo(() => {
        return selectedCnaes.some(code => {
            const cnae = getCnaeData(code);
            return cnae?.category === 'Odontologia';
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const submissionProLabores = values.proLabores.map(p => ({
        ...p,
        value: p.value || MINIMUM_WAGE,
        otherContributionSalary: p.hasOtherInssContribution ? (p.otherContributionSalary || 0) : 0,
    }));
    
    return {
        selectedCnaes: values.selectedCnaes,
        selectedPlan: values.selectedPlan,
        rbt12: values.rbt12 ?? 0,
        domesticActivities,
        exportActivities,
        exportCurrency: values.exportCurrency,
        exchangeRate: values.exportCurrency !== 'BRL' ? (values.exchangeRate ?? 1) : 1,
        totalSalaryExpense: values.totalSalaryExpense,
        proLabores: submissionProLabores,
        numberOfPartners: values.numberOfPartners,
        b2bRevenuePercentage: values.b2bRevenuePercentage,
    };
  }

  async function onSubmit(values: CalculatorFormValues) {
    // Business rule: Do not serve Anexo I/II companies with projected revenue > 4.8M
    if ((values.rbt12 ?? 0) === 0) {
        let domestic = 0;
        let exportRaw = 0;
        for (const key in values.revenues) {
            const revenue = values.revenues[key] || 0;
            if (key.startsWith('domestic_')) domestic += revenue;
            else if (key.startsWith('export_')) exportRaw += revenue;
        }
        const exportBRL = values.exportCurrency !== 'BRL' ? exportRaw * (values.exchangeRate || 1) : 1;
        const projectedAnnual = (domestic + exportBRL) * 12;

        if (projectedAnnual > SIMPLES_NACIONAL_LIMIT) {
            const hasAnexoIorII = values.selectedCnaes.some(code => {
                const cnae = getCnaeData(code);
                return cnae?.annex === 'I' || cnae?.annex === 'II';
            });
            if (hasAnexoIorII) {
                toast({
                    title: "Não atendemos este perfil",
                    description: "No momento, não atendemos empresas de Comércio ou Indústria (Anexo I ou II) com faturamento anual superior a R$ 4,8 milhões.",
                    variant: "destructive",
                    duration: 10000,
                });
                return;
            }
        }
    }
    
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

    if (year === 2025) {
        try {
            const calculatedResults = await calculateTaxesOnServer(submissionValues);

            if (!calculatedResults) {
                throw new Error("A API de cálculo não retornou resultados.");
            }

            setResults(calculatedResults);
            
            const totalRevenue = submissionValues.domesticActivities.reduce((acc, act) => acc + act.revenue, 0) + submissionValues.exportActivities.reduce((acc, act) => acc + (act.revenue * submissionValues.exchangeRate), 0);
            const totalProLabore = submissionValues.proLabores.reduce((acc, pl) => acc + pl.value, 0);

            if (totalRevenue === 0 && totalProLabore === 0 && submissionValues.rbt12 === 0) {
                 setIsLoading(false);
                return;
            }
            if (!('simplesNacionalBase' in calculatedResults)) {
                toast({
                    title: "Erro ao Processar",
                    description: "Os resultados do cálculo são inválidos. Tente novamente.",
                    variant: "destructive"
                });
                 setIsLoading(false);
                return;
            }

            setIsAdviceLoading(true);
            try {
                const totalDomesticRevenue = submissionValues.domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
                const totalExportRevenue = submissionValues.exportActivities.reduce((acc, act) => acc + (act.revenue * submissionValues.exchangeRate), 0);

                const activitiesSummary = [...submissionValues.domesticActivities, ...submissionValues.exportActivities]
                    .map(a => `${a.code} (R$ ${a.revenue.toFixed(2)})`)
                    .join(', ');
              
              if (calculatedResults.simplesNacionalOtimizado) {
                 const aiInput: TaxOptimizationInput = {
                    activities: activitiesSummary,
                    totalDomesticRevenue,
                    totalExportRevenue,
                    totalSalaryExpense: values.totalSalaryExpense,
                    totalProLabore: totalProLabore,
                    numberOfPartners: values.numberOfPartners,
                    simplesNacionalSemFatorRBurden: calculatedResults.simplesNacionalBase.totalMonthlyCost,
                    simplesNacionalComFatorRBurden: calculatedResults.simplesNacionalOtimizado.totalMonthlyCost,
                    lucroPresumidoTaxBurden: calculatedResults.lucroPresumido.totalMonthlyCost,
                  };
                  const aiResult = await getTaxOptimizationAdvice(aiInput);
                  setAdvice(aiResult.advice);
              }
            } catch (error) {
              console.error("Error fetching AI advice:", error);
              setAdvice("Não foi possível obter a recomendação da IA no momento.");
            } finally {
              setIsAdviceLoading(false);
            }
        } catch(e) {
            console.error("Erro ao calcular impostos (2025):", e);
            toast({
                title: "Erro no Cálculo",
                description: "Ocorreu um erro inesperado ao calcular os impostos. Por favor, tente novamente.",
                variant: "destructive",
            });
            setResults(null);
            setAdvice(null);
        } finally {
            setIsLoading(false);
        }
    } else { // Year is 2026
        try {
            const calculatedResults = await calculateTaxes2026OnServer(submissionValues);
            
            if (!calculatedResults) {
                throw new Error("A API de cálculo para 2026 não retornou resultados.");
            }
            
            setResults(calculatedResults);
        } catch (e) {
            console.error("Erro ao calcular impostos (2026):", e);
            toast({
                title: "Erro no Cálculo (2026)",
                description: "Ocorreu um erro inesperado ao calcular os impostos. Por favor, tente novamente.",
                variant: "destructive",
            });
            setResults(null);
            setAdvice(null);
        } finally {
             setIsLoading(false);
        }
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

    const submissionValues = transformFormToSubmission(form.getValues());
    const { selectedCnaes, numberOfPartners: numSocios } = form.getValues();

    let scenarios: (TaxDetails | TaxDetails2026)[] = [];
    if (year === 2025 && 'simplesNacionalBase' in results) {
        const { simplesNacionalBase, simplesNacionalOtimizado, lucroPresumido } = results;
        
        const scenariosToShow : (TaxDetails | TaxDetails2026)[] = [];

        if (!isCommerceOnly) {
            scenariosToShow.push(lucroPresumido);
        }
        
        scenariosToShow.push(simplesNacionalBase);
        
        if (simplesNacionalOtimizado && simplesNacionalOtimizado.totalMonthlyCost !== simplesNacionalBase.totalMonthlyCost) {
            const optimizationNote = `Para este cenário, o pró-labore total foi recalculado para ${formatCurrencyBRL(simplesNacionalOtimizado.proLabore)} para atingir o Fator R e tributar no Anexo III.`;
            scenariosToShow.push({ ...simplesNacionalOtimizado, optimizationNote });
        }
        
        scenarios = scenariosToShow;
    } else if (year === 2026 && 'simplesNacionalTradicional' in results) {
        if (!isCommerceOnly) {
          scenarios.push(results.lucroPresumido);
        }
        scenarios.push(results.simplesNacionalTradicional, results.simplesNacionalHibrido);
    }

    if (scenarios.length === 0) return null;
    
    const cheapestScenario = scenarios.length > 0
      ? scenarios.reduce((prev, current) => (prev.totalMonthlyCost < current.totalMonthlyCost ? prev : current))
      : null;
    
    const sortedForDisplay = [...scenarios].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return (
        <div id="results-section" className="mt-16 w-full">
             <div className="max-w-4xl mx-auto mb-12">
                <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg text-foreground flex items-center justify-center gap-2">
                        <ListChecks className="h-5 w-5 text-primary"/>
                        Resumo das Atividades Selecionadas
                    </h3>
                </div>
                <ul className="border rounded-lg p-3 bg-muted/20 divide-y divide-border/50">
                    {selectedCnaes.map((code) => {
                        const cnae = getCnaeData(code);
                        if (!cnae) return null;
                        return (
                             <li key={code} className="flex flex-col sm:flex-row items-start justify-between gap-x-4 gap-y-1 py-2 first:pt-0 last:pb-0">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground">{cnae.code}</p>
                                    <p className="text-muted-foreground text-sm">{cnae.description}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                                    <Badge variant="secondary" className="text-xs">Anexo {cnae.annex}</Badge>
                                    {cnae.requiresFatorR && <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">Fator R</Badge>}
                                    {cnae.isRegulated && <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs">Regulamentada</Badge>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Sua Análise Tributária</h2>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Comparamos os regimes para encontrar o menor custo para sua empresa. A recomendação destaca o cenário mais econômico.
                </p>
            </div>

            <div className="flex flex-wrap justify-center items-stretch gap-8">
                {sortedForDisplay.map(scenario => (
                     <ResultCard 
                        key={`${scenario.regime}-${scenario.annex}`} 
                        details={scenario as TaxDetailsSchema} 
                        isCheapest={cheapestScenario !== null && scenario.totalMonthlyCost === cheapestScenario.totalMonthlyCost && sortedForDisplay.length > 1 && cheapestScenario.totalMonthlyCost > 0}
                        formValues={submissionValues}
                    />
                ))}
            </div>

            {cheapestScenario && numSocios > 1 && (
                <div className="mt-12 max-w-4xl mx-auto">
                    <Card className="shadow-lg border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-foreground text-center flex items-center justify-center gap-2">
                                <Users className="h-5 w-5 text-primary"/>
                                Detalhamento por Sócio (Cenário Recomendado)
                            </CardTitle>
                            <CardDescription className="text-center">
                                Valores individuais de pró-labore e impostos retidos no cenário mais econômico.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cheapestScenario.partnerTaxes.map((partner, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                                    <h4 className="font-semibold mb-3 text-foreground">Sócio {index + 1}</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-muted-foreground">Pró-labore Bruto</span>
                                            <span className="font-medium">{formatCurrencyBRL(partner.proLaboreBruto)}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-muted-foreground">(-) INSS Retido (11%)</span>
                                            <span className="font-medium text-destructive/90">-{formatCurrencyBRL(partner.inss)}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-muted-foreground">(-) IRRF Retido</span>
                                            <span className="font-medium text-destructive/90">-{formatCurrencyBRL(partner.irrf)}</span>
                                        </div>
                                        <Separator className="my-2"/>
                                        <div className="flex justify-between items-baseline font-bold">
                                            <span className="text-foreground">(=) Pró-labore Líquido</span>
                                            <span className="text-primary">{formatCurrencyBRL(partner.proLaboreLiquido)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {advice && year === 2025 && (
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
                                const totalProLaboreLiquido = details.partnerTaxes.reduce((sum, p) => sum + p.proLaboreLiquido, 0);
                                const lucroDisponivel = details.totalRevenue - details.totalTax - totalProLaboreLiquido - details.contabilizeiFee;

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
                                            <span className="font-semibold text-foreground">-{formatCurrencyBRL(totalProLaboreLiquido)}</span>
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
                            <div className="md:col-span-3 space-y-4">
                                <FormLabel>Pró-labore e Vínculos dos Sócios</FormLabel>
                                <div className="space-y-6">
                                    {fields.map((item, index) => (
                                        <div key={item.id} className="p-4 border rounded-lg bg-muted/20">
                                            <h4 className="font-semibold text-foreground mb-4">Sócio {index + 1}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
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
                                                            <FormItem className={cn(!form.watch(`proLabores.${index}.hasOtherInssContribution`) && 'invisible h-0')}>
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
                                        Deixe R$ 0,00 se estiver abrindo a empresa agora. A calculadora estimará o valor.
                                    </FormDescription>
                                    <FormMessage />
                                    {showSimplesLimitWarning && (
                                        <Alert variant="destructive" className="mt-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Atenção: Limite do Simples Nacional</AlertTitle>
                                            <AlertDescription>
                                                Com base no faturamento mensal informado, sua receita anual projetada ({formatCurrencyBRL(projectedAnnualRevenue)}) ultrapassa o teto de R$ 4,8 milhões do Simples Nacional. Empresas que ultrapassam esse limite devem ser desenquadradas do regime.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </FormItem>
                                );
                            }} />

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
                                  Informe qual a porcentagem do seu faturamento que vem de vendas para outras empresas (Pessoa Jurídica).
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
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
                        {revenueGroups.length === 0 && <p className='text-base text-muted-foreground mt-4'>Selecione uma ou mais atividades para informar o faturamento.</p>}
                    </div>

                    <div className="space-y-2">
                      <div className='border-b pb-4'>
                          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                              <ListChecks className="h-5 w-5 text-primary" />
                              3. Selecione o Plano Contabilizei
                          </h3>
                           <p className='text-muted-foreground text-sm mt-1'>Qual plano de contabilidade melhor se encaixa no seu perfil?</p>
                      </div>
                       <FormField
                          control={form.control}
                          name="selectedPlan"
                          render={({ field }) => (
                              <FormItem className='pt-2'>
                                  <FormControl>
                                      <RadioGroup
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
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
                    </div>

                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-6">
                <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  4. Analisar e Otimizar Impostos
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
        
        <div className="mt-12">
            <CityInfoRenderer city={selectedCity} />
        </div>

        {hasHealthOrVetCnae && (
            <div className="mt-12">
                <HealthInfoSection />
            </div>
        )}

        {hasOdontologyCnae && (
            <div className="mt-12">
                <OdontologyInfoSection />
            </div>
        )}
        
        {renderResults()}
    </FormProvider>
  );
}
