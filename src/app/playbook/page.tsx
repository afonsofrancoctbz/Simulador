"use client";

import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
import CalculatorPlaybookSection from "@/components/calculator-playbook-section";
import CnaeTaxInfoSection from "@/components/cnae-tax-info-section";
import PfPjTaxReformSection from "@/components/pf-pj-tax-reform-section";
import SinTaxInfoSection from "@/components/sin-tax-info-section";

export default function PlaybookPage() {
    return (
        <>
            <AppHeader />
            <main>
                 <section className="bg-slate-50/70 border-b">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Playbook do Empreendedor</h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto pb-12">
                        Um guia completo com informações cruciais sobre a Reforma Tributária e seus impactos para o seu negócio.
                    </p>
                    </div>
                </section>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-24">
                    <CalculatorPlaybookSection />
                    <PfPjTaxReformSection />
                    <SinTaxInfoSection />
                    <CnaeTaxInfoSection />
                </div>
            </main>
            <AppFooter />
        </>
    )
}
