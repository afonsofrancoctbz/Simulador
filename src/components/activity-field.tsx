import { memo, useMemo } from 'react';
import { Button } from './ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Trash2, AlertCircle } from 'lucide-react';
import { CNAE_DATA } from '@/lib/cnaes';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const ActivityFieldComponent = ({ form, fieldName, index, removeFn, isExport = false, exportCurrency = 'BRL' }: { form: any, fieldName: "domesticActivities" | "exportActivities", index: number, removeFn: (index: number) => void, isExport?: boolean, exportCurrency?: string }) => {
  const currencySymbols: { [key: string]: string } = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
  const placeholderText = isExport ? `${currencySymbols[exportCurrency] ?? 'R$'} 1.000,00` : "R$ 10.000,00";

  const cnaeCode = form.watch(`${fieldName}.${index}.code`);
  const selectedCnaeData = useMemo(() => CNAE_DATA.find((cnae) => cnae.code === cnaeCode), [cnaeCode]);

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-background/50 mb-2">
      <div className="flex flex-col sm:flex-row items-end gap-2">
          <div className="flex-1 w-full space-y-2">
              <Label>CNAE</Label>
              <div className="w-full justify-start text-left font-normal h-auto min-h-10 py-2 px-3 border rounded-md bg-muted/30">
                  {selectedCnaeData ? (
                      <div className="flex w-full flex-col items-start text-sm">
                          <span className="font-medium text-foreground">{selectedCnaeData.code}</span>
                          <span className="text-muted-foreground whitespace-normal">{selectedCnaeData.description}</span>
                      </div>
                  ) : (
                      <span className="text-destructive">CNAE não encontrado. Por favor, remova e adicione novamente.</span>
                  )}
              </div>
          </div>
          <FormField control={form.control} name={`${fieldName}.${index}.revenue`} render={({ field }) => (
              <FormItem className="w-full sm:w-48">
                  <FormLabel>Faturamento Mensal</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder={placeholderText} {...field} /></FormControl>
                  <FormMessage />
              </FormItem>
          )} />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeFn(index)} className="shrink-0 mb-1">
              <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
      </div>
      {selectedCnaeData?.notes && (
        <Alert variant="default" className="bg-amber-100 border-amber-300 text-amber-800 mt-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-semibold text-amber-700">Ponto de Atenção</AlertTitle>
            <AlertDescription className="text-amber-700/90">{selectedCnaeData.notes}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

ActivityFieldComponent.displayName = 'ActivityField';

export const ActivityField = memo(ActivityFieldComponent);
