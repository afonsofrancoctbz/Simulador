import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FeeBracket } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const MINIMUM_WAGE = 1518.00;

export const formatCurrencyBRL = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatBRL = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

export const formatPercent = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`.replace('.', ',');
}

/**
 * Finds the correct bracket from a given table based on a value.
 * @param table The table to search in.
 * @param value The value to find the bracket for.
 * @returns The found bracket or the first bracket as a fallback if not found.
 */
export function findBracket<T extends { max: number }>(table: T[], value: number): T {
  if (!table || table.length === 0) {
    // This should not happen with valid config, but as a safeguard:
    throw new Error("Invalid tax table provided to findBracket.");
  }
  return table.find(bracket => value <= bracket.max) || table[table.length - 1];
}

/**
 * Finds the correct fee bracket from the Contabilizei fee tables.
 * @param table The fee table.
 * @param revenue The monthly revenue.
 * @returns The found fee bracket.
 */
export function findFeeBracket(table: FeeBracket[], revenue: number): FeeBracket | undefined {
    return table.find(bracket => revenue >= bracket.min && revenue <= bracket.max);
}

    