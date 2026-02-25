"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Branch, Client } from "@/lib/types";

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBranch: Branch | null;
  clients: Client[];
  onSubmit: (data: any) => void;
  loading: boolean;
}

interface BranchFormData {
  name: string;
  clientId: number;
  address: string;
  city: string;
  state: string;
  phone: string;
  contact: string;
  status: Branch["status"];
}

export function BranchFormDialog({
  open,
  onOpenChange,
  editingBranch,
  clients,
  onSubmit,
  loading,
}: BranchFormDialogProps) {
  const defaultFormData: BranchFormData = {
    name: "",
    clientId: 0,
    address: "",
    city: "",
    state: "",
    phone: "",
    contact: "",
    status: "active",
  };

  const getInitialData = (): BranchFormData => {
    if (editingBranch) {
      return {
        name: editingBranch.name,
        clientId: editingBranch.clientId,
        address: editingBranch.address,
        city: editingBranch.city,
        state: editingBranch.state,
        phone: editingBranch.phone || "",
        contact: editingBranch.contact || "",
        status: editingBranch.status,
      };
    }
    return defaultFormData;
  };

  // Usar un estado simple para el formulario
  const formData = getInitialData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      clientId: Number(form.get("clientId")),
      address: form.get("address") as string,
      city: form.get("city") as string,
      state: form.get("state") as string,
      phone: form.get("phone") as string,
      contact: form.get("contact") as string,
      status: form.get("status") as Branch["status"],
      code: editingBranch?.code || `SUC-${Date.now()}`,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={formData.name}
                placeholder="Nombre de la sucursal"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select 
                name="clientId" 
                defaultValue={formData.clientId ? String(formData.clientId) : undefined} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={formData.state}
                  placeholder="Estado"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={formData.phone}
                  placeholder="Teléfono"
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
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue={formData.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingBranch ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
