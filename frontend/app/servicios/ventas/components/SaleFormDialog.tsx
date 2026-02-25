"use client";

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
import type { Sale } from "@/lib/types/service-order.types";
import { useState, useEffect } from "react";
import { clientsService } from "@/lib/services";
import type { Client } from "@/lib/types";

// Función helper para formatear fecha para input type="date"
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  // Si ya viene en formato YYYY-MM-DD, retornarlo
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  // Si viene con tiempo, extraer solo la fecha YYYY-MM-DD
  // Usamos UTC para evitar que se reste un día por timezone
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSale: Sale | null;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const paymentMethods = [
  { value: "Transferencia", label: "Transferencia" },
  { value: "Cheque", label: "Cheque" },
  { value: "Efectivo", label: "Efectivo" },
  { value: "Credito 15 dias", label: "Credito 15 dias" },
  { value: "Credito 30 dias", label: "Credito 30 dias" },
];

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "partial", label: "Parcial" },
  { value: "paid", label: "Pagada" },
  { value: "overdue", label: "Vencida" },
  { value: "cancelled", label: "Cancelada" },
];

export function SaleFormDialog({
  open,
  onOpenChange,
  editingSale,
  onSubmit,
  loading,
}: SaleFormDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Cargar clientes
  useEffect(() => {
    if (open) {
      clientsService.getAll({ perPage: 100 })
        .then((res) => setClients(res.data || []))
        .catch(console.error)
        .finally(() => setLoadingClients(false));
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string | number> = {};
    
    formData.forEach((value, key) => {
      if (key === "clientId" || key === "subtotal" || key === "tax" || key === "paid" || key === "taxRate" || key === "quoteId") {
        data[key] = Number(value);
      } else {
        data[key] = value as string;
      }
    });

    // Calcular tax basado en porcentaje y total = subtotal + tax
    const subtotal = Number(data.subtotal) || 0;
    const taxRate = Number(data.taxRate) || 0;
    const tax = subtotal * (taxRate / 100);
    data.tax = Math.round(tax * 100) / 100;
    data.total = subtotal + data.tax;

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSale ? "Editar Venta" : "Nueva Venta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invoice">Factura</Label>
              <Input
                id="invoice"
                name="invoice"
                placeholder="FAC-YYYY-XXX"
                defaultValue={editingSale?.invoice || ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                name="clientId"
                defaultValue={editingSale?.clientId?.toString() || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quoteRef">Ref. Cotización</Label>
                <Input
                  id="quoteRef"
                  name="quoteRef"
                  placeholder="COT-XXX"
                  defaultValue={editingSale?.quoteRef || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quoteId">ID Cotización</Label>
                <Input
                  id="quoteId"
                  name="quoteId"
                  type="number"
                  placeholder="0"
                  defaultValue={editingSale?.quoteId || ""}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                name="subtotal"
                type="number"
                placeholder="0"
                defaultValue={editingSale?.subtotal || ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                placeholder="16"
                defaultValue="16"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select
                name="paymentMethod"
                defaultValue={editingSale?.paymentMethod || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={formatDateForInput(editingSale?.dueDate)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                name="status"
                defaultValue={editingSale?.status || "pending"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paid">Monto Pagado</Label>
              <Input
                id="paid"
                name="paid"
                type="number"
                step="0.01"
                min="0"
                defaultValue={editingSale?.paid || "0"}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
