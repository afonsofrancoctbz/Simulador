
'use client';

import { useState, useMemo } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud, FileText, AlertTriangle, LineChart, BarChart, CheckCircle, Info, Target, Wallet, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { extractDataFromPgdas } from '@/ai/flows/extract-pgdas-flow';
import type { PgdasData, DadosMensais, AnaliseCompleta, ProjecaoMes } from '@/lib/fator-r-migration-logic';
import { gerarAnaliseCompleta } from '@/lib/fator-r-migration-logic';
import { formatCurrencyBRL, formatPercent, formatBRL, parseBRL } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const FatorRFormSchema = z.object({
  rbt12: z.coerce.number().min(1, "O faturamento anual deve ser maior que zero."),
  folha12: z.coerce.number().min(0, "A folha de pagamento não pode ser negativa."),
});

type FatorRFormValues = z.infer<typeof FatorRFormSchema>;


function FatorRAnalysisComponent({ analysis }: { analysis: AnaliseCompleta }) {
  const { situacaoAtual, analiseGap, planoAdequacao, projecao, roi, recomendacoes, jaOtimizado } = analysis;

  if (jaOtimizado) {
    return (
      <Card className="shadow-xl border-green-200 bg-green-50/70">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <CardTitle className="text-2xl font-bold text-green-800">Parabéns, sua empresa está otimizada!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Seu Fator R atual de <strong>{formatPercent(situacaoAtual.fatorR)}</strong> já garante sua tributação pelo <strong>Anexo III</strong>, o mais econômico para seus serviços.
          </p>
          <Alert>
            <AlertTitle>Recomendação</AlertTitle>
            <AlertDescription>
              {recomendacoes.join(' ')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analiseGap.viavel) {
     return (
       <Card className="shadow-xl border-amber-200 bg-amber-50/70">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
          <CardTitle className="text-2xl font-bold text-amber-800">Aumento Elevado Requer Atenção</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {analiseGap.mensagemViabilidade}
          </p>
           <Alert variant="destructive">
            <AlertTitle>Próximos Passos</AlertTitle>
            <AlertDescription>
              Ajustar apenas o pró-labore pode não ser a melhor estratégia. Avalie a contratação de funcionários ou consulte um de nossos especialistas para um planejamento tributário mais aprofundado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-8">
      {/* 1. Cards Comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-destructive/20 bg-red-50/30">
          <CardHeader>
            <Badge variant="destructive">Situação Atual</Badge>
            <CardTitle>Anexo {situacaoAtual.anexo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatPercent(situacaoAtual.aliquotaAtual)}</div>
            <p className="text-sm text-destructive/80 mt-1">Alíquota efetiva estimada</p>
            <div className="mt-4 text-2xl font-bold">{formatCurrencyBRL(situacaoAtual.custoMensalAtual)}</div>
            <p className="text-sm text-muted-foreground">Imposto mensal estimado</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <Badge className="bg-green-600 text-white">Com Adequação</Badge>
            <CardTitle>Anexo III</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{formatPercent(calcularAliquotaEfetivaAnexoIII(situacaoAtual.rbt12))}</div>
            <p className="text-sm text-green-600 mt-1">Alíquota efetiva reduzida</p>
             <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
              <div className="text-lg font-bold text-green-800">💰 Economia: {formatCurrencyBRL(roi.economiaMensal)}/mês</div>
              <p className="text-xs text-green-700/90">{formatCurrencyBRL(roi.economiaAnual)} por ano economizados</p>
            </div>
          </CardContent>
        </Card>
      </div>

       {/* 2. Plano de Adequação */}
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="text-primary"/>Plano de Adequação</CardTitle>
          <CardDescription>Ajuste o plano para encontrar a melhor estratégia para sua empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Ajuste Mensal da Folha</h4>
                <p>Folha base atual: <strong className="font-mono">{formatCurrencyBRL(planoAdequacao.folhaBaseAtual)}</strong></p>
                <p>+ Aumento necessário: <strong className="font-mono text-primary">{formatCurrencyBRL(planoAdequacao.aumentoMensalNecessario)}</strong></p>
                <hr/>
                <p> = Folha total projetada: <strong className="font-mono text-lg">{formatCurrencyBRL(planoAdequacao.folhaTotalMensal)}</strong></p>
              </div>
               <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Análise de ROI</h4>
                <p>Custo com encargos: <strong className="font-mono text-destructive">{formatCurrencyBRL(roi.custoMensalAdequacao)}/mês</strong></p>
                <p>Economia tributária: <strong className="font-mono text-green-600">{formatCurrencyBRL(roi.economiaMensal)}/mês</strong></p>
                <hr/>
                <p>Payback do investimento: <strong className="font-mono text-lg">{roi.paybackMeses.toFixed(1)} meses</strong></p>
              </div>
           </div>
        </CardContent>
      </Card>
      
       {/* 3. Projeção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChart className="text-primary"/>Projeção Mês a Mês</CardTitle>
          <CardDescription>Veja a evolução do seu Fator R e quando você atingirá a meta de 28%.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês (Folha)</TableHead>
                  <TableHead>Fator R Projetado</TableHead>
                  <TableHead>Anexo</TableHead>
                  <TableHead className="text-right">Economia no Mês</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projecao.map((mes) => (
                  <TableRow key={mes.mes}>
                    <TableCell className="font-medium">{mes.mesReferencia}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${mes.anexoProjetado === 'III' ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="font-mono">{formatPercent(mes.fatorRProjetado)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={mes.anexoProjetado === 'III' ? 'default' : 'secondary'}>
                        Anexo {mes.anexoProjetado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {mes.economiaEstimada > 0 ? `+ ${formatCurrencyBRL(mes.economiaEstimada)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="h-80 mt-8">
            <ResponsiveContainer width="100%" height="100%">
               <RechartsLineChart data={projecao.map(p => ({ mes: p.mesReferencia, 'Fator R': parseFloat((p.fatorRProjetado * 100).toFixed(2))}))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis unit="%" />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Legend />
                <ReferenceLine y={28} label="Meta" stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Fator R" stroke="hsl(var(--accent))" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
       {/* 4. Recomendações */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="text-primary"/>Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
           <ul className="space-y-2 list-disc pl-5">
            {recomendacoes.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}


export default function FatorRPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [dadosMensais, setDadosMensais] = useState<DadosMensais[] | null>(null);
    const [mesesAdequacao, setMesesAdequacao] = useState<number>(4);

    const form = useForm<FatorRFormValues>({
        resolver: zodResolver(FatorRFormSchema),
        defaultValues: { rbt12: 0, folha12: 0 }
    });
    
    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({ title: "Arquivo Inválido", description: "Por favor, selecione um arquivo PDF.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setDadosMensais(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const pdfDataUri = reader.result as string;
                const extractedData: PgdasData = await extractDataFromPgdas({ pdfDataUri });

                if (!extractedData || !extractedData.competencias || extractedData.competencias.length < 12) {
                  toast({ title: "Dados Incompletos", description: "A IA não conseguiu extrair o histórico completo de 12 meses do PDF. Análise não pode prosseguir.", variant: "destructive" });
                  setIsLoading(false);
                  return;
                }
                
                form.setValue('rbt12', extractedData.totalRBT12);
                form.setValue('folha12', extractedData.totalFolha12);
                setDadosMensais(extractedData.competencias as DadosMensais[]);

                toast({
                    title: "Extração Concluída!",
                    description: `Dados de ${extractedData.competencias.length} meses carregados. Iniciando análise...`,
                    className: 'bg-green-100 border-green-200 text-green-900',
                });
                setIsLoading(false);
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
            toast({ title: "Falha na Extração", description: `A IA não conseguiu ler os dados do PDF: ${errorMessage}`, variant: "destructive" });
            setIsLoading(false);
        }
    };
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isLoading,
    });

    const onSubmit = (data: FatorRFormValues) => {
        const receitaMensal = data.rbt12 / 12;
        const folhaMensal = data.folha12 / 12;
        const historicoSimulado: DadosMensais[] = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            return {
                mes: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
                receita: receitaMensal,
                folha: folhaMensal
            };
        });
        setDadosMensais(historicoSimulado);
    };

    const analysisResult = useMemo(() => {
        if (!dadosMensais || dadosMensais.length !== 12) return null;
        try {
            return gerarAnaliseCompleta(dadosMensais, mesesAdequacao);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
            toast({ title: "Erro na Análise", description: errorMessage, variant: "destructive" });
            return null;
        }
    }, [dadosMensais, mesesAdequacao, toast]);

    return (
        <>
            <AppHeader />
            <main>
                <section className="bg-slate-50/70 border-b">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Análise e Adequação do Fator R</h1>
                        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto pb-12">
                            Descubra se você está pagando mais impostos do que deveria e veja um plano para migrar para o Anexo III.
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 max-w-5xl space-y-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><FileText/> 1. Informe seus Dados Anuais</CardTitle>
                            <CardDescription>Insira os totais do seu negócio ou importe seu extrato PGDAS para preenchimento automático.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormProvider {...form}>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <FormField control={form.control} name="rbt12" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Faturamento Bruto Anual (RBT12)</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Ex: 300000,00" value={formatBRL(field.value)} onChange={e => field.onChange(parseBRL(e.target.value))}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="folha12" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Folha de Pagamento Anual (FP12)</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Ex: 40000,00" value={formatBRL(field.value)} onChange={e => field.onChange(parseBRL(e.target.value))}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <Button type="submit" className="w-full">Analisar com Dados Manuais</Button>
                                    </form>
                                </Form>
                            </FormProvider>
                            
                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink mx-4 text-gray-400 font-semibold">OU</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                            
                            <div 
                                {...getRootProps()} 
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                            >
                                <input {...getInputProps()} />
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-4 text-primary">
                                        <Loader2 className="h-10 w-10 animate-spin" />
                                        <p className="font-semibold">Analisando o extrato...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                        <UploadCloud className="h-10 w-10" />
                                        <p className="font-semibold text-foreground">Arraste seu extrato PGDAS aqui</p>
                                        <p className="text-sm">para preenchimento automático.</p>
                                    </div>
                                )}
                            </div>
                            <Alert variant="default" className="mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Onde encontrar o extrato?</AlertTitle>
                                <AlertDescription>
                                    Faça login no portal do Simples Nacional, vá para "PGDAS-D e DEFIS" &gt; "Consulta de Declaração" e baixe o "Extrato" em PDF do período desejado.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {analysisResult && !analysisResult.jaOtimizado && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Wallet/> 2. Defina o Plano de Adequação</CardTitle>
                                <CardDescription>Selecione em quantos meses você deseja realizar o ajuste da sua folha de pagamento para atingir o Fator R de 28%.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <p className="font-semibold">Meses para Adequação: <span className="text-primary text-xl">{mesesAdequacao}</span></p>
                                 <Slider
                                    defaultValue={[4]}
                                    value={[mesesAdequacao]}
                                    min={1}
                                    max={12}
                                    step={1}
                                    onValueChange={(value) => setMesesAdequacao(value[0])}
                                    className="w-full max-w-md"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {analysisResult && (
                      <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3"><BarChart /> 3. Análise e Projeção</h2>
                        <FatorRAnalysisComponent analysis={analysisResult as AnaliseCompleta} />
                      </div>
                    )}
                </div>
            </main>
            <AppFooter />
        </>
    );
}

// Dummy function to avoid TS error, should be imported from the logic file
function calcularAliquotaEfetivaAnexoIII(rbt12: number): number {
  const faixas = [
    { ate: 180000, aliquota: 0.06, deducao: 0 },
    { ate: 360000, aliquota: 0.112, deducao: 9360 },
    { ate: 720000, aliquota: 0.135, deducao: 17640 },
    { ate: 1800000, aliquota: 0.16, deducao: 35640 },
    { ate: 3600000, aliquota: 0.21, deducao: 125640 },
    { ate: 4800000, aliquota: 0.33, deducao: 648000 },
  ];
   if(rbt12 <= 0) return faixas[0].aliquota;
  const faixa = faixas.find(f => rbt12 <= f.ate) || faixas[faixas.length - 1];
  return (rbt12 * faixa.aliquota - faixa.deducao) / rbt12;
}


    