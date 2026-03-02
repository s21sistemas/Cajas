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
import { useEffect, useState } from 'react';
import { processesService, machinesService, operatorsService } from '@/lib/services';
import type { CreateProductionDTO } from '@/lib/types/production.types';
import type { Process } from '@/lib/types/process.types';
import type { Machine } from '@/lib/types/machine.types';
import type { Operator } from '@/lib/types/operator.types';

const productionSchema = z.object({
  processId: z.number().min(1, 'El proceso es requerido'),
  machineId: z.number().optional().nullable(),
  operatorId: z.number().min(1, 'El operador es requerido'),
  targetParts: z.number().int().min(0).default(0),
  startTime: z.string().min(1, 'La fecha de inicio es requerida'),
  notes: z.string().optional().default(''),
});

type ProductionFormValues = z.infer<typeof productionSchema>;

interface ProductionFormProps {
  defaultValues?: Partial<CreateProductionDTO & { id?: number }>;
  onSubmit: (data: CreateProductionDTO) => Promise<void>;
  isLoading?: boolean;
  machineId?: number | null;
}

export function ProductionForm({ defaultValues, onSubmit, isLoading, machineId }: ProductionFormProps) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      processId: defaultValues?.processId || 0,
      machineId: defaultValues?.machineId ?? machineId ?? null,
      operatorId: defaultValues?.operatorId || 0,
      targetParts: defaultValues?.targetParts || 0,
      startTime: defaultValues?.startTime || new Date().toISOString().slice(0, 16),
      notes: defaultValues?.notes || '',
    },
  });

  // Cargar datos usando servicios existentes
  useEffect(() => {
    async function fetchData() {
      try {
        const [processesData, machinesData, operatorsData] = await Promise.all([
          processesService.getAll(),
          machinesService.getAll({ status: 'available' }),
          operatorsService.getAll(),
        ]);
        
        setProcesses(processesData?.data || []);
        setMachines(machinesData?.data || []);
        setOperators(operatorsData?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (data: ProductionFormValues) => {
    const submitData: CreateProductionDTO = {
      processId: data.processId,
      machineId: data.machineId || null,
      operatorId: data.operatorId,
      targetParts: data.targetParts,
      startTime: data.startTime,
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
            name="processId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proceso *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  defaultValue={field.value ? String(field.value) : ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proceso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {processes.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
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
            name="operatorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operador *</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  defaultValue={field.value ? String(field.value) : ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar operador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {operators.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.name}
                      </SelectItem>
                    ))}
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
            name="machineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máquina</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)} 
                  defaultValue={field.value ? String(field.value) : ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar máquina" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Ninguna</SelectItem>
                    {machines.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
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
            name="targetParts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta de piezas</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha/Hora de inicio *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
