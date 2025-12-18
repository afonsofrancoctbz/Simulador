"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Wallet, Gift } from "lucide-react";
import { calculateEmployeeCost, EmployeeCostResult } from "@/lib/employee-cost-calculations";
import EmployeeCostResults from "./employee-cost-results";
import { NumericFormat } from "react-number-format";

const EmployeeCostFormSchema = z.object({
    regime: z.enum(["simples", "presumido", "mei"]),
    salarioBase: z.coerce.number().min(1518, "O salário base deve ser no mínimo R$ 1.518,00."),
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
            salarioBase: 1518.00,
            valeTransporte: 0,
            valeRefeicao: 0,
            planoSaude: 0,
            outrosBeneficios: 0,
        },
    });

    function onSubmit(values: EmployeeCostFormValues) {
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            const calculatedResults = calculateEmployeeCost(values);
            setResults(calculatedResults);
            setIsLoading(false);
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }
    
    return (
        <div className="w-full max-w-4xl mx-auto space-y-12">
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="shadow-lg border">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Salário e Regime</CardTitle>
                                    <CardDescription>Informe o salário base e o regime tributário da sua empresa.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FormField
                                control={form.control}
                                name="salarioBase"
                                render={({ field }) => {
                                    const inputRef = useRef<HTMLInputElement>(null);
                                    return (
                                        <FormItem>
                                            <FormLabel>Salário Base Mensal</FormLabel>
                                            <FormControl>
                                                <NumericFormat
                                                    customInput={Input}
                                                    getInputRef={inputRef}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix="R$ "
                                                    decimalScale={2}
                                                    allowNegative={false}
                                                    value={field.value}
                                                    onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                                    onFocus={() => inputRef.current?.select()}
                                                    placeholder="R$ 1.518,00"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="regime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Regime Tributário</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o regime" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="simples">Simples Nacional</SelectItem>
                                                <SelectItem value="presumido">Lucro Presumido / Real</SelectItem>
                                                <SelectItem value="mei">MEI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <Gift className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Benefícios (Opcional)</CardTitle>
                                    <CardDescription>Adicione os valores mensais dos benefícios oferecidos.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {[
                                { name: "valeTransporte", label: "Vale Transporte" },
                                { name: "valeRefeicao", label: "Vale Alimentação / Refeição" },
                                { name: "planoSaude", label: "Plano de Saúde / Odontológico" },
                                { name: "outrosBeneficios", label: "Outros Benefícios" }
                            ].map(item => (
                                <FormField
                                    key={item.name}
                                    control={form.control}
                                    name={item.name as keyof EmployeeCostFormValues}
                                    render={({ field }) => {
                                        const inputRef = useRef<HTMLInputElement>(null);
                                        return (
                                            <FormItem>
                                                <FormLabel>{item.label}</FormLabel>
                                                <FormControl>
                                                    <NumericFormat
                                                        customInput={Input}
                                                        getInputRef={inputRef}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        decimalScale={2}
                                                        allowNegative={false}
                                                        value={field.value as number}
                                                        onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                                                        onFocus={() => inputRef.current?.select()}
                                                        placeholder="R$ 0,00"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </CardContent>
                    </Card>

                    <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-10">
                        <Button type="submit" size="lg" disabled={isLoading} className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? <Loader2 className="animate-spin" /> : <Wallet />}
                            {isLoading ? "Calculando..." : "Calcular Custo do Funcionário"}
                        </Button>
                    </div>
                </form>
            </FormProvider>

            {isLoading && (
                <div id="results-section" className="mt-12 w-full text-center">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary"/>
                    <p className="mt-4 text-muted-foreground">Analisando os custos...</p>
                </div>
            )}
            
            {results && <EmployeeCostResults results={results} />}

        </div>
    );
}
