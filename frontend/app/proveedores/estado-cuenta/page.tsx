"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface SupplierStatement {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: "paid" | "pending" | "overdue" | "partial";
  concept: string;
}

const mockStatements: SupplierStatement[] = [
  { id: "1", invoiceNumber: "PROV-2024-0089", supplierId: "1", supplierName: "Aceros Monterrey SA", date: "2024-10-01", dueDate: "2024-10-31", amount: 85000, paid: 85000, balance: 0, status: "paid", concept: "Barras de acero 4140" },
  { id: "2", invoiceNumber: "PROV-2024-0095", supplierId: "2", supplierName: "SKF Mexico", date: "2024-10-05", dueDate: "2024-11-04", amount: 42500, paid: 0, balance: 42500, status: "pending", concept: "Rodamientos industriales" },
  { id: "3", invoiceNumber: "PROV-2024-0101", supplierId: "1", supplierName: "Aceros Monterrey SA", date: "2024-10-08", dueDate: "2024-10-23", amount: 67000, paid: 0, balance: 67000, status: "overdue", concept: "Placas de aluminio 6061" },
  { id: "4", invoiceNumber: "PROV-2024-0108", supplierId: "3", supplierName: "Tintas y Adhesivos SA", date: "2024-10-10", dueDate: "2024-11-09", amount: 28500, paid: 15000, balance: 13500, status: "partial", concept: "Tintas flexograficas" },
  { id: "5", invoiceNumber: "PROV-2024-0112", supplierId: "4", supplierName: "Lubricantes Industriales", date: "2024-10-12", dueDate: "2024-11-11", amount: 12800, paid: 12800, balance: 0, status: "paid", concept: "Aceite de corte sintetico" },
  { id: "6", invoiceNumber: "PROV-2024-0118", supplierId: "2", supplierName: "SKF Mexico", date: "2024-10-14", dueDate: "2024-10-29", amount: 35200, paid: 0, balance: 35200, status: "overdue", concept: "Sellos y retenes" },
];

export default function SupplierAccountPage() {
  const [statements, setStatements] = useState<SupplierStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      await new Promise((r) => setTimeout(r, 300));
      setStatements(mockStatements);
      setLoading(false);
    };
    loadData();
  }, []);

  const suppliers = [...new Set(statements.map((s) => s.supplierName))];

  const filtered = statements.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      s.concept.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || s.supplierName === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const totalPayable = statements.reduce((sum, s) => sum + s.balance, 0);
  const totalOverdue = statements.filter((s) => s.status === "overdue").reduce((sum, s) => sum + s.balance, 0);
  const totalPaid = statements.reduce((sum, s) => sum + s.paid, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/20 text-green-400">Pagada</Badge>;
      case "pending":
        return <Badge className="bg-blue-500/20 text-blue-400">Pendiente</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/20 text-red-400">Vencida</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Parcial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <ERPLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estado de Cuenta - Proveedores</h1>
            <p className="text-muted-foreground">
              Consulta el estado de cuenta con tus proveedores
            </p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Facturas</p>
                  <p className="text-2xl font-bold text-foreground">{statements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Por Pagar</p>
                  <p className="text-2xl font-bold text-foreground">${totalPayable.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vencido</p>
                  <p className="text-2xl font-bold text-red-400">${totalOverdue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagado</p>
                  <p className="text-2xl font-bold text-green-400">${totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-foreground">Detalle de Cuentas por Pagar</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="w-48 bg-secondary border-border">
                    <SelectValue placeholder="Proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proveedores</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 bg-secondary border-border">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="paid">Pagadas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="overdue">Vencidas</SelectItem>
                    <SelectItem value="partial">Parciales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Factura</TableHead>
                    <TableHead className="text-muted-foreground">Proveedor</TableHead>
                    <TableHead className="text-muted-foreground">Concepto</TableHead>
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">Vencimiento</TableHead>
                    <TableHead className="text-muted-foreground text-right">Monto</TableHead>
                    <TableHead className="text-muted-foreground text-right">Pagado</TableHead>
                    <TableHead className="text-muted-foreground text-right">Saldo</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((statement) => (
                    <TableRow key={statement.id} className="border-border">
                      <TableCell className="font-mono text-sm text-primary">{statement.invoiceNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{statement.supplierName}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{statement.concept}</TableCell>
                      <TableCell className="text-muted-foreground">{statement.date}</TableCell>
                      <TableCell className="text-muted-foreground">{statement.dueDate}</TableCell>
                      <TableCell className="text-right text-foreground">${statement.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-400">${statement.paid.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">${statement.balance.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(statement.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
