
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSITION_INFO: { [key: number]: string } = {
    2026: 'Ano de Teste: Alíquotas simbólicas de IBS (0,1%) e CBS (0,9%) para adaptação, sem impacto real no caixa.',
    2027: 'Início da Transição Federal: CBS entra em vigor plenamente, extinguindo PIS/COFINS. Imposto Seletivo é ativado.',
    2028: 'Manutenção do Cenário: A CBS continua com alíquota plena e o IBS permanece em fase de teste (0,1%).',
    2029: 'Início da Transição Subnacional: IBS começa a substituir ICMS e ISS, que são reduzidos em 10%.',
    2030: 'Avanço da Transição: A substituição de ICMS/ISS pelo IBS continua, com redução progressiva.',
    2031: 'Intensificação da Transição: A substituição de ICMS/ISS pelo IBS se acelera.',
    2032: 'Fase Final da Transição: Último ano de coexistência entre os impostos antigos e novos, com o IBS se aproximando da alíquota cheia.',
    2033: 'Vigência Plena: O IVA (IBS + CBS) entra em vigor completamente, extinguindo ICMS e ISS.',
};

const YEARS = Object.keys(TRANSITION_INFO).map(Number);

interface YearSelectorProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
    
    return (
        <Card className="w-full max-w-4xl mx-auto mb-8 shadow-lg border-primary/20 bg-primary/5 overflow-hidden">
            <CardHeader className="text-center pb-4">
                <Calendar className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl font-bold text-primary">Selecione o Ano da Simulação</CardTitle>
                <CardDescription>A Reforma Tributária é gradual. Escolha o ano para ver o impacto correspondente.</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-6 text-center">
                <div className="relative flex items-center justify-between my-6 px-2">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10"></div>
                     <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10" 
                        style={{ width: `${((selectedYear - YEARS[0]) / (YEARS[YEARS.length - 1] - YEARS[0])) * 100}%` }}
                    ></div>
                    {YEARS.map((year) => (
                        <Button
                            key={year}
                            variant="ghost"
                            onClick={() => onYearChange(year)}
                            className={cn(
                                "h-10 w-10 p-0 rounded-full border-2 bg-background flex-shrink-0 transition-all duration-200",
                                selectedYear === year 
                                    ? "border-primary scale-110 shadow-lg" 
                                    : "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary",
                                selectedYear > year && "border-primary/70"
                            )}
                        >
                            <span className="text-sm font-semibold">{String(year).slice(-2)}</span>
                        </Button>
                    ))}
                </div>

                 <div className="mt-6 p-4 bg-background/50 rounded-lg min-h-[90px] flex flex-col justify-center items-center">
                    <Badge className="text-2xl font-bold py-1 px-4 mb-3 shadow-sm">{selectedYear}</Badge>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                        {TRANSITION_INFO[selectedYear]}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
