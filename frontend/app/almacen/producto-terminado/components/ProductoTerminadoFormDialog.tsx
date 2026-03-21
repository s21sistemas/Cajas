"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InventoryItem, CreateInventoryItemDto } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory.service";
import { productsService } from "@/lib/services/products.service";
import type { Product } from "@/lib/types";

const productoSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(255),
  name: z.string().min(1, "El nombre es requerido").max(255),
  category: z.string().min(1, "La categoría es requerida"),
  minStock: z.coerce.number().min(0, "El stock mínimo debe ser positivo").default(0),
  maxStock: z.coerce.number().optional(),
  unitCost: z.coerce.number().min(0, "El costo debe ser positivo").default(0),
  unit: z.string().optional().default(""),
  warehouse: z.string().optional().default(""),
  warehouse_location_id: z.string().min(1, "La ubicación es requerida"),
});

type ProductoFormValues = z.infer<typeof productoSchema>;

interface ProductoTerminadoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<InventoryItem>;
  onSubmit: (data: CreateInventoryItemDto) => Promise<void>;
  isLoading?: boolean;
}

export function ProductoTerminadoFormDialog({ 
  open, 
  onOpenChange, 
  defaultValues, 
  onSubmit, 
  isLoading 
}: ProductoTerminadoFormDialogProps) {
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  
  // Cargar ubicaciones y productos del catálogo
  useEffect(() => {
    if (open) {
      inventoryService.selectListLocations()
        .then(setLocationOptions)
        .catch(() => setLocationOptions([]));
       
      productsService.selectList()
        .then(setProductOptions)
        .catch(() => setProductOptions([]));
    }
  }, [open]);

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "",
      minStock: 0,
      maxStock: undefined,
      unitCost: 0,
      unit: "",
      warehouse: "",
      warehouse_location_id: "",
    },
  });

  // Sincronizar defaultValues cuando cambian (para edición)
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        code: defaultValues.code || "",
        name: defaultValues.name || "",
        category: defaultValues.category || "",
        minStock: defaultValues.minStock || 0,
        maxStock: defaultValues.maxStock || undefined,
        unitCost: defaultValues.unitCost || 0,
        unit: defaultValues.unit || "",
        warehouse: defaultValues.warehouse || "",
        warehouse_location_id: defaultValues.warehouse_location_id?.toString() || "",
      });
    } else if (open && !defaultValues) {
      // Nuevo producto - limpiar formulario
      form.reset({
        code: "",
        name: "",
        category: "",
        minStock: 0,
        maxStock: undefined,
        unitCost: 0,
        unit: "",
        warehouse: "",
        warehouse_location_id: "",
      });
    }
  }, [open, defaultValues, form]);

  // Manejar selección de producto existente del catálogo (solo para autocompletar datos, NO stock)
  const handleProductSelect = (productId: string) => {
    if (!productId) return;
    const product = productOptions.find(p => p.id.toString() === productId);
    if (product) {
      form.setValue("code", product.code);
      form.setValue("name", product.name);
      
      if (product.category) form.setValue("category", product.category);
      if (product.unit) form.setValue("unit", product.unit);
      if (product.cost != null) form.setValue("unitCost", Number(product.cost) || 0);
      if (product.minStock != null) form.setValue("minStock", Number(product.minStock) || 0);
    }
  };

  const handleSubmit = async (data: ProductoFormValues) => {
    // El stock se maneja a través de movimientos de inventario, no directamente
    // Usamos warehouse para identificar productos terminados
    const submitData: CreateInventoryItemDto = {
      code: data.code,
      name: data.name,
      category: data.category as any,
      warehouse: "finished_product",
      quantity: 0, // Se manejará por movimientos
      minStock: data.minStock,
      maxStock: data.maxStock,
      unitCost: data.unitCost,
      unit: data.unit || undefined,
      warehouse_location_id: parseInt(data.warehouse_location_id),
    };
    await onSubmit(submitData);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Editar Producto Terminado" : "Nuevo Producto Terminado"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* SelectList para autocompletar de productos terminados existentes */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto existente (opcional)</FormLabel>
                  <Select onValueChange={handleProductSelect} defaultValue="">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar para autocompletar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id.toString()}>
                          {opt.code} - {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="PT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Caja de cartón" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <FormControl>
                    <Input placeholder="Producto terminado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nota: El stock se gestiona a través de movimientos de inventario, no se edita directamente */}
            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
              <p>El stock se gestiona a través de movimientos de inventario (entradas/salidas).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock mínimo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock máximo (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Sin límite"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo unitario</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Pza" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="warehouse_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación específica *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ubicación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />      

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : defaultValues?.id ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
