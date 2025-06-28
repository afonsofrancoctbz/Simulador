"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { CIDADES_ATENDIDAS } from "@/lib/cities";
import { Banknote, Building, Check, ChevronsUpDown, CreditCard, FileText, Link, Send, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const bankFeatures = [
    { icon: Wallet, title: "Conta PJ Gratuita", description: "Abertura e manutenção da sua conta, sem mensalidade ou taxas escondidas." },
    { icon: CreditCard, title: "Cartão Visa sem Anuidade", description: "Cartão de crédito físico e virtual para sua empresa, sem taxas anuais." },
    { icon: Send, title: "Pix e TEDs Gratuitos", description: "Realize transferências via Pix ilimitadas e 10 TEDs por mês, sem custos." },
    { icon: FileText, title: "10 Boletos de Cobrança Grátis", description: "Emita e compense até 10 boletos por mês para receber de seus clientes." },
    { icon: Link, title: "Integrada à Contabilidade", description: "Sua rotina financeira integrada automaticamente, sem envio manual de extratos." },
    { icon: TrendingUp, title: "Débito Automático de Impostos", description: "Evite multas com o pagamento automático das suas guias de impostos (DAS)." },
];

const CityCombobox = () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full max-w-sm justify-between text-muted-foreground font-normal"
                >
                    {value || "Digite o nome da sua cidade..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                <Command>
                    <CommandInput placeholder="Buscar cidade..." />
                    <CommandList>
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                        <CommandGroup>
                            {CIDADES_ATENDIDAS.map((cidade) => (
                                <CommandItem
                                    key={cidade}
                                    value={cidade}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue.toLowerCase() === value.toLowerCase() ? "" : cidade);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.toLowerCase() === cidade.toLowerCase() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {cidade}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function FaqSection() {
    return (
        <div className="mt-12 w-full max-w-6xl space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Banknote className="text-primary-foreground" />
                        Contabilizei Bank: A Conta PJ Integrada à sua Contabilidade
                    </CardTitle>
                    <CardDescription className="font-serif !mt-2">
                        Uma conta PJ gratuita e inteligente, que separa suas finanças e automatiza sua contabilidade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bankFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
                                <feature.icon className="h-8 w-8 text-accent shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground font-serif">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Building className="text-primary-foreground" />
                        Cidades Atendidas pela Contabilizei
                    </CardTitle>
                    <CardDescription className="font-serif !mt-2">
                        Oferecemos cobertura nacional, atendendo centenas de cidades em todos os estados do Brasil. Verifique se a sua cidade é atendida:
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <CityCombobox />
                     <p className="mt-4 text-sm text-muted-foreground text-center font-serif">Se sua cidade não está na lista, consulte-nos. Nosso serviço de contabilidade online nos permite alcançar empresas em todo o território nacional.</p>
                </CardContent>
            </Card>
        </div>
    )
}
