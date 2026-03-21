"use client";

import { useState, useEffect, useRef } from "react";
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
import { productsService } from "@/lib/services";

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
  error?: any;
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
  error,
}: WorkOrderDialogProps) {
  const [formData, setFormData] = useState<CreateWorkOrderDto>(defaultFormData);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  // Usar ref para evitar dependencias de array en useEffect
  const allProductsRef = useRef<SaleProduct[]>([]);
  const allProducts = allProductsRef.current;
  const setAllProducts = (products: SaleProduct[]) => {
    allProductsRef.current = products;
  };

  // Resetear el formulario cuando se abre el diálogo para nueva orden
  const prevOpenRef = useRef(open);
  const prevWorkOrderRef = useRef(workOrder);
  
  useEffect(() => {
    // Detectar cambio de cerrado a abierto
    const wasClosed = !prevOpenRef.current;
    const isNowOpen = open;
    const isNewOrder = !workOrder;
    const wasEditing = prevWorkOrderRef.current !== null;
    
    if (wasClosed && isNowOpen && isNewOrder) {
      // Nueva orden - resetear todo
      setFormData({
        product_id: null,
        client_id: null,
        sale_id: null,
        quantity: 1,
        priority: "medium",
        start_date: new Date().toISOString().split('T')[0],
        due_date: "",
        notes: "",
      });
      setProductsLoaded(false); // Permitir recargar productos
      setSaleProducts(allProducts);
    } else if (isNowOpen && workOrder) {
      // Edición - cargar datos existentes
      setFormData({
        product_id: workOrder.productId,
        client_id: workOrder.clientId,
        sale_id: workOrder.saleId,
        quantity: workOrder.quantity,
        priority: workOrder.priority || "medium",
        start_date: workOrder.startDate || new Date().toISOString().split('T')[0],
        due_date: workOrder.dueDate || "",
        notes: workOrder.notes || "",
      });
    }
    
    // Actualizar refs
    prevOpenRef.current = open;
    prevWorkOrderRef.current = workOrder;
  }, [open, workOrder]);

  console.log(error);

  // Obtener errores del prop o del formato de error de Laravel
  const fieldErrors = error?.response?.data?.errors || error?.errors || {};

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

  // Cargar productos al abrir el diálogo - solo una petición inicial
  useEffect(() => {
    async function fetchProducts() {
      if (!open || productsLoaded) return;
      
      setLoadingProducts(true);
      setProductsLoaded(true);
      try {
        // Cargar todos los productos activos al abrir
        const response = await productsService.selectList();
        if (response && Array.isArray(response)) {
          // Transformar al formato esperado - solo productos con ID válido
          const products = response
            .filter((p: any) => p.id && p.id > 0)
            .map((p: any) => ({
              id: p.id,
              saleItemId: 0,
              productId: p.id,
              productName: p.name || 'Producto sin nombre',
              quantity: 1,
              unitPrice: p.price || 0,
              subtotal: p.price || 0,
            }));
          setAllProducts(products);
          // Inicialmente mostrar todos los productos
          setSaleProducts(products);
        } else {
          setAllProducts([]);
          setSaleProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
        setSaleProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    
    fetchProducts();
  }, [open, productsLoaded]);

  // Cargar los productos de la venta seleccionada
  useEffect(() => {
    async function fetchSaleProducts() {
      // Usar el ref directamente para evitar dependencia de array
      const products = allProductsRef.current;
      
      // No ejecutar si no hay productos cargados o si es la carga inicial
      if (products.length === 0 || !open) {
        return;
      }

      if (!formData.sale_id) {
        // Si no hay venta seleccionada, mostrar todos los productos
        setSaleProducts(products);
        return;
      }

      setLoadingProducts(true);
      try {
        // Cargar los items de la venta
        // const response = await salesService.getItems(formData.sale_id);
        const response = await workOrdersService.getAvailableProducts(formData.sale_id);
        console.log('Sale items response:', response);
        
        // El API devuelve { success: true, data: [...] }
        const items = response?.data || response;
        
        if (Array.isArray(items) && items.length > 0) {
          // Transformar los items de la venta al formato esperado - solo con ID válido
          const validItems = items
            .filter((item: any) => {
              const productId = item.productId ?? item.product_id;
              return productId && productId > 0;
            })
            .map((item: any) => {
              // Buscar el ID del producto - puede estar en diferentes lugares
              const productId = item.productId ?? item.product_id;
              return {
                id: productId,
                saleItemId: item.id,
                productId: productId,
                productName: item.productName || item.description || item.product_name || 'Producto sin nombre',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || item.unit_price || 0,
                subtotal: item.subtotal || (item.quantity * (item.unit_price || item.price || 0)),
              };
            });
          
          setSaleProducts(validItems);
        } else {
          // Si no hay items, mostrar todos los productos
          console.log('No items found in sale, showing all products');
          setSaleProducts(products);
        }
      } catch (error) {
        console.error('Error fetching sale products:', error);
        setSaleProducts(products);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchSaleProducts();
  }, [formData.sale_id, open]);

  // Cuando se selecciona una venta, autocompletar el cliente
  const handleSaleChange = (saleId: string) => {
    const sale = sales.find(s => s.id === parseInt(saleId));
    setFormData({ 
      ...formData, 
      sale_id: saleId === "none" ? null : parseInt(saleId),
      client_id: sale?.clientId ?? null,
      product_id: null,
      quantity: 1
    });
    // Los productos se cargan automáticamente por el useEffect
  };

  // Cuando se selecciona un producto, autocompletar la cantidad
  const handleProductChange = (productId: string) => {
    const parsedId = parseInt(productId);
    const product = saleProducts.find(p => p.productId === parsedId);
    
    // Solo actualizar si es un ID válido (mayor a 0)
    if (productId && parsedId > 0) {
      setFormData({ 
        ...formData, 
        product_id: parsedId,
        quantity: Number(product?.quantity) || 1
      });
    } else {
      // Limpiar el campo si no hay selección válida
      setFormData({ 
        ...formData, 
        product_id: null,
        quantity: 1
      });
    }
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
            <div className="w-full min-w-0">
              <Label>Venta</Label>
              <Select
                value={formData.sale_id?.toString() || ""}
                onValueChange={handleSaleChange}
                disabled={loadingSales}
              >
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue className="truncate"
                  placeholder={loadingSales ? "Cargando..." : "Seleccionar venta"} />
                </SelectTrigger>
                <SelectContent className="max-w-md">
                  <SelectItem value="none">
                    Ninguna venta
                  </SelectItem>
                  {sales.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      <span className="block truncate">
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
                disabled={loadingProducts}
              >
                <SelectTrigger className={`w-full bg-secondary border-border ${fieldErrors.product_id ? 'border-red-500' : ''}`}>
                  <SelectValue className="truncate"
                  placeholder={loadingProducts ? "Cargando..." : (saleProducts.length === 0 ? "No hay productos disponibles" : "Seleccionar producto")} />
                </SelectTrigger>
                <SelectContent>
                  {saleProducts.map((p) => (
                    <SelectItem key={p.productId} value={p.productId.toString()}>
                      <span className="block truncate">
                        {p.productName} - Cant: {p.quantity}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.product_id && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.product_id[0]}</p>
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
