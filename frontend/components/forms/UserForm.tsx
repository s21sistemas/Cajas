'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role, CreateUserDto } from '@/lib/types/user.types';

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.number().min(1, 'Debe seleccionar un rol'),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  defaultValues?: Partial<CreateUserDto>;
  roles: Role[];
  onSubmit: (data: CreateUserDto) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function UserForm({ defaultValues, roles, onSubmit, isLoading, isEdit }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      password: isEdit ? '' : defaultValues?.password || '',
      roleId: defaultValues?.roleId || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo *</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
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
              <FormLabel>Correo electrónico *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña {isEdit ? '(dejar en blanco para mantener)' : '*'}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol *</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value ? field.value.toString() : ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
