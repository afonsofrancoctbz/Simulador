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
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([])

  React.useEffect(() => {
    if (open) {
      setSearch("")
      setSelectedCategory(null)
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
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code]
    )
  }

  const handleConfirmClick = () => {
    onConfirm(selectedCodes)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center">Selecionar Atividades (CNAE)</DialogTitle>
          <DialogDescription className="text-center">
            Busque ou filtre por categoria e selecione uma ou mais atividades para adicionar.
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
          <div className="flex flex-wrap gap-2 justify-center">
            {mainCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setSelectedCategory(current => (current === category ? null : category))
                  if(search) setSearch('');
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-grow border-t mt-4">
          <div className="p-6 space-y-2">
            {filteredCnaes.length > 0 ? (
              filteredCnaes.map((cnae) => (
                <button
                  key={cnae.code}
                  className={cn(
                    "w-full text-left p-4 border rounded-lg cursor-pointer hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring relative transition-colors",
                    selectedCodes.includes(cnae.code) && "bg-accent text-accent-foreground ring-2 ring-ring"
                  )}
                  onClick={() => handleToggleCnae(cnae.code)}
                >
                  {selectedCodes.includes(cnae.code) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <p className="font-semibold">{cnae.code} - {cnae.description}</p>
                  {cnae.category && <Badge variant="secondary" className="mt-1">{cnae.category}</Badge>}
                </button>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <p>
                  {search.length > 1 || selectedCategory
                    ? "Nenhum CNAE encontrado."
                    : "Busque por um termo ou selecione uma categoria para ver os CNAEs."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t bg-background/80 sticky bottom-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirmClick} disabled={selectedCodes.length === 0}>
            Adicionar {selectedCodes.length > 0 ? `${selectedCodes.length} atividade(s)` : 'atividades'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
