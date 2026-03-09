import { calculateTaxes2026 } from "./calculations-2026";
import type { CalculatorFormValues, CnaeItem, TaxFormValues } from "./types";
import { differenceInMonths } from "date-fns";

export interface SimulationMonth {
  monthIndex: number;
  monthLabel: string; // Ex: "jan/2026"
  isJanuary: boolean;
  revenue: number;
  accumulatedRevenue: number;
  effectiveRBT12: number;
  simples: {
    tax: number;
    rate: number;
    annex: string;
    scenarioLabel: string; // NOVO: Nome do cenário vencedor (ex: "Otimizado", "Tradicional")
    // Detalhamento obrigatório para o Tooltip
    breakdown: {
        dasValue: number;
        dasRate: number;
        inssValue: number;
        inssRate: number;
        irrfValue: number;
        ivaValue: number;
        ivaRate: number;
        total: number;
    };
  };
  presumido: {
    tax: number;
    rate: number;
  };
  winner: 'SN' | 'LP';
}

function getMonthLabel(startDate: Date, monthOffset: number): string {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthOffset);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
}

export function runNewCompanySimulation(
  rawValues: CalculatorFormValues,
  dynamicStartDate?: Date, 
  dynamicFirstBillingDate?: Date
): SimulationMonth[] {
  const simulation: SimulationMonth[] = [];
  
  // 1. Definição das Datas
  let cnpjStartDate = dynamicStartDate;
  if (!cnpjStartDate) {
     if (rawValues.cnpjStartDate) {
         const [y, m] = rawValues.cnpjStartDate.split('-').map(Number);
         cnpjStartDate = new Date(y, m - 1, 1);
     } else {
         cnpjStartDate = new Date();
     }
  }

  let firstBillingDate = dynamicFirstBillingDate || cnpjStartDate;
  let monthsGap = differenceInMonths(firstBillingDate, cnpjStartDate);
  if (monthsGap < 0) monthsGap = 0;

  // 2. Preparação dos Valores Base
  const domesticActivities: CnaeItem[] = rawValues.selectedCnaes
      .filter(c => (c.domesticRevenue || 0) > 0)
      .map(c => ({
          code: c.code,
          revenue: c.domesticRevenue || 0,
          cClassTrib: c.cClassTrib,
          nbsCode: c.nbsCode
      }));

  const exportActivities: CnaeItem[] = rawValues.selectedCnaes
      .filter(c => (c.exportRevenue || 0) > 0)
      .map(c => ({
          code: c.code,
          revenue: c.exportRevenue || 0,
          cClassTrib: c.cClassTrib,
          nbsCode: c.nbsCode
      }));

  const monthlyDomestic = domesticActivities.reduce((acc, a) => acc + a.revenue, 0);
  const monthlyExport = exportActivities.reduce((acc, a) => acc + a.revenue, 0);
  const exchangeRate = rawValues.exchangeRate || 1; 
  const totalMonthlyRevenue = monthlyDomestic + (monthlyExport * exchangeRate);

  // 3. Projeção de Despesas
  const totalProLaboreMensal = rawValues.proLabores.reduce((acc, p) => acc + (p.value || 0), 0);
  const totalSalaryExpense = rawValues.totalSalaryExpense || 0;
  const folhaMensalTotal = totalProLaboreMensal + totalSalaryExpense;

  let accumulatedRevenue = 0;
  let accumulatedFolha = 0; 

  // Simula 12 meses
  for (let i = 0; i < 12; i++) {
    const existenceMonth = monthsGap + i + 1;
    
    const currentDate = new Date(firstBillingDate);
    currentDate.setMonth(currentDate.getMonth() + i);
    
    const isJanuary = currentDate.getMonth() === 0;
    const currentYear = currentDate.getFullYear(); 

    accumulatedRevenue += totalMonthlyRevenue;
    accumulatedFolha += folhaMensalTotal;

    const proportionalRBT12 = (accumulatedRevenue / existenceMonth) * 12;
    const proportionalFP12 = (accumulatedFolha / existenceMonth) * 12; 

    const monthValues: TaxFormValues = {
      ...rawValues,
      rbt12: proportionalRBT12,
      fp12: proportionalFP12,
      domesticActivities,
      exportActivities,
      exchangeRate: exchangeRate, 
      proLabores: rawValues.proLabores.map(p => ({...p})),
      year: currentYear
    };

    const result = calculateTaxes2026(monthValues);
    
    // CORREÇÃO CRÍTICA: Considerar TODOS os cenários do Simples para eleger o mais barato
    const snOptions = [
        result.simplesNacionalTradicional,      // Cenário 1: O que o usuário informou (pode ser Anexo V ou III natural)
        result.simplesNacionalOtimizado,        // Cenário 2: Forçando Anexo III (se possível)
        result.simplesNacionalHibrido,          // Cenário 3: Híbrido (2027+)
        result.simplesNacionalOtimizadoHibrido  // Cenário 4: Híbrido Otimizado (2027+)
    ].filter((item): item is NonNullable<typeof item> => item !== null);
    
    // Ordena pelo CUSTO TOTAL (Menor para Maior) para garantir que pegamos o MAIS BARATO
    const bestSimples = snOptions.sort((a, b) => a.totalTax - b.totalTax)[0];
    const lp = result.lucroPresumido;

    if (!bestSimples || !lp) continue;

    // Extração segura dos dados
    const dasItem = bestSimples.breakdown.find(b => b.name.includes("DAS"));
    const inssItem = bestSimples.breakdown.find(b => b.name.includes("INSS"));
    const irrfItem = bestSimples.breakdown.find(b => b.name.includes("IRRF"));
    const ivaItem = bestSimples.breakdown.find(b => b.name.includes("IVA") || b.name.includes("CBS"));
    
    const dasValue = dasItem?.value || 0;
    const dasRate = totalMonthlyRevenue > 0 ? dasValue / totalMonthlyRevenue : 0;
    const inssValue = inssItem?.value || 0;
    const inssRate = inssItem?.rate || 0;
    const irrfValue = irrfItem?.value || 0;
    const ivaValue = ivaItem?.value || 0;
    const ivaRate = totalMonthlyRevenue > 0 ? ivaValue / totalMonthlyRevenue : 0;

    // Identifica o nome do cenário para exibir no tooltip
    // Ex: "Simples Nacional Otimizado (Anexo III)"
    const scenarioName = bestSimples.regime || "Simples Nacional";

    simulation.push({
      monthIndex: i + 1,
      monthLabel: getMonthLabel(firstBillingDate, i),
      isJanuary,
      revenue: totalMonthlyRevenue,
      accumulatedRevenue,
      effectiveRBT12: proportionalRBT12,
      simples: {
        tax: bestSimples.totalTax,
        rate: totalMonthlyRevenue > 0 ? bestSimples.totalTax / totalMonthlyRevenue : 0,
        annex: bestSimples.annex || '',
        scenarioLabel: scenarioName, // Passa o nome correto do cenário vencedor
        breakdown: {
            dasValue: dasValue,
            dasRate: dasRate,
            inssValue: inssValue,
            inssRate: inssRate,
            irrfValue: irrfValue,
            ivaValue: ivaValue,
            ivaRate: ivaRate,
            total: bestSimples.totalTax
        }
      },
      presumido: {
        tax: lp.totalTax,
        rate: totalMonthlyRevenue > 0 ? lp.totalTax / totalMonthlyRevenue : 0,
      },
      winner: bestSimples.totalTax < lp.totalTax ? 'SN' : 'LP'
    });
  }

  return simulation;
}