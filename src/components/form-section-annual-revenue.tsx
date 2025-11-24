
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FileText, AlertTriangle, UploadCloud, Loader2, List, Edit } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { formatCurrencyBRL, formatBRL, parseBRL } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { extractDataFromPgdas } from "@/ai/flows/extract-pgdas-flow";
import type { PgdasData, MonthlyData } from "@/lib/types";
import type { CalculatorFormValues } from './tax-calculator-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "./ui/table";
import { Button } from "./ui/button";

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function FormSectionAnnualRevenue() {
    const { control, setValue, getValues, watch } = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

    useEffect(() => {
        // 1. Calculate the new totals based on the monthly data grid
        const newRbt12 = monthlyData.reduce((acc, item) => acc + (item.receita || 0), 0);
        const newFolha12 = monthlyData.reduce((acc, item) => acc + (item.folha || 0), 0);
    
        // 2. Get the current values from the form without triggering a re-render
        const currentRbt12 = getValues('rbt12');
        const currentFolha12 = getValues('fp12');
    
        // 3. GUARD CLAUSE: Only update if there's a real difference to prevent the loop
        if (newRbt12 !== currentRbt12) {
            setValue('rbt12', newRbt12, { shouldValidate: true, shouldDirty: true });
        }
        
        if (newFolha12 !== currentFolha12) {
            setValue('fp12', newFolha12, { shouldValidate: true, shouldDirty: true });
        }
    
    }, [monthlyData, setValue, getValues]);

    const handleMonthlyDataChange = (index: number, field: 'receita' | 'folha', value: number) => {
        const updatedData = [...monthlyData];
        updatedData[index] = { ...updatedData[index], [field]: value };
        setMonthlyData(updatedData);
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            toast({ title: "Arquivo Inválido", description: "Por favor, selecione um arquivo PDF.", variant: "destructive" });
            return;
        }

        setIsUploading(true);

        try {
            const pdfDataUri = await fileToDataUri(file);
            const extractedData: PgdasData = await extractDataFromPgdas({ pdfDataUri });
            
            if (extractedData.competencias && extractedData.competencias.length > 0) {
                setMonthlyData(extractedData.competencias);
                toast({
                    title: "Extração Concluída!",
                    description: `Dados de ${extractedData.competencias.length} meses preenchidos. Confira os valores na grade.`,
                    className: 'bg-green-100 border-green-200 text-green-900',
                });
            } else {
                 setValue("rbt12", extractedData.totalRBT12, { shouldValidate: true, shouldDirty: true });
                 setValue("fp12", extractedData.totalFolha12, { shouldValidate: true, shouldDirty: true });
                 setMonthlyData([]);
                 toast({
                    title: "Extração Parcial",
                    description: "A IA extraiu os totais, mas não os detalhes mensais. Preencha a grade se precisar de mais precisão.",
                    variant: "default"
                });
            }
            
            setActiveTab("manual");

        } catch (error) {
            console.error("Error extracting data from PGDAS PDF:", error);
            const errorMessage = error instanceof Error ? error.message : "Tente novamente mais tarde.";
            toast({ title: "Falha na Extração", description: `A IA não conseguiu ler os dados do PDF. ${errorMessage}`, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    }, [setValue, toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isUploading,
    });


    const rbt12Value = watch("rbt12");
    const watchedRevenues = watch("revenues");

    const projectedAnnualRevenue = useMemo(() => {
        const domestic = Object.keys(watchedRevenues)
            .filter(k => k.startsWith('domestic_'))
            .reduce((sum, k) => sum + (watchedRevenues[k] || 0), 0);
        
        const exportVal = Object.keys(watchedRevenues)
            .filter(k => k.startsWith('export_'))
            .reduce((sum, k) => sum + (watchedRevenues[k] || 0), 0);

        const exchangeRate = getValues('exportCurrency') !== 'BRL' ? (getValues('exchangeRate') || 1) : 1;
        
        return (domestic + (exportVal * exchangeRate)) * 12;
    }, [watchedRevenues, getValues]);
      
    const SIMPLES_NACIONAL_LIMIT = 4800000;
    const showSimplesLimitWarning = (rbt12Value ?? 0) === 0 && projectedAnnualRevenue > SIMPLES_NACIONAL_LIMIT;

    return (
        <Card className='shadow-lg overflow-hidden border bg-card'>
            <CardHeader className='border-b bg-muted/30'>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Receita e Folha Anual (12 Meses)</CardTitle>
                        <CardDescription>Informação crucial para determinar a alíquota do Simples Nacional (Fator R).</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6 md:p-8'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Preenchimento</TabsTrigger>
                        <TabsTrigger value="import">Importar Extrato PGDAS</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                             <FormField control={control} name="rbt12" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Faturamento Total (RBT12)</FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="Ex: 250.000,00"
                                                onChange={(e) => field.onChange(parseBRL(e.target.value))}
                                                value={formatBRL(field.value)}
                                                readOnly={monthlyData.length > 0}
                                                className="pl-9 read-only:bg-muted/50"
                                            />
                                        </FormControl>
                                    </div>
                                    <FormDescription>Receita Bruta dos últimos 12 meses.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={control} name="fp12" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Folha de Pagamento (FP12)</FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="Ex: 70.000,00"
                                                onChange={(e) => field.onChange(parseBRL(e.target.value))}
                                                value={formatBRL(field.value)}
                                                readOnly={monthlyData.length > 0}
                                                className="pl-9 read-only:bg-muted/50"
                                            />
                                        </FormControl>
                                    </div>
                                    <FormDescription>Soma da folha dos últimos 12 meses.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <List className="h-5 w-5 text-primary"/>
                                        <span className="font-semibold">Detalhes Mês a Mês (Editável)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Competência</TableHead>
                                                    <TableHead>Receita</TableHead>
                                                    <TableHead>Folha / Pró-labore</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {monthlyData.length > 0 ? monthlyData.map((data, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{data.mes}</TableCell>
                                                        <TableCell>
                                                            <Input type="text" value={formatBRL(data.receita)} onChange={(e) => handleMonthlyDataChange(index, 'receita', parseBRL(e.target.value))} className="h-8"/>
                                                        </TableCell>
                                                         <TableCell>
                                                            <Input type="text" value={formatBRL(data.folha)} onChange={(e) => handleMonthlyDataChange(index, 'folha', parseBRL(e.target.value))} className="h-8"/>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                            Importe um extrato PGDAS ou preencha os totais manualmente.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </TabsContent>

                    <TabsContent value="import" className="mt-6">
                        <div 
                            {...getRootProps()} 
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                        >
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-4 text-primary">
                                    <Loader2 className="h-10 w-10 animate-spin" />
                                    <p className="font-semibold">Analisando o extrato...</p>
                                    <p className="text-sm text-muted-foreground">Aguarde, a IA está extraindo os dados.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                    <UploadCloud className="h-10 w-10" />
                                    <p className="font-semibold text-foreground">Arraste seu extrato do Simples Nacional aqui</p>
                                    <p className="text-sm">ou clique para selecionar o arquivo PDF.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                
                 {showSimplesLimitWarning && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Atenção: Limite do Simples Nacional</AlertTitle>
                        <AlertDescription>
                            Sua receita anual projetada ({formatCurrencyBRL(projectedAnnualRevenue)}) ultrapassa o teto de R$ 4,8 milhões.
                            Se sua empresa for nova (sem RBT12), ela poderá ser desenquadrada do Simples Nacional durante o ano.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
    
    