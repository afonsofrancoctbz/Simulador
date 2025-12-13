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
  if (value === undefined || value === null) return "0,00%";

  // Normalize input to number
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number)) return "0,00%";

  // If the value appears > 1 (e.g., 13.29 meaning 13.29%), treat it as percentage and divide by 100.
  // If it's between -1 and 1, treat it as fraction already (e.g., 0.1329).
  const fraction = Math.abs(number) > 1 ? number / 100 : number;

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fraction);
}


// Novo helper defensivo
export function safeFindBracket<T extends { max: number }>(
  value: number,
  brackets: T[] | undefined | null,
  context?: { who?: string; year?: number; annex?: string }
): T | null {
  // Contextual logging para debugar (mostra quem chamou e qual ano/anexo)
  const ctx = context ? ` [who=${context.who ?? '-'}, year=${context.year ?? '-'}, annex=${context.annex ?? '-'}]` : '';

  if (!Array.isArray(brackets) || brackets.length === 0) {
    console.warn(`[safeFindBracket] Tabela indisponível, retornando null.${ctx}`, {
      value,
      brackets,
      context,
    });
    return null;
  }

  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const found = brackets.find((b) => safeValue <= b.max);
  return found ?? brackets[brackets.length - 1];
}

// Mantemos findBracket compatível com chamadas existentes, mas delegamos ao safeFindBracket
export function findBracket<T extends { max: number }>(
  value: number,
  brackets: T[] | undefined | null,
  context?: {
    year?: number;
    annex?: string;
    who?: string;
  }
): T {
  const result = safeFindBracket(value, brackets, context);

  if (!result) {
    // fallback técnico seguro (primeira faixa “neutra”)
    return {
      max: Infinity,
    } as T;
  }

  return result;
}


// Alias for findBracket
export const findFeeBracket = findBracket;
