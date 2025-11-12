"use client";

import { cn } from "@/lib/utils";
import React, { createContext, useContext, useState, ReactNode } from "react";

const STEPS = [
  { id: 1, title: "1. Empresa" },
  { id: 2, title: "2. Folha e Sócios" },
  { id: 3, title: "3. Faturamento Anual" },
  { id: 4, title: "4. Atividades e Faturamento Mensal" },
  { id: 5, title: "5. Plano" },
];

interface MultiStepFormContextType {
  steps: typeof STEPS;
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const MultiStepFormContext = createContext<MultiStepFormContextType | null>(null);

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error("useMultiStepForm must be used within a MultiStepFormProvider");
  }
  return context;
};

export const MultiStepFormProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  return (
    <MultiStepFormContext.Provider
      value={{ steps: STEPS, currentStep, goToStep, nextStep, prevStep }}
    >
      {children}
    </MultiStepFormContext.Provider>
  );
};

interface MultiStepFormProps {
    steps: {id: number, title: string}[];
    currentStep: number;
    onStepClick: (step: number) => void;
}

export function MultiStepForm({ steps, currentStep, onStepClick }: MultiStepFormProps) {
    return (
        <nav className="mb-8 p-1.5 bg-muted rounded-lg flex items-center justify-center gap-2 overflow-x-auto">
            {steps.map(step => (
                <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepClick(step.id)}
                    className={cn(
                        "flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 text-center whitespace-nowrap",
                        currentStep === step.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-background/60"
                    )}
                >
                    {step.title}
                </button>
            ))}
        </nav>
    );
}
