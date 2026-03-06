"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { clientsService } from "@/lib/services/clients.service";
import { inventoryService } from "@/lib/services/inventory.service";
import type { OrderPedido, CreateOrderPedidoDto, InventoryItem } from "@/lib/types";

interface OrdenPedidoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: OrderPedido;
  onSubmit: (data: CreateOrderPedidoDto) => void;
  isLoading: boolean;
}

interface OrderItem {
  product_id?: number;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit?: string;
}

export function OrdenPedidoFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
}: OrdenPedidoFormDialogProps) {
  const [clients, setClients] = useState<{id: number, name: string}[]>([]);
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load clients and products
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.all([
        clientsService.selectList(),
        Promise.resolve({ data: [] })
      ])
        .then(([clientsRes, productsRes]) => {
          setClients(clientsRes || []);
          setProducts(productsRes.data || []);
        })
        .catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [open]);

  const handleAddItem = () => {
    setItems([...items, { product_name: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If selecting a product, auto-fill name and code
    if (field === "product_id" && value) {
      const product = products.find(p => p.id === Number(value));
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].product_code = product.code;
        newItems[index].unit = product.unit;
      }
    }
    
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: CreateOrderPedidoDto = {
      client_id: selectedClientId ? Number(selectedClientId) : undefined,
      delivery_address: deliveryAddress || undefined,
      notes: notes || undefined,
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit: item.unit,
      })),
    };

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Editar Orden de Pedido" : "Nueva Orden de Pedido"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Select 
                value={selectedClientId} 
                onValueChange={setSelectedClientId}
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="delivery_address">Dirección de Entrega</Label>
              <Input
                id="delivery_address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Calle, número, colonia, ciudad"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales para la orden"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Productos</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddItem}
              >
                + Agregar Producto
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end p-2 border rounded-md">
                    <div className="flex-1">
                      <Select
                        value={item.product_id?.toString() || ""}
                        onValueChange={(val) => handleItemChange(index, "product_id", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} ({product.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        placeholder="Cantidad"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || items.length === 0}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
