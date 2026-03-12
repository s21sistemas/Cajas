"use client";

import { useState, useEffect } from "react";
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
import { financeService } from "@/lib/services/finance.service";
import type { Movement, BankAccount } from "@/lib/types/finance.types";

interface MovementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMovement: Movement | null;
  onSave: () => void;
}

export function MovementFormDialog({
  open,
  onOpenChange,
  editingMovement,
  onSave,
}: MovementFormDialogProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income" as "income" | "expense" | "transfer",
    category: "",
    description: "",
    reference: "",
    amount: 0,
    bank_account_id: "",
    balance: 0,
    status: "completed" as "completed" | "pending" | "cancelled",
  });

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await financeService.getBankAccounts();
        setAccounts(response.data || []);
      } catch (error) {
        console.error("Error loading accounts:", error);
      }
    };
    loadAccounts();
  }, []);

  // Set form data when editing
  useEffect(() => {
    if (editingMovement) {
      setFormData({
        date: editingMovement.date || new Date().toISOString().split("T")[0],
        type: editingMovement.type || "income",
        category: editingMovement.category || "",
        description: editingMovement.description || "",
        reference: editingMovement.reference || "",
        amount: editingMovement.amount || 0,
        bank_account_id: editingMovement.bankAccountId?.toString() || "",
        balance: editingMovement.balance || 0,
        status: editingMovement.status || "completed",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "income",
        category: "",
        description: "",
        reference: "",
        amount: 0,
        bank_account_id: "",
        balance: 0,
        status: "completed",
      });
    }
  }, [editingMovement, open]);

  const handleBankChange = (bankId: string) => {
    const selectedAccount = accounts.find((a: BankAccount) => a.id.toString() === bankId);
    setFormData({
      ...formData,
      bank_account_id: bankId,
      balance: selectedAccount?.balance || 0,
    });
  };

  const handleSave = async () => {
    if (!formData.bank_account_id) {
      alert("Por favor selecciona una cuenta bancaria");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        date: formData.date,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        reference: formData.reference,
        amount: Number(formData.amount),
        bank_account_id: Number(formData.bank_account_id),
        balance: Number(formData.balance),
        status: formData.status,
      };

      if (editingMovement) {
        await financeService.updateMovement(editingMovement.id, dataToSend);
      } else {
        await financeService.createMovement(dataToSend);
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving movement:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingMovement ? "Editar Movimiento" : "Nuevo Movimiento"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Cuenta Bancaria</Label>
              <Select
                value={formData.bank_account_id?.toString()}
                onValueChange={handleBankChange}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account: BankAccount) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.bank} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Fecha</Label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(v: "income" | "expense" | "transfer") => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Categoría</Label>
              <Input
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-secondary border-border"
                placeholder="Ej: Ventas, Nómina"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Referencia</Label>
              <Input
                value={formData.reference || ""}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="bg-secondary border-border"
                placeholder="Ej: FAC-2024-001"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Descripción</Label>
            <Input
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary border-border"
              placeholder="Descripción del movimiento"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Monto</Label>
              <Input
                type="number"
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(v: "completed" | "pending" | "cancelled") => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
