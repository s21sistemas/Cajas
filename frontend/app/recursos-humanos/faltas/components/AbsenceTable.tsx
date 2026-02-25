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
import type { Absence } from "@/lib/types/hr.types";

interface AbsenceTableProps {
  absences: Absence[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (absence: Absence) => void;
  onDelete: (absence: Absence) => void;
  loading: boolean;
}

export function AbsenceTable({
  absences,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  loading,
}: AbsenceTableProps) {
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

  const getStatusBadge = (status: Absence["status"]) => {
    const variants: Record<string, string> = {
      registered: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      justified: "bg-green-500/20 text-green-400 border-green-500/30",
      discounted: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const labels: Record<string, string> = {
      registered: "Registrado",
      justified: "Justificada",
      discounted: "Descontado",
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getTypeBadge = (type: Absence["type"]) => {
    const variants: Record<string, string> = {
      justified: "bg-green-500/20 text-green-400 border-green-500/30",
      unjustified: "bg-red-500/20 text-red-400 border-red-500/30",
      late: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
    const labels: Record<string, string> = {
      justified: "Justificada",
      unjustified: "Injustificada",
      late: "Retardo",
    };
    return <Badge className={variants[type]}>{labels[type]}</Badge>;
  };

  const filtered = absences.filter(
    (a: Absence) =>
      (a.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (a.department?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (a.date?.includes(search))
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Registro de Faltas</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar falta..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Empleado</TableHead>
              <TableHead className="text-muted-foreground">Departamento</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Motivo</TableHead>
              <TableHead className="text-muted-foreground">Descuento</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
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
                  No hay faltas registradas.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((absence: Absence) => (
                <TableRow key={absence.id} className="border-border">
                  <TableCell className="text-foreground">{absence.employeeName}</TableCell>
                  <TableCell className="text-foreground">{absence.department}</TableCell>
                  <TableCell className="text-foreground">{formatDate(absence.date)}</TableCell>
                  <TableCell>{getTypeBadge(absence.type)}</TableCell>
                  <TableCell className="text-foreground max-w-[200px] truncate">{absence.reason || '-'}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(absence.deduction)}</TableCell>
                  <TableCell>{getStatusBadge(absence.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(absence)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(absence)}>
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
