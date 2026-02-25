"use client";

import { useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const movements = [
  { id: "1", date: "2024-10-15 08:30", type: "entrada", item: "Lamina Corrugada BC Kraft", code: "MP-001", qty: 200, unit: "lamina", warehouse: "Materia Prima", user: "Jose Ramirez", reference: "OC-2024-045" },
  { id: "2", date: "2024-10-15 09:15", type: "salida", item: "Lamina Corrugada BC Kraft", code: "MP-001", qty: 50, unit: "lamina", warehouse: "Materia Prima", user: "Carlos Mendoza", reference: "OP-2024-012" },
  { id: "3", date: "2024-10-15 10:00", type: "entrada", item: "Caja Corrugada 40x30x20", code: "PRD-001", qty: 100, unit: "pza", warehouse: "Producto Terminado", user: "Miguel Torres", reference: "OP-2024-012" },
  { id: "4", date: "2024-10-14 14:30", type: "salida", item: "Caja Troquelada Display", code: "PRD-002", qty: 50, unit: "pza", warehouse: "Producto Terminado", user: "Jose Ramirez", reference: "VTA-2024-089" },
  { id: "5", date: "2024-10-14 11:00", type: "entrada", item: "Tinta Flexo Cyan", code: "MP-004", qty: 5, unit: "cubeta", warehouse: "Materia Prima", user: "Jose Ramirez", reference: "OC-2024-044" },
  { id: "6", date: "2024-10-14 09:00", type: "transferencia", item: "Pegamento PVA Industrial", code: "MP-006", qty: 2, unit: "cubeta", warehouse: "Materia Prima", user: "Roberto Hernandez", reference: "TR-2024-003" },
  { id: "7", date: "2024-10-13 16:00", type: "salida", item: "Cartulina Sulfatada Cal.14", code: "MP-003", qty: 100, unit: "pliego", warehouse: "Materia Prima", user: "Ana Rodriguez", reference: "OP-2024-011" },
  { id: "8", date: "2024-10-13 13:00", type: "entrada", item: "Charola Hamburguesa", code: "PRD-003", qty: 500, unit: "pza", warehouse: "Producto Terminado", user: "Roberto Hernandez", reference: "OP-2024-010" },
];

export default function MovimientosAlmacenPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = movements.filter(m => {
    const matchSearch = m.item.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()) || m.reference.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const entradas = movements.filter(m => m.type === "entrada").length;
  const salidas = movements.filter(m => m.type === "salida").length;
  const transferencias = movements.filter(m => m.type === "transferencia").length;

  return (
    <ERPLayout title="Almacen" subtitle="Movimientos de Inventario">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border"><CardContent className="p-4 flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50"><ArrowDownToLine className="h-5 w-5 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground font-medium uppercase">Entradas</p><p className="text-2xl font-bold text-emerald-600">{entradas}</p></div></CardContent></Card>
          <Card className="border"><CardContent className="p-4 flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50"><ArrowUpFromLine className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-muted-foreground font-medium uppercase">Salidas</p><p className="text-2xl font-bold text-red-600">{salidas}</p></div></CardContent></Card>
          <Card className="border"><CardContent className="p-4 flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50"><ArrowRightLeft className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-muted-foreground font-medium uppercase">Transferencias</p><p className="text-2xl font-bold text-blue-600">{transferencias}</p></div></CardContent></Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar movimiento..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
              <SelectItem value="transferencia">Transferencias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50 border-b">
              <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Material / Producto</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Cantidad</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Almacen</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Referencia</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Usuario</th>
            </tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground text-xs font-mono">{m.date}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={cn("text-xs", m.type === "entrada" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : m.type === "salida" ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200")}>
                      {m.type === "entrada" ? <ArrowDownToLine className="h-3 w-3 mr-1" /> : m.type === "salida" ? <ArrowUpFromLine className="h-3 w-3 mr-1" /> : <ArrowRightLeft className="h-3 w-3 mr-1" />}
                      {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-3"><p className="font-medium">{m.item}</p><p className="text-xs text-muted-foreground">{m.code}</p></td>
                  <td className={cn("p-3 text-right font-semibold", m.type === "entrada" ? "text-emerald-600" : m.type === "salida" ? "text-red-600" : "text-blue-600")}>{m.type === "entrada" ? "+" : m.type === "salida" ? "-" : ""}{m.qty} {m.unit}</td>
                  <td className="p-3 text-muted-foreground">{m.warehouse}</td>
                  <td className="p-3 font-mono text-xs">{m.reference}</td>
                  <td className="p-3 text-muted-foreground">{m.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ERPLayout>
  );
}
