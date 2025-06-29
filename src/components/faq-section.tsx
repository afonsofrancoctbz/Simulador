
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { CIDADES_ATENDIDAS } from "@/lib/cities";
import { Building, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


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
        <div className="w-full max-w-7xl mx-auto">
            <Card className="bg-card shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Building className="text-primary" />
                        Cidades Atendidas pela Contabilizei
                    </CardTitle>
                    <CardDescription className="!mt-2 text-base">
                        Oferecemos cobertura nacional, atendendo centenas de cidades em todos os estados do Brasil. Verifique se a sua cidade é atendida:
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <CityCombobox />
                     <p className="mt-4 text-sm text-muted-foreground text-center">Se sua cidade não está na lista, consulte-nos. Nosso serviço de contabilidade online nos permite alcançar empresas em todo o território nacional.</p>
                </CardContent>
            </Card>
        </div>
    )
}
