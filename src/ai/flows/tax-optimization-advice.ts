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
  simplesNacionalTaxBurden: z
    .number()
    .describe('The tax burden under Simples Nacional.'),
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
  1.  **Regime Tributário:** Analise os custos totais e recomende o regime mais vantajoso (Simples Nacional ou Lucro Presumido).
  2.  **Fator R:** Se houver atividades do Anexo V, analise o "Fator R". Se for inferior a 28%, sugira o ajuste do pró-labore para se enquadrar no Anexo III, se for benéfico.
  3.  **Receitas de Exportação:** Analise o impacto das receitas de exportação, destacando as isenções de PIS, COFINS e ISS e como isso beneficia a empresa.
  4.  **Plano de Saúde:** Comente o impacto do custo do plano de saúde, explicando que é um benefício para os sócios, mas que o valor pago pela empresa aumenta a base de cálculo para o IRRF.

  **Dados Financeiros:**
  - Atividades (CNAEs): {{activities}}
  - Faturamento Mensal (Nacional): {{totalDomesticRevenue}}
  - Faturamento Mensal (Exportação): {{totalExportRevenue}}
  - Despesa com Salários (CLT): {{totalSalaryExpense}}
  - Pró-labore dos Sócios: {{proLaborePartners}}
  - Número de Sócios: {{numberOfPartners}}
  - Alíquota ISS Municipal: {{municipalISSRate}}%
  - Custo do Plano de Saúde: {{healthPlanCost}}
  - Carga Tributária (Simples Nacional): {{simplesNacionalTaxBurden}}
  - Carga Tributária (Lucro Presumido): {{lucroPresumidoTaxBurden}}

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
