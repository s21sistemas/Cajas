"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { Sale } from "@/lib/types/service-order.types";
import { useState, useEffect, useRef } from "react";
import { clientsService } from "@/lib/services";
import { productsService } from "@/lib/services/products.service";
import { quotesService } from "@/lib/services/quotes.service";
import { salesService } from "@/lib/services/sales.service";
import type { Client, Product } from "@/lib/types";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";

// Función helper para formatear fecha para input type="date"
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  // Si ya viene en formato YYYY-MM-DD, retornarlo
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  // Si viene con tiempo, extraer solo la fecha YYYY-MM-DD
  // Usamos UTC para evitar que se reste un día por timezone
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSale: Sale | null;
  onSubmit: (data: any) => void;
  loading: boolean;
  error?: any; // Errors from parent for field display
}

interface SaleItemForm {
  id?: number;
  productId: number | null;
  // Datos del producto para autocompletar
  productName?: string;
  productCode?: string;
  unit: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
}

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagada" },
  { value: "overdue", label: "Vencida" },
  { value: "cancelled", label: "Cancelada" },
];

// Componente para el selector de productos con búsqueda
function ProductSelect({
  value,
  onChange,
  products,
  loading,
  item
}: {
  value: number | null;
  onChange: (productId: number | null, product: Product | null) => void;
  products: Product[];
  loading: boolean;
  item?: SaleItemForm;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = products.find(p => p.id === value);

  const filteredProducts = products.filter(p => 
    p.status === "active" && 
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     (p.code && p.code.toLowerCase().includes(search.toLowerCase())))
  );

  const handleSelect = (product: Product) => {
    onChange(product.id, product);
    setSearch("");
    setIsOpen(false);
  };

  // Si el producto no está en la lista pero tenemos datos del item (de cotización), mostrar esos datos
  const displayValue = isOpen ? search : (selectedProduct?.name || (item?.productName ? `${item.productName} ${item.productCode ? `(${item.productCode})` : ''}` : (value ? `Producto #${value}` : "")));

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
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
          ) : filteredProducts.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No se encontraron productos
            </div>
          ) : (
            filteredProducts.map((product) => (
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

export function SaleFormDialog({
  open,
  onOpenChange,
  editingSale,
  onSubmit,
  loading,
  error,
}: SaleFormDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [availableQuotes, setAvailableQuotes] = useState<any[]>([]); // Todas las cotizaciones sin venta
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingAvailableQuotes, setLoadingAvailableQuotes] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("cash");
  const [items, setItems] = useState<SaleItemForm[]>([]);
  const [taxPercentage, setTaxPercentage] = useState(16);
  const [saving, setSaving] = useState(false);
  const [dueDate, setDueDate] = useState<string>("");

  // Fetch clients using selectList
  const { data: clientsData, loading: clientsLoading } = useApiQuery(
    () => clientsService.selectList(),
    { enabled: open }
  );
  const clientsList = clientsData || [];

  // Fetch products using selectList
  const { data: productsData, loading: productsLoading } = useApiQuery(
    () => productsService.selectList(),
    { enabled: open }
  );
  const products = (productsData || []) as Product[];

  // Fetch all quotes without sale when dialog opens (for new sales)
  // Also load the quote associated with the sale being edited
  useEffect(() => {
    const fetchQuotes = async () => {
      if (open) {
        // Para nuevas ventas: cargar cotizaciones sin venta
        if (!editingSale) {
          setLoadingAvailableQuotes(true);
          try {
            const response = await quotesService.getWithoutSale();
            console.log('Available quotes response:', response);
            setAvailableQuotes(response.data || []);
          } catch (error) {
            console.error('Error fetching available quotes:', error);
          } finally {
            setLoadingAvailableQuotes(false);
          }
        } 
        // Para ventas en edición: también cargar la cotización asociada
        else if (editingSale.quoteId) {
          setLoadingAvailableQuotes(true);
          try {
            // Cargar la cotización de la venta
            const quoteResponse = await quotesService.getById(editingSale.quoteId);
            const quoteData = quoteResponse.data || quoteResponse;
            console.log('Editing sale quote:', quoteData);
            
            // Agregar la cotización actual a availableQuotes para que se pueda mostrar
            if (quoteData) {
              const currentQuote = {
                id: quoteData.id,
                code: quoteData.code,
                title: quoteData.title,
                client_id: quoteData.clientId,
                client_name: quoteData.clientName,
                subtotal: quoteData.subtotal,
                tax_percentage: quoteData.taxPercentage,
                tax: quoteData.tax,
                total: quoteData.total,
                status: quoteData.status,
                valid_until: quoteData.validUntil,
                items_count: quoteData.itemsCount,
                created_at: quoteData.createdAt,
              };
              // Verificar si ya está en la lista (podría estar si ya tiene venta)
              setAvailableQuotes(prev => {
                const exists = prev.find(q => q.id === currentQuote.id);
                if (exists) return prev;
                return [currentQuote, ...prev];
              });
            }
          } catch (error) {
            console.error('Error fetching quote for editing sale:', error);
          } finally {
            setLoadingAvailableQuotes(false);
          }
        }
      }
    };
    fetchQuotes();
  }, [open, editingSale]);

  // Sync field errors from parent prop
  useEffect(() => {
    if (error && error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const fieldErrorMap: Record<string, string> = {};
      Object.keys(errors).forEach(key => {
        fieldErrorMap[key] = errors[key][0];
      });
      setFieldErrors(fieldErrorMap);
    } else {
      setFieldErrors({});
    }
  }, [error, open]);

  // Clear errors when opening/closing modal
  useEffect(() => {
    if (!open) {
      setFieldErrors({});
    }
  }, [open]);

  // Load items when editing sale
  useEffect(() => {
    const loadSaleItems = async () => {
      if (editingSale && editingSale.id) {
        // Siempre intentar cargar los items desde el backend
        // ya que la lista de ventas no incluye los items por defecto
        try {
          console.log('Loading items for sale:', editingSale.id);
          const saleItemsResponse: any = await salesService.getItems(editingSale.id);
          console.log('Sale items response:', saleItemsResponse);
          
          // El servicio puede devolver directamente el array o un objeto con data
          let itemsList: any[] = [];
          if (Array.isArray(saleItemsResponse)) {
            itemsList = saleItemsResponse;
          } else if (saleItemsResponse?.data) {
            itemsList = saleItemsResponse.data;
          } else if (saleItemsResponse?.success) {
            itemsList = saleItemsResponse.data || [];
          }
          
          console.log('Items list loaded:', itemsList);
          
          if (itemsList && itemsList.length > 0) {
            setItems(itemsList.map((item: any) => ({
              id: item.id,
              productId: item.product_id || null,
              productName: item.product?.name || "",
              productCode: item.product?.code || "",
              unit: item.unit || "",
              partNumber: item.partNumber || item.part_number || "",
              description: item.description || "",
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || item.unit_price || 0,
              discountPercentage: item.discountPercentage || item.discount_percentage || 0,
              discountAmount: item.discountAmount || item.discount_amount || 0,
              subtotal: item.subtotal || 0,
            })));
          } else {
            // Si no hay items del backend, verificar si vienen en editingSale
            const directItems = (editingSale as any).items || [];
            if (directItems.length > 0) {
              setItems(directItems.map((item: any) => ({
                id: item.id,
                productId: item.product_id || null,
                unit: item.unit || "",
                partNumber: item.partNumber || item.part_number || "",
                description: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || item.unit_price || 0,
                discountPercentage: item.discountPercentage || item.discount_percentage || 0,
                discountAmount: item.discountAmount || item.discount_amount || 0,
                subtotal: item.subtotal || 0,
              })));
            } else {
              setItems([]);
            }
          }
        } catch (error) {
          console.error('Error loading sale items:', error);
          // Si falla, intentar con los items directos
          const directItems = (editingSale as any).items || [];
          if (directItems.length > 0) {
            setItems(directItems);
          } else {
            setItems([]);
          }
        }
        
        // Cargar taxPercentage de la venta
        const saleTaxRate = (editingSale as any).taxPercentage ?? (editingSale as any).taxercentage ?? 16;
        setTaxPercentage(typeof saleTaxRate === 'number' ? saleTaxRate : parseFloat(saleTaxRate) || 16);
        
        // Cargar paymentType de la venta
        if ((editingSale as any).paymentType) {
          setPaymentType((editingSale as any).paymentType);
        }
        
        // Cargar dueDate de la venta o del AccountStatement
        const saleDueDate = (editingSale as any).dueDate;
        if (saleDueDate) {
          setDueDate(formatDateForInput(saleDueDate));
        }
        
        // Set quote info if editing sale with quote
        if (editingSale.clientId) {
          setSelectedClientId(editingSale.clientId.toString());
        }
        if (editingSale.quoteId) {
          setSelectedQuoteId(editingSale.quoteId.toString());
        }
      } else {
        setItems([]);
        setTaxPercentage(16);
        setPaymentType("cash");
        setSelectedClientId("");
        setSelectedQuoteId("");
        setQuotes([]);
        setAvailableQuotes([]);
        setDueDate("");
      }
    };
    loadSaleItems();
  }, [editingSale, open]);

  // Clear quotes when closing modal
  useEffect(() => {
    if (!open) {
      setAvailableQuotes([]);
      setQuotes([]);
    }
  }, [open]);

  // Fetch quotes when client is selected - only quotes without sale
  useEffect(() => {
    const fetchQuotes = async () => {
      console.log('Fetching quotes for client:', selectedClientId);
      if (selectedClientId) {
        setLoadingQuotes(true);
        try {
          // api.get devuelve directamente res.data = { success: true, data: [...] }
          // Solo traer cotizaciones que NO tienen una venta asociada
          const response = await quotesService.getByClient(Number(selectedClientId), true);
          console.log('Quotes response:', response);
          
          // response es { success: true, data: [...] }
          const quotesData = response.data || [];
          console.log('Quotes data to set:', quotesData);
          setQuotes(quotesData);
        } catch (error) {
          console.error('Error fetching quotes:', error);
        } finally {
          setLoadingQuotes(false);
        }
      } else {
        setQuotes([]);
        setSelectedQuoteId("");
      }
    };
    fetchQuotes();
  }, [selectedClientId]);

  // Fetch quote items when quote is selected
  useEffect(() => {
    const fetchQuoteItems = async () => {
      console.log('selectedQuoteId:', selectedQuoteId);
      console.log('Current quotes array:', quotes);
      if (selectedQuoteId && selectedQuoteId !== '__none__' && selectedQuoteId !== '') {
        try {
          console.log('Fetching quote items for quote ID:', selectedQuoteId);
          
          // Siempre intentar obtener el taxPercentage de la cotización
          // Primero buscar en el array de cotizaciones
          const selectedQuote = quotes.find(q => q.id.toString() === selectedQuoteId);
          console.log('Selected quote from array:', selectedQuote);
          console.log('Quote taxPercentage value:', selectedQuote?.taxPercentage);
          console.log('Quote tax value:', selectedQuote?.tax);
          console.log('Quote subtotal value:', selectedQuote?.subtotal);
          
          // Intentar obtener el taxPercentage de cualquier forma
          let taxPercent: number | null = null;
          
          // Buscar en el array de cotizaciones
          if (selectedQuote?.taxPercentage) {
            const parsed = parseFloat(selectedQuote.taxPercentage);
            console.log('Parsed tax from array:', parsed);
            if (!isNaN(parsed)) {
              taxPercent = parsed;
            }
          }
          
          // Si taxPercentage es null pero tenemos tax y subtotal, calcular el porcentaje
          if (taxPercent === null && selectedQuote?.tax && selectedQuote?.subtotal) {
            const tax = parseFloat(selectedQuote.tax);
            const subtotal = parseFloat(selectedQuote.subtotal);
            if (subtotal > 0) {
              taxPercent = (tax / subtotal) * 100;
              console.log('Calculated tax percentage from tax/subtotal:', taxPercent);
            }
          }
          
          // Si no encontró en el array, hacer una llamada API
          if (taxPercent === null) {
            try {
              // getById devuelve el Quote directamente, no envuelto en { success, data }
              const quoteResponse = await quotesService.getById(Number(selectedQuoteId));
              console.log('Quote response from API:', quoteResponse);
              // quoteResponse ya es el objeto Quote directamente
              const quoteData = quoteResponse.data || quoteResponse;
              console.log('Quote data:', quoteData);
              console.log('Quote taxPercentage from API:', quoteData?.taPercentage);
              console.log('Quote tax from API:', quoteData?.tax);
              console.log('Quote subtotal from API:', quoteData?.subtotal);
              
              if (quoteData?.taxPercentage) {
                const parsed = parseFloat(quoteData.taxPercentage);
                console.log('Parsed tax from API:', parsed);
                if (!isNaN(parsed)) {
                  taxPercent = parsed;
                }
              }
              
              // Calcular desde tax y subtotal si taxPercentage es null
              if (taxPercent === null && quoteData?.tax && quoteData?.subtotal) {
                const tax = parseFloat(quoteData.tax);
                const subtotal = parseFloat(quoteData.subtotal);
                if (subtotal > 0) {
                  taxPercent = (tax / subtotal) * 100;
                  console.log('Calculated tax percentage from API tax/subtotal:', taxPercent);
                }
              }
            } catch (e) {
              console.error('Error fetching quote details:', e);
            }
          }
          
          // Actualizar el taxPercentage
          console.log('Final taxPercent to set:', taxPercent);
          if (taxPercent !== null && !isNaN(taxPercent)) {
            setTaxPercentage(taxPercent);
          } else {
            // Default to 16%
            console.log('Using default tax percentage: 16');
            setTaxPercentage(16);
          }
          
          // api.get devuelve directamente res.data = { success: true, data: [...] }
          const response = await quotesService.getItems(Number(selectedQuoteId));
          console.log('Quote items response:', response);
          
          // response es { success: true, data: [...] }
          const itemsArray = response.data || [];
          console.log('Items array:', itemsArray);
          
          if (itemsArray && itemsArray.length > 0) {
            // Map quote items to sale items - iguales a QuoteItem
            const mappedItems = itemsArray.map((item: any) => {
              // Parsear los valores numéricos correctamente
              const qty = parseFloat(item.quantity) || 1;
              const price = parseFloat(item.unit_price) || parseFloat(item.product?.price) || 0;
              const total = parseFloat(item.total) || (qty * price);
              
              return {
                id: undefined, // New item, no ID
                productId: item.productId || null,
                // Datos del producto para autocompletar
                productName: item.product?.name || item.description || "",
                productCode: item.product?.code || item.partNumber || "",
                unit: item.unit || "PZA",
                partNumber: item.partNumber || item.product?.code || "",
                description: item.description || item.product?.name || "",
                quantity: qty,
                unitPrice: price,
                // Descuentos en cero initially (como QuoteItem no tiene descuentos)
                discountPercentage: 0,
                discountAmount: 0,
                // subtotal = total del QuoteItem (antes de descuentos)
                subtotal: total,
              };
            });
            console.log('Mapped items:', mappedItems);
            setItems(mappedItems);
          } else {
            // No items in quote, keep current items
            console.log('No items in quote');
          }
        } catch (error) {
          console.error('Error fetching quote items:', error);
        }
      } else if (selectedQuoteId === '__none__') {
        // User selected "Sin cotización" - clear items
        setItems([]);
      }
    };
    fetchQuoteItems();
  }, [selectedQuoteId]);

  const addItem = () => {
    setItems([
      ...items,
      { productId: null, unit: "PZA", partNumber: "", description: "", quantity: 1, unitPrice: 0, discountPercentage: 0, discountAmount: 0, subtotal: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItemForm, value: string | number | null) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    // Recalculate subtotal
    const item = newItems[index];
    const lineTotal = item.quantity * item.unitPrice;
    const discount = lineTotal * (item.discountPercentage / 100);
    item.discountAmount = discount;
    item.subtotal = lineTotal - discount;
    setItems(newItems);
  };

  // When selecting a product, autocomplete fields
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
    // Recalculate subtotal
    const item = newItems[index];
    const lineTotal = item.quantity * item.unitPrice;
    const discount = lineTotal * (item.discountPercentage / 100);
    item.discountAmount = discount;
    item.subtotal = lineTotal - discount;
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const discount = lineTotal * (item.discountPercentage / 100);
      return sum + (lineTotal - discount);
    }, 0);
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

      const { subtotal, tax, total } = calculateTotals();

      const selectedQuote = availableQuotes.find(
        q => q.id.toString() === selectedQuoteId
      );

      const data = {
        code: formData.get("code") as string,
        clientId: Number(formData.get("clientId")),
        quoteRef: selectedQuote ? selectedQuote.code : null,
        quoteId: selectedQuoteId && selectedQuoteId !== '__none__' ? Number(selectedQuoteId) : null,
        status: formData.get("status") as string,
        paymentType: paymentType,
        creditDays: paymentType === "credit" ? (formData.get("creditDays") ? String(formData.get("creditDays")) : "30") : null,
        dueDate: dueDate || null,
        subtotal: subtotal,
        taxRate: taxPercentage,
        tax: tax,
        total: total,
        sale_items: items.map(item => ({
          id: item.id,
          product_id: item.productId,
          unit: item.unit,
          part_number: item.partNumber,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percentage: item.discountPercentage,
          discount_amount: item.discountAmount,
          subtotal: item.subtotal,
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSale ? "Editar Venta" : "Nueva Venta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Selector de cotización para nueva venta: mostrar siempre para poder buscar cotizaciones */}
            {!editingSale && (
              <div className="grid gap-2">
                <Label htmlFor="quoteSelect">Buscar Cotización</Label>
                <Select
                  value={selectedQuoteId}
                  onValueChange={async (value) => {
                    if (value && value !== '__none__') {
                      const selectedQuote = availableQuotes.find(q => q.id.toString() === value);
                      console.log('Quote selected:', selectedQuote);
                      
                      if (selectedQuote) {
                        // Autocompletar el cliente
                        if (selectedQuote.clientId) {
                          setSelectedClientId(selectedQuote.clientId.toString());
                        }
                        // Autocompletar el tax percentage
                        if (selectedQuote.taxPercentage) {
                          setTaxPercentage(parseFloat(selectedQuote.taxPercentage));
                        }
                        setSelectedQuoteId(value);
                        
                        // Cargar los items de la cotización
                        try {
                          const response = await quotesService.getItems(Number(value));
                          const itemsArray = response.data || [];
                          
                          if (itemsArray && itemsArray.length > 0) {
                            const mappedItems = itemsArray.map((item: any) => {
                              const qty = parseFloat(item.quantity) || 1;
                              const price = parseFloat(item.unitPrice) || parseFloat(item.product?.price) || 0;
                              const total = parseFloat(item.total) || (qty * price);
                              
                              return {
                                id: undefined,
                                productId: item.product_id || null,
                                productName: item.product?.name || item.description || "",
                                productCode: item.product?.code || item.partNumber || "",
                                unit: item.unit || "PZA",
                                partNumber: item.partNumber || item.product?.code || "",
                                description: item.description || item.product?.name || "",
                                quantity: qty,
                                unitPrice: price,
                                discountPercentage: 0,
                                discountAmount: 0,
                                subtotal: total,
                              };
                            });
                            setItems(mappedItems);
                          }
                        } catch (error) {
                          console.error('Error fetching quote items:', error);
                        }
                      }
                    } else if (value === '__none__') {
                      setSelectedQuoteId("");
                      setItems([]);
                    }
                  }}
                  disabled={loadingAvailableQuotes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingAvailableQuotes ? "Cargando..." : "Seleccionar cotización"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin cotización</SelectItem>
                    {availableQuotes.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id.toString()}>
                        {quote.code} - {quote.client_name || quote.title || 'Sin título'} (${Number(quote.total).toLocaleString('es-MX')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecciona una cotización para autocompletar el cliente y los productos
                </p>
              </div>
            )}

            {/*venta*/}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Venta</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="V-YYYY-XXXX"
                  defaultValue={editingSale?.code || `V-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientId">Cliente</Label>
                {/* Si hay un cliente seleccionado pero no está en la lista, mostrar el nombre */}
                {selectedClientId && !clientsList.find(c => c.id.toString() === selectedClientId) ? (
                  <div className="flex gap-2">
                    <Input
                      id="clientId"
                      name="clientId"
                      value={selectedClientId}
                      disabled
                      className="bg-muted flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClientId("")}
                    >
                      X
                    </Button>
                  </div>
                ) : (
                  <Select
                    name="clientId"
                    value={selectedClientId || editingSale?.clientId?.toString() || ""}
                    onValueChange={(value) => {
                      console.log('Client selected:', value);
                      setSelectedClientId(value);
                      setSelectedQuoteId("");
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsList.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-medium">Productos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay productos agregados. Haga clic en "Agregar" para añadir productos.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-md">
                      <div className="col-span-4">
                        <Label className="text-xs">Producto</Label>
                        <ProductSelect
                          value={item.productId}
                          onChange={(productId, product) => handleProductSelect(index, product)}
                          products={products}
                          loading={productsLoading}
                          item={item}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Cantidad</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Precio Unit.</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Desc. %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discountPercentage}
                          onChange={(e) => updateItem(index, 'discountPercentage', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Total</Label>
                        <div className="text-sm font-medium py-2">
                          {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              {items.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="iva-input" className="text-muted-foreground">IVA</Label>
                      <Input
                        id="iva-input"
                        type="number"
                        min={0}
                        max={100}
                        className="w-16 h-7 text-right mb-2"
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          IVA ({Number(taxPercentage.toFixed(2))}%):
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Type Selection */}
            <div className="grid gap-2">
              <Label htmlFor="paymentType">Tipo de Pago</Label>
              <Select
                value={paymentType}
                onValueChange={setPaymentType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Contado</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Credit Days - Only show if credit */}
            {paymentType === "credit" && (
              <div className="grid gap-2">
                <Label htmlFor="creditDays">Días de Crédito</Label>
                <Input
                  name="creditDays"
                  type="text"
                  defaultValue={editingSale?.creditDays?.toString() || "30"}
                  placeholder="Ej: 30"
                />
              </div>
            )}

            {/* Due Date - Always visible */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                name="status"
                defaultValue={editingSale?.status || "pending"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || saving}>
              {loading || saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
