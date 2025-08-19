

"use client";

import { useState } from 'react';
import BenefitsSection from '@/components/benefits-section';
import FaqSection from '@/components/faq-section';
import TaxCalculator from '@/components/tax-calculator';
import AppFooter from '@/components/app-footer';
import AppHeader from '@/components/app-header';
import DigitalCertificateSection from '@/components/digital-certificate-section';
import PjAccountSection from '@/components/pj-account-section';
import MultibenefitsSection from '@/components/multibenefits-section';
import TaxReformInfoSection from '@/components/tax-reform-info-section';
import RocSection from '@/components/roc-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExportTaxInfoSection from '@/components/export-tax-info-section';

export default function Home() {
  const [showExportInfo, setShowExportInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);

  return (
    <>
      <AppHeader />
      <main className="print-hidden">
        <section className="bg-slate-50/70 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Simule Seus Impostos</h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto pb-12">
                Descubra o regime tributário ideal para sua empresa de serviços, detalhado de forma clara e transparente.
              </p>
            </div>
        </section>
        <Tabs defaultValue="2025" className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
            <div className="w-full flex justify-center">
                <TabsList className="mb-8">
                    <TabsTrigger value="2025">Cenário Atual (2025)</TabsTrigger>
                    <TabsTrigger value="2026">Reforma Tributária (Simulação 2026)</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="2025">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <TaxCalculator key="2025" year={2025} onExportRevenueChange={setShowExportInfo} onResultsChange={setShowResults}/>
                </div>
            </TabsContent>
            <TabsContent value="2026">
                <TaxReformInfoSection />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <TaxCalculator key="2026" year={2026} onExportRevenueChange={setShowExportInfo} onResultsChange={setShowResults} />
                </div>
            </TabsContent>
          </div>
        </Tabs>
        
        {showExportInfo && (
           <section className="py-16 lg:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ExportTaxInfoSection />
            </div>
          </section>
        )}

        <section className="py-16 lg:py-24 bg-slate-50/70">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <DigitalCertificateSection />
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <RocSection />
          </div>
        </section>

        <section className="pb-16 lg:pb-24 bg-slate-50/70">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <PjAccountSection />
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <BenefitsSection />
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-slate-50/70">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <MultibenefitsSection />
          </div>
        </section>

         <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FaqSection />
          </div>
        </section>

      </main>
      <AppFooter />
    </>
  );
}
