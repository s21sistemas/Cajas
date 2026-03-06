"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";
import type { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory.service";

const transferenciaSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  warehouse_location_id: z.string().min(1, "Selecciona una ubicación de origen"),
  warehouse_location_to_id: z.string().min(1, "Selecciona una ubicación de destino"),
  reference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  performed_by: z.string().optional().default(""),
});

type TransferenciaFormValues = z.infer<typeof transferenciaSchema>;

interface TransferenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSubmit: (data: { 
    quantity: number; 
    warehouse_location_id: number;
    warehouse_location_to_id: number;
    reference?: string; 
    notes?: string; 
    performed_by?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function TransferenciaDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: TransferenciaDialogProps) {
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);

  // Cargar ubicaciones
  useEffect(() => {
    if (open) {
      inventoryService.selectListLocations()
        .then(setLocationOptions)
        .catch(() => setLocationOptions([]));
    }
  }, [open]);

  const form = useForm<TransferenciaFormValues>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      quantity: 1,
      warehouse_location_id: "",
      warehouse_location_to_id: "",
      reference: "",
      notes: "",
      performed_by: "",
    },
  });

  const handleSubmit = async (data: TransferenciaFormValues) => {
    await onSubmit({
      quantity: data.quantity,
      warehouse_location_id: parseInt(data.warehouse_location_id),
      warehouse_location_to_id: parseInt(data.warehouse_location_to_id),
      reference: data.reference || undefined,
      notes: data.notes || undefined,
      performed_by: data.performed_by || undefined,
    });
    form.reset();
  };

  const handleOpenChangeInternal = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const currentQty = item?.quantity || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            Transferencia entre Ubicaciones
          </DialogTitle>
        </DialogHeader>
        
        {item && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              Código: {item.code} | Stock actual: {currentQty}
            </p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad a transferir *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      max={currentQty}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponible: {currentQty}
                  </p>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warehouse_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación origen *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouse_location_to_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación destino *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de documento, orden, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="performed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Realizado por (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de quien registra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Observaciones adicionales" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChangeInternal(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? "Procesando..." : "Registrar Transferencia"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
