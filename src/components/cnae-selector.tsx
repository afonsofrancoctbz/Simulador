"use client"

import * as React from "react"
import { Check, Search, PlusCircle, XCircle } from "lucide-react"

import { CNAE_DATA } from "@/lib/cnaes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"

const mainCategories = [
  "Consultoria",
  "Desenvolvimento de Software",
  "Educação e Cursos",
  "Administração",
  "Advocacia",
  "Engenharia",
  "Tecnologia",
  "Serviços Médicos",
  "Publicidade",
  "Turismo",
  "Arquitetura",
  "Corretagem de imóveis",
]

const categoryToInternalMap: Record<string, string[]> = {
  Consultoria: ["Consultoria e Gestão Empresarial"],
  "Desenvolvimento de Software": ["Tecnologia da Informação"],
  "Educação e Cursos": ["Educação e Treinamento"],
  Administração: ["Serviços Administrativos e de Apoio"],
  Advocacia: ["Atividades Jurídicas e Contábeis"],
  Engenharia: ["Engenharia, Arquitetura e Design", "Construção Civil", "Manutenção e Reparo Técnico"],
  Tecnologia: ["Tecnologia da Informação"],
  "Serviços Médicos": ["Saúde e Bem-estar", "Veterinária"],
  Publicidade: ["Publicidade e Marketing"],
  Turismo: ["Turismo e Eventos", "Hospedagem e Alimentação"],
  Arquitetura: ["Engenharia, Arquitetura e Design"],
  "Corretagem de imóveis": ["Serviços Financeiros e Imobiliários"],
}

const MAX_SELECTION = 20;

export function CnaeSelector({
  open,
  onOpenChange,
  onConfirm,
  initialSelectedCodes = [],
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (codes: string[]) => void
  initialSelectedCodes?: string[]
}) {
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(mainCategories[0])
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>(initialSelectedCodes)
  const [codesToPaste, setCodesToPaste] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setSelectedCodes(initialSelectedCodes)
    }
  }, [open, initialSelectedCodes])

  const filteredCnaes = React.useMemo(() => {
    let results = CNAE_DATA
    const lowercasedSearch = search.toLowerCase().trim()
    if (lowercasedSearch.length > 1) {
      results = results.filter(
        (cnae) =>
          cnae.code.includes(lowercasedSearch) ||
          cnae.description.toLowerCase().includes(lowercasedSearch) ||
          cnae.category?.toLowerCase().includes(lowercasedSearch)
      )
    } else if (selectedCategory) {
      const internalCategories = categoryToInternalMap[selectedCategory] || []
      results = results.filter((cnae) => cnae.category && internalCategories.includes(cnae.category))
    } else {
      return []
    }
    return results.slice(0, 100)
  }, [search, selectedCategory])

  const handleToggleCnae = (code: string) => {
    setSelectedCodes((current) => {
      if (current.includes(code)) {
        return current.filter((c) => c !== code)
      }
      if (current.length < MAX_SELECTION) {
        return [...current, code]
      }
      return current; // Limit reached
    });
  }

  const handleConfirmClick = () => {
    onConfirm(selectedCodes)
    onOpenChange(false)
  }

  const handleCategoryChange = (category: string) => {
    setSearch('');
    setSelectedCategory(category);
  }

  const handleSelectAllVisible = () => {
    const visibleCodes = filteredCnaes.map(c => c.code);
    const newSelected = new Set(selectedCodes);
    visibleCodes.forEach(code => {
        if (newSelected.size < MAX_SELECTION) {
            newSelected.add(code);
        }
    });
    setSelectedCodes(Array.from(newSelected));
  };

  const handleDeselectAllVisible = () => {
    const visibleCodes = new Set(filteredCnaes.map(c => c.code));
    setSelectedCodes(selectedCodes.filter(code => !visibleCodes.has(code)));
  };
  
  const handleAddPastedCnaes = () => {
    const rawCodes = codesToPaste.match(/(\d{4}-?\d\/?\d{2})|(\d{7})/g) || [];
    
    if (rawCodes.length === 0) {
      toast({
        title: "Nenhum CNAE encontrado",
        description: "O texto informado não contém códigos de CNAE válidos.",
        variant: "destructive",
      });
      return;
    }
    
    const allCnaeCodes = CNAE_DATA.map(c => c.code);
    let addedCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let limitReached = false;
    
    const newSelected = new Set(selectedCodes);

    rawCodes.forEach(rawCode => {
      if (newSelected.size >= MAX_SELECTION) {
        limitReached = true;
        return;
      }
      
      const normalizedCode = rawCode.replace(/[^\d]/g, '');
      const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 5)}/${normalizedCode.slice(5, 7)}`;
      
      if (allCnaeCodes.includes(formattedCode)) {
        if (newSelected.has(formattedCode)) {
          duplicateCount++;
        } else {
          newSelected.add(formattedCode);
          addedCount++;
        }
      } else {
        invalidCount++;
      }
    });

    setSelectedCodes(Array.from(newSelected));
    
    toast({
      title: "Processamento Concluído",
      description: `${addedCount} CNAEs adicionados. ${invalidCount} inválidos. ${duplicateCount} já estavam na lista.`,
    });

    if (limitReached) {
       toast({
        title: "Limite Atingido",
        description: `O limite de ${MAX_SELECTION} CNAEs foi alcançado.`,
        variant: "destructive",
      });
    }

    setCodesToPaste("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <div className="p-6 border-b shrink-0 space-y-4">
            <DialogHeader className="p-0 text-left space-y-1">
                <DialogTitle className="text-2xl font-bold">Selecionar Atividades (CNAE)</DialogTitle>
                <DialogDescription>
                    Cole uma lista, busque por código/descrição ou filtre por categoria. Máximo de {MAX_SELECTION} atividades.
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="cnae-paste">Adicionar CNAEs em massa</Label>
                    <div className="flex items-start gap-2">
                        <Textarea
                            id="cnae-paste"
                            placeholder="Cole os códigos aqui. Ex: 6201-5/01, 7112000"
                            value={codesToPaste}
                            onChange={(e) => setCodesToPaste(e.target.value)}
                            rows={2}
                        />
                        <Button type="button" onClick={handleAddPastedCnaes} disabled={!codesToPaste} className="h-auto py-2 px-4 self-stretch">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Adicionar
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cnae-search">Ou pesquise por atividade</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="cnae-search"
                        placeholder="Ex: consultoria, engenharia, 7112-0/00..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            if(selectedCategory) setSelectedCategory(null);
                        }}
                        />
                    </div>
                </div>
            </div>

            <Tabs value={selectedCategory || ''} onValueChange={handleCategoryChange} className="w-full">
                <TabsList className="h-auto flex-wrap justify-start gap-1">
                    {mainCategories.map((category) => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
        
        <div className="flex-grow min-h-0 flex flex-col">
            <div className="px-6 py-3 flex items-center justify-between border-b shrink-0 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                    {filteredCnaes.length > 0
                        ? `${filteredCnaes.length} resultados na visão atual.`
                        : "Nenhum CNAE encontrado."}
                </p>
                {filteredCnaes.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="link" onClick={handleSelectAllVisible} className="p-0 h-auto">
                        Selecionar todos
                    </Button>
                    <span className="text-muted-foreground/50">/</span>
                    <Button size="sm" variant="link" className="text-destructive hover:text-destructive/80 p-0 h-auto" onClick={handleDeselectAllVisible}>
                        Limpar todos
                    </Button>
                </div>
                )}
            </div>

            <ScrollArea className="flex-grow">
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredCnaes.length > 0 ? (
                    filteredCnaes.map((cnae) => (
                        <button
                        key={cnae.code}
                        className={cn(
                            "w-full text-left p-3 border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring relative transition-colors",
                            selectedCodes.includes(cnae.code) && "bg-accent/80 text-accent-foreground ring-2 ring-ring"
                        )}
                        onClick={() => handleToggleCnae(cnae.code)}
                        disabled={!selectedCodes.includes(cnae.code) && selectedCodes.length >= MAX_SELECTION}
                        >
                        {selectedCodes.includes(cnae.code) && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                            </div>
                        )}
                        <p className="font-semibold text-sm pr-6">{cnae.code} - {cnae.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{cnae.category}</Badge>
                            <Badge variant={cnae.annex === 'V' ? 'destructive' : 'default'} className="text-xs">
                                Anexo {cnae.annex}{cnae.requiresFatorR ? ' (Fator R)' : ''}
                            </Badge>
                            {cnae.isRegulated && <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">Regulamentado</Badge>}
                        </div>
                        </button>
                    ))
                    ) : (
                    <div className="text-center text-muted-foreground py-16 col-span-full">
                        <p>
                        {search.length > 1 || selectedCategory
                            ? "Nenhum CNAE encontrado com os filtros atuais."
                            : "Busque por um termo ou selecione uma categoria para ver os CNAEs."}
                        </p>
                    </div>
                    )}
                </div>
            </ScrollArea>
        </div>
        <DialogFooter className="p-4 border-t bg-background items-center justify-between flex-row shrink-0">
            <div className="text-sm text-muted-foreground">
                {selectedCodes.length} de {MAX_SELECTION} selecionados
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleConfirmClick} disabled={selectedCodes.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Confirmar {selectedCodes.length > 0 ? `${selectedCodes.length} atividade(s)` : ''}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
