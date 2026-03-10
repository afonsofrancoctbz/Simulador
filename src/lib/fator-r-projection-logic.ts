/**
 * @fileOverview Lógica puramente matemática para projeção do Fator R.
 * Movida para o cliente para suportar exportação estática (GitHub Pages).
 */

const META_FATOR_R = 0.28;
const MAX_PROJECTION_MONTHS = 24;

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

export interface FatorRInput {
  RBT12_atual: number;
  FS12_atual: number;
  receitaMensalProjetada: number;
}

export function calculateFatorRProjectionLocal(data: FatorRInput) {
    const { RBT12_atual, FS12_atual, receitaMensalProjetada } = data;

    if (!RBT12_atual || RBT12_atual <= 0 || !receitaMensalProjetada) {
         return null;
    }

    const fatorR_Atual = FS12_atual / RBT12_atual;
    const isEnquadradoAgora = fatorR_Atual >= META_FATOR_R;

    if (isEnquadradoAgora) {
        return {
            fatorR_Atual,
            isEnquadradoAgora: true,
            mesesParaEnquadramento: 0,
            statusMensagem: 'success' as const, 
            textoMensagem: TEXTS.success( (fatorR_Atual * 100).toFixed(2) )
        };
    }

    const proLaboreMensalOtimizado = receitaMensalProjetada * META_FATOR_R;
    const rbt_media_antiga = RBT12_atual / 12.0;
    const fs_media_antiga = FS12_atual / 12.0;

    let rbt_projetada = RBT12_atual;
    let fs_projetada = FS12_atual;
    let fatorR_projetado = fatorR_Atual;
    let meses = 0;

    while (fatorR_projetado < META_FATOR_R && meses < MAX_PROJECTION_MONTHS) {
        meses++;
        rbt_projetada = rbt_projetada - rbt_media_antiga + receitaMensalProjetada;
        fs_projetada = fs_projetada - fs_media_antiga + proLaboreMensalOtimizado;
        fatorR_projetado = fs_projetada / rbt_projetada;
    }

    const proLaboreStr = proLaboreMensalOtimizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fatorRStr = (fatorR_Atual * 100).toFixed(2);

    if (fatorR_projetado >= META_FATOR_R) {
        return {
            fatorR_Atual,
            isEnquadradoAgora: false,
            mesesParaEnquadramento: meses,
            statusMensagem: 'warning' as const, 
            textoMensagem: TEXTS.warning_projection(fatorRStr, meses, proLaboreStr) + TEXTS.warning_disclaimer,
            proLaboreSugerido: proLaboreMensalOtimizado
        };
    }

    return {
        fatorR_Atual,
        isEnquadradoAgora: false,
        mesesParaEnquadramento: -1, 
        statusMensagem: 'error' as const,
        textoMensagem: TEXTS.error_unreachable(fatorRStr, proLaboreStr),
        proLaboreSugerido: proLaboreMensalOtimizado
    };
}
