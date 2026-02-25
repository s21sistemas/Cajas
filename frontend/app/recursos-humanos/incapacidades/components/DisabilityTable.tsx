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
import type { Disability } from "@/lib/types/hr.types";

interface DisabilityTableProps {
  disabilities: Disability[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (disability: Disability) => void;
  onDelete: (disability: Disability) => void;
  loading: boolean;
}

export function DisabilityTable({
  disabilities,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  loading,
}: DisabilityTableProps) {
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "imss":
        return <Badge className="bg-blue-500/20 text-blue-400">IMSS</Badge>;
      case "accident":
        return <Badge className="bg-orange-500/20 text-orange-400">Accidente</Badge>;
      case "maternity":
        return <Badge className="bg-pink-500/20 text-pink-400">Maternidad</Badge>;
      case "illness":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Enfermedad</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Activa</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Completada</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filtered = disabilities.filter(
    (d: Disability) =>
      (d.employeeName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (d.folio?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (d.department?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Listado de Incapacidades</CardTitle>
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
              <TableHead className="text-muted-foreground">Folio</TableHead>
              <TableHead className="text-muted-foreground">Empleado</TableHead>
              <TableHead className="text-muted-foreground">Departamento</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Inicio</TableHead>
              <TableHead className="text-muted-foreground">Fin</TableHead>
              <TableHead className="text-muted-foreground">Dias</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading state
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No hay incapacidades registradas.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item: Disability) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-mono text-sm text-primary">{item.folio}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.employeeName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.department}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(item.startDate)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(item.endDate)}</TableCell>
                  <TableCell className="text-foreground">{item.days}</TableCell>
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
