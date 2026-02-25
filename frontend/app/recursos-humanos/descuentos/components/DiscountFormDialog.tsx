"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { employeesService } from "@/lib/services";
import type { Discount } from "@/lib/types/hr.types";
import type { Employee } from "@/lib/types";
import { useState } from "react";

const schema = z.object({
  employeeId: z.number().min(1, "Empleado requerido"),
  type: z.enum(["loan", "infonavit", "fonacot", "alimony", "other"]),
  description: z.string().min(1, "Descripción requerida"),
  amount: z.number().min(0, "Monto requerido"),
  period: z.string().min(1, "Periodo requerido"),
  status: z.enum(["active", "completed", "paused"]),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface DiscountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDiscount: Discount | null;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function DiscountFormDialog({ open, onOpenChange, editingDiscount, onSubmit, loading = false }: DiscountFormDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: editingDiscount?.employeeId || 0,
      type: (editingDiscount?.type as any) || "loan",
      description: editingDiscount?.description || "",
      amount: editingDiscount?.amount || 0,
      period: editingDiscount?.period || "quincenal",
      status: (editingDiscount?.status as any) || "active",
      startDate: editingDiscount?.startDate || "",
      endDate: editingDiscount?.endDate || "",
    },
  });

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await employeesService.getAll({ per_page: 100 });
        setEmployees(response?.data || []);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    };
    loadEmployees();
  }, []);

  // Reset form values when editingDiscount or open changes
  useEffect(() => {
    if (open) {
      reset({
        employeeId: editingDiscount?.employeeId || 0,
        type: (editingDiscount?.type as any) || "loan",
        description: editingDiscount?.description || "",
        amount: editingDiscount?.amount || 0,
        period: editingDiscount?.period || "quincenal",
        status: (editingDiscount?.status as any) || "active",
        startDate: editingDiscount?.startDate || "",
        endDate: editingDiscount?.endDate || "",
      });
    }
  }, [open, editingDiscount, reset]);

  const employeeIdValue = watch("employeeId");

  const onFormSubmit = (data: FormData) => {
    const dataToSend = {
      employee_id: data.employeeId,
      type: data.type,
      description: data.description,
      amount: data.amount,
      period: data.period,
      status: data.status,
      start_date: data.startDate,
      end_date: data.endDate || undefined,
    };
    onSubmit(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingDiscount ? "Editar Descuento" : "Nuevo Descuento"}
          </DialogTitle>
          <DialogDescription>
            {editingDiscount ? "Modifica los datos del descuento" : "Completa los datos del descuento"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado *</Label>
            <Select
              value={employeeIdValue > 0 ? employeeIdValue.toString() : ""}
              onValueChange={(v) => setValue("employeeId", parseInt(v), { shouldValidate: true })}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id?.toString() || ""}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={watch("type")}
                onValueChange={(v: any) => setValue("type", v)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan">Préstamo</SelectItem>
                  <SelectItem value="infonavit">INFONAVIT</SelectItem>
                  <SelectItem value="fonacot">FONACOT</SelectItem>
                  <SelectItem value="alimony">Pensión Alimenticia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Periodo *</Label>
              <Select
                value={watch("period")}
                onValueChange={(v) => setValue("period", v)}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quincenal">Quincenal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
              {errors.period && <p className="text-xs text-destructive">{errors.period.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Descripción del descuento"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={watch("status")}
                onValueChange={(v: any) => setValue("status", v)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingDiscount ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
