"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Wallet, Gift, Info, Users } from "lucide-react";
import { calculateEmployeeCost, EmployeeCostResult } from "@/lib/employee-cost-calculations";
import EmployeeCostResults from "./employee-cost-results"; // Importa o arquivo do Passo 2
import { NumericFormat } from "react-number-format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmployeeCostFormSchema = z.object({
    regime: z.enum(["simples", "presumido", "mei"]),
    salarioBase: z.coerce.number().min(1621, "O salário base deve ser no mínimo R$ 1.621,00 (Piso Nacional 2026)."),
    dependentes: z.coerce.number().min(0).max(20).default(0),
    valeTransporte: z.coerce.number().min(0).optional().default(0),
    valeRefeicao: z.coerce.number().min(0).optional().default(0),
    planoSaude: z.coerce.number().min(0).optional().default(0),
    outrosBeneficios: z.coerce.number().min(0).optional().default(0),
});

type EmployeeCostFormValues = z.infer<typeof EmployeeCostFormSchema>;

export default function EmployeeCostCalculator() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<EmployeeCostResult | null>(null);

    const form = useForm<EmployeeCostFormValues>({
        resolver: zodResolver(EmployeeCostFormSchema),
        defaultValues: {
            regime: "simples",
            salarioBase: 1621.00,
            dependentes: 0,
            valeTransporte: 0,
            valeRefeicao: 0,
            planoSaude: 0,
            outrosBeneficios: 0,
        },
    });

    function onSubmit(values: EmployeeCostFormValues) {
        setIsLoading(true);
        setTimeout(() => {
            const calculatedResults = calculateEmployeeCost(values);
            setResults(calculatedResults);
            setIsLoading(false);
            // Pequeno delay para garantir que o React renderizou o componente antes do scroll
            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 600);
    }
    
    return (
        <TooltipProvider>
            <div className="w-full max-w-5xl mx-auto space-y-8">
                
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Parâmetros Vigentes: 2026</AlertTitle>
                    <AlertDescription className="text-blue-700 text-sm">
                        Cálculos auditados com Salário Mínimo de <strong>R$ 1.621,00</strong>, Teto INSS de <strong>R$ 8.475,55</strong> e nova regra de isenção de IR até <strong>R$ 5.000,00</strong>.
                    </AlertDescription>
                </Alert>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Card Principal */}
                            <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-primary">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <DollarSign className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle>Dados Contratuais</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="salarioBase"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Salário Bruto (Carteira)</FormLabel>
                                                <FormControl>
                                                    <NumericFormat
                                                        customInput={Input}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        decimalScale={2}
                                                        value={field.value}
                                                        onValueChange={(v) => field.onChange(v.floatValue ?? 0)}
                                                        className="text-lg font-bold"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="regime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    Regime Tributário
                                                    <Tooltip>
                                                        <TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger>
                                                        <TooltipContent><p className="max-w-xs">Simples Nacional (Anexos I-III) é isento de INSS patronal. MEI paga 3%. Lucro Presumido paga ~28%.</p></TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="simples">Simples Nacional</SelectItem>
                                                        <SelectItem value="presumido">Lucro Presumido</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dependentes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    Dependentes (Filhos)
                                                    <Tooltip>
                                                        <TooltipTrigger><Users className="h-3 w-3 text-slate-400" /></TooltipTrigger>
                                                        <TooltipContent><p className="max-w-xs">Impacta no IRRF e garante Salário Família se aplicável.</p></TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} max={20} {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Card Benefícios */}
                            <Card className="lg:col-span-1 shadow-sm border-t-4 border-t-indigo-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-full">
                                            <Gift className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <CardTitle>Benefícios Mensais</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { name: "valeTransporte", label: "Vale Transporte" },
                                        { name: "valeRefeicao", label: "Vale Alimentação" },
                                        { name: "planoSaude", label: "Plano de Saúde" }
                                    ].map((item) => (
                                        <FormField
                                            key={item.name}
                                            control={form.control}
                                            name={item.name as keyof EmployeeCostFormValues}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">{item.label}</FormLabel>
                                                    <NumericFormat
                                                        customInput={Input}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        value={field.value}
                                                        onValueChange={(v) => field.onChange(v.floatValue ?? 0)}
                                                        className="h-9"
                                                        placeholder="R$ 0,00"
                                                    />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="sticky bottom-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl border shadow-2xl">
                             <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-6 bg-gradient-to-r from-primary to-blue-700 hover:to-primary transition-all shadow-lg hover:shadow-primary/25">
                                {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Wallet className="mr-2 h-6 w-6" />}
                                {isLoading ? "Processando Auditoria 2026..." : "Calcular Custo & Salário Líquido"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>

                {/* Renderização Condicional do Resultado */}
                <div id="results-section">
                    {results && <EmployeeCostResults results={results} />}
                </div>
            </div>
        </TooltipProvider>
    );
}