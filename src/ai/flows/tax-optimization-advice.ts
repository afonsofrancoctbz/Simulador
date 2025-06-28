'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing tax optimization advice based on user input data.
 *
 * - getTaxOptimizationAdvice - A function that triggers the tax optimization advice flow.
 * - TaxOptimizationInput - The input type for the getTaxOptimizationAdvice function.
 * - TaxOptimizationOutput - The return type for the getTaxOptimizationAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaxOptimizationInputSchema = z.object({
  activities: z
    .string()
    .describe(
      'A summary of all business activities (CNAEs) and their revenues.'
    ),
  totalDomesticRevenue: z
    .number()
    .describe('Total monthly revenue from domestic sales.'),
  totalExportRevenue: z
    .number()
    .describe('Total monthly revenue from export sales.'),
  totalSalaryExpense: z.number().describe('Total monthly salary expense.'),
  proLaborePartners: z
    .number()
    .describe('Monthly pro-labore amount for partners.'),
  numberOfPartners: z.number().describe('The number of partners in the business.'),
  municipalISSRate: z.number().describe('The municipal ISS rate.'),
  simplesNacionalSemFatorRBurden: z
    .number()
    .describe('The tax burden under Simples Nacional without Fator R optimization.'),
  simplesNacionalComFatorRBurden: z
    .number()
    .describe('The tax burden under Simples Nacional with Fator R optimization.'),
  lucroPresumidoTaxBurden: z
    .number()
    .describe('The tax burden under Lucro Presumido.'),
  healthPlanCost: z.number().describe('Total monthly cost of health plan paid by the company for partners.'),
});
export type TaxOptimizationInput = z.infer<typeof TaxOptimizationInputSchema>;

const TaxOptimizationOutputSchema = z.object({
  advice: z
    .string()
    .describe(
      'Context-aware advice on tax optimization based on the input data, in Portuguese.'
    ),
});
export type TaxOptimizationOutput = z.infer<typeof TaxOptimizationOutputSchema>;

export async function getTaxOptimizationAdvice(
  input: TaxOptimizationInput
): Promise<TaxOptimizationOutput> {
  return taxOptimizationAdviceFlow(input);
}

const taxOptimizationAdvicePrompt = ai.definePrompt({
  name: 'taxOptimizationAdvicePrompt',
  input: {schema: TaxOptimizationInputSchema},
  output: {schema: TaxOptimizationOutputSchema},
  prompt: `Você é um consultor tributário especialista nos regimes Simples Nacional e Lucro Presumido no Brasil.

  **Instruções:**
  Com base nos dados financeiros fornecidos, elabore uma recomendação concisa (3-4 frases) e acionável para o empresário otimizar sua carga tributária. A resposta deve ser em português.

  **Análise Mandatória:**
  1.  **Comparação de Regimes:** Compare os três cenários: Simples Nacional sem otimização, Simples Nacional com otimização do Fator R, e Lucro Presumido. Recomende o mais vantajoso em termos de custo total.
  2.  **Fator R:** Se a otimização do "Fator R" for benéfica, explique o porquê, mencionando a economia gerada ao aumentar o pró-labore para atingir 28% do faturamento, o que permite a tributação pelo Anexo III.
  3.  **Receitas de Exportação:** Se houver receitas de exportação, comente sobre o impacto positivo das isenções de PIS, COFINS e ISS.
  4.  **Plano de Saúde:** Comente o impacto do custo do plano de saúde, explicando que é um benefício para os sócios, mas que o valor pago pela empresa aumenta a base de cálculo para o IRRF.
  5.  **Pró-labore vs. Distribuição de Lucros:** Diferencie o pró-labore da distribuição de lucros. Explique que o pró-labore é a remuneração do sócio, com retenção de 11% de INSS e IRRF. Além disso, no Lucro Presumido e no Simples Nacional (Anexo IV), a empresa tem o custo da Contribuição Previdenciária Patronal (20% + adicionais) sobre o pró-labore. Já a distribuição de lucros é isenta de impostos para o sócio. Se a otimização do Fator R não for o principal fator, sugira manter um pró-labore estratégico (pelo menos um salário mínimo) e retirar o restante como lucros para maior eficiência tributária.

  **Dados Financeiros:**
  - Atividades (CNAEs): {{activities}}
  - Faturamento Mensal (Nacional): {{totalDomesticRevenue}}
  - Faturamento Mensal (Exportação): {{totalExportRevenue}}
  - Despesa com Salários (CLT): {{totalSalaryExpense}}
  - Pró-labore dos Sócios (Informado): {{proLaborePartners}}
  - Número de Sócios: {{numberOfPartners}}
  - Alíquota ISS Municipal: {{municipalISSRate}}%
  - Custo do Plano de Saúde: {{healthPlanCost}}
  - Custo Total (Simples Nacional sem Fator R): {{simplesNacionalSemFatorRBurden}}
  - Custo Total (Simples Nacional com Fator R): {{simplesNacionalComFatorRBurden}}
  - Custo Total (Lucro Presumido): {{lucroPresumidoTaxBurden}}

  **Formato da Resposta:**
  Gere apenas a recomendação em texto, sem cabeçalhos ou formatação extra.`,
});

const taxOptimizationAdviceFlow = ai.defineFlow(
  {
    name: 'taxOptimizationAdviceFlow',
    inputSchema: TaxOptimizationInputSchema,
    outputSchema: TaxOptimizationOutputSchema,
  },
  async input => {
    const {output} = await taxOptimizationAdvicePrompt(input);
    return output!;
  }
);
