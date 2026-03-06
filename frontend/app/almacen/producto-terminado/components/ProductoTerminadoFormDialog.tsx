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
  quantity: z.number().min(0, "La cantidad debe ser positiva").default(0),
  minStock: z.number().min(0, "El stock mínimo debe ser positivo").default(0),
  maxStock: z.number().optional(),
  unitCost: z.number().min(0, "El costo debe ser positivo").default(0),
  unit: z.string().optional().default(""),
  warehouse: z.string().optional().default(""),
  warehouse_location_id: z.string().optional().default(""),
});

type ProductoFormValues = z.infer<typeof productoSchema>;

interface ProductoTerminadoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<InventoryItem>;
  onSubmit: (data: CreateInventoryItemDto) => Promise<void>;
  isLoading?: boolean;
}

const unitOptions = [
  { value: "pza", label: "Pieza" },
  { value: "kg", label: "Kilogramo" },
  { value: "ton", label: "Tonelada" },
  { value: "metro", label: "Metro" },
  { value: "litro", label: "Litro" },
  { value: "rollo", label: "Rollo" },
  { value: "caja", label: "Caja" },
  { value: "paquete", label: "Paquete" },
];

const warehouseOptions = [
  { value: "almacen_principal", label: "Almacén Principal" },
  { value: "almacen_secundario", label: "Almacén Secundario" },
  { value: "area_produccion", label: "Área de Producción" },
  { value: "exhibicion", label: "Exhibición" },
];

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
      quantity: 0,
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
        quantity: defaultValues.quantity || 0,
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
        quantity: 0,
        minStock: 0,
        maxStock: undefined,
        unitCost: 0,
        unit: "",
        warehouse: "",
        warehouse_location_id: "",
      });
    }
  }, [open, defaultValues, form]);

  // Manejar selección de producto existente del catálogo
  const handleProductSelect = (productId: string) => {
    if (!productId) return;
    const product = productOptions.find(p => p.id.toString() === productId);
    if (product) {
      form.setValue("code", product.code);
      form.setValue("name", product.name);
      if (product.unit) form.setValue("unit", product.unit);
      if (product.cost != null) form.setValue("unitCost", Number(product.cost) || 0);
      if (product.stock != null) form.setValue("quantity", Number(product.stock) || 0);
      if (product.minStock != null) form.setValue("minStock", Number(product.minStock) || 0);
      if (product.category) form.setValue("category" as any, product.category);
    }
  };

  const handleSubmit = async (data: ProductoFormValues) => {
    const submitData: CreateInventoryItemDto = {
      code: data.code,
      name: data.name,
      category: "finished_product",
      quantity: data.quantity,
      minStock: data.minStock,
      maxStock: data.maxStock,
      unitCost: data.unitCost,
      unit: data.unit || undefined,
      warehouse_location_id: data.warehouse_location_id ? parseInt(data.warehouse_location_id) : undefined,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Editar Producto Terminado" : "Nuevo Producto Terminado"}
          </DialogTitle>
        </DialogHeader>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad inicial</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="warehouse_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación específica</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
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
            </div>



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
      </DialogContent>
    </Dialog>
  );
}
