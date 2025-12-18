import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=BRL', {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from exchangerate.host');
    }

    const data = await response.json();

    if (!data.rates) {
      throw new Error('Rates not found in external API response');
    }

    // Return only the rates object, which contains USD, EUR, etc.
    return NextResponse.json(data.rates);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API /api/exchange-rate] Error: ${errorMessage}`);
    
    return NextResponse.json(
      { error: 'Internal server error while fetching exchange rates.' },
      { status: 500 }
    );
  }
}
