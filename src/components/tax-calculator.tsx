"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DollarSign, Globe, Users, UserCheck, Briefcase, Landmark, Loader2, Lightbulb, TrendingUp } from 'lucide-react';
import { getTaxOptimizationAdvice, type TaxOptimizationInput } from '@/ai/flows/tax-optimization-advice';
import { calculateTaxes } from '@/lib/calculations';
import { type CalculationResults, type TaxFormValues } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  monthlyRevenueDomestic: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo."),
  monthlyRevenueExport: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo."),
  totalSalaryExpense: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo."),
  proLaborePartners: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo."),
  businessActivityCNAE: z.string().min(1, "Campo obrigatório."),
  municipalISSRate: z.coerce.number({ required_error: "Campo obrigatório" }).min(0, "O valor deve ser positivo.").max(5, "A alíquota não pode exceder 5%."),
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function TaxCalculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyRevenueDomestic: 10000,
      monthlyRevenueExport: 0,
      totalSalaryExpense: 1500,
      proLaborePartners: 2500,
      businessActivityCNAE: "6201-5/01",
      municipalISSRate: 2,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResults(null);
    setAdvice(null);

    const calculatedResults = calculateTaxes(values);
    setResults(calculatedResults);
    setIsLoading(false);
    
    setIsAdviceLoading(true);
    try {
      const aiInput: TaxOptimizationInput = {
        ...values,
        simplesNacionalTaxBurden: calculatedResults.simplesNacional.totalTax,
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

    return (
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Resultados da Análise</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className={`border-2 ${simplesIsCheaper ? 'border-accent' : 'border-transparent'}`}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-between">
                Simples Nacional
                {simplesIsCheaper && <Badge variant="default" className="bg-accent text-accent-foreground">Mais vantajoso</Badge>}
              </CardTitle>
              <CardDescription>Custo total mensal estimado</CardDescription>
              <p className="text-3xl font-bold text-primary">{formatCurrency(results.simplesNacional.totalMonthlyCost)}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Tributo</TableHead><TableHead className="text-right">Valor</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {results.simplesNacional.breakdown.map((item) => (
                    <TableRow key={item.name}><TableCell>{item.name}</TableCell><TableCell className="text-right">{formatCurrency(item.value)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className={`border-2 ${!simplesIsCheaper ? 'border-accent' : 'border-transparent'}`}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-between">
                Lucro Presumido
                {!simplesIsCheaper && <Badge variant="default" className="bg-accent text-accent-foreground">Mais vantajoso</Badge>}
              </CardTitle>
              <CardDescription>Custo total mensal estimado</CardDescription>
              <p className="text-3xl font-bold text-primary">{formatCurrency(results.lucroPresumido.totalMonthlyCost)}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Tributo</TableHead><TableHead className="text-right">Valor</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {results.lucroPresumido.breakdown.map((item) => (
                    <TableRow key={item.name}><TableCell>{item.name}</TableCell><TableCell className="text-right">{formatCurrency(item.value)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Lightbulb className="text-primary" />
              Recomendação da IA
            </CardTitle>
            <CardDescription>Conselhos para otimização fiscal baseados nos seus dados.</CardDescription>
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
      <Card className="max-w-4xl mx-auto shadow-lg" style={{backgroundColor: 'hsl(200 40% 97%)'}}>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Calculadora de Impostos</CardTitle>
          <CardDescription>Insira os dados da sua empresa para comparar os regimes tributários Simples Nacional e Lucro Presumido.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="monthlyRevenueDomestic" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><DollarSign size={16} />Faturamento Mensal (Nacional)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="R$ 10.000,00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="monthlyRevenueExport" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe size={16} />Faturamento Mensal (Exportação)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="R$ 0,00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="totalSalaryExpense" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users size={16} />Despesa com Salários (CLT)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="R$ 1.500,00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="proLaborePartners" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><UserCheck size={16} />Pró-labore dos Sócios</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="R$ 2.500,00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="businessActivityCNAE" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Briefcase size={16} />CNAE Principal</FormLabel>
                    <FormControl><Input placeholder="Ex: 6201-5/01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="municipalISSRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Landmark size={16} />Alíquota de ISS Municipal (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="Ex: 2" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  Calcular Impostos
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground">Nota: Os cálculos para o CNAE assumem atividade de serviço genérica para presunção de lucro e enquadramento nos anexos. Os resultados podem variar.</p>
        </CardFooter>
      </Card>
      {renderResults()}
    </>
  );
}
