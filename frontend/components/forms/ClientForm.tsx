"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { Client } from "@/lib/types";

const schema = z.object({
  code: z.string().min(1, "Código requerido"),
  name: z.string().min(1, "Nombre requerido"),
  rfc: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  contacto: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().min(1, "Dirección requerida"),
  city: z.string().min(1, "Ciudad requerida"),
  state: z.string().min(1, "Estado requerido"),
  creditLimit: z.number().min(0).default(0),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
});

type FormData = z.infer<typeof schema>;

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export function ClientForm({ client, onSubmit, loading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: client?.code || "",
      name: client?.name || "",
      rfc: client?.rfc || "",
      email: client?.email || "",
      phone: client?.phone || "",
      contacto: client?.contacto || "",
      whatsapp: client?.whatsapp || "",
      address: client?.address || "",
      city: client?.city || "",
      state: client?.state || "",
      creditLimit: client?.creditLimit || 0,
      status: client?.status || "active",
    },
  });

  // Reset form values when client changes (for editing)
  useEffect(() => {
    reset({
      code: client?.code || "",
      name: client?.name || "",
      rfc: client?.rfc || "",
      email: client?.email || "",
      phone: client?.phone || "",
      contacto: client?.contacto || "",
      whatsapp: client?.whatsapp || "",
      address: client?.address || "",
      city: client?.city || "",
      state: client?.state || "",
      creditLimit: client?.creditLimit || 0,
      status: client?.status || "active",
    });
  }, [client, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Código *</label>
          <Input {...register("code")} placeholder="CLI-XXX" />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">RFC</label>
          <Input {...register("rfc")} placeholder="XAXX010101000" />
          {errors.rfc && <p className="text-xs text-destructive">{errors.rfc.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Razón Social *</label>
        <Input {...register("name")} placeholder="Nombre de la empresa" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input {...register("email")} type="email" placeholder="correo@empresa.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Teléfono</label>
        <Input {...register("phone")} placeholder="+52 XX XXXX XXXX" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Contacto</label>
        <Input {...register("contacto")} placeholder="Nombre del contacto" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">WhatsApp</label>
        <Input {...register("whatsapp")} placeholder="+52 XX XXXX XXXX" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dirección *</label>
        <Input {...register("address")} placeholder="Calle y número" />
        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ciudad *</label>
          <Input {...register("city")} placeholder="Ciudad" />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado *</label>
          <Input {...register("state")} placeholder="Estado" />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Límite de Crédito</label>
        <Input
          {...register("creditLimit", { valueAsNumber: true })}
          type="number"
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <select
          {...register("status")}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : client ? "Guardar Cambios" : "Crear Cliente"}
        </Button>
      </DialogFooter>
    </form>
  );
}
