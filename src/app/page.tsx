import TaxCalculator from '@/components/tax-calculator';

export default function Home() {
  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Simule Seus Impostos</h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Descubra o regime tributário ideal para sua empresa, detalhado de forma clara e transparente.
            </p>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16">
        <TaxCalculator />
      </main>

       <footer className="py-6 mt-12 text-center text-sm text-muted-foreground font-serif">
          <p>TributaSimples © {new Date().getFullYear()}.</p>
          <p className="text-xs mt-2">Aviso: Esta ferramenta destina-se apenas a fins de estimativa. Consulte um contador para aconselhamento preciso.</p>
        </footer>
    </>
  );
}
