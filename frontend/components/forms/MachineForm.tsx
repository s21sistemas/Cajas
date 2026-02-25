'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Machine, CreateMachineDto, MachineStatus } from '@/lib/types';

const machineSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(255),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  type: z.string().min(1, 'El tipo es requerido').max(255),
  axes: z.number().int().min(1, 'Mínimo 1 eje').max(255).default(1),
  brand: z.string().optional().default(''),
  model: z.string().optional().default(''),
  location: z.string().optional().default(''),
  status: z.enum(['available', 'running', 'maintenance', 'offline']).default('available'),
  notes: z.string().optional().default(''),
});

type MachineFormValues = z.infer<typeof machineSchema>;

interface MachineFormProps {
  defaultValues?: Partial<Machine>;
  onSubmit: (data: CreateMachineDto) => Promise<void>;
  isLoading?: boolean;
}

export function MachineForm({ defaultValues, onSubmit, isLoading }: MachineFormProps) {
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      name: defaultValues?.name || '',
      type: defaultValues?.type || '',
      axes: defaultValues?.axes || 1,
      brand: defaultValues?.brand || '',
      model: defaultValues?.model || '',
      location: defaultValues?.location || '',
      status: (defaultValues?.status as MachineFormValues['status']) || 'available',
      notes: defaultValues?.notes || '',
    },
  });

  const handleSubmit = async (data: MachineFormValues) => {
    const submitData: CreateMachineDto = {
      code: data.code,
      name: data.name,
      type: data.type,
      axes: data.axes,
      brand: data.brand || undefined,
      model: data.model || undefined,
      location: data.location || undefined,
      status: data.status || 'available',
      notes: data.notes || undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input placeholder="MAQ-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Torno CNC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <FormControl>
                  <Input placeholder="CNC, Manual, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="axes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ejes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="3"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Haas, Mazak, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="VF-2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Nave A, Área 1" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="running">En Operación</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="offline">Apagada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
