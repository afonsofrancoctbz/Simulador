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

export function formatPercent(value: number | undefined | null) {
  if (value === undefined || value === null || isNaN(value)) return "0,00%";

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}


// Novo helper defensivo
export function safeFindBracket<T extends { max: number }>(
  value: number,
  brackets: T[] | undefined | null,
  context?: { who?: string; year?: number; annex?: string }
): T {
  // Contextual logging para debugar (mostra quem chamou e qual ano/anexo)
  const ctx = context ? ` [who=${context.who ?? '-'}, year=${context.year ?? '-'}, annex=${context.annex ?? '-'}]` : '';

  if (!Array.isArray(brackets) || brackets.length === 0) {
    console.error(`Erro crítico: Tabela de faixas (brackets) inválida ou vazia.${ctx}`, {
      value,
      brackets,
      context,
      stack: new Error().stack,
    });
    throw new Error(
      `Dados de cálculo (tabela de impostos) não encontrados ou inválidos${ctx}. Verifique se o ano e o anexo estão corretos.`
    );
  }

  const safeValue = isNaN(Number(value)) ? 0 : Number(value);
  const found = brackets.find((b) => safeValue <= b.max);
  return found || brackets[brackets.length - 1];
}

// Mantemos findBracket compatível com chamadas existentes, mas delegamos ao safeFindBracket
export function findBracket<T extends { max: number }>(value: number, brackets: T[]): T {
  return safeFindBracket(value, brackets, { who: 'findBracket (legacy)' });
}


// Alias for findBracket
export const findFeeBracket = findBracket;
