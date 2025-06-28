"use client"

import * as React from "react"
import { Check, Search } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

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

const MAX_SELECTION = 5;

export function CnaeSelector({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (codes: string[]) => void
}) {
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(mainCategories[0])
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([])

  React.useEffect(() => {
    if (open) {
      setSearch("")
      setSelectedCategory(mainCategories[0])
      setSelectedCodes([])
    }
  }, [open])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center">Selecionar Atividades (CNAE)</DialogTitle>
          <DialogDescription className="text-center">
            Busque ou filtre por categoria. Você pode adicionar até {MAX_SELECTION} atividades.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar: Atividade, código..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if(selectedCategory) setSelectedCategory(null);
              }}
            />
          </div>
          <Tabs value={selectedCategory || ''} onValueChange={handleCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {mainCategories.map((category) => (
                    <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>
        <ScrollArea className="flex-grow border-t mt-4">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredCnaes.length > 0 ? (
              filteredCnaes.map((cnae) => (
                <button
                  key={cnae.code}
                  className={cn(
                    "w-full text-left p-3 border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring relative transition-colors",
                    selectedCodes.includes(cnae.code) && "bg-accent text-accent-foreground ring-2 ring-ring"
                  )}
                  onClick={() => handleToggleCnae(cnae.code)}
                  disabled={!selectedCodes.includes(cnae.code) && selectedCodes.length >= MAX_SELECTION}
                >
                  {selectedCodes.includes(cnae.code) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <p className="font-semibold text-sm">{cnae.code} - {cnae.description}</p>
                  {cnae.category && <Badge variant="secondary" className="mt-1 text-xs">{cnae.category}</Badge>}
                </button>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-16 col-span-2">
                <p>
                  {search.length > 1 || selectedCategory
                    ? "Nenhum CNAE encontrado."
                    : "Busque por um termo ou selecione uma categoria para ver os CNAEs."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t bg-background/80 sticky bottom-0 items-center justify-between flex-row">
            <div className="text-sm text-muted-foreground">
                {selectedCodes.length} de {MAX_SELECTION} selecionados
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleConfirmClick} disabled={selectedCodes.length === 0}>
                    Adicionar {selectedCodes.length > 0 ? `${selectedCodes.length} atividade(s)` : 'atividades'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
