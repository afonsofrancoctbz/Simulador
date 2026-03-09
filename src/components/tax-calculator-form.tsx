"use client";

import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormSectionCompany } from "./form-section-company";
import { FormSectionPlan } from "./form-section-plan";
import { Loader2, Rocket, Building2 } from "lucide-react";
import { FormSectionPayroll } from "./form-section-payroll";
import { FormSectionAnnualRevenue } from "./form-section-annual-revenue";
import { MultiStepForm, useMultiStepForm } from "./multi-step-form";
import { FormSectionRevenueAndCnae } from "./form-section-revenue-and-cnae";
import type { CalculatorFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaxCalculatorFormProps {
    year: number;
    onCnaeSelectorOpen: () => void;
    isLoading: boolean;
    onSubmit: (values: CalculatorFormValues) => void;
}

export function TaxCalculatorForm({ year, onCnaeSelectorOpen, isLoading, onSubmit }: TaxCalculatorFormProps) {
    const form = useFormContext<CalculatorFormValues>();
    const { currentStep, steps: defaultSteps, goToStep } = useMultiStepForm();
    
    // Watch para o estágio da empresa
    const companyStage = form.watch("companyStage");

    // --- FIX: AUTO-SELECT NOVA EMPRESA ---
    // Se o campo estiver vazio ao carregar, define automaticamente como "Nova Empresa" ('new')
    // Isso evita que o formulário fique inválido/travado sem uma seleção inicial.
    useEffect(() => {
        if (!companyStage) {
            form.setValue("companyStage", "new");
        }
    }, [companyStage, form]);
    // -------------------------------------

    // Efeito para garantir navegação consistente ao trocar de modo
    useEffect(() => {
        if (companyStage === 'new' && currentStep === 3) {
            goToStep(4);
        }
    }, [companyStage, currentStep, goToStep]);

    const visibleSteps = defaultSteps.filter(step => {
        if (companyStage === 'new' && step.id === 3) return false;
        return true;
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-500">
            
            {/* --- 1. SELEÇÃO DE PERFIL (DISCRETO) --- */}
            <div className="flex flex-col items-center justify-center gap-5 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Qual é o seu perfil?
                </span>
                <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-full border border-slate-200 shadow-inner">
                    {/* Opção Nova Empresa */}
                    <label className={cn(
                        "cursor-pointer px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 select-none",
                        companyStage === 'new' 
                            ? "bg-white text-primary shadow-sm ring-1 ring-black/5 scale-105" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}>
                        <input 
                            type="radio" 
                            value="new" 
                            className="sr-only" 
                            {...form.register("companyStage")} 
                        />
                        <Rocket className={cn("w-4 h-4", companyStage === 'new' ? "text-primary" : "text-slate-400")} />
                        Nova Empresa
                    </label>

                    {/* Opção Empresa Existente */}
                    <label className={cn(
                        "cursor-pointer px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 select-none",
                        companyStage === 'existing' 
                            ? "bg-white text-primary shadow-sm ring-1 ring-black/5 scale-105" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}>
                        <input 
                            type="radio" 
                            value="existing" 
                            className="sr-only" 
                            {...form.register("companyStage")} 
                        />
                        <Building2 className={cn("w-4 h-4", companyStage === 'existing' ? "text-primary" : "text-slate-400")} />
                        Empresa em Atividade
                    </label>
                </div>
            </div>

            {/* --- 2. BARRA DE PROGRESSO --- */}
            <MultiStepForm 
                currentStep={currentStep} 
                steps={visibleSteps} 
                onStepClick={(id) => {
                    if (companyStage === 'new' && id === 3) return;
                    goToStep(id);
                }} 
            />

            {/* --- 3. CONTEÚDO DOS PASSOS --- */}
            <div className={cn("transition-all duration-300 ease-in-out", currentStep === 1 ? 'block opacity-100' : 'hidden opacity-0')}>
                <FormSectionCompany />
            </div>
            
            <div className={cn("transition-all duration-300 ease-in-out", currentStep === 2 ? 'block opacity-100' : 'hidden opacity-0')}>
                <FormSectionPayroll year={year as 2025 | 2026} />
            </div>
            
            {companyStage === 'existing' && (
                <div className={cn("transition-all duration-300 ease-in-out", currentStep === 3 ? 'block opacity-100' : 'hidden opacity-0')}>
                    <FormSectionAnnualRevenue />
                </div>
            )}
            
            <div className={cn("transition-all duration-300 ease-in-out", currentStep === 4 ? 'block opacity-100' : 'hidden opacity-0')}>
                <FormSectionRevenueAndCnae year={year} onCnaeSelectorOpen={onCnaeSelectorOpen} />
            </div>
            
            <div className={cn("transition-all duration-300 ease-in-out", currentStep === 5 ? 'block opacity-100' : 'hidden opacity-0')}>
                <FormSectionPlan />
            </div>

            <div className="bg-card rounded-lg border shadow-lg p-4 sticky bottom-4 z-20">
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading} 
                    className="w-full text-lg py-7 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : null}
                    {isLoading ? "Processando Simulação..." : "Analisar e Otimizar Impostos"}
                </Button>
            </div>
        </form>
    );
}