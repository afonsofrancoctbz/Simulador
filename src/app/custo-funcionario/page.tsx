"use client";

import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
import EmployeeCostCalculator from "@/components/employee-cost-calculator";

export default function CustoFuncionarioPage() {
    return (
        <>
            <AppHeader />
            <main>
                 <section className="bg-slate-50/70 border-b">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Custo Real de um Funcionário</h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto pb-12">
                        Simule o custo total de um funcionário para sua empresa, incluindo encargos, benefícios e impostos conforme o regime tributário.
                    </p>
                    </div>
                </section>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <EmployeeCostCalculator />
                </div>
            </main>
            <AppFooter />
        </>
    )
}
