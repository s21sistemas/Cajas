"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import type { WarehouseLocation, CreateWarehouseLocationDto, UpdateWarehouseLocationDto } from "@/lib/types/inventory.types";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  zone: z.string().min(0, ""),
  type: z.string().min(1, "El tipo es requerido"),
  capacity: z.coerce.number().min(1, "La capacidad debe ser mayor a 0"),
  occupancy: z.coerce.number().min(0, "La ocupación no puede ser negativa").default(0),
});

interface UbicacionesFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateWarehouseLocationDto | UpdateWarehouseLocationDto) => Promise<void>;
  initialData?: WarehouseLocation | null;
  mode?: "create" | "edit";
}

export function UbicacionesFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: UbicacionesFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localOpen, setLocalOpen] = useState(open);

  useEffect(() => {
    setLocalOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setLocalOpen(newOpen);
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset({
        name: "",
        zone: "",
        type: "",
        capacity: 0,
        occupancy: 0,
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      zone: initialData?.zone || "",
      type: initialData?.type || "",
      capacity: initialData?.capacity || 0,
      occupancy: initialData?.occupancy || 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        zone: initialData.zone,
        type: initialData.type,
        capacity: initialData.capacity,
        occupancy: initialData.occupancy,
      });
    } else {
      form.reset({
        name: "",
        zone: "",
        type: "",
        capacity: 0,
        occupancy: 0,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      handleOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={localOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Ubicación" : "Editar Ubicación"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Agrega una nueva ubicación de almacén."
              : "Actualiza los datos de la ubicación."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. A-01-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Recepción" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Rack" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ocupación Inicial</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : mode === "create" ? "Crear" : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
