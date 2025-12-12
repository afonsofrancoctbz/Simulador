
"use client"

import * as React from "react"
import { Check, Search, PlusCircle, X, List, FileSearch, HardHat, HeartPulse, Code, Megaphone, Leaf, Briefcase, Info, CheckCheck, XCircle, Stethoscope, DraftingCompass, Building, Handshake, Clapperboard, ShoppingCart, Utensils, VenetianMask, AlertTriangle, Badge } from "lucide-react"

import { getCnaeData, UNIFIED_CNAE_DATA as CNAE_DATA } from "@/lib/cnae-helpers"
import { Badge as BadgeUI } from "@/components/ui/badge"
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce";
import type { CnaeData, CnaeSelection } from "@/lib/types"

const categories = [
  { name: "Busca", icon: Search, cnaeCodes: [] },
  { name: "Tecnologia da Informação", icon: Code, cnaeCodes: ["6201-5/01", "6201-5/02", "6202-3/00", "6203-1/00", "6204-0/00", "6209-1/00", "6311-9/00", "6319-4/00", "6399-2/00", "4751-2/02"] },
  { name: "Saúde e Bem-estar", icon: HeartPulse, cnaeCodes: ["8610-1/01", "8610-1/02", "8621-6/01", "8621-6/02", "8622-4/00", "8630-5/01", "8630-5/02", "8630-5/03", "8630-5/06", "8630-5/07", "8630-5/99", "8640-2/01", "8640-2/02", "8640-2/03", "8640-2/04", "8640-2/05", "8640-2/06", "8640-2/07", "8640-2/08", "8640-2/09", "8640-2/10", "8640-2/11", "8640-2/12", "8640-2/13", "8640-2/14", "8640-2/99", "8650-0/01", "8650-0/02", "8650-0/03", "8650-0/04", "8650-0/05", "8650-0/06", "8650-0/07", "8650-0/99", "8660-7/00", "8690-9/01", "8690-9/02", "8690-9/03", "8690-9/04", "8690-9/99", "8711-5/01", "8711-5/02", "8712-3/00", "3250-7/09"] },
  { name: "Odontologia", icon: Stethoscope, cnaeCodes: ["8630-5/04", "3250-7/06"] },
  { name: "Engenharia, Arquitetura e Design", icon: DraftingCompass, cnaeCodes: ["7111-1/00", "7112-0/00", "7119-7/01", "7119-7/02", "7119-7/03", "7119-7/04", "7119-7/99", "7120-1/00", "7410-2/02", "7410-2/03", "7410-2/99"] },
  { name: "Consultoria e Gestão Empresarial", icon: Briefcase, cnaeCodes: ["7020-4/00", "7210-0/00", "7220-7/00", "7320-3/00", "7490-1/03"] },
  { name: "Publicidade e Marketing", icon: Megaphone, cnaeCodes: ["7311-4/00", "7312-2/00", "7319-0/01", "7319-0/02", "7319-0/03", "7319-0/04", "7319-0/99", "5911-1/02"] },
  { name: "Educação e Treinamento", icon: FileSearch, cnaeCodes: ["8511-2/00", "8512-1/00", "8513-9/00", "8520-1/00", "8531-7/00", "8532-5/00", "8533-3/00", "8541-4/00", "8542-2/00", "8550-3/02", "8591-1/00", "8592-9/01", "8592-9/02", "8592-9/03", "8592-9/99", "8593-7/00", "8599-6/01", "8599-6/02", "8599-6/03", "8599-6/04", "8599-6/05", "8599-6/99"] },
  { name: "Construção Civil", icon: HardHat, cnaeCodes: ["4399-1/01", "4211-1/02", "4221-9/03", "4221-9/05", "4313-4/00", "4321-5/00", "4322-3/01", "4322-3/02", "4322-3/03", "4329-1/01", "4329-1/02", "4329-1/03", "4329-1/04", "4329-1/05", "4399-1/02", "8121-4/00", "8122-2/00", "8129-0/00", "8130-3/00"] },
  { name: "Representação Comercial", icon: Handshake, cnaeCodes: ["4512-9/01", "4530-7/06", "4542-1/01", "4611-7/00", "4612-5/00", "4613-3/00", "4614-1/00", "4615-0/00", "4616-8/00", "4617-6/00", "4618-4/01", "4618-4/02", "4618-4/03", "4618-4/99", "4619-2/00"] },
  { name: "Serviços Administrativos e de Apoio", icon: Building, cnaeCodes: ["8211-3/00", "8219-9/01", "8219-9/99", "8220-2/00", "8291-1/00", "8299-7/01", "8299-7/03", "8299-7/07", "8299-7/99"] },
  { name: "Atividades artísticas, criativas e de espetáculos", icon: VenetianMask, cnaeCodes: ["9001-9/01", "9001-9/02", "9001-9/03", "9001-9/04", "9001-9/05", "9001-9/06", "9001-9/99"] },
  { name: "Fotografia e Audiovisual", icon: Clapperboard, cnaeCodes: ["7420-0/01", "7420-0/02", "7420-0/03", "7420-0/04", "7420-0/05", "5911-1/99", "5912-0/01", "5912-0/02", "5912-0/99", "5913-8/00", "5914-6/00", "5920-1/00", "5911-1/01"] },
  { name: "Comércio Varejista", icon: ShoppingCart, cnaeCodes: ["4511-1/01", "4530-7/03", "4530-7/04", "4530-7/05", "4541-2/03", "4541-2/04", "4541-2/06", "4541-2/07", "4711-3/01", "4711-3/02", "4712-1/00", "4713-0/02", "4713-0/04", "4729-6/01", "4722-9/02", "4729-6/02", "4741-5/00", "4742-3/00", "4743-1/00", "4744-0/01", "4744-0/02", "4744-0/03", "4744-0/04", "4744-0/05", "4744-0/06", "4744-0/99", "4751-2/01", "4752-1/00", "4753-9/00", "4754-7/01", "4754-7/02", "4754-7/03", "4755-5/01", "4755-5/02", "4755-5/03", "4756-3/00", "4757-1/00", "4759-8/01", "4759-8/99", "4761-0/01", "4761-0/02", "4761-0/03", "4762-8/00", "4763-6/01", "4763-6/02", "4763-6/03", "4763-6/04", "4763-6/05", "4771-7/04", "4772-5/00", "4773-3/00", "4774-1/00", "4781-4/00", "4782-2/01", "4782-2/02", "4783-1/02", "4785-7/01", "4785-7/99", "4789-0/01", "4789-0/02", "4789-0/03", "4789-0/05", "4789-0/06", "4789-0/07", "4789-0/08", "4789-0/09", "4789-0/99"] },
  { name: "Hospedagem e Alimentação", icon: Utensils, cnaeCodes: ["5510-8/01", "5510-8/02", "5510-8/03", "5590-6/01", "5590-6/02", "5590-6/03", "5590-6/99", "5611-2/01", "5611-2/03", "5611-2/04", "5620-1/01", "5620-1/02", "5620-1/03", "5620-1/04", "4721-1/02", "4721-1/03", "4721-1/04", "4723-7/00", "4724-5/00", "4729-6/99"] },
];

const allCategorizedCnaes = new Set(categories.flatMap(c => c.cnaeCodes));
const otherCnaes = CNAE_DATA.filter(c => !allCategorizedCnaes.has(c.code)).map(c => c.code);
categories.push({ name: "Outras Atividades", icon: Leaf, cnaeCodes: otherCnaes });


const MAX_SELECTION = 20;

function CnaeSelectorComponent({
  open,
  onOpenChange,
  onConfirm,
  initialSelectedCnaes = [],
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (cnaes: CnaeSelection[]) => void
  initialSelectedCnaes?: CnaeSelection[]
}) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300);
  const [activeView, setActiveView] = React.useState("Busca")
  const [selectedCnaes, setSelectedCnaes] = React.useState<CnaeSelection[]>(initialSelectedCnaes)
  const [codesToPaste, setCodesToPaste] = React.useState("");
  const [hoveredCnae, setHoveredCnae] = React.useState<CnaeData | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setSelectedCnaes(initialSelectedCnaes);
      setActiveView("Busca");
      setSearch("");
    }
  }, [open, initialSelectedCnaes])

  const filteredCnaes = React.useMemo(() => {
    if (activeView === "Busca") {
        const lowercasedSearch = debouncedSearch.toLowerCase().trim()
        if (lowercasedSearch.length < 2) return [];
        return CNAE_DATA.filter(
            (cnae) =>
            cnae.code.includes(lowercasedSearch) ||
            cnae.description.toLowerCase().includes(lowercasedSearch) ||
            cnae.category?.toLowerCase().includes(lowercasedSearch)
        ).slice(0, 100);
    }
    const category = categories.find(c => c.name === activeView);
    const cnaesForCategory = category?.cnaeCodes || [];
    return CNAE_DATA.filter((cnae) => cnaesForCategory.includes(cnae.code)).slice(0,100)
  }, [debouncedSearch, activeView]);

  const handleToggleCnae = (code: string) => {
    setSelectedCnaes((current) => {
      const isSelected = current.some(c => c.code === code);
      if (isSelected) {
        return current.filter((c) => c.code !== code)
      }
      if (current.length < MAX_SELECTION) {
        return [...current, { code }]
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
    onConfirm(selectedCnaes)
    onOpenChange(false)
  }
  
  const handleAddPastedCnaes = () => {
    const rawCodes = codesToPaste.match(/(\d{4}-?\d\/?\d{2})|(\d{7})/g) || [];
    
    if (rawCodes.length === 0) {
      toast({ title: "Nenhum CNAE encontrado", description: "O texto informado não contém códigos de CNAE válidos.", variant: "destructive" });
      return;
    }
    
    const allCnaeCodes = new Set(CNAE_DATA.map(c => c.code));
    const currentSelectedCodes = new Set(selectedCnaes.map(c => c.code));
    let addedCount = 0, invalidCount = 0, duplicateCount = 0, limitReached = false;
    const newSelected = [...selectedCnaes];

    rawCodes.forEach(rawCode => {
      if (newSelected.length >= MAX_SELECTION) { limitReached = true; return; }
      
      const normalizedCode = rawCode.replace(/[^\d]/g, '');
      const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 5)}/${normalizedCode.slice(5, 7)}`;
      
      if (allCnaeCodes.has(formattedCode)) {
        if (currentSelectedCodes.has(formattedCode)) {
          duplicateCount++;
        } else {
          newSelected.push({ code: formattedCode });
          currentSelectedCodes.add(formattedCode);
          addedCount++;
        }
      } else {
        invalidCount++;
      }
    });

    setSelectedCnaes(newSelected);
    toast({ title: "Processamento Concluído", description: `${addedCount} CNAEs adicionados, ${invalidCount} inválidos e ${duplicateCount} já selecionados.` });
    if (limitReached) toast({ title: "Limite Atingido", description: `O limite de ${MAX_SELECTION} CNAEs foi alcançado.`, variant: "destructive" });
    setCodesToPaste("");
  };


  const handleSelectAll = () => {
    const currentSelectedCodes = new Set(selectedCnaes.map(c => c.code));
    const newSelected = [...selectedCnaes];
    let limitReached = false;
    
    for (const cnae of filteredCnaes) {
        if (newSelected.length >= MAX_SELECTION) {
            limitReached = true;
            break;
        }
        if (!currentSelectedCodes.has(cnae.code)) {
            newSelected.push({ code: cnae.code });
            currentSelectedCodes.add(cnae.code);
        }
    }
    setSelectedCnaes(newSelected);
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
    const newSelectedCnaes = selectedCnaes.filter(cnae => !categoryCnaeCodes.has(cnae.code));
    setSelectedCnaes(newSelectedCnaes);
  };

  const isCnaeSelected = (code: string) => selectedCnaes.some(c => c.code === code);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold">Selecionar Atividades (CNAE)</DialogTitle>
          <DialogDescription>
            Pesquise, filtre por categoria ou cole uma lista de códigos para definir as atividades da sua empresa. Máximo de ${MAX_SELECTION} atividades.
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
                                    <button
                                        type="button"
                                        key={cnae.code}
                                        onMouseEnter={() => setHoveredCnae(cnae)}
                                        onMouseLeave={() => setHoveredCnae(null)}
                                        onClick={() => handleToggleCnae(cnae.code)}
                                        className={cn("w-full text-left", "p-3 border rounded-lg cursor-pointer transition-colors bg-card flex items-center justify-between hover:bg-muted/50", isCnaeSelected(cnae.code) && "border-primary ring-1 ring-primary/80")}
                                    >
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{cnae.code} - {cnae.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                <BadgeUI variant="secondary" className="text-xs">{cnae.category}</BadgeUI>
                                                <BadgeUI variant={cnae.annex === 'V' ? 'destructive' : 'default'} className="text-xs">
                                                    Anexo {cnae.annex}{cnae.requiresFatorR ? ' (Fator R)' : ''}
                                                </BadgeUI>
                                                {cnae.isRegulated && <BadgeUI variant="outline" className="text-xs border-amber-500 text-amber-600">Regulamentado</BadgeUI>}
                                            </div>
                                        </div>
                                         <Button size="sm" variant="ghost" className="ml-4 shrink-0">
                                            {isCnaeSelected(cnae.code) ? <Check className="h-5 w-5 text-primary"/> : <PlusCircle className="h-5 w-5 text-muted-foreground"/>}
                                        </Button>
                                    </button>
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
                                <BadgeUI>Anexo Simples Nacional: {hoveredCnae.annex} {hoveredCnae.requiresFatorR && '(Depende do Fator R)'}</BadgeUI>
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
                    <h4 className="font-semibold text-foreground mb-4 shrink-0">Atividades Selecionadas ({selectedCnaes.length}/${MAX_SELECTION})</h4>
                    <ScrollArea className="flex-grow bg-background border rounded-lg">
                        <div className="space-y-2 p-3">
                           {selectedCnaes.length > 0 ? selectedCnaes.map(cnaeItem => {
                               const cnae = getCnaeData(cnaeItem.code);
                               if (!cnae) {
                                   console.warn(`CNAE ${cnaeItem.code} não encontrado`);
                                   return null;
                               }
                               return (
                                <div key={cnaeItem.code} className="bg-muted/40 p-3 rounded-lg border text-sm relative">
                                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 absolute top-1 right-1" onClick={() => handleToggleCnae(cnaeItem.code)}>
                                        <X className="h-4 w-4 text-destructive"/>
                                    </Button>
                                    <p className="font-semibold text-foreground pr-6">{cnae.code} - {cnae.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                                         <BadgeUI variant={cnae.annex === 'V' ? 'destructive' : 'default'} className="text-xs">
                                            Anexo {cnae.annex}{cnae.requiresFatorR ? ' (Fator R)' : ''}
                                        </BadgeUI>
                                        {cnae.isRegulated && (
                                            <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                <span>Atividade Regulamentada</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                               )
                            }) : (
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
                <Button onClick={handleConfirmClick} disabled={selectedCnaes.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Confirmar {selectedCnaes.length > 0 ? `(${selectedCnaes.length})` : ''}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const CnaeSelector = React.memo(CnaeSelectorComponent);

    
