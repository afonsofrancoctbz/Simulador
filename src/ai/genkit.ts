import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// --- IMPORTAÇÃO DOS CÁLCULOS ---
// ATENÇÃO: Deixei comentado (//) para parar o erro vermelho por enquanto.
// Precisamos saber o nome exato da função no seu arquivo para ativar isso depois.
// import { calcularSimplesNacional } from '../lib/calculations'; 

export const ai = genkit({
  plugins: [googleAI()],
  
  // Configuração para o modelo mais potente (Gemini 3)
  // Nota: Se futuramente der erro de "model not found", usaremos 'gemini-1.5-pro'
  model: 'googleai/gemini-3.0-pro', 
});
