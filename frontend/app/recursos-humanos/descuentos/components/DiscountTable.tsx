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
import { Search, Edit, Trash2, Pause, Play, CheckCircle } from "lucide-react";
import type { Discount } from "@/lib/types/hr.types";

interface DiscountTableProps {
  discounts: Discount[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  onComplete: (id: number) => void;
  loading: boolean;
}

export function DiscountTable({
  discounts,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onComplete,
  loading,
}: DiscountTableProps) {
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
      case "loan":
        return <Badge className="bg-blue-500/20 text-blue-400">Préstamo</Badge>;
      case "infonavit":
        return <Badge className="bg-green-500/20 text-green-400">INFONAVIT</Badge>;
      case "fonacot":
        return <Badge className="bg-yellow-500/20 text-yellow-400">FONACOT</Badge>;
      case "alimony":
        return <Badge className="bg-purple-500/20 text-purple-400">Pensión</Badge>;
      case "other":
        return <Badge className="bg-gray-500/20 text-gray-400">Otro</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Activo</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-400">Completado</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pausado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filtered = discounts.filter(
    (d: Discount) =>
      (d.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (d.department?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (d.type?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Listado de Descuentos</CardTitle>
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
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Descripción</TableHead>
              <TableHead className="text-muted-foreground">Periodo</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
                  No hay descuentos registrados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item: Discount) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{item.employeeName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.department}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="text-foreground">{item.description}</TableCell>
                  <TableCell className="text-muted-foreground">{item.period}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status === "active" && (
                        <Button variant="ghost" size="icon" onClick={() => onPause(item.id)}>
                          <Pause className="h-4 w-4 text-yellow-400" />
                        </Button>
                      )}
                      {item.status === "paused" && (
                        <Button variant="ghost" size="icon" onClick={() => onResume(item.id)}>
                          <Play className="h-4 w-4 text-green-400" />
                        </Button>
                      )}
                      {item.status !== "completed" && (
                        <Button variant="ghost" size="icon" onClick={() => onComplete(item.id)}>
                          <CheckCircle className="h-4 w-4 text-blue-400" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(item)}>
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
