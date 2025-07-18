import { CNAE_DATA_RAW } from './cnaes-raw';
import type { CnaeData } from './types';

// This file is for helper functions related to CNAEs.
// The raw data is now in cnaes-raw.ts to keep this file cleaner.

export function getCnaeData(code: string): CnaeData | undefined {
  return CNAE_DATA_RAW.find(c => c.code === code);
}

// Re-exporting for consistent access path if needed
export { CNAE_DATA_RAW };
