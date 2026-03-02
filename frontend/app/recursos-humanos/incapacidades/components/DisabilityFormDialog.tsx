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
import type { Disability } from "@/lib/types/hr.types";
import { useState } from "react";

interface SelectListItem {
  value: number;
  label: string;
}

// Función para convertir fecha ISO a formato YYYY-MM-DD para inputs date
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  // Si ya viene en formato YYYY-MM-DD, retornarlo
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
  // Si viene con timestamp, convertir a YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const schema = z.object({
  folio: z.string().min(1, "Folio requerido"),
  type: z.string().min(1, "Tipo requerido"),
  employeeId: z.number().min(1, "Empleado requerido"),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha fin requerida"),
  days: z.number().min(1, "Días requeridos"),
  status: z.enum(["active", "completed", "pending"]),
  description: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "La fecha fin debe ser mayor o igual a la fecha de inicio",
  path: ["endDate"],
});

type FormData = z.infer<typeof schema>;

interface DisabilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDisability: Disability | null;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function DisabilityFormDialog({ open, onOpenChange, editingDisability, onSubmit, loading = false }: DisabilityFormDialogProps) {
  const [employees, setEmployees] = useState<SelectListItem[]>([]);
  
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
      folio: editingDisability?.folio || "",
      type: (editingDisability?.type as any) || "illness",
      employeeId: editingDisability?.employeeId || 0,
      startDate: formatDateForInput(editingDisability?.startDate),
      endDate: formatDateForInput(editingDisability?.endDate),
      days: editingDisability?.days || 0,
      status: (editingDisability?.status as any) || "pending",
      description: editingDisability?.description || "",
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

  // Reset form values when editingDisability or open changes
  useEffect(() => {
    if (open) {
      reset({
        folio: editingDisability?.folio || "",
        type: (editingDisability?.type as any) || "illness",
        employeeId: editingDisability?.employeeId || 0,
        startDate: formatDateForInput(editingDisability?.startDate),
        endDate: formatDateForInput(editingDisability?.endDate),
        days: editingDisability?.days || 0,
        status: (editingDisability?.status as any) || "pending",
        description: editingDisability?.description || "",
      });
    }
  }, [open, editingDisability, reset]);

  const employeeIdValue = watch("employeeId");

  const onFormSubmit = (data: FormData) => {
    // Prepare data for backend (snake_case)
    const dataToSend = {
      employee_id: data.employeeId,
      type: data.type,
      start_date: data.startDate,
      end_date: data.endDate,
      days: data.days,
      folio: data.folio,
      status: data.status,
      description: data.description || undefined,
    };
    onSubmit(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingDisability ? "Editar Incapacidad" : "Nueva Incapacidad"}
          </DialogTitle>
          <DialogDescription>
            {editingDisability ? "Modifica los datos de la incapacidad" : "Completa los datos de la incapacidad"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="folio">Folio *</Label>
          <Input
            id="folio"
            {...register("folio")}
            placeholder="INC-XXX"
          />
          {errors.folio && <p className="text-xs text-destructive">{errors.folio.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Input
            id="type"
            {...register("type")}
            placeholder="Tipo de incapacidad (ej: enfermedad, accidente, imss, maternidad)"
          />
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee">Empleado *</Label>
        <Select
          value={employeeIdValue > 0 ? String(employeeIdValue) : ''}
          onValueChange={(v) => setValue("employeeId", parseInt(v), { shouldValidate: true })}
        >
          <SelectTrigger id="employee">
            <SelectValue placeholder="Seleccionar empleado">
              {employees.find(e => e.value === employeeIdValue)?.label || 'Seleccionar empleado'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.value} value={String(emp.value)}>
                {emp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
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
          <Label htmlFor="endDate">Fecha Fin *</Label>
          <Input
            id="endDate"
            type="date"
            {...register("endDate")}
          />
          {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="days">Días *</Label>
          <Input
            id="days"
            type="number"
            min="1"
            {...register("days", { valueAsNumber: true })}
          />
          {errors.days && <p className="text-xs text-destructive">{errors.days.message}</p>}
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
            <SelectItem value="active">Activa</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descripción de la incapacidad..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : editingDisability ? "Actualizar" : "Registrar"}
        </Button>
      </DialogFooter>
    </form>
    </DialogContent>
    </Dialog>
  );
}
