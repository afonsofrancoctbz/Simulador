

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

const simpleAnnexes = [
  { annex: "Anexo I", scope: "Comércio", observation: "Tributação sobre a receita de venda de mercadorias." },
  { annex: "Anexo II", scope: "Indústria", observation: "Para empresas que realizam produção ou fabricação." },
  { annex: "Anexo III", scope: "Serviços", observation: "Alíquotas menores, para atividades que não exigem Fator R ou que o cumprem." },
  { annex: "Anexo IV", scope: "Serviços", observation: "Para atividades específicas (advocacia, construção civil) com CPP paga por fora do DAS." },
  { annex: "Anexo V", scope: "Serviços", observation: "Alíquotas maiores, sujeitas ao Fator R para possível migração para o Anexo III." },
];

const ivaRates = [
  { reduction: "0%", rate: "~26,5%", scope: "Alíquota padrão para a maioria dos bens e serviços (ex: tecnologia, locação de bens)." },
  { reduction: "30%", rate: "~18,55%", scope: "Serviços de profissão intelectual, científica ou artística (ex: advocacia, engenharia)." },
  { reduction: "60%", rate: "~10,60%", scope: "Serviços de saúde e educação, produções culturais, medicamentos e cesta básica." },
];

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Info className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Entendendo a Metodologia da Simulação (2026)
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            A simulação pós-reforma considera dois eixos de análise para determinar o melhor cenário.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Eixo 1: Simples Nacional (Anexos)</h3>
                <p className="text-sm text-muted-foreground mb-4">A atividade (CNAE) define o anexo e a forma de tributação dentro do Simples.</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Anexo</TableHead>
                            <TableHead>Abrangência</TableHead>
                            <TableHead>Observação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {simpleAnnexes.map(item => (
                            <TableRow key={item.annex}>
                                <TableCell className="font-semibold">{item.annex}</TableCell>
                                <TableCell>{item.scope}</TableCell>
                                <TableCell className="text-xs">{item.observation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Eixo 2: Carga Tributária do IVA (IBS/CBS)</h3>
                <p className="text-sm text-muted-foreground mb-4">Fora do Simples (LP ou SN Híbrido), a alíquota do IVA pode variar conforme o setor.</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Redução</TableHead>
                            <TableHead>Alíquota</TableHead>
                            <TableHead>Setores Aplicáveis</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ivaRates.map(item => (
                            <TableRow key={item.rate}>
                                <TableCell><Badge variant="secondary">{item.reduction}</Badge></TableCell>
                                <TableCell className="font-semibold">{item.rate}</TableCell>
                                <TableCell className="text-xs">{item.scope}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
