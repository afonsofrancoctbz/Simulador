
'use server';

/**
 * @fileOverview Genkit flow para extração de dados do PGDAS-D (Extrato do Simples Nacional).
 * 
 * Extrai com precisão:
 * - Tabelas mensais de Receita e Folha
 * - Totais de RBT12 e Folha de Salários para validação
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PgdasDataSchema, type PgdasData } from '@/lib/types';

const PgdasInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "PDF do PGDAS-D como data URI. Formato: 'data:application/pdf;base64,<encoded_data>'"
    ),
});

/**
 * Prompt otimizado para extração precisa e granular dos dados do PGDAS-D
 */
const extractPgdasPrompt = ai.definePrompt({
  name: 'extractPgdasPrompt',
  input: { schema: PgdasInputSchema },
  output: { schema: PgdasDataSchema },
  model: 'googleai/gemini-2.5-flash',
  config: {
    temperature: 0.1,
  },
  prompt: `Você é um especialista em análise de documentos fiscais brasileiros. Sua tarefa é extrair dados do PGDAS-D (Extrato do Simples Nacional) com PRECISÃO ABSOLUTA, focando nas tabelas mensais.

📄 DOCUMENTO PARA ANÁLISE:
{{media url=pdfDataUri}}

🎯 INSTRUÇÕES DE EXTRAÇÃO:

1.  **competencias (Array de Dados Mensais):**
    - Procure a seção **"2.2) Receitas Brutas Anteriores (R$)"**. Extraia a tabela completa com as colunas "Mês Anterior ao PA" (competência), e "Total" (receita).
    - Procure a seção **"2.3) Folha de Salários Anteriores (R$)"**. Extraia a tabela completa com as colunas "Mês Anterior ao PA" (competência), e "Total" (folha).
    - **UNIFIQUE** as duas tabelas. Para cada mês (competência), crie um objeto com \`{ mes, receita, folha }\`.
    - O formato do mês deve ser "MM/AAAA".
    - Se um mês tiver receita mas não tiver folha, o valor da folha deve ser \`0\`.
    - Se um mês tiver folha mas não tiver receita, o valor da receita deve ser \`0\`.
    - Converta todos os valores monetários para números (ex: 1.234,56 → 1234.56).

2.  **totalRBT12** (Receita Bruta Total - Validação):
    - Na seção "2.2", localize a linha de total: "Receita bruta acumulada nos doze meses anteriores ao PA (RBT12)".
    - Extraia o valor da coluna "Total" e converta para número.

3.  **totalFolha12** (Folha de Salários - Validação):
    - Na seção "2.3", localize a linha de total: "2.3.1) Total de Folhas de Salários Anteriores (R$)".
    - Extraia o valor e converta para número.

4.  **periodoApuracao** (Período de Apuração):
    - Procure "Período de Apuração (PA):". Extraia a data no formato MM/AAAA.

5.  **fatorR** e **anexo** (Opcional):
    - Procure a seção "2.4) Fator r". Se encontrar, extraia o valor numérico e o Anexo ("III" ou "V").

⚠️ REGRAS CRÍTICAS:
- A prioridade máxima é o array \`competencias\`. Se não conseguir extrair as tabelas mensais, retorne um array vazio.
- Sempre converta valores monetários brasileiros corretamente (ex: 1.234,56 → 1234.56).
- Retorne APENAS o JSON válido, sem nenhum texto, explicação ou markdown adicional.

✅ EXEMPLO DE RETORNO ESPERADO:
{
  "competencias": [
    { "mes": "08/2024", "receita": 30000.00, "folha": 1500.00 },
    { "mes": "09/2024", "receita": 32000.00, "folha": 1500.00 },
    { "mes": "10/2024", "receita": 28000.00, "folha": 1600.00 }
  ],
  "totalRBT12": 394270.17,
  "totalFolha12": 17686.00,
  "periodoApuracao": "08/2025",
  "fatorR": 0.04,
  "anexo": "V"
}`,
});

/**
 * Função principal de extração de dados do PGDAS
 * 
 * @param input - Objeto contendo o PDF em formato data URI
 * @returns Dados estruturados do PGDAS (incluindo array mensal)
 * @throws Error se a IA falhar na extração ou se dados obrigatórios estiverem ausentes
 */
export async function extractDataFromPgdas(
  input: z.infer<typeof PgdasInputSchema>
): Promise<PgdasData> {
  try {
    const { output } = await extractPgdasPrompt(input);
    
    if (!output) {
      throw new Error('A IA não conseguiu processar o documento PGDAS-D.');
    }

    if (output.totalRBT12 === undefined || output.totalRBT12 <= 0) {
      throw new Error('Total RBT12 inválido ou não encontrado no documento.');
    }
    if (output.totalFolha12 === undefined || output.totalFolha12 < 0) {
      throw new Error('Total da Folha de Salários inválida ou não encontrada no documento.');
    }

    if (!output.fatorR && output.totalRBT12 > 0) {
        output.fatorR = output.totalFolha12 / output.totalRBT12;
    }

    if (!output.anexo && output.fatorR !== undefined) {
        output.anexo = output.fatorR >= 0.28 ? 'III' : 'V';
    }

    return output;
    
  } catch (error) {
    console.error('❌ Erro na extração do PGDAS:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar o documento.';
    throw new Error(`Falha ao extrair dados do PGDAS: ${errorMessage}`);
  }
}
