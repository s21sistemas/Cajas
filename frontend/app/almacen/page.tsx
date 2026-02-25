"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  ArrowUpDown,
  Boxes,
  MapPin,
  Warehouse,
} from "lucide-react";
import { api } from "@/lib/mock-data";

interface InvItem {
  id: string;
  code: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  unit: string;
  location: string;
  lastMovement: string;
}

interface WarehouseLoc {
  id: string;
  name: string;
  zone: string;
  type: string;
  capacity: number;
  occupancy: number;
}

export default function AlmacenPage() {
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [locations, setLocations] = useState<WarehouseLoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showMovementDialog, setShowMovementDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [inv, locs] = await Promise.all([
        api.getInventory(),
        api.getWarehouseLocations(),
      ]);
      setInventory(
        inv.map((i) => ({
          ...i,
          lastMovement: i.lastMovement instanceof Date ? i.lastMovement.toLocaleDateString("es-MX") : String(i.lastMovement),
        }))
      );
      setLocations(locs);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = inventory.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchWarehouse = filterWarehouse === "all" || item.warehouse === filterWarehouse;
    const matchCategory = filterCategory === "all" || item.category === filterCategory;
    return matchSearch && matchWarehouse && matchCategory;
  });

  const mpItems = inventory.filter((i) => i.warehouse === "materia_prima");
  const ptItems = inventory.filter((i) => i.warehouse === "producto_terminado");
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStock);
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const getStockStatus = (item: InvItem) => {
    if (item.quantity === 0) return { label: "Sin Stock", variant: "destructive" as const };
    if (item.quantity <= item.minStock) return { label: "Stock Bajo", variant: "destructive" as const };
    if (item.quantity <= item.minStock * 1.5) return { label: "Precaucion", variant: "secondary" as const };
    return { label: "Normal", variant: "default" as const };
  };

  const warehouseLabel = (w: string) => {
    const map: Record<string, string> = { materia_prima: "Materia Prima", producto_terminado: "Producto Terminado" };
    return map[w] || w;
  };

  const categoryLabel = (c: string) => {
    const map: Record<string, string> = { raw_material: "Materia Prima", component: "Componente", tool: "Herramental", consumable: "Consumible", finished_product: "Producto Terminado" };
    return map[c] || c;
  };

  if (loading) {
    return (
      <ERPLayout title="Almacen" subtitle="Gestion de almacenes de materia prima y producto terminado">
        <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout title="Almacen" subtitle="Gestion de almacenes de materia prima y producto terminado">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
              <DialogTrigger asChild>
                <Button variant="outline"><ArrowUpDown className="mr-2 h-4 w-4" />Movimiento</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-card-foreground">
                <DialogHeader><DialogTitle>Registrar Movimiento</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Tipo</Label>
                    <Select><SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada (Recepcion)</SelectItem>
                        <SelectItem value="salida">Salida (Produccion)</SelectItem>
                        <SelectItem value="transferencia">Transferencia MP a PT</SelectItem>
                        <SelectItem value="ajuste">Ajuste de Inventario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Almacen</Label>
                    <Select><SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar almacen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="materia_prima">Materia Prima</SelectItem>
                        <SelectItem value="producto_terminado">Producto Terminado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Material</Label>
                    <Select><SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{inventory.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} ({item.code})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Cantidad</Label><Input type="number" placeholder="0" className="bg-secondary border-border" /></div>
                  <div><Label>Referencia</Label><Input placeholder="OC, orden produccion, etc." className="bg-secondary border-border" /></div>
                  <Button className="w-full">Registrar Movimiento</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button><Plus className="mr-2 h-4 w-4" />Nuevo Material</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><Warehouse className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Materia Prima</p><p className="text-xl font-bold text-card-foreground">{mpItems.length} items</p></div></div></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-chart-2" /><div><p className="text-xs text-muted-foreground">Prod. Terminado</p><p className="text-xl font-bold text-card-foreground">{ptItems.length} items</p></div></div></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-chart-1" /><div><p className="text-xs text-muted-foreground">Valor Total</p><p className="text-xl font-bold text-card-foreground">${totalValue.toLocaleString()}</p></div></div></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-destructive" /><div><p className="text-xs text-muted-foreground">Stock Bajo</p><p className="text-xl font-bold text-destructive">{lowStockItems.length}</p></div></div></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><MapPin className="h-8 w-8 text-chart-3" /><div><p className="text-xs text-muted-foreground">Ubicaciones</p><p className="text-xl font-bold text-card-foreground">{locations.length}</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="inventario" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="inventario">Inventario General</TabsTrigger>
            <TabsTrigger value="ubicaciones">Ubicaciones</TabsTrigger>
            <TabsTrigger value="alertas">Alertas Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="inventario" className="space-y-4">
            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre o codigo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-secondary border-border" />
                  </div>
                  <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
                    <SelectTrigger className="w-full md:w-48 bg-secondary border-border"><SelectValue placeholder="Almacen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los almacenes</SelectItem>
                      <SelectItem value="materia_prima">Materia Prima</SelectItem>
                      <SelectItem value="producto_terminado">Producto Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48 bg-secondary border-border"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="raw_material">Materia Prima</SelectItem>
                      <SelectItem value="consumable">Consumible</SelectItem>
                      <SelectItem value="tool">Herramental</SelectItem>
                      <SelectItem value="finished_product">Prod. Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Codigo", "Material", "Almacen", "Categoria", "Ubicacion", "Stock", "Min/Max", "Costo Unit.", "Estado"].map((h) => (
                          <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="p-4 font-mono text-xs text-foreground">{item.code}</td>
                            <td className="p-4"><p className="font-medium text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.unit}</p></td>
                            <td className="p-4"><Badge variant="outline" className="text-xs">{warehouseLabel(item.warehouse)}</Badge></td>
                            <td className="p-4 text-sm text-foreground">{categoryLabel(item.category)}</td>
                            <td className="p-4 text-sm text-foreground">{item.location}</td>
                            <td className="p-4 text-right font-medium text-foreground">{item.quantity}</td>
                            <td className="p-4 text-right text-xs text-muted-foreground">{item.minStock} / {item.maxStock}</td>
                            <td className="p-4 text-right text-foreground">${item.unitCost.toFixed(2)}</td>
                            <td className="p-4"><Badge variant={status.variant}>{status.label}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ubicaciones" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc) => (
                <Card key={loc.id} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground">{loc.name}</CardTitle>
                      <Badge variant={loc.occupancy > 80 ? "destructive" : "default"}>{loc.occupancy}% ocupado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Zona:</span><span className="text-foreground">{loc.zone}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tipo:</span><span className="text-foreground">{loc.type}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Capacidad:</span><span className="text-foreground">{loc.capacity} unidades</span></div>
                      <div className="w-full bg-secondary rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${loc.occupancy}%` }} /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alertas" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><AlertTriangle className="h-5 w-5 text-destructive" />Items con Stock Bajo</CardTitle></CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay alertas de stock bajo</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-3">
                          <Boxes className="h-8 w-8 text-destructive" />
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.code} | {warehouseLabel(item.warehouse)} | {item.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-destructive">{item.quantity} {item.unit}</p>
                          <p className="text-xs text-muted-foreground">Min: {item.minStock} {item.unit}</p>
                        </div>
                        <Button size="sm" variant="outline">Crear OC</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ERPLayout>
  );
}
