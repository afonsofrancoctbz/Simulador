"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { DollarSign, Globe, Users, UserCheck, Briefcase, Landmark, Loader2, Lightbulb, TrendingUp, Trash2, PlusCircle, Check, ChevronsUpDown } from 'lucide-react';

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
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const cnaeItemSchema = z.object({
  code: z.string().min(1, "Selecione um CNAE."),
  revenue: z.coerce.number().min(0, "O valor deve ser positivo."),
});

const formSchema = z.object({
  domesticActivities: z.array(cnaeItemSchema).min(1, "Adicione pelo menos uma atividade nacional."),
  exportActivities: z.array(cnaeItemSchema),
  exportInUSD: z.boolean().default(false),
  exchangeRate: z.coerce.number().optional(),
  totalSalaryExpense: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo."),
  proLaborePartners: z.coerce.number({ required_error: "Campo obrigatório" }).min(MINIMUM_WAGE, `O valor deve ser no mínimo ${formatCurrency(MINIMUM_WAGE)}.`),
  municipalISSRate: z.coerce.number({ required_error: "Campo obrigatório" }).min(2, "A alíquota mínima é 2%.").max(5, "A alíquota máxima é 5%."),
}).refine(data => {
    if (data.exportInUSD) {
        return data.exchangeRate && data.exchangeRate > 0;
    }
    return true;
}, {
    message: "A taxa de câmbio é obrigatória para faturamento em USD.",
    path: ["exchangeRate"],
});

export default function TaxCalculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domesticActivities: [{ code: '6201-5/01', revenue: 10000 }],
      exportActivities: [],
      exportInUSD: false,
      totalSalaryExpense: 1500,
      proLaborePartners: MINIMUM_WAGE,
      municipalISSRate: 2,
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

  const exportInUSD = form.watch("exportInUSD");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults(null);
    setAdvice(null);

    // Ensure exchangeRate is a number if exportInUSD is true
    const submissionValues: TaxFormValues = {
        ...values,
        exchangeRate: values.exportInUSD ? values.exchangeRate! : 1,
    };

    const calculatedResults = calculateTaxes(submissionValues);
    setResults(calculatedResults);
    setIsLoading(false);
    
    setIsAdviceLoading(true);
    try {
        const totalDomesticRevenue = values.domesticActivities.reduce((acc, act) => acc + act.revenue, 0);
        let totalExportRevenue = values.exportActivities.reduce((acc, act) => acc + act.revenue, 0);
        if (values.exportInUSD && values.exchangeRate) {
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
        municipalISSRate: values.municipalISSRate,
        simplesNacionalTaxBurden: simplesTax,
        lucroPresumidoTaxBurden: calculatedResults.lucroPresumido.totalTax,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Resultados da Análise</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResultCard regime="Simples Nacional" details={results.simplesNacional} isCheapest={cheapestRegime === 'Simples Nacional'} />
          <ResultCard regime="Lucro Presumido" details={results.lucroPresumido} isCheapest={cheapestRegime === 'Lucro Presumido'} />
        </div>
        
        <Card className="mt-8 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Lightbulb className="text-primary" />
              Recomendação da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAdviceLoading ? <Skeleton className="h-12 w-full" /> : <p className="text-primary-foreground font-medium text-lg">{advice}</p>}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold">Calculadora de Impostos</h1>
            <p className="text-muted-foreground mt-2 text-lg">Compare os regimes Simples Nacional e Lucro Presumido com base nos dados da sua empresa.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Users className="text-primary" />Dados de Despesas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Despesa com Salários (CLT)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="R$ 1.500,00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="proLaborePartners" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pró-labore dos Sócios</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder={formatCurrency(MINIMUM_WAGE)} {...field} /></FormControl>
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

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><DollarSign className="text-primary" />Receitas Nacionais</CardTitle>
                    <CardDescription>Adicione as atividades que geram faturamento no Brasil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {domesticFields.map((field, index) => (
                        <ActivityField key={field.id} form={form} fieldName="domesticActivities" index={index} removeFn={removeDomestic} />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendDomestic({ code: '', revenue: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade Nacional
                    </Button>
                     <FormMessage>{form.formState.errors.domesticActivities?.message}</FormMessage>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Globe className="text-primary" />Receitas de Exportação</CardTitle>
                    <CardDescription>Adicione as atividades de exportação de serviços ou produtos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="exportInUSD"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Faturamento em Dólar (USD)?</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {exportInUSD && (
                         <FormField control={form.control} name="exchangeRate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Taxa de Câmbio (USD para BRL)</FormLabel>
                                <FormControl><Input type="number" step="0.0001" placeholder="Ex: 5.25" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    {exportFields.map((field, index) => (
                        <ActivityField key={field.id} form={form} fieldName="exportActivities" index={index} removeFn={removeExport} isExport />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendExport({ code: '', revenue: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Atividade de Exportação
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Calcular Impostos
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {renderResults()}
    </>
  );
}

const ActivityField = ({ form, fieldName, index, removeFn, isExport = false }: { form: any, fieldName: "domesticActivities" | "exportActivities", index: number, removeFn: (index: number) => void, isExport?: boolean }) => {
  return (
    <div className="flex items-end gap-2 p-3 border rounded-md bg-background">
        <FormField
            control={form.control}
            name={`${fieldName}.${index}.code`}
            render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>CNAE</FormLabel>
                    <CnaeCombobox value={field.value} onChange={field.onChange} />
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name={`${fieldName}.${index}.revenue`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Faturamento Mensal</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder={isExport ? "$ 1.000,00" : "R$ 10.000,00"} {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => removeFn(index)} className="shrink-0">
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
    </div>
  );
};


const CnaeCombobox = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground"
          >
            {value ? CNAE_DATA.find((cnae) => cnae.code === value)?.code : "Selecione o CNAE..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar CNAE por código ou descrição..." />
            <CommandList>
                <CommandEmpty>Nenhum CNAE encontrado.</CommandEmpty>
                <CommandGroup>
                {CNAE_DATA.map((cnae) => (
                    <CommandItem
                    key={cnae.code}
                    value={`${cnae.code} - ${cnae.description}`}
                    onSelect={() => {
                        onChange(cnae.code);
                        setOpen(false);
                    }}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === cnae.code ? "opacity-100" : "opacity-0"
                        )}
                    />
                    <div>
                        <p className="font-bold">{cnae.code}</p>
                        <p className="text-xs">{cnae.description}</p>
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
    <Card className={`border-2 ${isCheapest ? 'border-accent' : 'border-transparent'}`}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between">
          {regime}
          {isCheapest && <Badge variant="default" className="bg-accent text-accent-foreground">Mais vantajoso</Badge>}
        </CardTitle>
        <CardDescription>Custo total mensal estimado</CardDescription>
        <p className="text-3xl font-bold text-primary">{formatCurrency(details.totalMonthlyCost)}</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Tributo</TableHead><TableHead className="text-right">Valor</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {details.breakdown.map((item) => (
              <TableRow key={item.name}><TableCell>{item.name}</TableCell><TableCell className="text-right">{formatCurrency(item.value)}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {details.notes && details.notes.length > 0 && (
          <CardFooter>
            <Alert variant="default" className="bg-accent/10 border-accent/20">
                <AlertTitle>Observações</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-4">
                        {details.notes.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>
          </CardFooter>
      )}
    </Card>
);
