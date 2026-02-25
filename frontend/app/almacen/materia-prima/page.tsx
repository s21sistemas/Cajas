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
import { inventoryService } from "@/lib/services";
import { Plus, Search, Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

export default function MateriaPrimaPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await inventoryService.getByCategory("raw_material", { perPage: 100 });
        setItems((response.data as InventoryItem[]) || []);
      } catch (error) {
        console.error("Error cargando materia prima:", error);
        showToast("error", "Error", "No se pudo cargar la materia prima");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) || 
    item.code?.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = items.filter(item => (item.quantity || 0) <= (item.minStock || 0)).length;
  const totalValue = items.reduce((s, item) => s + (item.quantity || 0) * (item.unitCost || 0), 0);

  const handleEntry = async () => {
    if (!selectedItem || !qty) return;
    setActionLoading(true);
    try {
      await inventoryService.updateQuantity(selectedItem.id, (selectedItem.quantity || 0) + Number(qty));
      showToast("success", "Entrada registrada", `+${qty} ${selectedItem.unit || 'pz'} de ${selectedItem.name}`);
      // Recargar datos
      const response = await inventoryService.getByCategory("raw_material", { perPage: 100 });
      setItems(response.data);
    } catch (error) {
      showToast("error", "Error", "No se pudo registrar la entrada");
    } finally {
      setEntryOpen(false);
      setQty("");
      setActionLoading(false);
    }
  };

  const handleExit = async () => {
    if (!selectedItem || !qty) return;
    if (Number(qty) > (selectedItem.quantity || 0)) { 
      showToast("error", "Stock insuficiente", "No hay suficiente material en inventario"); 
      return; 
    }
    setActionLoading(true);
    try {
      await inventoryService.updateQuantity(selectedItem.id, (selectedItem.quantity || 0) - Number(qty));
      showToast("success", "Salida registrada", `-${qty} ${selectedItem.unit || 'pz'} de ${selectedItem.name}`);
      // Recargar datos
      const response = await inventoryService.getByCategory("raw_material", { perPage: 100 });
      setItems(response.data);
    } catch (error) {
      showToast("error", "Error", "No se pudo registrar la salida");
    } finally {
      setExitOpen(false);
      setQty("");
      setActionLoading(false);
    }
  };

  if (loading) return <ERPLayout title="Almacen" subtitle="Materia Prima"><div className="animate-pulse space-y-4"><div className="h-24 bg-muted rounded-lg" /><div className="h-96 bg-muted rounded-lg" /></div></ERPLayout>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <ERPLayout title="Almacen" subtitle="Materia Prima">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Items</p><p className="text-2xl font-bold mt-1">{items.length}</p></CardContent></Card>
          <Card className="border"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Valor Total</p><p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(totalValue)}</p></CardContent></Card>
          <Card className="border"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Alertas Stock Bajo</p><p className="text-2xl font-bold mt-1 text-red-500">{lowStock}</p></CardContent></Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar material..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead><tr className="bg-muted/50 border-b">
                <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Codigo</th>
                <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Material</th>
                <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Tipo</th>
                <th className="text-right p-3 font-medium text-muted-foreground whitespace-nowrap">Stock</th>
                <th className="text-right p-3 font-medium text-muted-foreground whitespace-nowrap">Min</th>
                <th className="text-right p-3 font-medium text-muted-foreground whitespace-nowrap">Costo Unit.</th>
                <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Ubicacion</th>
                <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">Estado</th>
                <th className="text-right p-3 font-medium text-muted-foreground whitespace-nowrap">Acciones</th>
              </tr></thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = (item.quantity || 0) <= (item.minStock || 0);
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs whitespace-nowrap">{item.code}</td>
                      <td className="p-3 whitespace-nowrap"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.category}</p></div></td>
                      <td className="p-3 whitespace-nowrap"><Badge variant="outline" className="text-xs">{item.category}</Badge></td>
                      <td className={cn("p-3 text-right font-semibold whitespace-nowrap", isLow && "text-red-500")}>{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right text-muted-foreground whitespace-nowrap">{item.minStock}</td>
                      <td className="p-3 text-right whitespace-nowrap">{formatCurrency(item.unitCost || 0)}</td>
                      <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">{item.location || "N/A"}</td>
                      <td className="p-3 whitespace-nowrap">{isLow ? <Badge className="bg-red-50 text-red-700 border-red-200 text-xs" variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Bajo</Badge> : <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs" variant="outline">OK</Badge>}</td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent whitespace-nowrap" onClick={() => { setSelectedItem(item); setQty(""); setEntryOpen(true); }}><ArrowDownToLine className="h-3 w-3 mr-1" />Entrada</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent whitespace-nowrap" onClick={() => { setSelectedItem(item); setQty(""); setExitOpen(true); }}><ArrowUpFromLine className="h-3 w-3 mr-1" />Salida</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent><DialogHeader><DialogTitle>Entrada de Material</DialogTitle><DialogDescription>{selectedItem?.code} - {selectedItem?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Cantidad a ingresar ({selectedItem?.unit})</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" /></div>
            <p className="text-sm text-muted-foreground">Stock actual: {selectedItem?.quantity} {selectedItem?.unit}</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEntryOpen(false)}>Cancelar</Button><Button onClick={handleEntry} disabled={actionLoading}>{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Entrada"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent><DialogHeader><DialogTitle>Salida de Material</DialogTitle><DialogDescription>{selectedItem?.code} - {selectedItem?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Cantidad a retirar ({selectedItem?.unit})</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" /></div>
            <p className="text-sm text-muted-foreground">Stock actual: {selectedItem?.quantity} {selectedItem?.unit}</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setExitOpen(false)}>Cancelar</Button><Button onClick={handleExit} disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 text-white">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Salida"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
}
