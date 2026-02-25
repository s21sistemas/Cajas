'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

const purchaseOrderSchema = z.object({
  supplier_id: z.number().min(1, 'El proveedor es requerido'),
  material_id: z.number().min(1, 'El material es requerido'),
  material_name: z.string().optional(),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unit_price: z.number().min(0, 'El precio debe ser mayor o igual a 0').default(0),
  subtotal: z.number().min(0).default(0),
  iva_percentage: z.number().min(0).max(100).default(16),
  iva: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  payment_type: z.enum(['cash', 'credit']).default('cash'),
  credit_days: z.number().min(0).default(0),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  expected_date: z.string().optional().default(''),
  due_date: z.string().optional().default(''),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  order?: any;
  onSubmit: (data: PurchaseOrderFormValues) => Promise<void>;
  isLoading?: boolean;
  suppliers?: any[];
  materials?: any[];
  suppliersLoading?: boolean;
  materialsLoading?: boolean;
}

export function PurchaseOrderForm({ order, onSubmit, isLoading, suppliers: initialSuppliers, materials: initialMaterials, suppliersLoading: initialSuppliersLoading, materialsLoading: initialMaterialsLoading }: PurchaseOrderFormProps) {
  const suppliers = initialSuppliers || [];
  const materials = initialMaterials || [];
  const isSuppliersLoading = initialSuppliersLoading ?? false;
  const isMaterialsLoading = initialMaterialsLoading ?? false;

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: order?.supplier_id ?? 0,
      material_id: order?.material_id ?? 0,
      material_name: order?.material_name ?? '',
      quantity: order?.quantity ?? 1,
      unit_price: order?.unit_price ?? 0,
      subtotal: order?.subtotal ?? 0,
      iva_percentage: order?.iva_percentage ?? 16,
      iva: order?.iva ?? 0,
      total: order?.total ?? 0,
      payment_type: order?.payment_type ?? 'cash',
      credit_days: order?.credit_days ?? 0,
      status: order?.status ?? 'draft',
      priority: order?.priority ?? 'medium',
      expected_date: order?.expected_date?.split('T')[0] ?? '',
      due_date: order?.due_date?.split('T')[0] ?? '',
    },
  });

  // Apply order data when order changes
  useEffect(() => {
    if (order) {
      // Format dates properly - extract YYYY-MM-DD from ISO string
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
      };
      
      form.reset({
        supplier_id: Number(order.supplier_id) || 0,
        material_id: Number(order.material_id) || 0,
        material_name: order.material_name || '',
        quantity: Number(order.quantity) || 1,
        unit_price: parseFloat(order.unit_price) || 0,
        subtotal: parseFloat(order.subtotal) || 0,
        iva_percentage: order.iva_percentage || 16,
        iva: parseFloat(order.iva) || 0,
        total: parseFloat(order.total) || 0,
        payment_type: order.payment_type || 'cash',
        credit_days: Number(order.credit_days) || 0,
        status: order.status || 'draft',
        priority: order.priority || 'medium',
        expected_date: formatDate(order.expected_date),
        due_date: formatDate(order.due_date),
      });
    }
  }, [order, form]);

  const quantity = form.watch('quantity') || 0;
  const unitPrice = form.watch('unit_price') || 0;
  const ivaPercentage = form.watch('iva_percentage') || 0;
  const paymentType = form.watch('payment_type') || 'cash';

  const calculateTotals = () => {
    const qty = form.getValues('quantity') || 0;
    const price = form.getValues('unit_price') || 0;
    const taxRate = (form.getValues('iva_percentage') || 0) / 100;
    const subtotal = qty * price;
    const iva = subtotal * taxRate;
    const total = subtotal + iva;
    
    form.setValue('subtotal', subtotal);
    form.setValue('iva', iva);
    form.setValue('total', total);
  };

  const handleQuantityChange = (value: number) => {
    form.setValue('quantity', value);
    calculateTotals();
  };

  const handleUnitPriceChange = (value: number) => {
    form.setValue('unit_price', value);
    calculateTotals();
  };

  const handleSubmit = async (data: PurchaseOrderFormValues) => {
    await onSubmit({
      ...data,
      expected_date: data.expected_date || undefined,
      due_date: data.due_date || undefined,
      credit_days: data.payment_type === 'credit' ? data.credit_days : 0,
    } as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Proveedor y Producto */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor *</FormLabel>
                {isSuppliersLoading ? (
                  <Skeleton className="h-10" />
                ) : (
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="material_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material *</FormLabel>
                {isMaterialsLoading ? (
                  <Skeleton className="h-10" />
                ) : (
                  <Select 
                    onValueChange={(value) => {
                      const materialId = Number(value);
                      field.onChange(materialId);
                      const material = materials.find((m: any) => m.id === materialId);
                      if (material) {
                        form.setValue('material_name', material.name);
                        if (material.cost) {
                          form.setValue('unit_price', material.cost);
                          calculateTotals();
                        }
                      }
                    }} 
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materials.map((material: any) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Cantidad y Precio Unitario */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={field.value}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Unitario</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Porcentaje de IVA y Totales */}
        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="iva_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% IVA</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder=""
                    {...field}
                  
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    value={field.value ? Number(field.value).toFixed(2) : '0.00'}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IVA</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={field.value ? Number(field.value).toFixed(2) : '0.00'}
                    disabled
                    className="bg-muted"
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
                    value={field.value ? Number(field.value).toFixed(2) : '0.00'}
                    disabled
                    className="bg-muted font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tipo de Pago y Días de Crédito */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de pago" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Contado</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {paymentType === 'credit' && (
            <FormField
              control={form.control}
              name="credit_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Crédito</FormLabel>
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
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expected_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Esperada</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value || ''} 
                    onChange={(e) => field.onChange(e.target.value)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value || ''} 
                    onChange={(e) => field.onChange(e.target.value)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Prioridad y Estado */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="ordered">Ordenada</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="received">Recibida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
