
'use server';

/**
 * @fileOverview Genkit flow para extração de dados do PGDAS-D (Extrato do Simples Nacional).
 * 
 * Extrai com precisão:
 * - RBT12: Receita Bruta Total acumulada nos últimos 12 meses
 * - folha12: Total da Folha de Salários dos últimos 12 meses
 * - periodoApuracao: Período de Apuração (PA)
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
 * Prompt otimizado para extração precisa dos dados do PGDAS-D
 */
const extractPgdasPrompt = ai.definePrompt({
  name: 'extractPgdasPrompt',
  input: { schema: PgdasInputSchema },
  output: { schema: PgdasDataSchema },
  model: 'googleai/gemini-2.5-flash',
  config: {
    temperature: 0.1,
  },
  prompt: `Você é um especialista em análise de documentos fiscais brasileiros. Sua tarefa é extrair dados do PGDAS-D (Extrato do Simples Nacional) com PRECISÃO ABSOLUTA.

📄 DOCUMENTO PARA ANÁLISE:
{{media url=pdfDataUri}}

🎯 INSTRUÇÕES DE EXTRAÇÃO:

1. **rbt12** (Receita Bruta Total - 12 meses):
   - Procure a seção "2.1 Discriminativo de Receitas" ou similar.
   - Encontre a linha: "Receita bruta acumulada nos doze meses anteriores ao PA (RBT12)".
   - Na coluna "Total", extraia o valor e converta para número.
   - Exemplo: se encontrar "394.270,17" → retorne 394270.17

2. **folha12** (Folha de Salários - 12 meses):
   - Procure a seção "2.3) Folha de Salários Anteriores (R$)" ou similar.
   - Encontre a linha: "2.3.1) Total de Folhas de Salários Anteriores (R$)" ou o campo que totaliza a folha dos últimos 12 meses.
   - Extraia o valor após "R$" e converta para número.
   - Exemplo: se encontrar "R$ 17.686,00" → retorne 17686.00. Se o valor for zero, retorne 0.

3. **periodoApuracao** (Período de Apuração):
   - Procure a seção "2) Informações da Apuração" ou no cabeçalho do documento.
   - Encontre a linha: "Período de Apuração (PA):".
   - Extraia a data no formato MM/YYYY.
   - Exemplo: se encontrar "08/2025" → retorne "08/2025".

4. **fatorR** (Fator R calculado - OPCIONAL):
   - Procure a seção "2.4) Fator r" ou similar.
   - Se existir, extraia o valor numérico do Fator r.
   - Exemplo: "Fator r = 0,04" → retorne 0.04. Se não encontrar, não inclua este campo.

5. **anexo** (Anexo aplicado - OPCIONAL):
   - Na mesma seção "2.4) Fator r" ou próximo a ele.
   - Se o documento especificar o Anexo, identifique se é "Anexo III" ou "Anexo V".
   - Retorne exatamente "III" ou "V". Se não encontrar, não inclua este campo.

⚠️ REGRAS CRÍTICAS:
- Sempre converta valores monetários brasileiros corretamente (ex: 1.234,56 → 1234.56).
- Ignore pontos de milhar e substitua a vírgula decimal por um ponto.
- Se um campo OPCIONAL não existir no documento, não o inclua no JSON de saída.
- Retorne APENAS o JSON válido, sem nenhum texto, explicação ou markdown adicional.

✅ EXEMPLO DE RETORNO ESPERADO:
{
  "rbt12": 394270.17,
  "folha12": 17686.00,
  "periodoApuracao": "08/2025",
  "fatorR": 0.04,
  "anexo": "V"
}`,
});

/**
 * Função principal de extração de dados do PGDAS
 * 
 * @param input - Objeto contendo o PDF em formato data URI
 * @returns Dados estruturados do PGDAS (RBT12, folha12, periodoApuracao, etc.)
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

    // Validação adicional dos dados obrigatórios
    if (output.rbt12 === undefined || output.rbt12 < 0) {
      throw new Error('RBT12 inválido ou não encontrado no documento.');
    }
    if (output.folha12 === undefined || output.folha12 < 0) {
      throw new Error('Folha de Salários inválida ou não encontrada no documento.');
    }
    if (!output.periodoApuracao || !/^\d{2}\/\d{4}$/.test(output.periodoApuracao)) {
      throw new Error('Período de Apuração inválido ou não encontrado.');
    }

    return output;
    
  } catch (error) {
    console.error('❌ Erro na extração do PGDAS:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar o documento.';
    throw new Error(`Falha ao extrair dados do PGDAS: ${errorMessage}`);
  }
}
