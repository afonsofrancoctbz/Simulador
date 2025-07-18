
"use client";

import { useEffect, useState, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { BarChartBig, Rocket, Building2, Loader2, Lightbulb, TrendingUp, RefreshCw, Briefcase, PlusCircle, XCircle, Users, ListChecks, Percent, AlertTriangle, CheckCircle, Trophy, Info, DollarSign } from 'lucide-react';

import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { getCnaeData } from '@/lib/cnae-helpers';
import { type CalculationResults, type CalculationResults2026, type TaxFormValues, type CnaeItem, Annex, CnaeData, TaxDetails, ProLaboreFormSchema, PlanEnumSchema } from '@/lib/types';
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
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import CityInfoRenderer from './city-info-renderer';
import HealthInfoSection from './health-info-section';
import OdontologyInfoSection from './odontology-info-section';
import { PartnerDetailsCard } from './partner-details-card';
import { ProfitStatementCard } from './profit-statement-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const fiscalConfig2025 = getFiscalParameters(2025);
const MINIMUM_WAGE_2025 = fiscalConfig2025.salario_minimo;

const CalculatorFormSchema = z.object({
  city: z.string({ required_error: "Por favor, selecione uma cidade." }).optional(),
  selectedCnaes: z.array(z.string()).min(1, "Selecione ao menos uma atividade (CNAE)."),
  rbt12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
  fp12: z.coerce.number().min(0, "O valor deve ser positivo.").optional().default(0),
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
      fp12: 0,
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
            const [type, annex] = key.split('_');
            const cnaesInGroup = cnaesByAnnex[annex] || [];
            if (cnaesInGroup.length > 0) {
                const revenuePerCnae = revenue / cnaesInGroup.length;
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
        fp12: values.fp12 ?? 0,
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
    if ((values.rbt12 ?? 0) === 0) {
        let domestic = 0;
        let exportRaw = 0;
        for (const key in values.revenues) {
            const revenue = values.revenues[key] || 0;
            if (key.startsWith('domestic_')) domestic += revenue;
            else if (key.startsWith('export_')) exportRaw += revenue;
        }
        const exportBRL = values.exportCurrency !== 'BRL' ? exportRaw * (values.exchangeRate || 1) : exportRaw;
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
        <div id="results-section" className="mt-12 w-full">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-1/2 mx-auto" />
              <Skeleton className="h-5 w-3/4 mx-auto mt-4" />
            </div>
            <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
                <Skeleton className="h-[450px] w-full rounded-xl" />
                <Skeleton className="h-[450px] w-full rounded-xl" />
                <Skeleton className="h-[450px] w-full rounded-xl" />
            </div>
        </div>
      );
    }

    if (!results) {
      return null;
    }

    let scenarios: TaxDetails[] = [];
    if (year === 2025 && 'simplesNacionalBase' in results) {
        const { simplesNacionalBase, simplesNacionalOtimizado, lucroPresumido } = results;
        
        scenarios.push(lucroPresumido);
        scenarios.push(simplesNacionalBase);
        
        if (simplesNacionalOtimizado && simplesNacionalOtimizado.totalMonthlyCost !== simplesNacionalBase.totalMonthlyCost) {
            scenarios.push(simplesNacionalOtimizado);
        }
    } else if (year === 2026 && 'simplesNacionalTradicional' in results) {
        if (!isCommerceOnly) scenarios.push(results.lucroPresumido as TaxDetails);
        scenarios.push(results.simplesNacionalTradicional as TaxDetails, results.simplesNacionalHibrido as TaxDetails);
    }

    if (scenarios.length === 0) return null;
    
    const validScenarios = scenarios.filter(s => s && (s.totalRevenue > 0 || s.proLabore > 0));
    const cheapestScenario = validScenarios.length > 0 ? validScenarios.reduce((prev, current) => (prev.totalMonthlyCost < current.totalMonthlyCost ? prev : current)) : null;

    const groupTaxes = (details: TaxDetails) => {
        const groups: { [key: string]: { name: string, value: number, rate?: number }[] } = {
            "Impostos s/ Faturamento": [],
            "Encargos s/ Folha e Pró-labore": [],
            "Outros Custos": []
        };
    
        details.breakdown.forEach(item => {
            if (['DAS', 'PIS', 'COFINS', 'ISS', 'ICMS', 'IPI', 'IRPJ', 'CSLL'].some(tax => item.name.includes(tax))) {
                groups["Impostos s/ Faturamento"].push(item);
            } else if (['INSS s/ Pró-labore', 'IRRF s/ Pró-labore', 'CPP (INSS Patronal)'].some(tax => item.name.includes(tax))) {
                groups["Encargos s/ Folha e Pró-labore"].push(item);
            }
        });
        groups["Outros Custos"].push({ name: 'Mensalidade Contabilizei', value: details.contabilizeiFee });
    
        return groups;
    };
    
    return (
      <div id="results-section" className="mt-16 w-full space-y-12">
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Sua Análise Tributária</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
              Comparamos os regimes para encontrar o menor custo para sua empresa. A recomendação destaca o cenário mais econômico.
            </p>
          </div>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row flex-wrap justify-center items-stretch gap-8">
            {validScenarios.sort((a, b) => a.order! - b.order!).map((scenario) => {
              if (!scenario) return null;
              const isRecommended = cheapestScenario !== null && scenario.totalMonthlyCost === cheapestScenario.totalMonthlyCost && validScenarios.length > 1 && cheapestScenario.totalMonthlyCost > 0;
              const groupedTaxes = groupTaxes(scenario);
              const costPercentage = scenario.totalRevenue > 0 ? (scenario.totalMonthlyCost / scenario.totalRevenue) : 0;
              
              return (
                <div key={scenario.regime + (scenario.annex || '')}
                  className={cn(
                    "border bg-card rounded-xl w-full max-w-sm flex flex-col transition-all duration-300 shadow-sm",
                    isRecommended ? "border-primary shadow-lg" : "border-border"
                  )}
                >
                    <div className={cn("p-6 rounded-t-xl text-center relative overflow-hidden")}>
                        {isRecommended && (
                        <Badge className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-50%] bg-primary text-primary-foreground font-bold px-4 py-1.5 shadow-md">
                            Recomendado
                        </Badge>
                        )}
                        <h3 className="text-xl font-bold text-foreground mt-4">{scenario.regime}</h3>
                        {scenario.annex && <p className="font-semibold text-primary">{scenario.annex}</p>}
                    </div>

                    <div className="p-6 pt-0 flex-grow text-base">
                        {Object.entries(groupedTaxes).map(([groupName, items]) => {
                          if (items.length === 0 || items.every(i => i.value === 0 && !i.name.includes("Mensalidade"))) return null;
                          return (
                              <div key={groupName} className="space-y-3">
                                  <Separator className="my-4"/>
                                  <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                      {groupName}
                                  </h4>
                                  <div className="space-y-3">
                                  {items.map(item => (
                                    <div key={item.name} className="flex justify-between items-center">
                                        <span className="text-muted-foreground">{item.name}</span>
                                        <span className="font-medium text-foreground">{formatCurrencyBRL(item.value)}</span>
                                    </div>
                                  ))}
                                  </div>
                              </div>
                          )
                        })}
                    </div>
                  
                    <div className="p-6 mt-auto space-y-4">
                        {scenario.fatorR !== undefined && (
                        <div className={cn(
                            "text-center rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2",
                            scenario.fatorR >= 0.28 ? 'bg-green-100/80 text-green-900 border border-green-200/80' : 'bg-amber-100/80 text-amber-900 border border-amber-200/80'
                        )}>
                            {scenario.fatorR >= 0.28 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            <span>Fator R: {formatPercent(scenario.fatorR)}</span>
                        </div>
                        )}
                        <div className={cn("p-4 rounded-lg bg-muted/30")}>
                            <div className="w-full space-y-2 text-center">
                                <div className='text-sm font-medium text-foreground'>Custo Total Mensal</div>
                                <div className="text-3xl font-bold text-primary">
                                    {formatCurrencyBRL(scenario.totalMonthlyCost)}
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                                    <div className="bg-gradient-to-r from-primary/70 to-primary h-2.5 rounded-full" style={{ width: `${Math.min(costPercentage*100, 100)}%` }}></div>
                                </div>
                                <p className='text-sm text-muted-foreground text-right mt-1'>{formatPercent(costPercentage)} do faturamento</p>
                            </div>
                        </div>
                    </div>
                </div>
              )
            })}
          </div>
        </div>

        {advice && year === 2025 && (
          <div className="mt-12 max-w-5xl mx-auto">
            <Alert variant="default" className="bg-primary/5 border-primary/20">
              <Lightbulb className="h-5 w-5 text-primary" />
              <AlertTitle className="font-semibold text-primary">Recomendação da IA</AlertTitle>
              <AlertDescription className="text-base text-foreground/90 leading-relaxed">
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

        {cheapestScenario && cheapestScenario.totalRevenue > 0 && (
          <>
            <PartnerDetailsCard details={cheapestScenario as TaxDetails} />
            <ProfitStatementCard details={cheapestScenario as TaxDetails} />
          </>
        )}
      </div>
    );
  };
  
  return (
    <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left">
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
                                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => handleCnaeConfirm(selectedCnaes.filter(c => c !== code))}>
                                            <XCircle className="h-3 w-3 text-destructive/80" />
                                        </Button>
                                    </Badge>
                                )) : <p className="text-sm text-muted-foreground px-1">Nenhuma atividade selecionada.</p>}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setCnaeSelectorOpen(true)}>
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
                                                         <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-muted-foreground" onClick={fetchRates} disabled={isFetchingRate}>
                                                            <RefreshCw className={cn("h-4 w-4", isFetchingRate && "animate-spin")} />
                                                        </Button>
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  Analisar e Otimizar Impostos
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
