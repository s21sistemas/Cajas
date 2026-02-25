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
import type { CreateOperatorDto, Operator } from '@/lib/types';

const operatorSchema = z.object({
  employeeCode: z.string().min(1, 'El código de empleado es requerido').max(255),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  shift: z.string().optional().default(''),
  specialty: z.string().optional().default(''),
  active: z.boolean().default(true),
  phone: z.string().optional().default(''),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  hireDate: z.string().optional().default(''),
});

type OperatorFormValues = z.infer<typeof operatorSchema>;

interface OperatorFormProps {
  defaultValues?: Partial<Operator>;
  onSubmit: (data: CreateOperatorDto) => Promise<void>;
  isLoading?: boolean;
}

export function OperatorForm({ defaultValues, onSubmit, isLoading }: OperatorFormProps) {
  const form = useForm<OperatorFormValues>({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      employeeCode: defaultValues?.employeeCode || '',
      name: defaultValues?.name || '',
      shift: defaultValues?.shift || '',
      specialty: defaultValues?.specialty || '',
      active: defaultValues?.active ?? true,
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      hireDate: defaultValues?.hireDate || '',
    },
  });

  const handleSubmit = async (data: OperatorFormValues) => {
    const submitData: CreateOperatorDto = {
      employeeCode: data.employeeCode,
      name: data.name,
      shift: data.shift || undefined,
      specialty: data.specialty || undefined,
      active: data.active,
      phone: data.phone || undefined,
      email: data.email || undefined,
      hireDate: data.hireDate || undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Empleado *</FormLabel>
                <FormControl>
                  <Input placeholder="OPE-001" {...field} />
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
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="matutino">Matutino</SelectItem>
                    <SelectItem value="vespertino">Vespertino</SelectItem>
                    <SelectItem value="nocturno">Nocturno</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidad</FormLabel>
                <FormControl>
                  <Input placeholder="Operador de corrugadora" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="operador@empresa.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hireDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Contratación</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
