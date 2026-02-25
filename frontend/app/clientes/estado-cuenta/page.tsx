"use client";

import { useState } from "react";
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
import { useApiQuery } from "@/hooks/use-api-query";
import { serviceOrdersService } from "@/lib/services";
import type { AccountStatement } from "@/lib/types/client.types";
import type { PaginatedResponse } from "@/lib/types/api.types";

export default function ClientAccountPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  const { data: statementsResponse, loading, refetch } = useApiQuery<PaginatedResponse<AccountStatement>>(
    () => serviceOrdersService.getAccountStatements(),
    {}
  );

  const statements = statementsResponse?.data || [];

  // Get unique clients for filter
  const clients = [...new Set(
    statements
      .filter((s: AccountStatement) => s.clientName)
      .map((s: AccountStatement) => s.clientName)
  )];

  const filtered = statements.filter((s: AccountStatement) => {
    const matchesSearch =
      (s.invoiceNumber?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.clientName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.concept?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesClient = clientFilter === "all" || s.clientName === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const totalReceivable = statements.reduce((sum: number, s: AccountStatement) => sum + (s.balance || 0), 0);
  const totalOverdue = statements.filter((s: AccountStatement) => s.status === "overdue").reduce((sum: number, s: AccountStatement) => sum + (s.balance || 0), 0);
  const totalPaid = statements.reduce((sum: number, s: AccountStatement) => sum + (s.paid || 0), 0);

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
    <ERPLayout title="Estado de Cuenta" subtitle="Gestiona el estado de cuenta de clientes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estado de Cuenta - Clientes</h1>
            <p className="text-muted-foreground">
              Consulta el estado de cuenta de tus clientes
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
                  <p className="text-sm text-muted-foreground">Por Cobrar</p>
                  <p className="text-2xl font-bold text-foreground">${totalReceivable.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Cobrado</p>
                  <p className="text-2xl font-bold text-green-400">${totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-foreground">Detalle de Movimientos</CardTitle>
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
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-48 bg-secondary border-border">
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {clients.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
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
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
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
                  {filtered.map((statement: AccountStatement) => (
                    <TableRow key={statement.id} className="border-border">
                      <TableCell className="font-mono text-sm text-primary">{statement.invoiceNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{statement.clientName}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{statement.concept}</TableCell>
                      <TableCell className="text-muted-foreground">{statement.date}</TableCell>
                      <TableCell className="text-muted-foreground">{statement.dueDate}</TableCell>
                      <TableCell className="text-right text-foreground">${(statement.amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-400">${(statement.paid || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">${(statement.balance || 0).toLocaleString()}</TableCell>
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
