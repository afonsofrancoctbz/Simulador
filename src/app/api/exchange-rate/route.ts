import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL', {
      next: { revalidate: 3600 } // Revalida a cada hora
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar as taxas de câmbio');
    }

    const data = await response.json();

    const rates = {
      USD: parseFloat(data.USDBRL.bid),
      EUR: parseFloat(data.EURBRL.bid),
    };

    return NextResponse.json(rates);
  } catch (error) {
    console.error('Erro na API de câmbio:', error);
    return NextResponse.json({ error: 'Não foi possível buscar as taxas de câmbio' }, { status: 500 });
  }
}
