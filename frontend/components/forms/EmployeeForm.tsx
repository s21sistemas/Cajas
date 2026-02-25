'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const employeeSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(255),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  position: z.string().min(1, 'El puesto es requerido').max(255),
  department: z.string().min(1, 'El departamento es requerido').max(255),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().optional().default(''),
  salary: z.number().min(0, 'El salario debe ser mayor a 0'),
  hire_date: z.string().min(1, 'La fecha de contratación es requerida'),
  status: z.enum(['active', 'inactive', 'vacation']).default('active'),
  avatar: z.string().optional().default(''),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function EmployeeForm({ defaultValues, onSubmit, isLoading }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      name: defaultValues?.name || '',
      position: defaultValues?.position || '',
      department: defaultValues?.department || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      salary: defaultValues?.salary || 0,
      hire_date: defaultValues?.hire_date || '',
      status: defaultValues?.status || 'active',
      avatar: defaultValues?.avatar || '',
    },
  });

  const handleSubmit = async (data: EmployeeFormValues) => {
    await onSubmit(data as any);
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
                  <Input placeholder="EMP-00001" {...field} />
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puesto *</FormLabel>
                <FormControl>
                  <Input placeholder="Operador de máquina" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento *</FormLabel>
                <FormControl>
                  <Input placeholder="Producción" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="juan@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salario *</FormLabel>
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
            name="hire_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Contratación *</FormLabel>
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
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="vacation">Vacaciones</SelectItem>
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
