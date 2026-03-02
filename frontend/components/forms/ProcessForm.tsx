'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { Process, CreateProcessDto } from '@/lib/types';
import { processTypesService, type ProcessType } from '@/lib/services';

const processSchema = z.object({
  code: z.string().optional().default(''),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  processTypeId: z.number().min(1, 'El tipo de proceso es requerido'),
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
  errors?: Record<string, string[]>;
}

export function ProcessForm({ defaultValues, onSubmit, isLoading, errors }: ProcessFormProps) {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  
  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      name: defaultValues?.name || '',
      processTypeId: (defaultValues as any)?.processTypeId || 0,
      description: defaultValues?.description || '',
      requiresMachine: defaultValues?.requiresMachine ?? false,
      estimatedTimeMin: defaultValues?.estimatedTimeMin ?? null,
      status: (defaultValues?.status as ProcessFormValues['status']) || 'active',
    },
  });

  // Set backend errors on fields
  useEffect(() => {
    if (errors) {
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof ProcessFormValues, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }
  }, [errors, form]);

  useEffect(() => {
    const fetchProcessTypes = async () => {
      try {
        const data = await processTypesService.getAll();
        setProcessTypes(data);
      } catch (error) {
        console.error('Error fetching process types:', error);
      }
    };
    fetchProcessTypes();
  }, []);

  const handleSubmit = async (data: ProcessFormValues) => {
    const submitData: CreateProcessDto = {
      code: data.code || undefined,
      name: data.name,
      processTypeId: data.processTypeId,
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
                  <Input placeholder="PROC-00001" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="processTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Proceso *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {processTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
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
                <Input placeholder="Corrugado" {...field} value={field.value ?? ''} />
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
                <Textarea placeholder="Descripción del proceso..." {...field} value={field.value ?? ''} />
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
