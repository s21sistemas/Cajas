"use client";

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
import type { Supplier, CreateSupplierDto } from "@/lib/types";

interface ProveedoresFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Supplier | null;
  onSubmit: (data: CreateSupplierDto) => void;
  loading: boolean;
}

export function ProveedoresFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSubmit,
  loading,
}: ProveedoresFormDialogProps) {
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
        lead_time: editingItem.lead_time,
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  name="rfc"
                  defaultValue={formData.rfc}
                  placeholder="XAXX010101000"
                />
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={formData.email}
                placeholder="correo@empresa.com"
              />
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
              <select
                  id="status"
                  name="status"
                  defaultValue={formData.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="pending">Pendiente</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
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
