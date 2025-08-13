
"use client"

import * as React from "react"
import { Check, Search, PlusCircle, X } from "lucide-react"

import { CNAE_DATA_RAW as CNAE_DATA } from "@/lib/cnaes-raw"
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
import { Separator } from "./ui/separator"

const mainCategories = [
  "Consultoria",
  "Desenvolvimento de Software",
  "Educação",
  "Administração",
  "Advocacia",
  "Engenharia",
  "Tecnologia",
  "Serviços Médicos",
  "Publicidade",
  "Turismo",
  "Arquitetura",
  "Corretagem de Imóveis",
]

const categoryToCnaeMap: Record<string, string[]> = {
    Consultoria: ["6911-7/01", "6612-6/05", "7020-4/00", "7319-0/04", "6204-0/00", "6920-6/02"],
    "Desenvolvimento de Software": ["6201-5/01", "6203-1/00", "6202-3/00"],
    Educação: ["8511-2/00", "8512-1/00", "8513-9/00", "8520-1/00", "8531-7/00", "8532-5/00", "8533-3/00", "8541-4/00", "8542-2/00", "8550-3/02", "8599-6/03", "8599-6/04", "8599-6/99"],
    Administração: ["8211-3/00", "8219-9/99"],
    Advocacia: ["6911-7/01"],
    Engenharia: ["7112-0/00", "7119-7/03", "7119-7/99"],
    Tecnologia: ["6204-0/00", "6202-3/00", "6209-1/00", "6201-5/01", "6203-1/00", "6201-5/02"],
    "Serviços Médicos": ["8630-5/03", "8630-5/02", "8610-1/02", "8630-5/01", "8610-1/01"],
    Publicidade: ["7311-4/00", "7319-0/02", "7319-0/03", "7319-0/04", "7319-0/99"],
    Turismo: ["7912-1/00", "7911-2/00", "7990-2/00"],
    Arquitetura: ["7111-1/00", "7119-7/03", "7119-7/99"],
    "Corretagem de Imóveis": ["6821-8/01", "6821-8/02", "6822-6/00"],
};

const MAX_SELECTION = 20;

function CnaeSelectorComponent({
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
      const cnaesForCategory = categoryToCnaeMap[selectedCategory] || []
      results = results.filter((cnae) => cnaesForCategory.includes(cnae.code))
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
      toast({
        title: "Limite Atingido",
        description: `Você só pode selecionar até ${MAX_SELECTION} atividades.`,
        variant: "destructive",
      });
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
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold">Selecionar Atividades (CNAE)</DialogTitle>
          <DialogDescription>
            Pesquise, filtre por categoria ou cole uma lista de códigos para definir as atividades da sua empresa. Máximo de {MAX_SELECTION} atividades.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow min-h-0 flex">
            {/* Left Panel */}
            <div className="w-1/3 min-w-[350px] border-r flex flex-col bg-muted/30">
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cnae-search">Pesquisar por código ou descrição</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            id="cnae-search"
                            placeholder="Ex: consultoria, 7112-0/00..."
                            className="pl-9 bg-background"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                if(selectedCategory) setSelectedCategory(null);
                            }}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cnae-paste">Adicionar CNAEs em massa</Label>
                        <div className="flex items-start gap-2">
                            <Textarea
                                id="cnae-paste"
                                placeholder="Cole códigos aqui..."
                                value={codesToPaste}
                                onChange={(e) => setCodesToPaste(e.target.value)}
                                rows={2}
                                className="bg-background"
                            />
                            <Button type="button" onClick={handleAddPastedCnaes} disabled={!codesToPaste} className="h-auto py-2 px-3 self-stretch" title="Adicionar CNAEs colados">
                                <PlusCircle className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="flex-grow p-4 flex flex-col min-h-0">
                    <h4 className="font-semibold text-foreground mb-2 shrink-0">Atividades Selecionadas ({selectedCodes.length}/{MAX_SELECTION})</h4>
                    <ScrollArea className="flex-grow">
                        <div className="space-y-2 pr-4">
                           {selectedCodes.length > 0 ? selectedCodes.map(code => (
                            <div key={code} className="flex items-center justify-between bg-background p-2 rounded-md border">
                                <span className="text-sm font-medium">{code}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleToggleCnae(code)}>
                                    <X className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                           )) : (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                Nenhuma atividade selecionada.
                            </div>
                           )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="mt-auto p-4 border-t shrink-0">
                     <Tabs value={selectedCategory || ''} onValueChange={handleCategoryChange} className="w-full">
                        <Label>Ou filtre por categoria</Label>
                        <TabsList className="h-auto flex-wrap justify-start gap-1 mt-2">
                            {mainCategories.slice(0, 6).map((category) => ( // Show first 6 for brevity
                                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col">
                <div className="px-6 py-3 border-b shrink-0 bg-background">
                    <p className="text-sm text-muted-foreground">
                        {filteredCnaes.length > 0
                            ? `Mostrando ${filteredCnaes.length} resultados para sua busca.`
                            : "Nenhum CNAE encontrado para os filtros atuais."}
                    </p>
                </div>
                <ScrollArea className="flex-grow">
                     <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filteredCnaes.length > 0 ? (
                        filteredCnaes.map((cnae) => (
                            <button
                            key={cnae.code}
                            className={cn(
                                "w-full text-left p-3 border rounded-lg cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring relative transition-colors bg-card",
                                selectedCodes.includes(cnae.code) && "border-primary ring-2 ring-primary/50"
                            )}
                            onClick={() => handleToggleCnae(cnae.code)}
                            >
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-sm pr-6">{cnae.code} - {cnae.description}</p>
                                {selectedCodes.includes(cnae.code) && (
                                    <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
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
        </div>

        <DialogFooter className="p-4 border-t bg-background items-center justify-end flex-row shrink-0">
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

export const CnaeSelector = React.memo(CnaeSelectorComponent);

    