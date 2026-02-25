'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { CreateProcessDto, Process } from '@/lib/types';

const processSchema = z.object({
  code: z.string().optional().default(''),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  processType: z.string().min(1, 'El tipo de proceso es requerido').max(255),
  description: z.string().optional().default(''),
  requiresMachine: z.boolean().default(false),
  estimatedTimeMin: z.number().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type ProcessFormValues = z.infer<typeof processSchema>;

interface ProcessFormProps {
  defaultValues?: Partial<Process>;
  onSubmit: (data: CreateProcessDto) => Promise<void>;
  isLoading?: boolean;
}

export function ProcessForm({ defaultValues, onSubmit, isLoading }: ProcessFormProps) {
  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      name: defaultValues?.name || '',
      processType: (defaultValues?.processType as string) || '',
      description: defaultValues?.description || '',
      requiresMachine: defaultValues?.requiresMachine ?? false,
      estimatedTimeMin: defaultValues?.estimatedTimeMin ?? null,
      status: (defaultValues?.status as ProcessFormValues['status']) || 'active',
    },
  });

  const handleSubmit = async (data: ProcessFormValues) => {
    const submitData: CreateProcessDto = {
      code: data.code || undefined,
      name: data.name,
      processType: data.processType,
      description: data.description || undefined,
      requiresMachine: data.requiresMachine,
      estimatedTimeMin: data.estimatedTimeMin || undefined,
      status: data.status,
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
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="PROC-00001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="processType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Proceso *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Corrugado">Corrugado</SelectItem>
                    <SelectItem value="Impresión">Impresión</SelectItem>
                    <SelectItem value="Troquelado">Troquelado</SelectItem>
                    <SelectItem value="Pegado">Pegado</SelectItem>
                    <SelectItem value="Ensamble">Ensamble</SelectItem>
                    <SelectItem value="Empaque">Empaque</SelectItem>
                    <SelectItem value="Inspección">Inspección</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Corrugado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del proceso..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedTimeMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiempo estimado (min)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="60"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
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
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requiresMachine"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Requiere Máquina
                </FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
