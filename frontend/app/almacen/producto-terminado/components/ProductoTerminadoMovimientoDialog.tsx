"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownToLine, ArrowUpFromLine, Package, ShoppingCart } from "lucide-react";
import type { InventoryItem } from "@/lib/types";

const movimientoSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  reference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type MovimientoFormValues = z.infer<typeof movimientoSchema>;

interface ProductoTerminadoMovimientoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  type: "production" | "sale";
  onSubmit: (data: { quantity: number; reference?: string; notes?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function ProductoTerminadoMovimientoDialog({
  open,
  onOpenChange,
  item,
  type,
  onSubmit,
  isLoading,
}: ProductoTerminadoMovimientoDialogProps) {
  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      quantity: 1,
      reference: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: MovimientoFormValues) => {
    await onSubmit({
      quantity: data.quantity,
      reference: data.reference || undefined,
      notes: data.notes || undefined,
    });
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const isProduction = type === "production";
  const currentQty = item?.quantity || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProduction ? (
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowUpFromLine className="h-5 w-5 text-red-500" />
            )}
            {isProduction ? "Registrar Producción" : "Registrar Venta"}
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
                  <FormLabel>Cantidad {isProduction ? "producida" : "vendida"} *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      max={isProduction ? undefined : currentQty}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  {!isProduction && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Máximo disponible: {currentQty}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isProduction ? "Orden de producción" : "Número de venta"} 
                      {...field} 
                    />
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                variant={isProduction ? "default" : "destructive"}
              >
                {isLoading ? "Procesando..." : isProduction ? "Registrar Producción" : "Registrar Venta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
