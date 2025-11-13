
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";

const TRANSITION_INFO: { [key: number]: string } = {
    2026: 'Ano de Teste: IBS e CBS com alíquotas simbólicas (0,1% e 0,9%) para adaptação. PIS/COFINS ainda valem.',
    2027: 'Início da Transição: CBS entra em vigor plenamente, extinguindo PIS/COFINS. IBS continua em teste.',
    2028: 'Manutenção: A CBS segue com alíquota plena e o IBS em teste.',
    2029: 'Transição do IBS: Começa a substituição gradual do ICMS e ISS pelo IBS.',
    2030: 'Transição do IBS: Continua a substituição gradual do ICMS e ISS.',
    2031: 'Transição do IBS: A substituição do ICMS e ISS pelo IBS se intensifica.',
    2032: 'Fase Final da Transição: Último ano de convivência entre os impostos antigos e novos.',
    2033: 'Vigência Plena: O IVA (IBS + CBS) entra em vigor completamente, extinguindo ICMS e ISS.',
};

interface YearSelectorProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
    
    return (
        <Card className="w-full max-w-2xl mx-auto mb-8 shadow-lg border-primary/20 bg-primary/5">
            <CardHeader className="text-center">
                <Calendar className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl font-bold text-primary">Selecione o Ano da Simulação</CardTitle>
                <CardDescription>A Reforma Tributária terá um período de transição. Escolha o ano para ver o impacto correspondente.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-center">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">2026</span>
                    <Slider
                        min={2026}
                        max={2033}
                        step={1}
                        value={[selectedYear]}
                        onValueChange={(value) => onYearChange(value[0])}
                        className="flex-1"
                    />
                    <span className="text-sm font-medium">2033</span>
                </div>
                 <Badge className="mt-4 text-2xl font-bold p-3">{selectedYear}</Badge>
                 <p className="mt-4 text-sm text-muted-foreground h-10 flex items-center justify-center">
                    {TRANSITION_INFO[selectedYear]}
                </p>
            </CardContent>
        </Card>
    );
}
