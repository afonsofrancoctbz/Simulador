
'use server';

/**
 * @fileOverview A Genkit flow for extracting data from PGDAS-D PDF statements.
 *
 * - extractDataFromPgdas - A function that triggers the PDF data extraction flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PgdasDataSchema, type PgdasData } from '@/lib/types';


const PgdasInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PGDAS-D PDF statement, as a data URI that must include a MIME type and use Base64 encoding. Format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});

const extractPgdasPrompt = ai.definePrompt({
    name: 'extractPgdasPrompt',
    input: { schema: PgdasInputSchema },
    output: { schema: PgdasDataSchema },
    prompt: `Sua tarefa é analisar o documento PDF do PGDAS-D (Programa Gerador do Documento de Arrecadação do Simples Nacional - Declaratório) fornecido e extrair três informações cruciais com extrema precisão.

    Documento para análise:
    {{media url=pdfDataUri}}

    Valores a serem extraídos:
    1.  **RBT12**: Encontre o campo "Receita Bruta Acumulada (RBA) nos doze meses anteriores ao PA" e extraia o valor monetário. Converta-o para um número (ex: "R$ 240.000,00" deve virar 240000.00).
    2.  **folha12**: Encontre o campo "Folha de Salários (FS) dos doze meses anteriores ao PA" e extraia o valor monetário. Converta-o para um número (ex: "R$ 67.200,00" deve virar 67200.00).
    3.  **periodoApuracao**: Identifique o Período de Apuração (PA) do documento e retorne no formato "MM/YYYY".

    Retorne os dados no formato JSON especificado.`,
});


export async function extractDataFromPgdas(
  input: z.infer<typeof PgdasInputSchema>
): Promise<PgdasData> {
  const { output } = await extractPgdasPrompt(input);
  if (!output) {
    throw new Error('A IA não conseguiu extrair os dados do documento.');
  }
  return output;
}
