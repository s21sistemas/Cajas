"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { InventoryItem, CreateInventoryItemDto } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory.service";

const materialSchema = z.object({
  code: z.string().min(1, "El código es requerido").max(255),
  name: z.string().min(1, "El nombre es requerido").max(255),
  category: z.string().min(1, "La categoría es requerida"),
  quantity: z.number().min(0, "La cantidad debe ser positiva").default(0),
  minStock: z.number().min(0, "El stock mínimo debe ser positivo").default(0),
  maxStock: z.number().optional(),
  unitCost: z.number().min(0, "El costo debe ser positivo").default(0),
  unit: z.string().optional().default(""),
  location: z.string().optional().default(""),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialesFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<InventoryItem>;
  onSubmit: (data: CreateInventoryItemDto) => Promise<void>;
  isLoading?: boolean;
}

const categoryOptions = [
  { value: "raw_material", label: "Materia Prima" },
  { value: "component", label: "Componente" },
  { value: "tool", label: "Herramienta" },
  { value: "consumable", label: "Consumible" },
];

const unitOptions = [
  { value: "pza", label: "Pieza" },
  { value: "kg", label: "Kilogramo" },
  { value: "g", label: "Gramo" },
  { value: "ton", label: "Tonelada" },
  { value: "metro", label: "Metro" },
  { value: "cm", label: "Centímetro" },
  { value: "litro", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "rollo", label: "Rollo" },
  { value: "hoja", label: "Hoja" },
  { value: "par", label: "Par" },
  { value: "juego", label: "Juego" },
];

export function MaterialesFormDialog({ 
  open, 
  onOpenChange, 
  defaultValues, 
  onSubmit, 
  isLoading 
}: MaterialesFormDialogProps) {
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);
  const [materialOptions, setMaterialOptions] = useState<InventoryItem[]>([]);
  
  // Cargar ubicaciones y materiales
  useEffect(() => {
    if (open) {
      inventoryService.selectListLocations()
        .then(setLocationOptions)
        .catch(() => setLocationOptions([]));
      
      inventoryService.selectListMaterials()
        .then(setMaterialOptions)
        .catch(() => setMaterialOptions([]));
    }
  }, [open]);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      code: defaultValues?.code || "",
      name: defaultValues?.name || "",
      category: defaultValues?.category || "raw_material",
      quantity: defaultValues?.quantity || 0,
      minStock: defaultValues?.minStock || 0,
      maxStock: defaultValues?.maxStock || undefined,
      unitCost: defaultValues?.unitCost || 0,
      unit: defaultValues?.unit || "",
      location: defaultValues?.location || "",
    },
  });

  // Manejar selección de material existente
  const handleMaterialSelect = (materialId: string) => {
    if (!materialId) return;
    const material = materialOptions.find(m => m.id.toString() === materialId);
    if (material) {
      form.setValue("code", material.code);
      form.setValue("name", material.name);
      if (material.category) form.setValue("category", material.category);
      if (material.unit) form.setValue("unit", material.unit);
      if (material.unitCost) form.setValue("unitCost", material.unitCost);
      if (material.minStock) form.setValue("minStock", material.minStock);
      if (material.maxStock) form.setValue("maxStock", material.maxStock);
      if (material.location) form.setValue("location", material.location);
    }
  };

  const handleSubmit = async (data: MaterialFormValues) => {
    const submitData: CreateInventoryItemDto = {
      code: data.code,
      name: data.name,
      category: data.category as any,
      quantity: data.quantity,
      minStock: data.minStock,
      maxStock: data.maxStock,
      unitCost: data.unitCost,
      unit: data.unit || undefined,
      location: data.location || undefined,
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
            {defaultValues?.id ? "Editar Material" : "Nuevo Material"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* SelectList para autocompletar de materiales existentes */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material existente (opcional)</FormLabel>
                  <Select onValueChange={handleMaterialSelect} defaultValue="">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar para autocompletar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialOptions.map((opt) => (
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
                      <Input placeholder="MAT-001" {...field} />
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
                      <Input placeholder="Cartón corrugado" {...field} />
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
                    <Input placeholder="Materia Prima" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((opt) => (
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
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
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
