'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateVehicleDto, VehicleType, VehicleStatus, YesNo } from '@/lib/types/vehicle.types';

const vehicleSchema = z.object({
  typeVehicle: z.enum(['car', 'motorcycle'], { required_error: 'Seleccione un tipo de vehículo' }),
  brand: z.string().min(1, 'La marca es requerida').max(50),
  model: z.string().min(1, 'El modelo es requerido').max(15),
  color: z.string().min(1, 'El color es requerido').max(15),
  licensePlate: z.string().min(1, 'La placa es requerida').max(20),
  status: z.enum(['Available', 'Assigned', 'Under repair', 'Out of service', 'Accident', 'Stolen', 'Sold']).optional(),
  vehiclePhotos: z.string().optional(),
  labeled: z.enum(['YES', 'NO'], { required_error: 'Seleccione una opción' }),
  gps: z.enum(['YES', 'NO'], { required_error: 'Seleccione una opción' }),
  taxesPaid: z.enum(['YES', 'NO'], { required_error: 'Seleccione una opción' }),
  insuranceCompany: z.string().min(1, 'La aseguradora es requerida').max(50),
  insuranceCompanyPhone: z.string().min(1, 'El teléfono es requerido').max(15),
  insuranceFile: z.string().optional(),
  policyNumber: z.string().min(1, 'El número de póliza es requerido'),
  expirationDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  defaultValues?: Partial<CreateVehicleDto>;
  onSubmit: (data: CreateVehicleDto) => Promise<void>;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
}

export function VehicleForm({ defaultValues, onSubmit, isLoading, errors }: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      typeVehicle: defaultValues?.typeVehicle || 'car',
      brand: defaultValues?.brand || '',
      model: defaultValues?.model || '',
      color: defaultValues?.color || '',
      licensePlate: defaultValues?.licensePlate || '',
      status: defaultValues?.status || 'Available',
      vehiclePhotos: defaultValues?.vehiclePhotos || '',
      labeled: defaultValues?.labeled || 'NO',
      gps: defaultValues?.gps || 'NO',
      taxesPaid: defaultValues?.taxesPaid || 'NO',
      insuranceCompany: defaultValues?.insuranceCompany || '',
      insuranceCompanyPhone: defaultValues?.insuranceCompanyPhone || '',
      insuranceFile: defaultValues?.insuranceFile || '',
      policyNumber: defaultValues?.policyNumber || '',
      expirationDate: defaultValues?.expirationDate || '',
    },
  });

  // Set backend errors on fields
  useEffect(() => {
    if (errors) {
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof VehicleFormValues, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }
  }, [errors, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="typeVehicle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de vehículo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="car">Automóvil</SelectItem>
                    <SelectItem value="motorcycle">Motocicleta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca *</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo *</FormLabel>
                <FormControl>
                  <Input placeholder="2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color *</FormLabel>
                <FormControl>
                  <Input placeholder="Rojo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa *</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'Available'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Available">Disponible</SelectItem>
                    <SelectItem value="Assigned">Asignado</SelectItem>
                    <SelectItem value="Under repair">En reparación</SelectItem>
                    <SelectItem value="Out of service">Fuera de servicio</SelectItem>
                    <SelectItem value="Accident">Accidentado</SelectItem>
                    <SelectItem value="Stolen">Robado</SelectItem>
                    <SelectItem value="Sold">Vendido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="labeled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etiquetado *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Sí</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehiclePhotos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fotos del vehículo</FormLabel>
                <FormControl>
                  <Input placeholder="URL de fotos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPS *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Sí</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxesPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impuestos pagados *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Sí</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="insuranceCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aseguradora *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de aseguradora" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insuranceCompanyPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono aseguradora *</FormLabel>
                <FormControl>
                  <Input placeholder="+52 81 1234 5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="insuranceFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Archivo de seguro</FormLabel>
                <FormControl>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => field.onChange(e.target.files?.[0]?.name || '')} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de póliza *</FormLabel>
                <FormControl>
                  <Input placeholder="POL-123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de vencimiento *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
