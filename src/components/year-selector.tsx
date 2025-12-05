'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSITION_INFO: { [key: number]: React.ReactNode } = {
    2026: <span>Ano de Teste: Alíquotas simbólicas de <strong>IBS (0,1%)</strong> e <strong>CBS (0,9%)</strong> para adaptação, sem impacto real no caixa.</span>,
    2027: <span>Início da Transição Federal: <strong>CBS</strong> entra em vigor plenamente, extinguindo <strong>PIS/COFINS</strong>. Imposto Seletivo é ativado.</span>,
    2028: <span>Manutenção do Cenário: A <strong>CBS</strong> continua com alíquota plena e o <strong>IBS</strong> permanece em fase de teste (0,1%).</span>,
    2029: <span>Início da Transição Subnacional: <strong>IBS</strong> começa a substituir <strong>ICMS</strong> e <strong>ISS</strong>, que são reduzidos em 10%.</span>,
    2030: <span>Avanço da Transição: A substituição de <strong>ICMS/ISS</strong> pelo <strong>IBS</strong> continua, com redução progressiva.</span>,
    2031: <span>Intensificação da Transição: A substituição de <strong>ICMS/ISS</strong> pelo <strong>IBS</strong> se acelera.</span>,
    2032: <span>Fase Final da Transição: Último ano de coexistência entre os impostos antigos e novos, com o <strong>IBS</strong> se aproximando da alíquota cheia.</span>,
    2033: <span>Vigência Plena: O IVA (<strong>IBS + CBS</strong>) entra em vigor completamente, extinguindo <strong>ICMS</strong> e <strong>ISS</strong>.</span>,
};

const YEARS = Object.keys(TRANSITION_INFO).map(Number);

interface YearSelectorProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
    // Calcula a porcentagem de progresso para a barra de fundo
    const progressPercentage = ((selectedYear - YEARS[0]) / (YEARS[YEARS.length - 1] - YEARS[0])) * 100;

    return (
        <Card className="w-full max-w-5xl mx-auto shadow-md border-border/60 bg-background relative mb-8 overflow-hidden !static !top-auto">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
            
            <CardHeader className="text-center pb-6 pt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">Cronograma da Reforma Tributária</CardTitle>
                </div>
                <CardDescription className="text-base max-w-2xl mx-auto">
                    Navegue pela linha do tempo para simular o impacto financeiro em cada fase da transição.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 sm:px-8 pb-8">
                {/* Linha do Tempo Visual com Scroll Horizontal para Mobile */}
                <div className="relative mb-6 mt-2 px-4 overflow-x-auto pb-6 hide-scrollbar">
                    <div className="min-w-[600px] px-4 relative"> {/* Container com largura mínima para evitar quebra no mobile */}
                        
                        {/* Linha de Fundo (Cinza) */}
                        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-muted rounded-full -z-20"></div>
                        
                        {/* Linha de Progresso (Colorida) - Ajustada dinamicamente */}
                        <div 
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-primary transition-all duration-500 ease-out rounded-full -z-10 origin-left" 
                            style={{ width: `calc(${progressPercentage}% - 2rem)` }} 
                        ></div>

                        {/* Botões dos Anos */}
                        <div className="flex justify-between items-center w-full">
                            {YEARS.map((year) => {
                                const isSelected = selectedYear === year;
                                const isPast = selectedYear > year;

                                return (
                                    <div key={year} className="flex flex-col items-center group relative cursor-pointer" onClick={() => onYearChange(year)}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "h-12 w-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 z-10 relative",
                                                isSelected 
                                                    ? "bg-primary border-background shadow-lg scale-125 ring-4 ring-primary/20 text-primary-foreground" 
                                                    : isPast 
                                                        ? "bg-primary border-primary text-primary-foreground hover:bg-primary/90" // Passado: Cheio mas sem check
                                                        : "bg-background border-muted text-muted-foreground hover:border-primary/50 hover:text-primary"
                                            )}
                                        >
                                            <span className={cn("text-sm font-bold", isSelected ? "text-lg" : "")}>
                                                {String(year).slice(-2)}
                                            </span>
                                        </Button>
                                        
                                        {/* Label do Ano abaixo do botão */}
                                        <div className={cn(
                                            "mt-3 text-xs font-semibold transition-colors duration-300 absolute top-full",
                                            isSelected ? "text-primary font-bold scale-110" : "text-muted-foreground"
                                        )}>
                                            {year}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Caixa de Informação do Cenário */}
                 <div className="mx-4 sm:mx-0 mt-4 bg-muted/30 border border-border/50 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-4 transition-all duration-300 hover:bg-muted/50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col items-center justify-center min-w-[100px] gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cenário</span>
                        <Badge variant={selectedYear === 2033 ? "default" : "outline"} className="text-lg px-4 py-1 border-primary/20 bg-background text-primary shadow-sm">
                            {selectedYear}
                        </Badge>
                    </div>
                    
                    <div className="hidden md:block w-px h-12 bg-border/60 mx-2"></div>

                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-semibold text-foreground mb-1 flex items-center justify-center md:justify-start gap-2">
                            Fase da Reforma
                            {selectedYear >= 2027 && selectedYear < 2033 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Em Transição</span>
                            )}
                            {selectedYear === 2033 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">Vigência Plena</span>
                            )}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {TRANSITION_INFO[selectedYear]}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}