"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Edit, Trash2 } from "lucide-react";
import type { Overtime } from "@/lib/types/hr.types";

interface OvertimeTableProps {
  overtime: Overtime[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (overtime: Overtime) => void;
  onDelete: (overtime: Overtime) => void;
  loading: boolean;
}

export function OvertimeTable({
  overtime,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  loading,
}: OvertimeTableProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "simple":
        return <Badge className="bg-blue-500/20 text-blue-400">Simple</Badge>;
      case "double":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Doble</Badge>;
      case "triple":
        return <Badge className="bg-orange-500/20 text-orange-400">Triple</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400">Aprobado</Badge>;
      case "paid":
        return <Badge className="bg-blue-500/20 text-blue-400">Pagado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filtered = overtime.filter(
    (o: Overtime) =>
      (o.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (o.department?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Registros de Tiempo Extra</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Empleado</TableHead>
              <TableHead className="text-muted-foreground">Departamento</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
              <TableHead className="text-muted-foreground">Horas</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground text-right">Monto</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay registros de tiempo extra.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item: Overtime) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{item.employeeName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.department}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(item.date)}</TableCell>
                  <TableCell className="text-foreground">{item.hours}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="text-right text-green-400">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
