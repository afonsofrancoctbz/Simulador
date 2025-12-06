"use client";

import { useFormContext } from "react-hook-form";
import { ListChecks } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getCnaeData } from "@/lib/cnae-helpers";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import type { CalculatorFormValues } from './tax-calculator-form';

const planOptions = [
    { value: 'basico', title: 'Básico' },
    { value: 'padrao', title: 'Padrão' },
    { value: 'multibeneficios', title: 'Multibenefícios' },
    { value: 'expertsEssencial', title: 'Experts' },
];

export function FormSectionPlan() {
    const form = useFormContext<CalculatorFormValues>();
    const { toast } = useToast();
    const selectedCnaes = form.watch("selectedCnaes");
    
    const isCommerceOnly = useMemo(() => {
        if (!selectedCnaes || selectedCnaes.length === 0) return false;
        
        // CORREÇÃO: O 'cnae' aqui é um objeto, precisamos passar 'cnae.code'
        return selectedCnaes.every(cnae => getCnaeData(cnae.code)?.annex === 'I');
    }, [selectedCnaes]);
      
    useEffect(() => {
        if (isCommerceOnly && form.getValues('selectedPlan') === 'expertsEssencial') {
            form.setValue('selectedPlan', 'padrao');
            toast({
                title: "Plano ajustado",
                description: "O plano Experts não está disponível para atividades de comércio. Selecionamos o plano Padrão para você.",
                variant: "default",
            });
        }
    }, [isCommerceOnly, form, toast]);

    return (
        <Card className='shadow-lg overflow-hidden border bg-card'>
             <CardHeader className='border-b bg-muted/30'>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <ListChecks className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Plano Contabilizei</CardTitle>
                        <CardDescription>Escolha o plano que melhor se adapta às suas necessidades.</CardDescription>
                    </div>
                </div>
            </CardHeader>
             <CardContent className='p-6 md:p-8'>
               <FormField
                  control={form.control}
                  name="selectedPlan"
                  render={({ field }) => (
                      <FormItem>
                           <FormLabel>Qual plano de contabilidade melhor se encaixa no seu perfil?</FormLabel>
                          <FormControl>
                              <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2"
                              >
                                  {planOptions.map(plan => {
                                      const isDisabled = plan.value === 'expertsEssencial' && isCommerceOnly;
                                      const isExperts = plan.value === 'expertsEssencial';
                                      return (
                                          <FormItem key={plan.value} className="relative">
                                              <FormControl>
                                                  <RadioGroupItem value={plan.value} id={plan.value} className="sr-only" disabled={isDisabled} />
                                              </FormControl>
                                              <Label
                                                  htmlFor={plan.value}
                                                  className={cn(
                                                      "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 h-full space-y-1 cursor-pointer transition-all",
                                                      "hover:bg-accent hover:text-accent-foreground hover:border-accent",
                                                      field.value === plan.value && "border-primary ring-2 ring-primary/50 text-primary",
                                                      isExperts && !isDisabled && "border-amber-500/50 shadow-sm bg-amber-50/20",
                                                      isExperts && field.value === plan.value && "bg-amber-100/80 border-amber-600 text-amber-900",
                                                      isDisabled && "cursor-not-allowed opacity-50 bg-muted/50 hover:bg-muted/50 hover:text-foreground"
                                                  )}
                                              >
                                                  <span className={cn(
                                                      "font-semibold", 
                                                      isExperts ? "font-bold text-base text-amber-700" : "text-sm",
                                                       field.value === plan.value && isExperts && "text-amber-900",
                                                       field.value === plan.value && !isExperts && "text-primary",

                                                     )}>
                                                       {plan.title}
                                                  </span>
                                              </Label>
                                          </FormItem>
                                      );
                                  })}
                              </RadioGroup>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
            </CardContent>
        </Card>
    );
}