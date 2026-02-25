"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import type { Loan } from "@/lib/services/loans.service";

interface LoanTableProps {
  data: Loan[];
  loading: boolean;
  onEdit: (item: Loan) => void;
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

export function LoanTable({ data, loading, onEdit }: LoanTableProps) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<Loan[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(data);
    } else {
      const lower = search.toLowerCase();
      setFilteredData(
        data.filter(
          (l) =>
            l.employee_name?.toLowerCase().includes(lower) ||
            l.employee?.department?.toLowerCase().includes(lower) ||
            l.code?.toLowerCase().includes(lower)
        )
      );
    }
  }, [data, search]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "personal":
        return <Badge className="bg-blue-500/20 text-blue-400">Personal</Badge>;
      case "emergency":
        return <Badge className="bg-red-500/20 text-red-400">Emergencia</Badge>;
      case "advance":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Anticipo</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Activo</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Liquidado</Badge>;
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
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-2 w-24 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
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
            <TableHead className="text-muted-foreground">Tipo</TableHead>
            <TableHead className="text-muted-foreground text-right">Monto</TableHead>
            <TableHead className="text-muted-foreground">Progreso</TableHead>
            <TableHead className="text-muted-foreground text-right">Saldo</TableHead>
            <TableHead className="text-muted-foreground text-right">Cuota</TableHead>
            <TableHead className="text-muted-foreground">Fecha Inicio</TableHead>
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
              <TableCell colSpan={9} className="text-center text-muted-foreground h-48">
                No se encontraron préstamos
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item) => (
              <TableRow key={item.id} className="border-border">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{item.employee_name}</p>
                    <p className="text-sm text-muted-foreground">{item.employee?.department}</p>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(item.type)}</TableCell>
                <TableCell className="text-right text-foreground">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress
                      value={item.amount > 0 ? (item.paid / item.amount) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {item.paid_installments}/{item.installments} cuotas
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right text-yellow-400">
                  {formatCurrency(item.balance)}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  {formatCurrency(item.installment_amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.start_date)}
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
