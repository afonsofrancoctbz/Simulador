
"use client"

import * as React from "react"
import { Check, Search, PlusCircle, X, List, FileSearch, HardHat, HeartPulse, Code, Megaphone, Leaf, Briefcase, Info, CheckCheck, XCircle } from "lucide-react"

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
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "./ui/separator"
import type { CnaeData } from "@/lib/types"

const categories = [
  { name: "Busca", icon: Search },
  { name: "Tecnologia da Informação", icon: Code },
  { name: "Saúde e Bem-estar", icon: HeartPulse },
  { name: "Engenharia, Arquitetura e Design", icon: HardHat },
  { name: "Publicidade e Marketing", icon: Megaphone },
  { name: "Consultoria e Gestão Empresarial", icon: Briefcase },
  { name: "Outras Atividades", icon: Leaf },
];

const categoryToCnaeMap: Record<string, string[]> = {
    "Tecnologia da Informação": ["6201-5/01", "6201-5/02", "6202-3/00", "6203-1/00", "6204-0/00", "6209-1/00", "6311-9/00", "6319-4/00", "6399-2/00"],
    "Saúde e Bem-estar": ["7500-1/00", "8610-1/01", "8610-1/02", "8621-6/01", "8621-6/02", "8622-4/00", "8630-5/01", "8630-5/02", "8630-5/03", "8630-5/06", "8630-5/07", "8630-5/99", "8640-2/01", "8640-2/02", "8640-2/03", "8640-2/04", "8640-2/05", "8640-2/06", "8640-2/07", "8640-2/08", "8640-2/09", "8640-2/10", "8640-2/11", "8640-2/12", "8640-2/13", "8640-2/14", "8640-2/99", "8650-0/01", "8650-0/02", "8650-0/03", "8650-0/04", "8650-0/05", "8650-0/06", "8650-0/07", "8650-0/99", "8660-7/00", "8690-9/01", "8690-9/02", "8690-9/03", "8690-9/04", "8690-9/99", "8711-5/01", "8711-5/02", "8712-3/00", "3250-7/09"],
    "Odontologia": ["8630-5/04", "3250-7/06"],
    "Engenharia, Arquitetura e Design": ["7111-1/00", "7112-0/00", "7119-7/01", "7119-7/02", "7119-7/03", "7119-7/04", "7119-7/99", "7120-1/00", "7410-2/02", "7410-2/03", "7410-2/99"],
    "Consultoria e Gestão Empresarial": ["7020-4/00", "7210-0/00", "7220-7/00", "7320-3/00", "7490-1/03"],
    "Publicidade e Marketing": ["7311-4/00", "7312-2/00", "7319-0/01", "7319-0/02", "7319-0/03", "7319-0/04", "7319-0/99", "5911-1/02"],
    "Educação e Treinamento": ["8511-2/00", "8512-1/00", "8513-9/00", "8520-1/00", "8531-7/00", "8532-5/00", "8533-3/00", "8541-4/00", "8542-2/00", "8550-3/02", "8591-1/00", "8592-9/01", "8592-9/02", "8592-9/03", "8592-9/99", "8593-7/00", "8599-6/01", "8599-6/02", "8599-6/03", "8599-6/04", "8599-6/05", "8599-6/99"],
    "Outras Atividades": [] // Preenchido dinamicamente
};
const allCategorizedCnaes = new Set(Object.values(categoryToCnaeMap).flat());
categoryToCnaeMap["Outras Atividades"] = CNAE_DATA.filter(c => !allCategorizedCnaes.has(c.code)).map(c => c.code);

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
  const [activeView, setActiveView] = React.useState("Busca")
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>(initialSelectedCodes)
  const [codesToPaste, setCodesToPaste] = React.useState("");
  const [hoveredCnae, setHoveredCnae] = React.useState<CnaeData | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setSelectedCodes(initialSelectedCodes);
      setActiveView("Busca");
      setSearch("");
    }
  }, [open, initialSelectedCodes])

  const filteredCnaes = React.useMemo(() => {
    if (activeView === "Busca") {
        const lowercasedSearch = search.toLowerCase().trim()
        if (lowercasedSearch.length < 2) return [];
        return CNAE_DATA.filter(
            (cnae) =>
            cnae.code.includes(lowercasedSearch) ||
            cnae.description.toLowerCase().includes(lowercasedSearch) ||
            cnae.category?.toLowerCase().includes(lowercasedSearch)
        ).slice(0, 100);
    }
    const cnaesForCategory = categoryToCnaeMap[activeView] || []
    return CNAE_DATA.filter((cnae) => cnaesForCategory.includes(cnae.code)).slice(0,100)
  }, [search, activeView]);

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
      return current;
    });
  }

  const handleConfirmClick = () => {
    onConfirm(selectedCodes)
    onOpenChange(false)
  }
  
  const handleAddPastedCnaes = () => {
    const rawCodes = codesToPaste.match(/(\d{4}-?\d\/?\d{2})|(\d{7})/g) || [];
    
    if (rawCodes.length === 0) {
      toast({ title: "Nenhum CNAE encontrado", description: "O texto informado não contém códigos de CNAE válidos.", variant: "destructive" });
      return;
    }
    
    const allCnaeCodes = CNAE_DATA.map(c => c.code);
    let addedCount = 0, invalidCount = 0, duplicateCount = 0, limitReached = false;
    const newSelected = new Set(selectedCodes);

    rawCodes.forEach(rawCode => {
      if (newSelected.size >= MAX_SELECTION) { limitReached = true; return; }
      
      const normalizedCode = rawCode.replace(/[^\d]/g, '');
      const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 5)}/${normalizedCode.slice(5, 7)}`;
      
      if (allCnaeCodes.includes(formattedCode)) {
        if (newSelected.has(formattedCode)) duplicateCount++;
        else { newSelected.add(formattedCode); addedCount++; }
      } else invalidCount++;
    });

    setSelectedCodes(Array.from(newSelected));
    toast({ title: "Processamento Concluído", description: `${addedCount} CNAEs adicionados, ${invalidCount} inválidos e ${duplicateCount} já selecionados.` });
    if (limitReached) toast({ title: "Limite Atingido", description: `O limite de ${MAX_SELECTION} CNAEs foi alcançado.`, variant: "destructive" });
    setCodesToPaste("");
  };

  const handleSelectAll = () => {
    const newSelected = new Set(selectedCodes);
    let limitReached = false;
    for (const cnae of filteredCnaes) {
      if (newSelected.size >= MAX_SELECTION) {
        limitReached = true;
        break;
      }
      newSelected.add(cnae.code);
    }
    setSelectedCodes(Array.from(newSelected));
    if (limitReached) {
      toast({
        title: "Limite Atingido",
        description: `O limite de ${MAX_SELECTION} CNAEs foi alcançado. Nem todos os itens puderam ser adicionados.`,
        variant: "destructive",
      });
    }
  };

  const handleClearCategorySelection = () => {
    const categoryCnaeCodes = new Set(filteredCnaes.map(c => c.code));
    const newSelectedCodes = selectedCodes.filter(code => !categoryCnaeCodes.has(code));
    setSelectedCodes(newSelectedCodes);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold">Selecionar Atividades (CNAE)</DialogTitle>
          <DialogDescription>
            Pesquise, filtre por categoria ou cole uma lista de códigos para definir as atividades da sua empresa. Máximo de {MAX_SELECTION} atividades.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow min-h-0 flex">
            {/* Left Panel - Navigation */}
            <div className="w-1/4 min-w-[240px] border-r flex flex-col bg-muted/30 p-4">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categorias</p>
                <ScrollArea>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <Button
                                key={cat.name}
                                variant={activeView === cat.name ? "secondary" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => setActiveView(cat.name)}
                            >
                                <cat.icon className="mr-2 h-4 w-4" />
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Center Panel - List/Inputs */}
            <div className="w-1/2 border-r flex flex-col">
                <div className="p-4 border-b shrink-0 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">{activeView}</h3>
                    {activeView !== 'Busca' && filteredCnaes.length > 0 && (
                      <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handleSelectAll}>
                              <CheckCheck className="mr-2 h-4 w-4"/>
                              Selecionar todos
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleClearCategorySelection}>
                               <XCircle className="mr-2 h-4 w-4"/>
                              Limpar seleção
                          </Button>
                      </div>
                    )}
                </div>
                 {activeView === 'Busca' && (
                    <div className="p-4 space-y-4">
                         <div className="p-4 border rounded-lg bg-background/50">
                            <Label htmlFor="cnae-paste" className="font-semibold text-base">Adicionar em Massa</Label>
                            <p className="text-sm text-muted-foreground mb-3">Cole uma lista de códigos CNAE abaixo.</p>
                            <Textarea
                                id="cnae-paste"
                                placeholder="Ex: 7020-4/00, 6201501, 8630504..."
                                value={codesToPaste}
                                onChange={(e) => setCodesToPaste(e.target.value)}
                                rows={4}
                            />
                            <Button onClick={handleAddPastedCnaes} disabled={!codesToPaste} className="w-full mt-3">
                                <PlusCircle className="mr-2 h-4 w-4"/> Adicionar CNAEs à Seleção
                            </Button>
                        </div>
                        <Separator />
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ou busque por código ou descrição..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                <ScrollArea className="flex-grow">
                     <div className="p-4 pt-0 space-y-2">
                        {(activeView !== 'Busca' || search.length >= 2) && (
                            <>
                                {filteredCnaes.length > 0 ? filteredCnaes.map(cnae => (
                                    <div
                                        key={cnae.code}
                                        onMouseEnter={() => setHoveredCnae(cnae)}
                                        onMouseLeave={() => setHoveredCnae(null)}
                                        onClick={() => handleToggleCnae(cnae.code)}
                                        className={cn("p-3 border rounded-lg cursor-pointer transition-colors bg-card flex items-center justify-between hover:bg-muted/50", selectedCodes.includes(cnae.code) && "border-primary ring-1 ring-primary/80")}
                                    >
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{cnae.code} - {cnae.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                <Badge variant="secondary" className="text-xs">{cnae.category}</Badge>
                                                <Badge variant={cnae.annex === 'V' ? 'destructive' : 'default'} className="text-xs">
                                                    Anexo {cnae.annex}{cnae.requiresFatorR ? ' (Fator R)' : ''}
                                                </Badge>
                                                {cnae.isRegulated && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Regulamentado</Badge>}
                                            </div>
                                        </div>
                                         <Button size="sm" variant="ghost" className="ml-4 shrink-0">
                                            {selectedCodes.includes(cnae.code) ? <Check className="h-5 w-5 text-primary"/> : <PlusCircle className="h-5 w-5 text-muted-foreground"/>}
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <p>Nenhum CNAE encontrado.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Panel - Details & Selection */}
            <div className="w-1/4 flex flex-col bg-muted/30">
                <div className="p-6 flex-grow flex flex-col min-h-0">
                    <h4 className="font-semibold text-foreground mb-4 shrink-0">Análise de Impacto</h4>
                    {hoveredCnae ? (
                        <div className="p-4 border rounded-lg bg-background space-y-3 text-sm">
                           <h5 className="font-bold">{hoveredCnae.code} - {hoveredCnae.description}</h5>
                            <div className="space-y-1">
                                <Badge>Anexo Simples Nacional: {hoveredCnae.annex} {hoveredCnae.requiresFatorR && '(Depende do Fator R)'}</Badge>
                            </div>
                           {hoveredCnae.notes && <p className="text-xs text-muted-foreground italic flex gap-2 pt-2"><Info className="h-4 w-4 shrink-0 mt-0.5"/>{hoveredCnae.notes}</p>}
                        </div>
                    ) : (
                        <div className="p-4 flex-grow flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <FileSearch className="mx-auto h-12 w-12 opacity-50 mb-4"/>
                                <p>Passe o mouse sobre uma atividade<br/>para ver a análise de impacto fiscal.</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t shrink-0 h-1/2 flex flex-col min-h-0">
                    <h4 className="font-semibold text-foreground mb-4 shrink-0">Atividades Selecionadas ({selectedCodes.length}/{MAX_SELECTION})</h4>
                    <ScrollArea className="flex-grow bg-background border rounded-lg">
                        <div className="space-y-2 p-3">
                           {selectedCodes.length > 0 ? selectedCodes.map(code => (
                            <div key={code} className="flex items-center justify-between bg-muted/40 p-2 rounded-md border">
                                <span className="text-sm font-medium flex-grow pr-2">{code} - {CNAE_DATA.find(c=>c.code===code)?.description}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleToggleCnae(code)}>
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
            </div>
        </div>

        <DialogFooter className="p-4 border-t bg-background items-center justify-end flex-row shrink-0">
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleConfirmClick} disabled={selectedCodes.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Confirmar {selectedCodes.length > 0 ? `(${selectedCodes.length})` : ''}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const CnaeSelector = React.memo(CnaeSelectorComponent);

    

    

    