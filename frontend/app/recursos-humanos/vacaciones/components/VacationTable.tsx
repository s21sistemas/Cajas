"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Check, X, Edit, Calendar, Search } from "lucide-react";
import type { VacationRequest } from "@/lib/types/hr.types";

interface VacationTableProps {
  data: VacationRequest[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (item: VacationRequest) => void;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function VacationTable({
  data,
  loading,
  onApprove,
  onReject,
  onEdit,
}: VacationTableProps) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<VacationRequest[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(data);
    } else {
      const lower = search.toLowerCase();
      setFilteredData(
        data.filter(
          (v) =>
            v.employeeName?.toLowerCase().includes(lower) ||
            v.department?.toLowerCase().includes(lower)
        )
      );
    }
  }, [data, search]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vacation":
        return <Badge className="bg-blue-500/20 text-blue-400">Vacaciones</Badge>;
      case "personal":
        return <Badge className="bg-purple-500/20 text-purple-400">Personal</Badge>;
      case "medical":
        return <Badge className="bg-green-500/20 text-green-400">Médica</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400">Aprobada</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rechazada</Badge>;
      case "taken":
        return <Badge className="bg-blue-500/20 text-blue-400">Tomada</Badge>;
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
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
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
            <TableHead className="text-muted-foreground">Departamento</TableHead>
            <TableHead className="text-muted-foreground">Inicio</TableHead>
            <TableHead className="text-muted-foreground">Fin</TableHead>
            <TableHead className="text-muted-foreground">Días</TableHead>
            <TableHead className="text-muted-foreground">Tipo</TableHead>
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
                No se encontraron solicitudes de vacaciones
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item) => (
              <TableRow key={item.id} className="border-border">
                <TableCell className="font-medium text-foreground">
                  {item.employeeName}
                </TableCell>
                <TableCell className="text-muted-foreground">{item.department}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.startDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.endDate)}
                </TableCell>
                <TableCell className="text-foreground">{item.days}</TableCell>
                <TableCell>{getTypeBadge(item.type)}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {item.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(item.id)}
                        >
                          <Check className="h-4 w-4 text-green-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(item.id)}
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
