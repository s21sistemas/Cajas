"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Process } from "@/lib/types";

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: "Activo", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  inactive: { label: "Inactivo", class: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

interface ProcessTableProps {
  processes: Process[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (process: Process) => void;
  onDelete: (process: Process) => void;
  loading?: boolean;
}

export function ProcessTable({
  processes,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  loading = false,
}: ProcessTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Procesos</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proceso..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Código</TableHead>
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Descripción</TableHead>
                <TableHead className="text-muted-foreground">Requiere Máquina</TableHead>
                <TableHead className="text-muted-foreground">Tiempo Est. (min)</TableHead>
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
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : processes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay procesos registrados
                  </TableCell>
                </TableRow>
              ) : (
                processes.map((process) => (
                  <TableRow key={process.id} className="border-border">
                    <TableCell className="font-mono text-sm text-foreground">{process.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{process.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{process.processType}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {process.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={process.requiresMachine ? "default" : "secondary"}>
                        {process.requiresMachine ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {process.estimatedTimeMin ? `${process.estimatedTimeMin} min` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[process.status]?.class}>
                        {statusConfig[process.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(process)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(process)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
