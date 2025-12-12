'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FatorRResponseSchema } from '@/lib/types';

// --- Constantes de Configuração (Idealmente via Remote Config) ---
const META_FATOR_R = 0.28;
const MAX_PROJECTION_MONTHS = 24; // Limite de segurança da simulação
const TEXTS = {
    success: (fatorR: string) => 
        `Seu Fator R atual (${fatorR}%) já está acima de 28%. Você está enquadrado no Anexo III.`,
    
    warning_projection: (fatorR: string, meses: number, proLabore: string) => 
        `Seu Fator R atual é de ${fatorR}% (Anexo V). Para atingir o Anexo III, seu pró-labore precisa ser de ${proLabore}. ` +
        `Mantendo essa projeção, sua média acumulada atingirá 28% em aproximadamente **${meses} ${meses > 1 ? 'meses' : 'mês'}**.`,
    
    warning_disclaimer: 
        `\n\n*(Esta é uma estimativa simplificada. O tempo exato depende da variação real de cada um dos últimos 12 meses).*`,
    
    error_unreachable: (fatorR: string, proLabore: string) =>
        `Seu Fator R atual é de ${fatorR}% (Anexo V). Mesmo com o pró-labore projetado (${proLabore}), a simulação de ${MAX_PROJECTION_MONTHS} meses não atingiu a meta de 28%.`
};
// --- Fim das Constantes ---


const FatorRInputSchema = z.object({
  RBT12_atual: z.number(),           // Ex: 240000
  FS12_atual: z.number(),            // Ex: 67000
  receitaMensalProjetada: z.number(), // Ex: 20000
});

export type FatorRResponse = z.infer<typeof FatorRResponseSchema>;


export const calculateFatorRProjectionFlow = ai.defineFlow({
    name: 'calculateFatorRProjectionFlow',
    inputSchema: FatorRInputSchema,
    outputSchema: FatorRResponseSchema,
}, async (data) => {

    const { RBT12_atual, FS12_atual, receitaMensalProjetada } = data;

    // --- Validação de Entrada ---
    if (!RBT12_atual || RBT12_atual <= 0 || !FS12_atual || FS12_atual < 0 || !receitaMensalProjetada) {
         throw new Error('Valores de entrada inválidos para projeção do Fator R.');
    }

    // --- Cálculo Inicial ---
    const fatorR_Atual = RBT12_atual > 0 ? FS12_atual / RBT12_atual : 0;
    const isEnquadradoAgora = fatorR_Atual >= META_FATOR_R;

    if (isEnquadradoAgora) {
        return {
            fatorR_Atual,
            isEnquadradoAgora: true,
            mesesParaEnquadramento: 0,
            statusMensagem: 'success' as const, // CORREÇÃO: as const força o tipo literal
            textoMensagem: TEXTS.success( (fatorR_Atual * 100).toFixed(2) )
        };
    }

    // --- Início da Lógica de Projeção ---
    const proLaboreMensalOtimizado = receitaMensalProjetada * META_FATOR_R;

    // A "proxy" para o valor que sai do cálculo (a média)
    const rbt_media_antiga = RBT12_atual > 0 ? RBT12_atual / 12.0 : 0;
    const fs_media_antiga = FS12_atual >= 0 ? FS12_atual / 12.0 : 0;

    let rbt_projetada = RBT12_atual;
    let fs_projetada = FS12_atual;
    let fatorR_projetado = fatorR_Atual;
    let meses = 0;

    while (fatorR_projetado < META_FATOR_R && meses < MAX_PROJECTION_MONTHS) {
        meses++;

        // Remove o mês mais antigo (estimado pela média)
        rbt_projetada -= rbt_media_antiga;
        fs_projetada -= fs_media_antiga;

        // Adiciona o novo mês (projetado)
        rbt_projetada += receitaMensalProjetada;
        fs_projetada += proLaboreMensalOtimizado;

        // Evita divisão por zero se a receita projetada for negativa ou zerada
        if (rbt_projetada <= 0) {
            fatorR_projetado = 0;
            break; 
        }

        fatorR_projetado = fs_projetada / rbt_projetada;
    }

    // --- Montagem da Resposta ---
    const proLaboreStr = proLaboreMensalOtimizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fatorRStr = (fatorR_Atual * 100).toFixed(2);

    if (fatorR_projetado >= META_FATOR_R) {
        // Atingiu a meta
        return {
            fatorR_Atual,
            isEnquadradoAgora: false,
            mesesParaEnquadramento: meses,
            statusMensagem: 'warning' as const, // CORREÇÃO: as const
            textoMensagem: TEXTS.warning_projection(fatorRStr, meses, proLaboreStr) + TEXTS.warning_disclaimer
        };
    } else {
        // Não atingiu a meta no tempo limite
        return {
            fatorR_Atual,
            isEnquadradoAgora: false,
            mesesParaEnquadramento: -1, // Sinaliza que não atingiu
            statusMensagem: 'error' as const, // CORREÇÃO: as const
            textoMensagem: TEXTS.error_unreachable(fatorRStr, proLaboreStr)
        };
    }
});


export async function calculateFatorRProjection(input: z.infer<typeof FatorRInputSchema>): Promise<FatorRResponse> {
  return await calculateFatorRProjectionFlow(input);
}