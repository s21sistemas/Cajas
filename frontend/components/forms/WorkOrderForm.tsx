'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { CreateWorkOrderDto } from '@/lib/types/work-order.types';
import type { Product } from '@/lib/types/product.types';
import type { Client } from '@/lib/types/client.types';

const workOrderSchema = z.object({
  product_id: z.number().min(1, 'El producto es requerido').nullable(),
  client_id: z.number().min(1, 'El cliente es requerido').nullable(),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  defaultValues?: Partial<CreateWorkOrderDto>;
  onSubmit: (data: CreateWorkOrderDto) => Promise<void>;
  isLoading?: boolean;
  products?: Product[];
  clients?: Client[];
}

export function WorkOrderForm({ 
  defaultValues, 
  onSubmit, 
  isLoading, 
  products = [],
  clients = []
}: WorkOrderFormProps) {
  const form = useForm<CreateWorkOrderDto>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      product_id: defaultValues?.product_id ?? null,
      client_id: defaultValues?.client_id ?? null,
      quantity: defaultValues?.quantity || 1,
      priority: defaultValues?.priority || 'medium',
      start_date: defaultValues?.start_date || '',
      due_date: defaultValues?.due_date || '',
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Producto *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))} 
                  value={field.value?.toString() || 'none'}
                >
                  <FormControl>
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Seleccionar producto</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.code})
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
            name="client_id"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Cliente *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))} 
                  value={field.value?.toString() || 'none'}
                >
                  <FormControl>
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">Seleccionar cliente</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Cantidad *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="100"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Fecha de Entrega *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="w-full" />
                </FormControl>
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
