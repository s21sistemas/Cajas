"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { CreateWorkOrderDto } from "@/lib/types/work-order.types";
import type { WorkOrder } from "@/lib/types";
import { salesService } from "@/lib/services/sales.service";
import { workOrdersService } from "@/lib/services/work-orders.service";

// Tipo para las ventas
interface Sale {
  id: number;
  code: string;
  clientId: number;
  clientName: string;
  total: number;
  status: string;
  due_date: string;
  invoice?: string;
}

// Tipo para los productos disponibles de una venta
interface SaleProduct {
  id: number;
  saleItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface WorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder | null;
  onSubmit: (data: CreateWorkOrderDto) => void;
  products: { id: number; name: string }[];
  isLoading: boolean;
}

const defaultFormData: CreateWorkOrderDto = {
  product_id: null,
  client_id: null,
  sale_id: null,
  quantity: 1,
  priority: "medium",
  start_date: new Date().toISOString().split('T')[0],
  due_date: "",
  notes: "",
};

export function WorkOrderDialog({
  open,
  onOpenChange,
  workOrder,
  onSubmit,
  products,
  isLoading,
}: WorkOrderDialogProps) {
  const [formData, setFormData] = useState<CreateWorkOrderDto>(defaultFormData);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cargar todas las ventas al abrir el diálogo (para nueva orden)
  useEffect(() => {
    async function fetchAllSales() {
      if (open && !workOrder) {
        setLoadingSales(true);
        try {
          const response = await salesService.getSelectList();
          // Verificar que response sea un array
          if (Array.isArray(response)) {
            setSales(response);
          } else {
            setSales([]);
          }
        } catch (error) {
          console.error('Error fetching sales:', error);
          setSales([]);
        } finally {
          setLoadingSales(false);
        }
      }
    }
    fetchAllSales();
  }, [open, workOrder]);

  // Cargar productos de la venta cuando cambia la venta
  useEffect(() => {
    async function fetchSaleProducts() {
      if (formData.sale_id) {
        setLoadingProducts(true);
        try {
          const response = await workOrdersService.getAvailableProducts(formData.sale_id);
          // Verificar que response sea un objeto con data como array
          if (response && Array.isArray(response.data)) {
            setSaleProducts(response.data);
          } else if (Array.isArray(response)) {
            // Si la respuesta es directamente un array
            setSaleProducts(response);
          } else {
            setSaleProducts([]);
          }
        } catch (error) {
          console.error('Error fetching sale products:', error);
          setSaleProducts([]);
        } finally {
          setLoadingProducts(false);
        }
      } else {
        setSaleProducts([]);
        setFormData(prev => ({ ...prev, product_id: null, quantity: 1 }));
      }
    }
    fetchSaleProducts();
  }, [formData.sale_id]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (workOrder) {
        setFormData({
          product_id: workOrder.productId ?? null,
          client_id: workOrder.clientId ?? null,
          sale_id: (workOrder as any).saleId ?? null,
          quantity: workOrder.quantity || 0,
          priority: workOrder.priority || 'medium',
          start_date: workOrder.startDate || '',
          due_date: workOrder.dueDate || '',
          notes: workOrder.notes || '',
        });
      } else {
        setFormData(defaultFormData);
        setSaleProducts([]);
      }
    }
  }, [open, workOrder]);

  // Cuando se selecciona una venta, autocompletar el cliente
  const handleSaleChange = (saleId: string) => {
    const sale = sales.find(s => s.id === parseInt(saleId));
    setFormData({ 
      ...formData, 
      sale_id: saleId ? parseInt(saleId) : null,
      client_id: sale?.clientId ?? null,
      product_id: null,
      quantity: 1
    });
    setSaleProducts([]);
  };

  // Cuando se selecciona un producto, autocompletar la cantidad
  const handleProductChange = (productId: string) => {
    const product = saleProducts.find(p => p.productId === parseInt(productId));
    setFormData({ 
      ...formData, 
      product_id: productId ? parseInt(productId) : null,
      quantity: Number(product?.quantity) || 1
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {workOrder ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Venta</Label>
              <Select
                value={formData.sale_id?.toString() || ""}
                onValueChange={handleSaleChange}
                disabled={loadingSales}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue className="truncate"
                  placeholder={loadingSales ? "Cargando..." : "Seleccionar venta"} />
                </SelectTrigger>
                <SelectContent className="max-w-md">
                  {sales.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      <span>
                        {s.code} - {s.clientName} - ${s.total.toLocaleString()}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Producto</Label>
              <Select
                value={formData.product_id?.toString() || ""}
                onValueChange={handleProductChange}
                disabled={!formData.sale_id || loadingProducts}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={loadingProducts ? "Cargando..." : formData.sale_id ? (saleProducts.length === 0 ? "No hay productos disponibles" : "Seleccionar producto") : "Seleccione una venta primero"} />
                </SelectTrigger>
                <SelectContent>
                  {saleProducts.map((p) => (
                    <SelectItem key={p.productId} value={p.productId.toString()}>
                      {p.productName} - Cant: {p.quantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.sale_id && saleProducts.length === 0 && !loadingProducts && (
                <p className="text-xs text-muted-foreground mt-1">Todos los productos ya tienen orden de trabajo</p>
              )}
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select
                value={formData.priority || "medium"}
                onValueChange={(v) => setFormData({ ...formData, priority: v as any })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de Inicio</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label>Fecha de Entrega</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notas</Label>
              <Input
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Agregar notas..."
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {workOrder ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
