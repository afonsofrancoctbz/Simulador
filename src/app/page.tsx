"use client";

import { useState } from 'react';
import AppFooter from '@/components/app-footer';
import AppHeader from '@/components/app-header';
import BenefitsSection from '@/components/benefits-section';
import CapitalSocialSection from '@/components/capital-social-section';
import ContabilizeiMaisSection from '@/components/contabilizei-mais-section';
import DigitalCertificateSection from '@/components/digital-certificate-section';
import ExportTaxInfoSection from '@/components/export-tax-info-section';
import FaqSection from '@/components/faq-section';
import MultibenefitsSection from '@/components/multibenefits-section';
import OpeningStepsSection from '@/components/opening-steps-section';
import PjAccountSection from '@/components/pj-account-section';
import RocSection from '@/components/roc-section';
import SociiLawSection from '@/components/socii-law-section';
import TaxCalculator from '@/components/tax-calculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FloatingNav from '@/components/floating-nav';

export default function Home() {
  const [showExportInfo, setShowExportInfo] = useState(false);
  // Nota: showResults está declarado mas não está sendo usado no JSX abaixo. 
  // Mantive o estado caso você pretenda usá-lo futuramente.
  const [showResults, setShowResults] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  return (
    <>
    <AppHeader />
    <main className="relative">
      <FloatingNav />
      <div className='print-hidden'>
          <section id="tax-calculator" className="bg-slate-50/70 border-b">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Simule Seus Impostos</h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto pb-12">
                  Descubra o regime tributário ideal para sua empresa de serviços, detalhado de forma clara e transparente.
                </p>
              </div>
          </section>
      </div>
      
      <Tabs defaultValue="2025" className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 print-hidden">
              <div className="w-full flex justify-center">
                  <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
                      <TabsTrigger value="2025">Cenário Atual (2025)</TabsTrigger>
                      <TabsTrigger value="2026">Pós-Reforma (2026-2033)</TabsTrigger>
                  </TabsList>
              </div>
                
                <TabsContent value="2025" className="animate-in fade-in zoom-in-95 duration-300">
                    <div className="py-4">
                        <TaxCalculator 
                            key="2025" 
                            year={2025} 
                            onExportRevenueChange={setShowExportInfo} 
                            onResultsChange={setShowResults}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="2026" className="animate-in fade-in zoom-in-95 duration-300">
                      <div className="py-4">
                        {/* Aqui passamos o selectedYear controlado pelo estado da página.
                            Se o usuário mudar o ano lá dentro do formulário, o onYearChange atualiza aqui.
                        */}
                        <TaxCalculator 
                            key="2026-plus"
                            year={selectedYear} 
                            onExportRevenueChange={setShowExportInfo} 
                            onResultsChange={(hasResults) => {
                                setShowResults(hasResults);
                            }}
                            onYearChange={setSelectedYear} 
                        />
                    </div>
                </TabsContent>
          </div>
      </Tabs>
        
        {/* Espaço reservado para impressão */}
        <div id="results-print-only" className='hidden print:block'></div>
        
        {/* Seção Informativa de Exportação (Condicional) */}
        {showExportInfo && (
           <section className="py-16 bg-white border-t border-slate-100 print-hidden animate-in slide-in-from-bottom-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ExportTaxInfoSection />
            </div>
          </section>
        )}

        {/* Seções Institucionais (Rodapé da Landing Page) */}
        <div className='print-hidden space-y-px bg-slate-200'>
            <section id="opening-steps" className="py-16 lg:py-24 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <OpeningStepsSection />
              </div>
            </section>
            
            <section id="digital-certificate" className="py-16 lg:py-24 bg-slate-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <DigitalCertificateSection />
              </div>
            </section>

            <section id="roc" className="py-16 lg:py-24 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <RocSection />
              </div>
            </section>

            <section id="pj-account" className="py-16 lg:py-24 bg-slate-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <PjAccountSection />
              </div>
            </section>
            
            <section id="capital-social" className="py-16 lg:py-24 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <CapitalSocialSection />
              </div>
            </section>

            <section id="health-benefits" className="py-16 lg:py-24 bg-slate-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <BenefitsSection />
              </div>
            </section>

            <section id="multibenefits-section" className="py-16 lg:py-24 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <MultibenefitsSection />
              </div>
            </section>
            
            <section id="contabilizei-mais" className="py-16 lg:py-24 bg-slate-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ContabilizeiMaisSection />
              </div>
            </section>

             <section id="socii-law" className="py-16 lg:py-24 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SociiLawSection />
              </div>
            </section>

             <section id="faq" className="py-16 lg:py-24 bg-slate-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <FaqSection />
              </div>
            </section>
        </div>

      </main>
      <AppFooter />
    </>
  );
}