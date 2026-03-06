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
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import type { InventoryItem } from "@/lib/types";

const movimientoSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  reference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  performed_by: z.string().optional().default(""),
});

type MovimientoFormValues = z.infer<typeof movimientoSchema>;

interface MaterialesMovimientoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  type: "entry" | "exit";
  onSubmit: (data: { 
    quantity: number; 
    reference?: string; 
    notes?: string; 
    performed_by?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function MaterialesMovimientoDialog({
  open,
  onOpenChange,
  item,
  type,
  onSubmit,
  isLoading,
}: MaterialesMovimientoDialogProps) {
  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      quantity: 1,
      reference: "",
      notes: "",
      performed_by: "",
    },
  });

  const handleSubmit = async (data: MovimientoFormValues) => {
    await onSubmit({
      quantity: data.quantity,
      reference: data.reference || undefined,
      notes: data.notes || undefined,
      performed_by: data.performed_by || undefined,
    });
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const isEntry = type === "entry";
  const currentQty = item?.quantity || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEntry ? (
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowUpFromLine className="h-5 w-5 text-red-500" />
            )}
            {isEntry ? "Entrada de Material" : "Salida de Material"}
          </DialogTitle>
        </DialogHeader>
        
        {item && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              Codigo: {item.code} | Stock actual: {currentQty}
              {item.location && <span> | Ubicacion: {item.location}</span>}
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
                  <FormLabel>Cantidad {isEntry ? "a agregar" : "a retirar"} *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      max={isEntry ? undefined : currentQty}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  {!isEntry && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximo disponible: {currentQty}
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
                    <Input placeholder="Numero de factura, orden, etc." {...field} />
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                variant={isEntry ? "default" : "destructive"}
              >
                {isLoading ? "Procesando..." : isEntry ? "Registrar Entrada" : "Registrar Salida"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
