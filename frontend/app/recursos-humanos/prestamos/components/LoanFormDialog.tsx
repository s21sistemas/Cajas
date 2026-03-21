"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { Loan, CreateLoanDto, UpdateLoanDto } from "@/lib/services/loans.service";
import { loanTypesService } from "@/lib/services";
import type { LoanType } from "@/lib/services/loan-types.service";

const loanSchema = z.object({
  employee_id: z.coerce.number().min(1, "Debe seleccionar un empleado"),
  type: z.string().min(1, "Tipo de préstamo requerido"),
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  installments: z.coerce.number().min(1, "Debe tener al menos 1 cuota"),
  start_date: z.string().min(1, "La fecha de inicio es requerida"),
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Loan | null;
  employees: any[];
  onSave: (data: CreateLoanDto | UpdateLoanDto) => Promise<void>;
  loading?: boolean;
}

export function LoanFormDialog({
  open,
  onOpenChange,
  editingItem,
  employees,
  onSave,
  loading = false,
}: LoanFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      employee_id: 0,
      type: "",
      amount: 0,
      installments: 1,
      start_date: new Date().toISOString().split("T")[0],
      status: "pending",
      reason: "",
      notes: "",
    },
  });

  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);

  const formType = watch("type");
  const formStatus = watch("status");
  const formAmount = watch("amount");
  const formInstallments = watch("installments");

  const calculatedInstallment = useMemo(() => {
    if (formAmount > 0 && formInstallments > 0) {
      return formAmount / formInstallments;
    }
    return 0;
  }, [formAmount, formInstallments]);

  useEffect(() => {
    if (editingItem) {
      reset({
        employee_id: editingItem.employee_id || 0,
        type: editingItem.type || "personal",
        amount: editingItem.amount || 0,
        installments: editingItem.installments || 1,
        start_date: editingItem.start_date || "",
        status: editingItem.status || "pending",
        reason: editingItem.reason || "",
        notes: editingItem.notes || "",
      });
    } else {
      reset({
        employee_id: 0,
        type: "",
        amount: 0,
        installments: 1,
        start_date: new Date().toISOString().split("T")[0],
        status: "pending",
        reason: "",
        notes: "",
      });
    }
  }, [editingItem, reset, open]);

  // Load loan types
  useEffect(() => {
    const loadLoanTypes = async () => {
      try {
        const response = await loanTypesService.getAll();
        setLoanTypes(response || []);
      } catch (error) {
        console.error("Error loading loan types:", error);
      }
    };
    loadLoanTypes();
  }, []);

  const onSubmit = async (data: LoanFormData) => {
    await onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingItem ? "Editar Préstamo" : "Nuevo Préstamo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">Empleado</Label>
              <Select
                value={watch("employee_id") ? String(watch("employee_id")) : ""}
                onValueChange={(v) => setValue("employee_id", Number(v))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.value} value={String(emp.value)}>
                      {emp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && (
                <p className="text-sm text-red-500">{errors.employee_id.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Tipo</Label>
                <Select
                  value={formType}
                  onValueChange={(v: string) =>
                    setValue("type", v)
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanTypes.map((type) => (
                      <SelectItem key={type.id} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: "pending" | "active" | "completed" | "cancelled") =>
                    setValue("status", v)
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Liquidado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label className="text-foreground">Cuotas</Label>
                <Input
                  type="number"
                  {...register("installments")}
                  className="bg-secondary border-border"
                />
                {errors.installments && (
                  <p className="text-sm text-red-500">{errors.installments.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Fecha Inicio</Label>
              <Input
                type="date"
                {...register("start_date")}
                className="bg-secondary border-border"
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>
            {calculatedInstallment > 0 && (
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Cuota calculada:</p>
                <p className="text-lg font-bold text-primary">
                  ${calculatedInstallment.toLocaleString()}
                </p>
              </div>
            )}
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
