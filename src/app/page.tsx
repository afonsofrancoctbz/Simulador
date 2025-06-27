import AppHeader from '@/components/app-header';
import TaxCalculator from '@/components/tax-calculator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <TaxCalculator />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>TributaSimples © {new Date().getFullYear()}. Todos os direitos reservados.</p>
        <p className="text-xs mt-2">Aviso: Esta ferramenta destina-se apenas a fins de estimativa. Consulte um contador profissional para obter aconselhamento financeiro preciso.</p>
      </footer>
    </div>
  );
}
