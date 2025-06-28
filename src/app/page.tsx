import TaxCalculator from '@/components/tax-calculator';

export default function Home() {
  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold">Conte-nos sobre sua empresa</h1>
                <p className="mt-3 text-lg text-primary-foreground/80">Com essas informações, calcularemos o regime tributário ideal.</p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mt-8">
                <div className="flex justify-between mb-1 text-sm font-medium text-primary-foreground/90">
                    <span className="hidden sm:inline">🏦 Conta + Benefícios</span>
                    <span className="font-bold text-accent">📋 Perfil da Empresa</span>
                    <span className="hidden sm:inline">🧮 Simulação</span>
                    <span className="hidden sm:inline">🎯 Sua Proposta</span>
                </div>
                <div className="w-full bg-primary-foreground/20 rounded-full h-1.5">
                    <div className="bg-accent h-1.5 rounded-full" style={{width: '50%'}}></div>
                </div>
            </div>
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
