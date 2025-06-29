
import BenefitsSection from '@/components/benefits-section';
import FaqSection from '@/components/faq-section';
import TaxCalculator from '@/components/tax-calculator';
import AppFooter from '@/components/app-footer';
import AppHeader from '@/components/app-header';

export default function Home() {
  return (
    <>
      <AppHeader />
      <main>
        <section id="calculator" className="bg-slate-50/70">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Simule Seus Impostos</h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-serif">
              Descubra o regime tributário ideal para sua empresa de serviços, detalhado de forma clara e transparente.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="-mt-16">
              <TaxCalculator />
            </div>
        </div>

        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <BenefitsSection />
          </div>
        </section>

         <section className="py-16 lg:py-24 bg-slate-50/70">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <FaqSection />
          </div>
        </section>

      </main>
      <AppFooter />
    </>
  );
}
