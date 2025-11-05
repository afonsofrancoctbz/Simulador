

"use client";

import { useFormContext } from "react-hook-form";
import { Building2 } from 'lucide-react';
import { CIDADES_ATENDIDAS } from '@/lib/cities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FormSectionCompany() {
    const form = useFormContext();

    return (
        <Card className='shadow-lg overflow-hidden border bg-card'>
            <CardHeader className='border-b bg-muted/30'>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Dados da Empresa</CardTitle>
                        <CardDescription>Comece nos dizendo onde sua empresa será registrada.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-6 md:p-8'>
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Onde sua empresa será registrada?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma cidade" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {CIDADES_ATENDIDAS.map((city) => (
                                    <SelectItem key={city} value={city}>
                                    {city}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Isso afeta taxas e prazos de abertura.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}

    