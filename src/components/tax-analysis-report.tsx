"use client";

import type { CalculationResults, TaxDetails } from "@/lib/types";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ArrowRight, CheckCircle, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface ReportProps {
    results: CalculationResults;
}

export function TaxAnalysisReport({ results }: ReportProps) {
    const { simplesNacionalBase, simplesNacionalOtimizado, lucroPresumido } = results;

    const initialBest = [simplesNacionalBase, lucroPresumido].reduce((a, b) => (a.totalMonthlyCost < b.totalMonthlyCost ? a : b));

    const scenarios = [
        { title: `Cenário Inicial: ${simplesNacionalBase.regime}`, details: simplesNacionalBase },
        { title: `Cenário Inicial: ${lucroPresumido.regime}`, details: lucroPresumido },
    ];

    if (simplesNacionalOtimizado) {
        scenarios.push({ title: `Cenário Otimizado: ${simplesNacionalOtimizado.regime}`, details: simplesNacionalOtimizado });
    }

    const finalBest = simplesNacionalOtimizado
        ? [simplesNacionalOtimizado, lucroPresumido].reduce((a, b) => (a.totalMonthlyCost < b.totalMonthlyCost ? a : b))
        : initialBest;
        
    const faturamentoAnual = simplesNacionalBase.totalRevenue * 12;

    const renderScenarioDetails = (scenario: TaxDetails) => {
        const custoTotalAnual = scenario.totalMonthlyCost * 12;
        const impostoAnual = scenario.totalTax * 12;
        const proLaboreAnual = scenario.proLabore * 12;
        const encargosAnuais = (scenario.breakdown.find(b => b.name.includes("CPP"))?.value ?? 0) * 12 + (scenario.partnerTaxes.reduce((acc, p) => acc + p.inss, 0) * 12);
        const custoTotalPessoal = proLaboreAnual + encargosAnuais;
        const lucroLiquido = faturamentoAnual - impostoAnual - custoTotalPessoal - 120000; // 120k despesas operacionais
        const cargaTributariaEfetiva = faturamentoAnual > 0 ? (impostoAnual + encargosAnuais) / faturamentoAnual : 0;

        return {
            impostoAnual,
            custoTotalPessoal,
            lucroLiquido,
            cargaTributariaEfetiva
        };
    };

    const initialSNData = renderScenarioDetails(simplesNacionalBase);
    const initialLPData = renderScenarioDetails(lucroPresumido);
    const optimizedSNData = simplesNacionalOtimizado ? renderScenarioDetails(simplesNacionalOtimizado) : null;

    return (
        <div id="analysis-report-section" className="mt-16 w-full max-w-5xl mx-auto space-y-12">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Relatório de Análise Tributária</h2>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Uma análise detalhada dos regimes para a sua empresa, com base nos dados informados.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>1. Análise do Perfil da Empresa</CardTitle>
                    <CardDescription>Resumo dos dados e cálculo inicial do Fator R.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Faturamento Anual</p>
                            <p className="font-bold text-lg text-primary">{formatCurrencyBRL(faturamentoAnual)}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Folha Anual (FP12)</p>
                            <p className="font-bold text-lg text-primary">{formatCurrencyBRL(simplesNacionalBase.proLabore * 12)}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">CNAE Principal</p>
                            <p className="font-bold text-lg text-primary">6201-5/01</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Fator R Inicial</p>
                            <p className="font-bold text-lg text-primary">{formatPercent(simplesNacionalBase.fatorR ?? 0)}</p>
                        </div>
                    </div>
                    {simplesNacionalBase.fatorR !== undefined && simplesNacionalBase.fatorR < 0.28 && (
                        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-900">
                             <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <AlertTitle className="font-semibold">Alerta de Enquadramento</AlertTitle>
                            <AlertDescription>
                                Com um Fator R de {formatPercent(simplesNacionalBase.fatorR)}, a empresa é inicialmente tributada pelo Anexo V do Simples Nacional, que possui alíquotas mais elevadas.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Tabela Comparativa (Cenário Inicial)</CardTitle>
                    <CardDescription>Comparativo financeiro entre Simples Nacional (Anexo V) e Lucro Presumido no cenário inicial.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Indicador</TableHead>
                                <TableHead className="text-right font-semibold">{simplesNacionalBase.regime}</TableHead>
                                <TableHead className="text-right font-semibold">{lucroPresumido.regime}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Receita Bruta Anual</TableCell>
                                <TableCell className="text-right">{formatCurrencyBRL(faturamentoAnual)}</TableCell>
                                <TableCell className="text-right">{formatCurrencyBRL(faturamentoAnual)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Custo com Impostos (Anual)</TableCell>
                                <TableCell className="text-right">{formatCurrencyBRL(initialSNData.impostoAnual)}</TableCell>
                                <TableCell className="text-right">{formatCurrencyBRL(initialLPData.impostoAnual)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Custo com Pró-labore + Encargos</TableCell>
                                <TableCell className="text-right">{formatCurrencyBRL(initialSNData.custoTotalPessoal)}</TableCell>
                                <TableCell className="text-right">{formatCurrencyBRL(initialLPData.custoTotalPessoal)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Carga Tributária Efetiva</TableCell>
                                <TableCell className="text-right font-semibold text-primary">{formatPercent(initialSNData.cargaTributariaEfetiva)}</TableCell>
                                <TableCell className="text-right font-semibold text-primary">{formatPercent(initialLPData.cargaTributariaEfetiva)}</TableCell>
                            </TableRow>
                             <TableRow className="font-bold bg-muted/30">
                                <TableCell>(=) Lucro Líquido Final Estimado</TableCell>
                                <TableCell className="text-right text-xl">{formatCurrencyBRL(initialSNData.lucroLiquido)}</TableCell>
                                <TableCell className="text-right text-xl">{formatCurrencyBRL(initialLPData.lucroLiquido)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {optimizedSNData && simplesNacionalOtimizado && (
                <Card className="border-2 border-primary/30 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2"><TrendingUp className="h-6 w-6"/> 3. Análise de Sensibilidade: Otimização do Fator R</CardTitle>
                        <CardDescription>Simulamos o aumento do pró-labore para R$ {formatCurrencyBRL(simplesNacionalOtimizado.proLabore * 12)}/ano para atingir um Fator R de {formatPercent(simplesNacionalOtimizado.fatorR ?? 0)} e enquadrar a empresa no Anexo III.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Indicador</TableHead>
                                    <TableHead className="text-right font-semibold">Lucro Presumido</TableHead>
                                    <TableHead className="text-right font-semibold">{simplesNacionalOtimizado.regime}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Custo com Impostos (Anual)</TableCell>
                                    <TableCell className="text-right">{formatCurrencyBRL(initialLPData.impostoAnual)}</TableCell>
                                    <TableCell className="text-right">{formatCurrencyBRL(optimizedSNData.impostoAnual)}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>Custo com Pró-labore + Encargos</TableCell>
                                    <TableCell className="text-right">{formatCurrencyBRL(initialLPData.custoTotalPessoal)}</TableCell>
                                    <TableCell className="text-right">{formatCurrencyBRL(optimizedSNData.custoTotalPessoal)}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>Carga Tributária Efetiva</TableCell>
                                    <TableCell className="text-right font-semibold text-primary">{formatPercent(initialLPData.cargaTributariaEfetiva)}</TableCell>
                                    <TableCell className="text-right font-semibold text-primary">{formatPercent(optimizedSNData.cargaTributariaEfetiva)}</TableCell>
                                </TableRow>
                                 <TableRow className="font-bold bg-background">
                                    <TableCell>(=) Lucro Líquido Final Estimado</TableCell>
                                    <TableCell className="text-right text-xl">{formatCurrencyBRL(initialLPData.lucroLiquido)}</TableCell>
                                    <TableCell className="text-right text-xl text-green-600">{formatCurrencyBRL(optimizedSNData.lucroLiquido)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-green-50/50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2"><Lightbulb className="h-6 w-6" /> 4. Recomendação Final</CardTitle>
                </CardHeader>
                <CardContent className="text-base text-green-900 space-y-3">
                    {finalBest.regime === lucroPresumido.regime ? (
                        <p>Com base na análise, o regime do <strong>Lucro Presumido</strong> se mostra o mais vantajoso financeiramente para a Alfa Soluções em TI, resultando em um lucro líquido final de <strong>{formatCurrencyBRL(initialLPData.lucroLiquido)}</strong>.</p>
                    ) : (
                        <>
                            <p>A análise demonstra que a estratégia mais vantajosa para a Alfa Soluções em TI é adotar o regime do <strong>Simples Nacional com a otimização do Fator R</strong>. </p>
                            <p>Aumentando o pró-labore para <strong>{formatCurrencyBRL(simplesNacionalOtimizado!.proLabore * 12)}</strong> anuais, a empresa migra do Anexo V para o Anexo III. Embora o custo com a folha de pagamento aumente, a economia gerada no imposto (DAS) é substancialmente maior, resultando no maior lucro líquido final entre todos os cenários: <strong>{formatCurrencyBRL(optimizedSNData!.lucroLiquido)}</strong>.</p>
                            <p><strong>Recomendação Conclusiva:</strong> Adotar o Simples Nacional, ajustar o pró-labore dos sócios para garantir um Fator R acima de 28% e, assim, ser tributado pelas alíquotas mais favoráveis do Anexo III.</p>
                        </>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
