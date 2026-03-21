"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type {
  LoanPayment,
  CreateLoanPaymentDto,
  UpdateLoanPaymentDto,
} from "@/lib/services/loan-payments.service";

const paymentSchema = z.object({
  loan_id: z.coerce.number().min(1, "Debe seleccionar un préstamo"),
  date: z.string().min(1, "La fecha es requerida"),
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  method: z.enum(["payroll", "cash", "transfer", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: LoanPayment | null;
  loans: any[];
  onSave: (data: CreateLoanPaymentDto | UpdateLoanPaymentDto) => Promise<void>;
  loading?: boolean;
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  editingItem,
  loans,
  onSave,
  loading = false,
}: PaymentFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      loan_id: 0,
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      method: "payroll",
      reference: "",
      notes: "",
    },
  });

  const formMethod = watch("method");

  useEffect(() => {
    if (editingItem) {
      reset({
        loan_id: editingItem.loan_id || 0,
        date: editingItem.date || "",
        amount: editingItem.amount || 0,
        method: editingItem.method || "payroll",
        reference: editingItem.reference || "",
        notes: editingItem.notes || "",
      });
    } else {
      reset({
        loan_id: 0,
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        method: "payroll",
        reference: "",
        notes: "",
      });
    }
  }, [editingItem, reset, open]);

  const onSubmit = async (data: PaymentFormData) => {
    await onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingItem ? "Editar Abono" : "Registrar Abono"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">Préstamo</Label>
              <Select
                value={watch("loan_id") ? String(watch("loan_id")) : ""}
                onValueChange={(v) => setValue("loan_id", Number(v))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar préstamo" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((loan: any) => (
                    <SelectItem key={loan.id} value={String(loan.id)}>
                      {loan.employee?.name} - ${loan.amount?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.loan_id && (
                <p className="text-sm text-red-500">{errors.loan_id.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Fecha</Label>
                <Input
                  type="date"
                  {...register("date")}
                  className="bg-secondary border-border"
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Monto ($)</Label>
                <Input
                  type="number"
                  {...register("amount")}
                  className="bg-secondary border-border"
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Método de Pago</Label>
                <Select
                  value={formMethod}
                  onValueChange={(v: "payroll" | "cash" | "transfer" | "other") =>
                    setValue("method", v)
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payroll">Nómina</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-sm text-red-500">{errors.method.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Referencia</Label>
                <Input
                  {...register("reference")}
                  className="bg-secondary border-border"
                  placeholder="Opcional"
                />
                {errors.reference && (
                  <p className="text-sm text-red-500">{errors.reference.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Notas (opcional)</Label>
              <Input
                {...register("notes")}
                className="bg-secondary border-border"
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
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
