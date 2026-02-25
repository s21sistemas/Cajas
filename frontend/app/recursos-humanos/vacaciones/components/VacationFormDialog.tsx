"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { VacationRequest, CreateVacationRequestDto, Employee } from "@/lib/types/hr.types";

const vacationSchema = z.object({
  employeeId: z.coerce.number().min(1, "Debe seleccionar un empleado"),
  employeeName: z.string().min(1, "El nombre del empleado es requerido"),
  department: z.string().min(1, "El departamento es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  days: z.coerce.number().min(1, "Debe solicitar al menos 1 día"),
  daysAvailable: z.coerce.number().min(0, "Los días disponibles no pueden ser negativos"),
  type: z.enum(["vacation", "personal", "medical"]),
  status: z.enum(["pending", "approved", "rejected", "taken"]),
  reason: z.string().optional(),
  approvedBy: z.string().optional(),
});

type VacationFormData = z.infer<typeof vacationSchema>;

interface VacationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: VacationRequest | null;
  employees: Employee[];
  onSave: (data: CreateVacationRequestDto) => Promise<void>;
  loading?: boolean;
}

export function VacationFormDialog({
  open,
  onOpenChange,
  editingItem,
  employees,
  onSave,
  loading = false,
}: VacationFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VacationFormData>({
    resolver: zodResolver(vacationSchema),
    defaultValues: {
      employeeId: 0,
      employeeName: "",
      department: "",
      startDate: "",
      endDate: "",
      days: 0,
      daysAvailable: 10,
      type: "vacation",
      status: "pending",
      reason: "",
      approvedBy: "",
    },
  });

  const formType = watch("type");
  const formStatus = watch("status");
  const formEmployeeId = watch("employeeId");

  useEffect(() => {
    if (editingItem) {
      reset({
        employeeId: editingItem.employeeId || 0,
        employeeName: editingItem.employeeName || "",
        department: editingItem.department || "",
        startDate: editingItem.startDate || "",
        endDate: editingItem.endDate || "",
        days: editingItem.days || 0,
        daysAvailable: editingItem.daysAvailable || 10,
        type: editingItem.type || "vacation",
        status: editingItem.status || "pending",
        reason: editingItem.reason || "",
        approvedBy: editingItem.approvedBy || "",
      });
    } else {
      reset({
        employeeId: 0,
        employeeName: "",
        department: "",
        startDate: "",
        endDate: "",
        days: 0,
        daysAvailable: 10,
        type: "vacation",
        status: "pending",
        reason: "",
        approvedBy: "",
      });
    }
  }, [editingItem, reset, open]);

  const handleEmployeeChange = (value: string) => {
    const empId = Number(value);
    const employee = employees.find(e => e.id === empId);
    setValue("employeeId", empId);
    if (employee) {
      setValue("employeeName", employee.name);
      setValue("department", employee.department || "");
    }
  };

  const onSubmit = async (data: VacationFormData) => {
    const { employeeId: _employeeId, employeeName: _employeeName, department: _department, ...rest } = data;
    await onSave({
      employeeId: data.employeeId,
      ...rest,
    } as CreateVacationRequestDto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingItem ? "Editar Solicitud" : "Nueva Solicitud de Vacaciones"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">Empleado</Label>
              <Select
                value={formEmployeeId ? String(formEmployeeId) : ""}
                onValueChange={handleEmployeeChange}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Departamento</Label>
              <Input
                {...register("department")}
                className="bg-secondary border-border"
                disabled
              />
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Inicio</Label>
                <Input
                  type="date"
                  {...register("startDate")}
                  className="bg-secondary border-border"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Fin</Label>
                <Input
                  type="date"
                  {...register("endDate")}
                  className="bg-secondary border-border"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Días Solicitados</Label>
                <Input
                  type="number"
                  {...register("days")}
                  className="bg-secondary border-border"
                />
                {errors.days && (
                  <p className="text-sm text-red-500">{errors.days.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Días Disponibles</Label>
                <Input
                  type="number"
                  {...register("daysAvailable")}
                  className="bg-secondary border-border"
                />
                {errors.daysAvailable && (
                  <p className="text-sm text-red-500">{errors.daysAvailable.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Tipo</Label>
                <Select
                  value={formType}
                  onValueChange={(v: "vacation" | "personal" | "medical") =>
                    setValue("type", v)
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="medical">Médica</SelectItem>
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
                  onValueChange={(v: "pending" | "approved" | "rejected" | "taken") =>
                    setValue("status", v)
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                    <SelectItem value="taken">Tomada</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Motivo</Label>
              <Textarea
                {...register("reason")}
                className="bg-secondary border-border"
                rows={3}
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason.message}</p>
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
