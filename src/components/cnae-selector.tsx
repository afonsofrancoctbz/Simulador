"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { CNAE_DATA } from "@/lib/cnaes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const selectedCnae = React.useMemo(() => CNAE_DATA.find((c) => c.code === value), [value])

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
      return [] // Do not show anything if no search or category
    }

    return results.slice(0, 100) // Limit results for performance
  }, [search, selectedCategory])

  const handleSelectCnae = (code: string) => {
    onChange(code)
    setOpen(false)
    setSearch("")
    setSelectedCategory(null)
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-auto min-h-10 py-2"
        onClick={() => setOpen(true)}
      >
        {selectedCnae ? (
          <div className="flex w-full flex-col items-start text-sm">
            <span className="font-medium text-foreground">{selectedCnae.code}</span>
            <span className="text-muted-foreground whitespace-normal">{selectedCnae.description}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Selecionar CNAE...</span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-center">Consulta de CNAE.</DialogTitle>
            <DialogDescription className="text-center">
              Busque pelo código, atividade ou consulte as áreas sugeridas nas categorias abaixo:
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
                    className="w-full text-left p-4 border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => handleSelectCnae(cnae.code)}
                  >
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
        </DialogContent>
      </Dialog>
    </>
  )
}
