"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Supplier, CreateSupplierDto } from "@/lib/types";
import { z } from "zod";

interface ProveedoresFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Supplier | null;
  onSubmit: (data: CreateSupplierDto) => void;
  loading: boolean;
  errors?: Record<string, string[]>;
}

// Schema de validación con Zod
const supplierSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "La razón social es requerida"),
  rfc: z.string()
    .optional()
    .refine((val) => !val || val.length === 0 || val.length >= 12, {
      message: "El RFC debe tener al menos 12 caracteres",
    })
    .refine((val) => !val || val.length <= 13, {
      message: "El RFC no debe exceder 13 caracteres",
    }),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().optional(),
  contact: z.string().optional(),
  category: z.string().optional(),
  lead_time: z.number().int().min(0, "El tiempo de entrega debe ser positivo").default(0),
  rating: z.number().int().min(0).max(5, "La calificación debe estar entre 0 y 5").default(0),
  status: z.enum(["active", "inactive", "pending"]).default("pending"),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export function ProveedoresFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSubmit,
  loading,
  errors = {},
}: ProveedoresFormDialogProps) {
  // Limpiar errores Zod cuando se abre el diálogo o cambia el item
  useEffect(() => {
    if (open) {
      setZodErrors({});
    }
  }, [open, editingItem]);
  // Estado para errores de validación de Zod
  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  const getFieldError = (field: string): string | undefined => {
    // Primero verificar errores del servidor (Zod tiene prioridad)
    if (zodErrors[field]) {
      return zodErrors[field];
    }
    // Luego errores del servidor
    if (errors[field] && errors[field].length > 0) {
      return errors[field][0];
    }
    return undefined;
  };

  const validateForm = (data: SupplierFormData): boolean => {
    try {
      supplierSchema.parse(data);
      setZodErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });
        setZodErrors(fieldErrors);
      }
      return false;
    }
  };
  const getInitialData = (): CreateSupplierDto => {
    if (editingItem) {
      return {
        code: editingItem.code,
        name: editingItem.name,
        rfc: editingItem.rfc || undefined,
        email: editingItem.email || undefined,
        phone: editingItem.phone || undefined,
        address: editingItem.address,
        city: editingItem.city,
        state: editingItem.state || undefined,
        contact: editingItem.contact || undefined,
        category: editingItem.category || undefined,
        lead_time: editingItem.leadTime,
        rating: editingItem.rating,
        status: editingItem.status,
      };
    }
    return {
      code: "",
      name: "",
      rfc: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      contact: "",
      category: "",
      lead_time: 0,
      rating: 0,
      status: "pending",
    };
  };

  const formData = getInitialData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: CreateSupplierDto = {
      code: form.get("code") as string,
      name: form.get("name") as string,
      rfc: form.get("rfc") as string || undefined,
      email: form.get("email") as string || undefined,
      phone: form.get("phone") as string || undefined,
      address: form.get("address") as string,
      city: form.get("city") as string,
      state: form.get("state") as string || undefined,
      contact: form.get("contact") as string || undefined,
      category: form.get("category") as string || undefined,
      lead_time: parseInt(form.get("lead_time") as string) || 0,
      rating: parseInt(form.get("rating") as string) || 0,
      status: (form.get("status") as "active" | "inactive" | "pending") || "pending",
    };
    
    // Validar con Zod antes de enviar
    const isValid = validateForm(data as SupplierFormData);
    if (!isValid) {
      return;
    }
    
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Proveedor" : "Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {editingItem
              ? "Modifique los datos del proveedor."
              : "Complete los datos del proveedor a registrar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={formData.code}
                  placeholder="PRV-XXX"
                  required
                  className={getFieldError('code') ? "border-destructive" : ""}
                />
                {getFieldError('code') && (
                  <p className="text-sm text-destructive">{getFieldError('code')}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  name="rfc"
                  defaultValue={formData.rfc}
                  placeholder="XAXX010101000"
                  className={getFieldError('rfc') ? "border-destructive" : ""}
                />
                {getFieldError('rfc') && (
                  <p className="text-sm text-destructive">{getFieldError('rfc')}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Razón Social *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={formData.name}
                placeholder="Nombre del proveedor"
                required
                className={getFieldError('name') ? "border-destructive" : ""}
              />
              {getFieldError('name') && (
                <p className="text-sm text-destructive">{getFieldError('name')}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={formData.email}
                placeholder="correo@empresa.com"
                className={getFieldError('email') ? "border-destructive" : ""}
              />
              {getFieldError('email') && (
                <p className="text-sm text-destructive">{getFieldError('email')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={formData.phone}
                  placeholder="+52 XX XXXX XXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  name="contact"
                  defaultValue={formData.contact}
                  placeholder="Nombre del contacto"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                name="address"
                defaultValue={formData.address}
                placeholder="Dirección completa"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={formData.city}
                  placeholder="Ciudad"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={formData.state}
                  placeholder="Estado"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={formData.category}
                  placeholder="Materia Prima, etc."
                />
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lead_time">Tiempo de Entrega (días)</Label>
                <Input
                  id="leadTime"
                  name="lead_time"
                  type="number"
                  defaultValue={formData.lead_time}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rating">Calificación</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  defaultValue={formData.rating}
                  placeholder="0-5"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select defaultValue={formData.status} onValueChange={(v) => {
                // Actualizar el valor del input hidden
                const input = document.getElementById('status-input') as HTMLInputElement;
                if (input) input.value = v;
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" id="status-input" name="status" value={formData.status} />
            </div>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingItem ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
