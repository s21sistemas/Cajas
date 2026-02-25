'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { CreatePartDto, Part } from '@/lib/types';

const partSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(255),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  description: z.string().optional().default(''),
  material: z.string().optional().default(''),
  drawing_url: z.string().optional().default(''),
  status: z.enum(['design', 'ready_for_production', 'in_production', 'completed']).default('design'),
});

type PartFormValues = z.infer<typeof partSchema>;

interface PartFormProps {
  defaultValues?: Partial<Part>;
  onSubmit: (data: CreatePartDto) => Promise<void>;
  isLoading?: boolean;
}

export function PartForm({ defaultValues, onSubmit, isLoading }: PartFormProps) {
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      material: defaultValues?.material || '',
      drawing_url: defaultValues?.drawing_url || '',
      status: defaultValues?.status || 'design',
    },
  });

  const handleSubmit = async (data: PartFormValues) => {
    const submitData: CreatePartDto = {
      code: data.code,
      name: data.name,
      description: data.description || undefined,
      material: data.material || undefined,
      drawing_url: data.drawing_url || undefined,
      status: data.status,
    };
    await onSubmit(submitData);
  };

  const statusLabels: Record<string, string> = {
    design: 'Diseño',
    ready_for_production: 'Listo para Producción',
    in_production: 'En Producción',
    completed: 'Completado',
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
                  <Input placeholder="PARTE-00001" {...field} />
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
                  <Input placeholder="Tapa frontal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <FormControl>
                <Input placeholder="Cartón corrugado" {...field} />
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
                <Textarea placeholder="Descripción de la parte..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="drawing_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Dibujo</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
                  <SelectItem value="design">Diseño</SelectItem>
                  <SelectItem value="ready_for_production">Listo para Producción</SelectItem>
                  <SelectItem value="in_production">En Producción</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
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
