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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { employeesService } from "@/lib/services";
import type { Absence } from "@/lib/types/hr.types";
import type { Employee } from "@/lib/types";
import { useState } from "react";

const schema = z.object({
  employeeId: z.number().min(1, "Empleado requerido"),
  date: z.string().min(1, "Fecha requerida"),
  type: z.enum(["justified", "unjustified", "late"]),
  reason: z.string().optional(),
  status: z.enum(["registered", "justified", "discounted"]),
  deduction: z.number().min(0).default(0),
});

type FormData = z.infer<typeof schema>;

interface AbsenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAbsence: Absence | null;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function AbsenceFormDialog({ open, onOpenChange, editingAbsence, onSubmit, loading = false }: AbsenceFormDialogProps) {
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
      employeeId: editingAbsence?.employeeId || 0,
      date: editingAbsence?.date || "",
      type: (editingAbsence?.type as any) || "unjustified",
      reason: editingAbsence?.reason || "",
      status: (editingAbsence?.status as any) || "registered",
      deduction: editingAbsence?.deduction || 0,
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

  // Reset form values when editingAbsence or open changes
  useEffect(() => {
    if (open) {
      reset({
        employeeId: editingAbsence?.employeeId || 0,
        date: editingAbsence?.date || "",
        type: (editingAbsence?.type as any) || "unjustified",
        reason: editingAbsence?.reason || "",
        status: (editingAbsence?.status as any) || "registered",
        deduction: editingAbsence?.deduction || 0,
      });
    }
  }, [open, editingAbsence, reset]);

  const employeeIdValue = watch("employeeId");

  const onFormSubmit = (data: FormData) => {
    const dataToSend = {
      employee_id: data.employeeId,
      date: data.date,
      type: data.type,
      reason: data.reason || undefined,
      status: data.status,
      deduction: data.deduction,
    };
    onSubmit(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingAbsence ? "Editar Falta" : "Registrar Falta"}
          </DialogTitle>
          <DialogDescription>
            {editingAbsence ? "Modifica los datos de la falta" : "Completa los datos de la falta"}
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
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
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
                  <SelectItem value="justified">Justificada</SelectItem>
                  <SelectItem value="unjustified">Injustificada</SelectItem>
                  <SelectItem value="late">Retardo</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              placeholder="Describe el motivo de la falta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="registered">Registrado</SelectItem>
                  <SelectItem value="justified">Justificada</SelectItem>
                  <SelectItem value="discounted">Descontado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deduction">Descuento</Label>
              <Input
                id="deduction"
                type="number"
                min="0"
                step="0.01"
                {...register("deduction", { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingAbsence ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
