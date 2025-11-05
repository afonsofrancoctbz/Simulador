
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { BookCopy, AlertCircle, TrendingUp, ShieldCheck } from "lucide-react";

const professionTaxes = [
  { profession: "Saúde e Educação", annex: "Anexo V / III", ivaReduction: "60%" },
  { profession: "Produção Artística", annex: "Anexo III", ivaReduction: "60%" },
  { profession: "Advogados", annex: "Anexo IV", ivaReduction: "30%" },
  { profession: "Administração", annex: "Anexo V", ivaReduction: "30%" },
  { profession: "Arquitetura / Engenharia", annex: "Anexo V", ivaReduction: "30%" },
  { profession: "Educação Física", annex: "Anexo V", ivaReduction: "30%" },
  { profession: "Veterinária", annex: "Anexo V", ivaReduction: "30%" },
  { profession: "Bares, Restaurantes, Turismo", annex: "Anexo I / III", ivaReduction: "40%" },
  { profession: "Tecnologia (Intelectual)", annex: "Anexo V", ivaReduction: "0% (Alíquota Padrão)" },
  { profession: "Locação de Bens Móveis", annex: "Anexo III", ivaReduction: "0% (Alíquota Padrão)" },
  { profession: "Comércio", annex: "Anexo I", ivaReduction: "0% (Alíquota Padrão)" },
];

export default function CnaeTaxInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-xl border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <BookCopy className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">
            Tributação por Atividade Pós-Reforma
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            Entenda como a combinação do Anexo do Simples Nacional com a nova alíquota do IVA (IBS/CBS) impacta cada profissão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-8">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="font-bold w-1/3">Atividade/Profissão</TableHead>
                    <TableHead className="font-bold w-1/3">Anexo Simples Nacional (Eixo 1)</TableHead>
                    <TableHead className="font-bold w-1/3 text-right">Redução IVA (Eixo 2)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {professionTaxes.map((item) => (
                    <TableRow key={item.profession}>
                        <TableCell className="font-semibold">{item.profession}</TableCell>
                        <TableCell>{item.annex}</TableCell>
                        <TableCell className="text-right">{item.ivaReduction}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            
          <Accordion type="single" collapsible className="w-full text-left">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                <AlertCircle className="mr-3 text-primary h-5 w-5" />
                Implicações Críticas para a Simulação
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-base text-muted-foreground">
                 <p>
                    O principal desafio na simulação reside no Simples Nacional, especialmente para serviços. O simulador precisa considerar três pontos-chave:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Fator R:</strong> Para a maioria dos serviços, o simulador deve calcular o Fator R (relação Folha/Receita) para determinar o enquadramento no Anexo III (alíquota menor) ou V (alíquota maior).
                    </li>
                    <li>
                        <strong>Competitividade B2B:</strong> A reforma permite que empresas do Simples Nacional no regime "Híbrido" repassem crédito de IVA integral, tornando-se mais competitivas ao vender para empresas do Lucro Presumido/Real. O simulador deve comparar o custo-benefício dessa opção.
                    </li>
                     <li>
                        <strong>Comparação de IRPJ/CSLL:</strong> Os percentuais de IRPJ/CSLL dentro do DAS (que variam por anexo e faixa) devem ser comparados com as alíquotas fixas sobre o lucro presumido (32% para a maioria dos serviços).
                    </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
