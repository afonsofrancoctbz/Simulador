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
    feriasProvision: 1 / 12,
    feriasUmTerco: (1 / 12) / 3,
    get feriasTotal() { return this.feriasProvision + this.feriasUmTerco }, // ~11.11%
    decimoTerceiro: 1 / 12, // ~8.33%
    fgts: 0.08,
    multaRescisoria: 0.04, // Provisão de 4% sobre o salário para a multa de 40% do FGTS
    // Lucro Presumido/Real
    cpp: 0.20,
    rat: 0.02, // Média (pode ser 1%, 2% ou 3%)
    salarioEducacao: 0.025,
    sistemaS: 0.033, // Média (pode variar)
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
    
    // 1. Custo com Benefícios
    const totalBeneficiosAdicionais = valeRefeicao + planoSaude + outros;
    const descontoVT = Math.min(salarioBase * 0.06, valeTransporte);
    const custoValeTransporte = valeTransporte > 0 ? valeTransporte - descontoVT : 0;
    const custoTotalBeneficios = custoValeTransporte + totalBeneficiosAdicionais;

    // 2. Provisões Mensais (Comuns a todos os regimes)
    const provisaoFerias = salarioBase * PERCENTUALS.feriasTotal;
    const provisaoDecimoTerceiro = salarioBase * PERCENTUALS.decimoTerceiro;

    // 3. Encargos baseados no salário e provisões
    const fgtsMensal = salarioBase * PERCENTUALS.fgts;
    const fgtsSobreProvisoes = (provisaoFerias + provisaoDecimoTerceiro) * PERCENTUALS.fgts;
    const totalFgts = fgtsMensal + fgtsSobreProvisoes;
    
    const provisaoMultaFgts = salarioBase * PERCENTUALS.multaRescisoria;

    // 4. Encargos específicos por Regime
    let encargosRegime = {
        cpp: 0,
        rat: 0,
        salarioEducacao: 0,
        sistemaS: 0
    };

    if (regime === 'presumido') {
        const baseCalculoEncargos = salarioBase; 
        encargosRegime.cpp = baseCalculoEncargos * PERCENTUALS.cpp;
        encargosRegime.rat = baseCalculoEncargos * PERCENTUALS.rat;
        encargosRegime.salarioEducacao = baseCalculoEncargos * PERCENTUALS.salarioEducacao;
        encargosRegime.sistemaS = baseCalculoEncargos * PERCENTUALS.sistemaS;
    } else if (regime === 'mei') {
        encargosRegime.cpp = salarioBase * PERCENTUALS.cppMEI;
    }
    // Para o Simples Nacional (Anexos I-III, V), esses encargos estão inclusos no DAS.

    const totalEncargos = 
        provisaoFerias +
        provisaoDecimoTerceiro +
        totalFgts +
        provisaoMultaFgts +
        encargosRegime.cpp +
        encargosRegime.rat +
        encargosRegime.salarioEducacao +
        encargosRegime.sistemaS;

    const custoTotalEmpresa = salarioBase + totalEncargos + custoTotalBeneficios;
    
    // Monta o breakdown final para exibição
    const breakdown: EmployeeCostBreakdown = {
        salarioBase,
        ferias: provisaoFerias,
        decimoTerceiro: provisaoDecimoTerceiro,
        fgts: totalFgts,
        fgtsProvisaoRescisao: provisaoMultaFgts,
        cpp: encargosRegime.cpp,
        rat: encargosRegime.rat,
        salarioEducacao: encargosRegime.salarioEducacao,
        sistemaS: encargosRegime.sistemaS,
        previdenciario: 0, // Simplificado, pois a lógica de INSS s/ Férias é complexa e já está embutida nas provisões
        valeTransporte: custoValeTransporte,
        outrosBeneficios: totalBeneficiosAdicionais,
        encargos: totalEncargos,
    };

    return {
        regime,
        salarioBase,
        totalBeneficios: custoTotalBeneficios,
        totalEncargos,
        totalCost: custoTotalEmpresa,
        breakdown,
    };
}
