"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";
import { productsService } from "@/lib/services/products.service";
import { clientsService } from "@/lib/services/clients.service";
import type { Quote, QuoteStatus, Client, Product } from "@/lib/types";

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingQuote: Quote | null;
  onSubmit: (data: any) => void;
  loading: boolean;
}

interface QuoteItemForm {
  id?: number;
  productId: number | null;
  unit: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// Componente para el selector de productos con búsqueda
// Si el producto no existe, se usa lo que escribió el usuario y se crea al guardar
function ProductSelect({
  value,
  onChange,
  products,
  loading,
  onSearchChange
}: {
  value: number | null;
  onChange: (productId: number | null, product: Product | null) => void;
  products: Product[];
  loading: boolean;
  onSearchChange: (search: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = products.find(p => p.id === value);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleSelect = (product: Product) => {
    onChange(product.id, product);
    setSearch("");
    setIsOpen(false);
  };

  // Cuando el input pierde el foco, si hay texto y no se seleccionó ningún producto,
  // usamos el texto como nombre del producto (se creará al guardar la cotización)
  const handleBlur = () => {
    setTimeout(() => {
      if (search && !selectedProduct) {
        // No hacemos nada aquí, el usuario puede seguir editando
        // El producto se creará al guardar la cotización
      }
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={isOpen ? search : selectedProduct?.name || ""}
        onChange={handleSearch}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder="Buscar producto..."
        className="h-9 w-full"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No se encontraron productos
            </div>
          ) : (
            products
              .filter((product) => product.status === "active")
              .map((product) => (
                <div
                  key={product.id}
                  className="p-3 cursor-pointer hover:bg-accent border-b last:border-b-0"
                  onClick={() => handleSelect(product)}
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Código: {product.code}
                    {product.category && <span className="ml-2">• {product.category}</span>}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

export function QuoteFormDialog({
  open,
  onOpenChange,
  editingQuote,
  onSubmit,
  loading,
}: QuoteFormDialogProps) {
  const [items, setItems] = useState<QuoteItemForm[]>([]);
  const [taxPercentage, setTaxPercentage] = useState(16);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Fetch clients using the new selectList endpoint
  const { data: clientsData, loading: clientsLoading } = useApiQuery(
    () => clientsService.selectList(),
    { enabled: open }
  );
  const clients = clientsData || [];

  // Fetch products para el select
  const { data: productsData, loading: productsLoading } = useApiQuery(
    () => productsService.selectList(),
    { enabled: open }
  );
  const products = (productsData || []) as Product[];

  const getInitialData = () => {
    if (editingQuote) {
      return {
        code: editingQuote.code,
        clientId: (editingQuote as any).clientId || 0,
        title: editingQuote.title,
        validUntil: (editingQuote as any).validUntil || "",
        status: editingQuote.status,
      };
    }
    return {
      code: `COT-${Date.now().toString().slice(-6)}`,
      clientId: 0,
      title: "",
      validUntil: "",
      status: "draft" as QuoteStatus,
    };
  };

  const formData = getInitialData();

  // Cargar items cuando se edita
  useEffect(() => {
    if (editingQuote) {
      const itemsList = (editingQuote as any).items || [];
      if (itemsList && itemsList.length > 0) {
        setItems(itemsList.map((item: any) => ({
          id: item.id,
          productId: item.productId || null,
          unit: item.unit || "",
          partNumber: item.partNumber || item.part_number || "",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.unit_price || 0,
        })));
        // Cargar taxPercentage correctamente
        const taxPercent = (editingQuote as any).taxPercentage ?? (editingQuote as any).tax_percentage ?? 16;
        setTaxPercentage(typeof taxPercent === 'number' ? taxPercent : parseFloat(taxPercent) || 16);
      } else {
        setItems([]);        
      }
    } else {
      setItems([]);
      setTaxPercentage(16);
    }
  }, [editingQuote, open]);

  const addItem = () => {
    setItems([
      ...items,
      { productId: null, unit: "", partNumber: "", description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItemForm, value: string | number | null) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  // Cuando se selecciona un producto, autocompletar los campos
  const handleProductSelect = (index: number, product: Product | null) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product?.id || null,
      unit: product?.unit || "PZA",
      partNumber: product?.code || "",
      description: product?.name || "",
      unitPrice: product?.price || product?.cost || 0,
    };
    setItems(newItems);
  };

  // Crear un nuevo producto desde la cotización
  const handleCreateProduct = async (name: string, code: string, unit: string, price: number) => {
    try {
      const newProduct = await productsService.createFromQuote({
        name,
        code: code || undefined,
        unit,
        price,
      });
      
      // Agregar el nuevo producto como item en la cotización
      const newItems = [...items];
      newItems.push({
        productId: newProduct.id,
        unit: newProduct.unit || "PZA",
        partNumber: newProduct.code || "",
        description: newProduct.name || name,
        quantity: 1,
        unitPrice: newProduct.price || price || 0,
      });
      setItems(newItems);
      
      // Recargar la lista de productos
      setProductSearch("");
    } catch (error) {
      console.error("Error al crear producto:", error);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (taxPercentage / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const data = {
        code: formData.get("code") as string,
        clientId: Number(formData.get("clientId")),
        title: formData.get("title") as string,
        validUntil: formData.get("validUntil") as string,
        status: formData.get("status") as QuoteStatus,
        taxPercentage: taxPercentage,
        items: items.map(item => ({
          id: item.id,
          product_id: item.productId,
          unit: item.unit,
          partNumber: item.partNumber,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      onSubmit(data);
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingQuote ? "Editar Cotización" : "Nueva Cotización"}</DialogTitle>
          <DialogDescription>
            {editingQuote ? "Modifica los datos de la cotización" : "Completa los datos de la cotización"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} key={editingQuote?.id || 'new'}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            {/* Datos generales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={formData.code}
                  placeholder="COT-00001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                {clientsLoading ? (
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                ) : (
                  <select
                    id="clientId"
                    name="clientId"
                    defaultValue={formData.clientId || ""}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={formData.title}
                  placeholder="Cotización de cajas de cartón"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido hasta *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  name="validUntil"
                  defaultValue={formData.validUntil ? formData.validUntil.split('T')[0] : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={formData.status}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviada</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                  <option value="expired">Expirada</option>
                </select>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Productos de la Cotización</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    No hay productos. Haz clic en "Agregar Producto" para comenzar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 bg-card"
                    >
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-4">
                          <Label className="text-xs mb-1 block">Producto *</Label>
                          <ProductSelect
                            value={item.productId}
                            onChange={(productId, product) => handleProductSelect(index, product)}
                            products={products}
                            loading={productsLoading}
                            onSearchChange={setProductSearch}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">Unidad</Label>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(index, "unit", e.target.value)}
                            placeholder="PZA"
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">No. Parte</Label>
                          <Input
                            value={item.partNumber}
                            onChange={(e) => updateItem(index, "partNumber", e.target.value)}
                            placeholder="ABC-123"
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-xs mb-1 block">Descripción *</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            placeholder="Descripción del producto"
                            className="h-9"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">Cantidad *</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                            className="h-9"
                            min="0"
                            step="1"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs mb-1 block">Precio Unit. *</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="h-9"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales */}
              {items.length > 0 && (
                <div className="flex justify-end">
                  <div className="w-80 space-y-2 p-4 border rounded-lg bg-muted/50">
                    {/* Input de porcentaje de impuesto */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <Label htmlFor="taxPercentage" className="text-sm">Porcentaje IVA (%):</Label>
                      <Input
                        id="taxPercentage"
                        type="number"
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                        className="h-8 w-24 text-right"
                        min={0}
                        max={100}
                        step={0.01}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA ({taxPercentage}%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {saving || loading ? "Guardando..." : editingQuote ? "Actualizar" : "Crear Cotización"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
