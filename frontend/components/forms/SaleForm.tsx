'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApiQuery } from '@/hooks/use-api-query';
import { clientsService } from '@/lib/services/clients.service';

const saleSchema = z.object({
  invoice: z.string().min(1, 'La factura es requerida').max(255),
  client_id: z.number().min(1, 'El cliente es requerido'),
  quote_ref: z.string().optional().default(''),
  subtotal: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  paid: z.number().min(0).default(0),
  payment_method: z.string().min(1, 'El método de pago es requerido').max(255),
  due_date: z.string().min(1, 'La fecha de vencimiento es requerida'),
  status: z.enum(['pending', 'partial', 'paid', 'overdue', 'cancelled']).default('pending'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface SaleFormProps {
  defaultValues?: Partial<SaleFormValues>;
  onSubmit: (data: SaleFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function SaleForm({ defaultValues, onSubmit, isLoading }: SaleFormProps) {
  const { data: clientsData } = useApiQuery(
    () => clientsService.getAll({ perPage: 1000 }),
    { enabled: true }
  );
  // El interceptor transforma a camelCase, clientsData ya tiene la estructura { data: [], total, ... }
  const clients = Array.isArray(clientsData?.data) ? clientsData.data : [];

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      invoice: defaultValues?.invoice || '',
      client_id: defaultValues?.client_id || 0,
      quote_ref: defaultValues?.quote_ref || '',
      subtotal: defaultValues?.subtotal || 0,
      tax: defaultValues?.tax || 0,
      total: defaultValues?.total || 0,
      paid: defaultValues?.paid || 0,
      payment_method: defaultValues?.payment_method || '',
      due_date: defaultValues?.due_date || '',
      status: defaultValues?.status || 'pending',
    },
  });

  const handleSubmit = async (data: SaleFormValues) => {
    await onSubmit(data as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Factura *</FormLabel>
                <FormControl>
                  <Input placeholder="FAC-00001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  defaultValue={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client: any) => (
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

        <FormField
          control={form.control}
          name="quote_ref"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia de Cotización</FormLabel>
              <FormControl>
                <Input placeholder="COT-00001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="subtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtotal</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impuesto</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pago *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Vencimiento *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pagada</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
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
