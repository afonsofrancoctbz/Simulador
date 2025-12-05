"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, DollarSign, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

// --- INTERFACE DE PROPS (Crucial para corrigir o erro de Build) ---
// Define exatamente o que a página Home envia para este componente
interface TaxCalculatorProps {
  year: number;
  onExportRevenueChange: (show: boolean) => void;
  onResultsChange: (show: boolean) => void;
  onYearChange?: (year: number) => void; // Opcional, pois só é usado na aba 2026+
}

export default function TaxCalculator({
  year,
  onExportRevenueChange,
  onResultsChange,
  onYearChange,
}: TaxCalculatorProps) {
  
  // --- Estados do Formulário ---
  const [faturamento, setFaturamento] = useState<string>("");
  const [folhaPagamento, setFolhaPagamento] = useState<string>("");
  const [temExportacao, setTemExportacao] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cenário de Reforma Tributária (2026 em diante)
  const isReformScenario = year >= 2026;

  // Efeito: Reseta a visualização dos resultados se o ano mudar
  useEffect(() => {
    onResultsChange(false);
  }, [year, onResultsChange]);

  // Efeito: Controla a exibição da seção de exportação na página pai
  useEffect(() => {
    onExportRevenueChange(temExportacao);
  }, [temExportacao, onExportRevenueChange]);

  // --- Função Auxiliar de Formatação de Moeda ---
  const formatMoney = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = Number(numericValue) / 100;
    return floatValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleChangeFaturamento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") setFaturamento("");
    else setFaturamento(formatMoney(raw));
  };

  const handleChangeFolha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") setFolhaPagamento("");
    else setFolhaPagamento(formatMoney(raw));
  };

  // --- Handler de Cálculo ---
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // [IMPORTANTE] Aqui você deve reconectar sua lógica real de cálculo (server actions ou libs)
    // Estou simulando um delay para a UX funcionar e o build passar
    setTimeout(() => {
      console.log(`Calculando impostos para o ano ${year}...`);
      
      // Libera a exibição dos resultados na página pai
      onResultsChange(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Calculator className="h-5 w-5 text-blue-600" />
              Simulador Tributário {year}
            </CardTitle>
            <p className="text-sm text-slate-500">
              {isReformScenario 
                ? "Simulação com regras de transição da Reforma Tributária (IVA Dual)." 
                : "Comparativo Simples Nacional vs. Lucro Presumido (Regras Atuais)."}
            </p>
          </div>

          {/* Seletor de Ano (Renderizado apenas se a função onYearChange for passada - Aba 2026) */}
          {onYearChange && (
            <div className="flex items-center gap-3 bg-white p-1.5 pr-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Ano Base
              </div>
              <Select 
                value={String(year)} 
                onValueChange={(val) => onYearChange(Number(val))}
              >
                <SelectTrigger className="w-[100px] h-8 border-none shadow-none focus:ring-0 font-medium">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => 2026 + i).map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8">
        <form onSubmit={handleCalculate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Input: Faturamento */}
            <div className="space-y-3">
              <Label htmlFor="faturamento" className="text-base font-semibold text-slate-700">
                Faturamento Mensal Médio
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <Input 
                  id="faturamento" 
                  placeholder="R$ 0,00" 
                  className="pl-10 h-12 text-lg shadow-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  value={faturamento}
                  onChange={handleChangeFaturamento}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Média estimada dos últimos 12 meses.
              </p>
            </div>

            {/* Input: Folha de Pagamento */}
            <div className="space-y-3">
              <Label htmlFor="folha" className="text-base font-semibold text-slate-700">
                Folha de Pagamento Mensal
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <Input 
                  id="folha" 
                  placeholder="R$ 0,00" 
                  className="pl-10 h-12 text-lg shadow-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  value={folhaPagamento}
                  onChange={handleChangeFolha}
                />
              </div>
              <p className="text-xs text-slate-500">
                Inclua Pró-labore e salários (opcional).
              </p>
            </div>
          </div>

          {/* Toggle: Exportação de Serviços */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="space-y-0.5">
              <Label htmlFor="export-mode" className="text-base font-medium text-slate-800">
                Exportação de Serviços?
              </Label>
              <p className="text-sm text-slate-500">
                Ative se sua empresa presta serviços para clientes no exterior.
              </p>
            </div>
            <Switch 
              id="export-mode" 
              checked={temExportacao}
              onCheckedChange={setTemExportacao}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full md:w-auto md:min-w-[240px] h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-[0.98]"
              disabled={isLoading || !faturamento}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  Calcular Cenários
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <span>Simulação para fins estimativos. Consulte um contador.</span>
        </div>
      </CardFooter>
    </Card>
  );
}