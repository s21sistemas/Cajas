"use client";

import { useEffect, useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/erp/action-toast";
import { productsService } from "@/lib/services";
import { Search, Package, ArrowDownToLine, ArrowUpFromLine, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductoTerminadoPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await productsService.getAll({ perPage: 100 });
        setProducts((response.data as Product[]) || []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        showToast("error", "Error", "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.code?.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = products.filter(p => (p.stock || 0) <= (p.minStock || 0)).length;
  const totalValue = products.reduce((s, p) => s + (p.stock || 0) * (p.cost || 0), 0);

  const handleEntry = async () => {
    if (!selectedProduct || !qty) return;
    setActionLoading(true);
    try {
      await productsService.updateStock(selectedProduct.id, (selectedProduct.stock || 0) + Number(qty));
      showToast("success", "Entrada registrada", `+${qty} ${selectedProduct.unit || 'pz'} de ${selectedProduct.name}`);
      // Recargar datos
      const response = await productsService.getAll({ perPage: 100 });
      setProducts(response.data);
    } catch (error) {
      showToast("error", "Error", "No se pudo registrar la entrada");
    } finally {
      setEntryOpen(false);
      setQty("");
      setActionLoading(false);
    }
  };

  const handleExit = async () => {
    if (!selectedProduct || !qty) return;
    if (Number(qty) > (selectedProduct.stock || 0)) { 
      showToast("error", "Stock insuficiente", "No hay suficiente producto en inventario"); 
      return; 
    }
    setActionLoading(true);
    try {
      await productsService.updateStock(selectedProduct.id, (selectedProduct.stock || 0) - Number(qty));
      showToast("success", "Salida registrada", `-${qty} ${selectedProduct.unit || 'pz'} de ${selectedProduct.name}`);
      // Recargar datos
      const response = await productsService.getAll({ perPage: 100 });
      setProducts(response.data);
    } catch (error) {
      showToast("error", "Error", "No se pudo registrar la salida");
    } finally {
      setExitOpen(false);
      setQty("");
      setActionLoading(false);
    }
  };

  if (loading) return <ERPLayout title="Almacen" subtitle="Producto Terminado"><div className="animate-pulse space-y-4"><div className="h-24 bg-muted rounded-lg" /><div className="h-96 bg-muted rounded-lg" /></div></ERPLayout>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <ERPLayout title="Almacen" subtitle="Producto Terminado">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Productos</p><p className="text-2xl font-bold mt-1">{products.length}</p></CardContent></Card>
          <Card className="border"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Valor Total</p><p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(totalValue)}</p></CardContent></Card>
          <Card className="border"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Alertas Stock Bajo</p><p className="text-2xl font-bold mt-1 text-red-500">{lowStock}</p></CardContent></Card>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50 border-b">
              <th className="text-left p-3 font-medium text-muted-foreground">Codigo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Producto</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Stock</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Min</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Precio</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Costo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const isLow = (p.stock || 0) <= (p.minStock || 0);
                return (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{p.code}</td>
                    <td className="p-3"><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.description}</p></div></td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{p.category}</Badge></td>
                    <td className={cn("p-3 text-right font-semibold", isLow && "text-red-500")}>{p.stock} {p.unit}</td>
                    <td className="p-3 text-right text-muted-foreground">{p.minStock}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(p.price || 0)}</td>
                    <td className="p-3 text-right text-muted-foreground">{formatCurrency(p.cost || 0)}</td>
                    <td className="p-3">{isLow ? <Badge className="bg-red-50 text-red-700 border-red-200 text-xs" variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Bajo</Badge> : <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs" variant="outline">OK</Badge>}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent" onClick={() => { setSelectedProduct(p); setQty(""); setEntryOpen(true); }}><ArrowDownToLine className="h-3 w-3 mr-1" />Entrada</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent" onClick={() => { setSelectedProduct(p); setQty(""); setExitOpen(true); }}><ArrowUpFromLine className="h-3 w-3 mr-1" />Salida</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent><DialogHeader><DialogTitle>Entrada de Producto Terminado</DialogTitle><DialogDescription>{selectedProduct?.code} - {selectedProduct?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4"><div className="space-y-2"><Label>Cantidad ({selectedProduct?.unit})</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} /></div><p className="text-sm text-muted-foreground">Stock actual: {selectedProduct?.stock}</p></div>
          <DialogFooter><Button variant="outline" onClick={() => setEntryOpen(false)}>Cancelar</Button><Button onClick={handleEntry} disabled={actionLoading}>{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Entrada"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent><DialogHeader><DialogTitle>Salida de Producto Terminado</DialogTitle><DialogDescription>{selectedProduct?.code} - {selectedProduct?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4"><div className="space-y-2"><Label>Cantidad ({selectedProduct?.unit})</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} /></div><p className="text-sm text-muted-foreground">Stock actual: {selectedProduct?.stock}</p></div>
          <DialogFooter><Button variant="outline" onClick={() => setExitOpen(false)}>Cancelar</Button><Button onClick={handleExit} disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 text-white">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Salida"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
}
