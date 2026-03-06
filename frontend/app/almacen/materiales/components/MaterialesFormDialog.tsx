"use client";

import { useEffect, useState, useMemo } from "react";
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
import { materialsService } from "@/lib/services/materials.service";
import type { Material } from "@/lib/types";

const materialSchema = z.object({
  code: z.string().min(1, "El codigo es requerido").max(255),
  name: z.string().min(1, "El nombre es requerido").max(255),
  category: z.string().min(1, "La categoria es requerida"),
  quantity: z.coerce.number().min(0, "La cantidad debe ser positiva").default(0),
  minStock: z.coerce.number().min(0, "El stock minimo debe ser positivo").default(0),
  maxStock: z.coerce.number().optional(),
  unitCost: z.coerce.number().min(0, "El costo debe ser positivo").default(0),
  unit: z.string().optional().default(""),
  warehouse_location_id: z.string().optional().default(""),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialesFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<InventoryItem>;
  onSubmit: (data: CreateInventoryItemDto) => Promise<void>;
  isLoading?: boolean;
}

export function MaterialesFormDialog({ 
  open, 
  onOpenChange, 
  defaultValues, 
  onSubmit, 
  isLoading 
}: MaterialesFormDialogProps) {
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);
  const [materialOptions, setMaterialOptions] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Memoize the default values for useEffect dependencies
  const defaultValuesId = defaultValues?.id;
  const defaultValuesCode = defaultValues?.code;
  const defaultValuesName = defaultValues?.name;

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "raw_material",
      quantity: 0,
      minStock: 0,
      maxStock: undefined,
      unitCost: 0,
      unit: "",
      warehouse_location_id: "",
    },
  });

  // Cargar ubicaciones y materiales del catalogo
  useEffect(() => {
    if (open) {
      setIsDataLoaded(false);
      inventoryService.selectListLocations()
        .then(setLocationOptions)
        .catch(() => setLocationOptions([]));
       
      materialsService.selectList()
        .then((materials) => {
          setMaterialOptions(materials);
          setIsDataLoaded(true);
        })
        .catch(() => {
          setMaterialOptions([]);
          setIsDataLoaded(true);
        });
       
      // Reset selected material when opening
      setSelectedMaterialId("");
    }
  }, [open]);

  // Buscar material coincidente cuando se edita y hay opciones disponibles
  useEffect(() => {
    if (isDataLoaded && defaultValuesId && materialOptions.length > 0) {
      // Buscar si hay un material en el catalogo que coincida con los datos actuales
      const matchingMaterial = materialOptions.find(m => 
        m.code === defaultValuesCode || m.name === defaultValuesName
      );
      if (matchingMaterial) {
        setSelectedMaterialId(matchingMaterial.id.toString());
      }
    }
  }, [isDataLoaded, defaultValuesId, materialOptions, defaultValuesCode, defaultValuesName]);

  // Sincronizar defaultValues cuando cambian (para edicion)
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        code: defaultValues.code || "",
        name: defaultValues.name || "",
        category: defaultValues.category || "raw_material",
        quantity: defaultValues.quantity || 0,
        minStock: defaultValues.minStock || 0,
        maxStock: defaultValues.maxStock || undefined,
        unitCost: defaultValues.unitCost || 0,
        unit: defaultValues.unit || "",
        warehouse_location_id: defaultValues.warehouse_location_id?.toString() || "",
      });
    } else if (open && !defaultValues) {
      // Nuevo material - limpiar formulario
      form.reset({
        code: "",
        name: "",
        category: "raw_material",
        quantity: 0,
        minStock: 0,
        maxStock: undefined,
        unitCost: 0,
        unit: "",
        warehouse_location_id: "",
      });
    }
  }, [open, defaultValues, form]);

  // Manejar seleccion de material existente del catalogo
  const handleMaterialSelect = (materialId: string) => {
    if (!materialId) {
      setSelectedMaterialId("");
      return;
    }
    const material = materialOptions.find(m => m.id.toString() === materialId);
    if (material) {
      form.setValue("code", material.code);
      form.setValue("name", material.name);
      if (material.category) form.setValue("category", material.category);
      if (material.unit) form.setValue("unit", material.unit);
      if (material.cost != null) form.setValue("unitCost", Number(material.cost) || 0);
      if (material.stock != null) form.setValue("quantity", Number(material.stock) || 0);
      if (material.minStock != null) form.setValue("minStock", Number(material.minStock) || 0);
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
      warehouse_location_id: data.warehouse_location_id ? parseInt(data.warehouse_location_id) : undefined,
    };
    await onSubmit(submitData);
    form.reset();
    setSelectedMaterialId("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedMaterialId("");
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
                  <Select 
                    onValueChange={(value) => {
                      setSelectedMaterialId(value);
                      handleMaterialSelect(value);
                    }} 
                    value={selectedMaterialId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar para autocompletar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id.toString()}>
                          {opt.code} - {opt.name} - {opt.category}
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
                    <FormLabel>Codigo *</FormLabel>
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
                      <Input placeholder="Carton corrugado" {...field} />
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
                  <FormLabel>Categoria *</FormLabel>
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
                    <FormLabel>Stock minimo</FormLabel>
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
                    <FormLabel>Stock maximo (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Sin limite"
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
                    <FormLabel>Unidad *</FormLabel>
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
                    <FormLabel>Ubicacion</FormLabel>
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
