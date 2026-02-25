"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit, Search } from "lucide-react";
import type { LoanPayment } from "@/lib/services/loan-payments.service";

interface PaymentTableProps {
  data: LoanPayment[];
  loading: boolean;
  onEdit: (item: LoanPayment) => void;
  getEmployeeName: (loanId: number) => string;
  getLoanDescription: (loanId: number) => string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function PaymentTable({
  data,
  loading,
  onEdit,
  getEmployeeName,
  getLoanDescription,
}: PaymentTableProps) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<LoanPayment[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(data);
    } else {
      const lower = search.toLowerCase();
      setFilteredData(
        data.filter(
          (p) =>
            getEmployeeName(p.loan_id).toLowerCase().includes(lower) ||
            p.reference?.toLowerCase().includes(lower)
        )
      );
    }
  }, [data, search, getEmployeeName]);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "payroll":
        return <Badge className="bg-blue-500/20 text-blue-400">Nómina</Badge>;
      case "cash":
        return <Badge className="bg-green-500/20 text-green-400">Efectivo</Badge>;
      case "transfer":
        return <Badge className="bg-purple-500/20 text-purple-400">Transferencia</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge className="bg-green-500/20 text-green-400">Aplicado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground">Empleado</TableHead>
            <TableHead className="text-muted-foreground">Préstamo</TableHead>
            <TableHead className="text-muted-foreground">Fecha</TableHead>
            <TableHead className="text-muted-foreground text-right">Monto</TableHead>
            <TableHead className="text-muted-foreground">Método</TableHead>
            <TableHead className="text-muted-foreground">Referencia</TableHead>
            <TableHead className="text-muted-foreground">Estado</TableHead>
            <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground h-48">
                No se encontraron abonos
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item) => (
              <TableRow key={item.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {getEmployeeName(item.loan_id)}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[180px] truncate">
                  {getLoanDescription(item.loan_id)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.date)}
                </TableCell>
                <TableCell className="text-right text-green-400">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell>{getMethodBadge(item.method)}</TableCell>
                <TableCell className="font-mono text-sm text-primary">
                  {item.reference || "-"}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
