'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateDeliveryDto, DeliveryStatus } from '@/lib/types/delivery.types';
import type { Vehicle } from '@/lib/types/vehicle.types';

const deliverySchema = z.object({
  vehicleId: z.number().optional(),
  driver: z.string().min(1, 'El conductor es requerido').max(255),
  originAddress: z.string().min(1, 'La dirección de origen es requerida').max(255),
  status: z.enum(['pending', 'assigned', 'in_transit', 'completed', 'cancelled']).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;

interface DeliveryFormProps {
  defaultValues?: Partial<CreateDeliveryDto>;
  vehicles: Vehicle[];
  onSubmit: (data: CreateDeliveryDto) => Promise<void>;
  isLoading?: boolean;
}

export function DeliveryForm({ defaultValues, vehicles, onSubmit, isLoading }: DeliveryFormProps) {
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      vehicleId: defaultValues?.vehicleId || undefined,
      driver: defaultValues?.driver || '',
      originAddress: defaultValues?.originAddress || '',
      status: defaultValues?.status || 'pending',
      startedAt: defaultValues?.startedAt || '',
      completedAt: defaultValues?.completedAt || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="driver"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conductor *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del conductor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="originAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección de Origen *</FormLabel>
              <FormControl>
                <Input placeholder="Dirección de origen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehículo</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                defaultValue={field.value ? field.value.toString() : ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Sin vehículo</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value || 'pending'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="assigned">Asignado</SelectItem>
                  <SelectItem value="in_transit">En tránsito</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="completedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de завершения</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
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
