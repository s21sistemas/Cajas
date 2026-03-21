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
import type { Overtime } from "@/lib/types/hr.types";
import { useState } from "react";

const schema = z.object({
  employeeId: z.number().min(1, "Empleado requerido"),
  date: z.string().min(1, "Fecha requerida"),
  hours: z.number().min(1, "Horas requeridas"),
  type: z.enum(["simple", "double", "triple"]),
  rate: z.number().min(0, "Tarifa requerida"),
  status: z.enum(["pending", "approved", "paid"]),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.hours && data.rate) {
    return data.hours > 0 && data.rate >= 0;
  }
  return true;
}, {
  message: "Las horas deben ser mayores a 0",
  path: ["hours"],
});

type FormData = z.infer<typeof schema>;

interface OvertimeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOvertime: Overtime | null;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

interface Employee {
  value?: number,
  label?: string,
}

export function OvertimeFormDialog({ open, onOpenChange, editingOvertime, onSubmit, loading = false }: OvertimeFormDialogProps) {
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
      employeeId: editingOvertime?.employeeId || 0,
      date: editingOvertime?.date || "",
      hours: editingOvertime?.hours || 0,
      type: (editingOvertime?.type as any) || "simple",
      rate: editingOvertime?.rate || 0,
      status: (editingOvertime?.status as any) || "pending",
      reason: editingOvertime?.reason || "",
    },
  });

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await employeesService.getSelectList();
        setEmployees(response || []);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    };
    loadEmployees();
  }, []);

  // Reset form values when editingOvertime or open changes
  useEffect(() => {
    if (open) {
      reset({
        employeeId: editingOvertime?.employeeId || 0,
        date: editingOvertime?.date || "",
        hours: editingOvertime?.hours || 0,
        type: (editingOvertime?.type as any) || "simple",
        rate: editingOvertime?.rate || 0,
        status: (editingOvertime?.status as any) || "pending",
        reason: editingOvertime?.reason || "",
      });
    }
  }, [open, editingOvertime, reset]);

  const employeeIdValue = watch("employeeId");
  const hoursValue = watch("hours");
  const typeValue = watch("type");

  // Calculate amount automatically
  const calculateAmount = () => {
    const hours = hoursValue || 0;
    const rate = watch("rate") || 0;
    const multiplier = typeValue === "simple" ? 1 : typeValue === "double" ? 2 : 3;
    return hours * rate * multiplier;
  };

  const onFormSubmit = (data: FormData) => {
    const amount = calculateAmount();
    const dataToSend = {
      employee_id: data.employeeId,
      date: data.date,
      hours: data.hours,
      type: data.type,
      rate: data.rate,
      status: data.status,
      reason: data.reason || undefined,
      amount,
    };
    onSubmit(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingOvertime ? "Editar Tiempo Extra" : "Registrar Tiempo Extra"}
          </DialogTitle>
          <DialogDescription>
            {editingOvertime ? "Modifica los datos del tiempo extra" : "Completa los datos del tiempo extra"}
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
                  <SelectItem key={emp.value} value={emp.value?.toString() || ""}>
                    {emp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Horas *</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                {...register("hours", { valueAsNumber: true })}
              />
              {errors.hours && <p className="text-xs text-destructive">{errors.hours.message}</p>}
            </div>
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
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="double">Doble</SelectItem>
                  <SelectItem value="triple">Triple</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Tarifa/Hora *</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.01"
                {...register("rate", { valueAsNumber: true })}
              />
              {errors.rate && <p className="text-xs text-destructive">{errors.rate.message}</p>}
            </div>
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
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Input
              id="reason"
              {...register("reason")}
              placeholder="Motivo del tiempo extra..."
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Monto Calculado:</p>
            <p className="text-xl font-bold text-green-400">
              ${calculateAmount().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingOvertime ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
