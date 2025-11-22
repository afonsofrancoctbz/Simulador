
"use client";

import { useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { FileText, AlertTriangle, UploadCloud, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { formatCurrencyBRL, formatBRL } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { extractDataFromPgdas } from "@/ai/flows/extract-pgdas-flow";
import type { PgdasData } from "@/lib/types";
import type { CalculatorFormValues } from './tax-calculator-form';


/**
 * Função auxiliar para converter arquivo File em data URI.
 * Executada no frontend antes de chamar a Server Action.
 */
async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type !== 'application/pdf') {
      reject(new Error('O arquivo deve ser um PDF.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo PDF.'));
    reader.readAsDataURL(file);
  });
}


export function FormSectionAnnualRevenue() {
    const form = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const pdfDataUri = await fileToDataUri(file);
            const extractedData: PgdasData = await extractDataFromPgdas({ pdfDataUri });

            form.setValue("rbt12", extractedData.rbt12, { shouldValidate: true, shouldDirty: true });
            form.setValue("fp12", extractedData.folha12, { shouldValidate: true, shouldDirty: true });
            
            toast({
                title: "Extração Concluída!",
                description: `Dados do extrato de ${extractedData.periodoApuracao} preenchidos com sucesso.`,
                className: 'bg-green-100 border-green-200 text-green-900',
            });
            
            setActiveTab("manual"); // Volta para a aba manual para conferência

        } catch (error) {
            console.error("Error extracting data from PGDAS PDF:", error);
            const errorMessage = error instanceof Error ? error.message : "Tente novamente mais tarde.";
            toast({ title: "Falha na Extração", description: `A IA não conseguiu ler os dados do PDF. ${errorMessage}`, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }

    }, [form, toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isUploading,
    });


    const rbt12Value = form.watch("rbt12");
    const watchedRevenues = form.watch("revenues");

    const projectedAnnualRevenue = useMemo(() => {
        const domestic = Object.keys(watchedRevenues)
            .filter(k => k.startsWith('domestic_'))
            .reduce((sum, k) => sum + (watchedRevenues[k] || 0), 0);
        
        const exportVal = Object.keys(watchedRevenues)
            .filter(k => k.startsWith('export_'))
            .reduce((sum, k) => sum + (watchedRevenues[k] || 0), 0);

        const exchangeRate = form.getValues('exportCurrency') !== 'BRL' ? (form.getValues('exchangeRate') || 1) : 1;
        
        return (domestic + (exportVal * exchangeRate)) * 12;
    }, [watchedRevenues, form]);
      
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
                        <CardTitle className="text-xl font-bold">Receita Anual</CardTitle>
                        <CardDescription>Esta informação é crucial para determinar a alíquota correta do Simples Nacional.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6 md:p-8'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Preenchimento Manual</TabsTrigger>
                        <TabsTrigger value="import">Importar Extrato PGDAS (PDF)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                            <FormField control={form.control} name="rbt12" render={({ field }) => {
                                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const { value } = e.target;
                                    const digitsOnly = value.replace(/\D/g, '');
                                    field.onChange(Number(digitsOnly) / 100);
                                };
                                return (
                                    <FormItem>
                                        <FormLabel>Faturamento Total (RBT12)</FormLabel>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
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
                                                    className="pl-9"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormDescription>
                                            Receita Bruta dos últimos 12 meses.
                                        </FormDescription>
                                        <FormMessage />
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
                                        <FormLabel>Folha de Pagamento (FP12)</FormLabel>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
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
                                                    className="pl-9"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormDescription>
                                            Soma da folha dos últimos 12 meses.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }} />
                        </div>
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
