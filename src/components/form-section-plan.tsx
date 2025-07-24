
"use client";

import { useFormContext } from "react-hook-form";
import { ListChecks } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getCnaeData } from "@/lib/cnae-helpers";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        if (selectedCnaes.length === 0) return false;
        return selectedCnaes.every(code => getCnaeData(code)?.annex === 'I');
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
        <Card className='shadow-xl overflow-hidden border bg-card'>
            <CardHeader className='bg-muted/40 p-4 rounded-t-lg border-b'>
               <h3 className="font-semibold text-lg text-foreground flex items-center gap-3">
                    <div className='p-2 bg-primary/10 rounded-md border border-primary/20'>
                        <ListChecks className="h-5 w-5 text-primary" />
                    </div>
                    3. Selecione o Plano Contabilizei
                </h3>
                <p className='text-sm text-muted-foreground mt-1'>Escolha o plano que melhor se adapta às suas necessidades.</p>
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
                                                      "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all text-center h-full space-y-1",
                                                      field.value === plan.value && "border-primary",
                                                      isExperts && !isDisabled && "border-amber-500/70 shadow-md bg-amber-50/20",
                                                      isDisabled && "cursor-not-allowed opacity-50 bg-muted/50"
                                                  )}
                                              >
                                                  <span className={cn(
                                                      "font-semibold", 
                                                      isExperts ? "font-bold text-base text-amber-700" : "text-sm"
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
