"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search } from "lucide-react";
import { accountStatementsService, type AccountStatement } from "@/lib/services/account-statements.service";

interface ClientAccountTableProps {
  items: AccountStatement[];
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  currentPage: number;
  lastPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  clients: string[];
  clientFilter: string;
  onClientFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function ClientAccountTable({
  items,
  search,
  onSearchChange,
  loading = false,
  currentPage,
  lastPage,
  totalItems,
  onPageChange,
  clients,
  clientFilter,
  onClientFilterChange,
  statusFilter,
  onStatusFilterChange,
}: ClientAccountTableProps) {
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="rounded-md border border-border">
      {/* Filters */}
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select value={clientFilter} onValueChange={onClientFilterChange}>
          <SelectTrigger className="w-48 bg-secondary border-border">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Venta</TableHead>
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
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No hay registros de estados de cuenta
                </TableCell>
              </TableRow>
            ) : (
              items.map((statement) => (
                <TableRow key={statement.id} className="border-border">
                  <TableCell className="font-mono text-sm text-primary">{statement.sale?.code}</TableCell>
                  <TableCell className="font-medium text-foreground">{statement.clientName}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{statement.concept}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(statement.date)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(statement.dueDate)}</TableCell>
                  <TableCell className="text-right text-foreground">${(statement.amount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-400">${(statement.paid || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">${(statement.balance || 0).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(statement.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando {items.length} de {totalItems} registros
          </p>
          {lastPage > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Página {currentPage} de {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage || loading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
