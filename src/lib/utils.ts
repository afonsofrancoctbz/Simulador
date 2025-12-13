import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number | string | undefined | null) {
  if (value === undefined || value === null) return "0,00"
  
  const number = typeof value === "string" ? parseFloat(value) : value
  
  if (isNaN(number)) return "0,00"

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}

export function formatCurrencyBRL(value: number | string | undefined | null) {
  if (value === undefined || value === null) return "R$ 0,00"
  
  const number = typeof value === "string" ? parseFloat(value) : value
  
  if (isNaN(number)) return "R$ 0,00"

  return new Intl.NumberFormat("pt-BR", {
    style: 'currency',
    currency: 'BRL',
  }).format(number)
}

export function parseBRL(value: string) {
  if (!value) return 0
  
  // Remove everything that isn't a digit or a comma
  // Example: "R$ 1.234,56" -> "1234,56"
  const cleanValue = value.replace(/[^0-9,]/g, "")
  
  // Replace comma with dot to parse as float
  // Example: "1234,56" -> "1234.56"
  const number = parseFloat(cleanValue.replace(",", "."))
  
  return isNaN(number) ? 0 : number
}

export function formatPercent(value: number | string | undefined | null) {
  if (value === undefined || value === null) return "0,00%"
  
  const number = typeof value === "string" ? parseFloat(value) : value
  
  if (isNaN(number)) return "0,00%"

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number / 100)
}

// Helper to find the correct tax bracket based on a value (e.g., revenue)
// Assumes brackets are sorted by limit (or max) ascending
export function findBracket<T extends { max: number }>(value: number, brackets: T[]): T {
  // Validação estrita para garantir que recebemos um array válido
  if (!Array.isArray(brackets) || brackets.length === 0) {
    console.error("Erro crítico: Tabela de faixas (brackets) inválida ou vazia.", { value, brackets });
    throw new Error(`Dados de cálculo (tabela de impostos) não encontrados ou inválidos. Verifique se o ano e o anexo estão corretos.`);
  }

  // Se o valor for inválido, assume 0 para evitar erros de comparação
  const safeValue = isNaN(value) ? 0 : value;

  // UPDATED: Using .max instead of .limit to match your FiscalConfig type
  const found = brackets.find((bracket) => safeValue <= bracket.max);
  
  // Fallback para a última faixa (maior alíquota) se o valor exceder todos os limites
  return found || brackets[brackets.length - 1];
}

// Alias for findBracket
export const findFeeBracket = findBracket;