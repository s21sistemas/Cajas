"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
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
import { salesService } from "@/lib/services/sales.service";
import { Upload, X } from "lucide-react";
import type { OrderPedido, CreateOrderPedidoDto } from "@/lib/types";

interface Branch {
  id: number;
  name: string;
  address: string;
  city?: string;
}

interface Sale {
  id: number;
  code: string;
  clientId: number;
  clientName: string;
  total: number;
}

interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

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

// Zod validation schema
const orderPedidoSchema = z.object({
  client_id: z.number().min(1, "El cliente es requerido"),
  branch_id: z.number().min(1, "La sucursal es requerida"),
  delivery_address: z.string().min(1, "La dirección de entrega es requerida"),
  items: z.array(z.object({
    product_name: z.string().min(1, "El nombre del producto es requerido"),
    quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  })).min(1, "Agregue al menos un producto"),
});

type OrderPedidoFormData = z.infer<typeof orderPedidoSchema>;

export function OrdenPedidoFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
}: OrdenPedidoFormDialogProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<{id: number, name: string}[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSaleItems, setLoadingSaleItems] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!defaultValues;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Reset all fields
      setSelectedSaleId("");
      setSelectedClientId("");
      setSelectedBranchId("");
      setDeliveryAddress("");
      setPickupDate("");
      setDeliveryDate("");
      setSupplierName("");
      setNotes("");
      setItems([]);
      setEvidenceFile(null);
      setErrors({});

      setLoadingData(true);
      Promise.all([
        salesService.getSelectListForOrderPedido(),
        clientsService.selectList()
      ])
        .then(([salesData, clientsData]) => {
          setSales(salesData || []);
          setClients(clientsData || []);
        })
        .catch(console.error)
        .finally(() => {
          setLoadingData(false);
          // Load default values after data is loaded
          if (defaultValues) {
            setSelectedSaleId(defaultValues.saleId?.toString() || "");
            setSelectedClientId(defaultValues.clientId?.toString() || "");
            setSelectedBranchId(defaultValues.branchId?.toString() || "");
            setDeliveryAddress(defaultValues.deliveryAddress || "");
            setNotes(defaultValues.notes || "");
            setItems(defaultValues.items?.map(item => ({
              product_id: item.productId || undefined,
              product_name: item.productName,
              product_code: item.productCode || undefined,
              quantity: item.quantity,
              unit: item.unit || undefined,
            })) || []);
          }
        });
    }
  }, [open]);


  // Handle sale selection - auto-fill client only (products load after branch is selected)
  useEffect(() => {
    if (selectedSaleId) {
      const sale = sales.find(s => s.id === Number(selectedSaleId));
      if (sale) {
        // Auto-fill client
        setSelectedClientId(sale.clientId.toString());
      }
    }
  }, [selectedSaleId, sales]);

  // Load products from sale after branch is selected (or client if no branch needed)
  useEffect(() => {
    if (selectedSaleId && selectedClientId && !isEditing) {
      // Wait for branches to be loaded by checking if we have a branch or if we're just loading products
      // Products load after client is set and branches are loaded
      const loadSaleItems = async () => {
        setLoadingSaleItems(true);
        try {
          const response = await salesService.getItems(Number(selectedSaleId));
          const saleItems = response?.data || [];
          if (saleItems.length > 0) {
            // Auto-fill items from sale
            setItems(saleItems.map((item: any) => ({
              product_id: item.product?.id || item.product_id || undefined,
              product_name: item.product?.name || item.description || item.product_name || '',
              product_code: item.product?.code || item.product_code || '',
              quantity: item.quantity || 1,
              unit: item.unit || 'pza',
            })));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingSaleItems(false);
        }
      };

      // Load products after a short delay to ensure branch is loaded, or immediately if branch is already selected
      if (selectedBranchId) {
        loadSaleItems();
      } else if (!loadingBranches && branches.length > 0) {
        // If branches are already loaded but no branch selected, wait a tick
        setTimeout(loadSaleItems, 100);
      }
    } else if (!selectedSaleId && !isEditing) {
      // If no sale selected, clear items only if not editing
      setItems([]);
    }
  }, [selectedSaleId, selectedClientId, selectedBranchId, branches, loadingBranches, isEditing]);

  // Load branches when client is selected (either from sale or manual)
  useEffect(() => {
    if (selectedClientId) {
      setLoadingBranches(true);
      setBranches([]);
      if (!isEditing) {
        setSelectedBranchId("");
        setDeliveryAddress("");
      }

      clientsService.getBranchSelectList(Number(selectedClientId))
        .then((data) => {
          setBranches(data || []);
        })
        .catch(console.error)
        .finally(() => setLoadingBranches(false));
    } else {
      setBranches([]);
      if (!isEditing) {
        setSelectedBranchId("");
        setDeliveryAddress("");
      }
    }
  }, [selectedClientId, isEditing]);

  // Auto-fill address when branch is selected
  useEffect(() => {
    if (selectedBranchId) {
      const branch = branches.find(b => b.id === Number(selectedBranchId));
      if (branch) {
        const address = branch.address || "";
        setDeliveryAddress(address);
      }
    }
  }, [selectedBranchId, branches]);

  const handleAddItem = () => {
    setItems([...items, { product_name: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      client_id: selectedClientId ? Number(selectedClientId) : 0,
      branch_id: selectedBranchId ? Number(selectedBranchId) : 0,
      delivery_address: deliveryAddress,
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
      })),
    };

    const result = orderPedidoSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    const data: CreateOrderPedidoDto = {
      client_id: selectedClientId ? Number(selectedClientId) : undefined,
      delivery_address: deliveryAddress || undefined,
      notes: notes || undefined,
      items: items.map(item => ({
        product_id: item.product_id ? Number(item.product_id) : undefined,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: parseInt(item.quantity.toString(), 10),
        unit: item.unit,
      })),
    } as CreateOrderPedidoDto;

    // Add additional fields that might not be in the type definition
    (data as any).sale_id = selectedSaleId ? Number(selectedSaleId) : undefined;
    (data as any).branch_id = selectedBranchId ? Number(selectedBranchId) : undefined;
    (data as any).pickup_date = pickupDate || undefined;
    (data as any).delivery_date = deliveryDate || undefined;
    (data as any).supplier_name = supplierName || undefined;
    (data as any).evidenceFile = evidenceFile;

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Editar Orden de Pedido" : "Nueva Orden de Pedido"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venta */}
          <div>
            <Label htmlFor="sale">Venta (Opcional)</Label>
            <Select 
              value={selectedSaleId} 
              onValueChange={setSelectedSaleId}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar venta" />
              </SelectTrigger>
              <SelectContent>
                {sales.map(sale => (
                  <SelectItem key={sale.id} value={sale.id.toString()}>
                    {sale.code} - {sale.clientName} - ${sale.total.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cliente y Sucursal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente <span className="text-red-500">*</span></Label>
              <Select 
                value={selectedClientId} 
                onValueChange={setSelectedClientId}
                disabled={loadingData}
              >
                <SelectTrigger className={errors.client_id ? "border-red-500" : ""}>
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
              {errors.client_id && <p className="text-sm text-red-500 mt-1">{errors.client_id}</p>}
            </div>

            <div>
              <Label htmlFor="branch">Sucursal <span className="text-red-500">*</span></Label>
              <Select 
                value={selectedBranchId} 
                onValueChange={setSelectedBranchId}
                disabled={loadingBranches || !selectedClientId}
              >
                <SelectTrigger className={errors.branch_id ? "border-red-500" : ""}>
                  <SelectValue placeholder={!selectedClientId ? "Seleccione un cliente primero" : (loadingBranches ? "Cargando..." : "Seleccionar sucursal")} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch_id && <p className="text-sm text-red-500 mt-1">{errors.branch_id}</p>}
            </div>
          </div>

          {/* Dirección de Entrega */}
          <div>
            <Label htmlFor="delivery_address">Dirección de Entrega <span className="text-red-500">*</span></Label>
            <Input
              id="delivery_address"
              value={deliveryAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAddress(e.target.value)}
              placeholder="Se autocompleta al seleccionar sucursal"
              className={errors.delivery_address ? "border-red-500" : ""}
            />
            {errors.delivery_address && <p className="text-sm text-red-500 mt-1">{errors.delivery_address}</p>}
          </div>

          {/* Fechas y Proveedor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pickup_date">Fecha de Recogida</Label>
              <Input
                id="pickup_date"
                type="date"
                value={pickupDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickupDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="delivery_date">Fecha de Entrega</Label>
              <Input
                id="delivery_date"
                type="date"
                value={deliveryDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="supplier_name">Proveedor / Transportista</Label>
              <Input
                id="supplier_name"
                value={supplierName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierName(e.target.value)}
                placeholder="DHL, Estafeta, Nombre del conductor..."
              />
            </div>
          </div>

          {/* Evidencia - File Upload */}
          <div>
            <Label>Evidencia (Archivo)</Label>
            <div className="mt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                id="evidence-file"
              />
              
              {evidenceFile ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-secondary">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{evidenceFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="evidence-file"
                  className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">Subir evidencia (imagen o PDF)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Notas adicionales para la orden"
              rows={2}
            />
          </div>

          {/* Productos - Auto-cargados desde venta */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>
                Productos <span className="text-red-500">*</span>
                {loadingSaleItems && <span className="ml-2 text-muted-foreground">(Cargando desde venta...)</span>}
              </Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddItem}
              >
                + Agregar Producto
              </Button>
            </div>

            {errors.items && <p className="text-sm text-red-500 mb-2">{errors.items}</p>}

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No hay productos agregados. Seleccione una venta o haga clic en "Agregar Producto".
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end p-2 border rounded-md">
                    <div className="flex-1">
                      <Input
                        value={item.product_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "product_name", e.target.value)}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        value={item.product_code || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "product_code", e.target.value)}
                        placeholder="Código"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        placeholder="Cant."
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        value={item.unit || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, "unit", e.target.value)}
                        placeholder="Unidad"
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
