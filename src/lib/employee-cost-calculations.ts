export interface EmployeeCostInput {
    regime: "simples" | "presumido" | "mei";
    salarioBase: number;
    valeTransporte?: number;
    valeRefeicao?: number;
    planoSaude?: number;
    outrosBeneficios?: number;
}

export interface EmployeeCostBreakdown {
    salarioBase: number;
    ferias: number;
    decimoTerceiro: number;
    fgts: number;
    fgtsProvisaoRescisao: number;
    previdenciario: number; // sobre 13, ferias, dsr
    cpp: number; // inss patronal
    rat: number;
    salarioEducacao: number;
    sistemaS: number;
    valeTransporte: number;
    outrosBeneficios: number; // soma de refeição, saude, etc.
    encargos: number; // soma de todos os encargos
}

export interface EmployeeCostResult {
    regime: "simples" | "presumido" | "mei";
    salarioBase: number;
    totalBeneficios: number;
    totalEncargos: number;
    totalCost: number;
    breakdown: EmployeeCostBreakdown;
}

const PERCENTUALS = {
    ferias: 0.1111, // 1/12 + 1/3 de 1/12
    decimoTerceiro: 0.0833, // 1/12
    fgts: 0.08,
    // Simples Nacional
    provisaoMultaSimples: 0.04,
    previdenciarioSimples: 0.0793,
    // Lucro Presumido/Real
    cpp: 0.20,
    rat: 0.02, // Média
    salarioEducacao: 0.025,
    sistemaS: 0.033,
    // MEI
    cppMEI: 0.03,
}

export function calculateEmployeeCost(input: EmployeeCostInput): EmployeeCostResult {
    const { 
        regime, 
        salarioBase, 
        valeTransporte = 0, 
        valeRefeicao = 0, 
        planoSaude = 0, 
        outrosBeneficios: outros = 0 
    } = input;
    
    const totalBeneficios = valeTransporte + valeRefeicao + planoSaude + outros;
    const descontoVT = Math.min(salarioBase * 0.06, valeTransporte);
    const custoBeneficios = totalBeneficios - descontoVT;

    const breakdown: EmployeeCostBreakdown = {
        salarioBase,
        ferias: salarioBase * PERCENTUALS.ferias,
        decimoTerceiro: salarioBase * PERCENTUALS.decimoTerceiro,
        fgts: salarioBase * PERCENTUALS.fgts,
        fgtsProvisaoRescisao: 0,
        previdenciario: 0,
        cpp: 0,
        rat: 0,
        salarioEducacao: 0,
        sistemaS: 0,
        valeTransporte: valeTransporte > 0 ? valeTransporte - descontoVT : 0,
        outrosBeneficios: valeRefeicao + planoSaude + outros,
        encargos: 0,
    };
    
    if (regime === 'simples') {
        breakdown.fgtsProvisaoRescisao = salarioBase * PERCENTUALS.provisaoMultaSimples;
        breakdown.previdenciario = (salarioBase + breakdown.ferias + breakdown.decimoTerceiro) * PERCENTUALS.previdenciarioSimples;
    } else if (regime === 'presumido') {
        const baseCalculoINSS = salarioBase + breakdown.ferias + breakdown.decimoTerceiro;
        breakdown.cpp = baseCalculoINSS * PERCENTUALS.cpp;
        breakdown.rat = baseCalculoINSS * PERCENTUALS.rat;
        breakdown.salarioEducacao = baseCalculoINSS * PERCENTUALS.salarioEducacao;
        breakdown.sistemaS = baseCalculoINSS * PERCENTUALS.sistemaS;
        // No presumido, a provisão da multa é sobre o total do FGTS depositado.
        breakdown.fgtsProvisaoRescisao = breakdown.fgts * 0.5; // 40% sobre o saldo, provisionado a 50% para calculo mensal
    } else if (regime === 'mei') {
        breakdown.fgtsProvisaoRescisao = salarioBase * PERCENTUALS.provisaoMultaSimples; // MEI tem provisão semelhante
        breakdown.cpp = salarioBase * PERCENTUALS.cppMEI;
    }

    const totalEncargos = 
        breakdown.ferias +
        breakdown.decimoTerceiro +
        breakdown.fgts +
        breakdown.fgtsProvisaoRescisao +
        breakdown.previdenciario +
        breakdown.cpp +
        breakdown.rat +
        breakdown.salarioEducacao +
        breakdown.sistemaS;

    breakdown.encargos = totalEncargos;

    const totalCost = salarioBase + totalEncargos + custoBeneficios;

    return {
        regime,
        salarioBase,
        totalBeneficios: custoBeneficios,
        totalEncargos,
        totalCost,
        breakdown,
    };
}
