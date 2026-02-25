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
import { Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import type { Operator } from "@/lib/types";

interface OperatorTableProps {
  operators: Operator[];
  search: string;
  onSearchChange: (value: string) => void;
  onView: (operator: Operator) => void;
  onEdit: (operator: Operator) => void;
  onDelete: (operator: Operator) => void;
  loading?: boolean;
  currentPage: number;
  lastPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function OperatorTable({ 
  operators, 
  search, 
  onSearchChange, 
  onView, 
  onEdit, 
  onDelete,
  loading = false,
  currentPage,
  lastPage,
  totalItems,
  onPageChange,
}: OperatorTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Operadores</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar operador..."
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
                <TableHead className="text-muted-foreground">Turno</TableHead>
                <TableHead className="text-muted-foreground">Especialidad</TableHead>
                <TableHead className="text-muted-foreground">Teléfono</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : operators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay operadores registrados.
                  </TableCell>
                </TableRow>
              ) : (
                operators.map((operator) => (
                  <TableRow key={operator.id} className="border-border">
                    <TableCell className="font-mono text-sm text-foreground">{operator.employeeCode}</TableCell>
                    <TableCell className="text-foreground">{operator.name}</TableCell>
                    <TableCell className="text-foreground">{operator.shift || '-'}</TableCell>
                    <TableCell className="text-foreground">{operator.specialty || '-'}</TableCell>
                    <TableCell className="text-foreground">{operator.phone || '-'}</TableCell>
                    <TableCell className="text-foreground">{operator.email || '-'}</TableCell>
                    <TableCell>
                      <Badge className={operator.active 
                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }>
                        {operator.active ? 'Activo' : 'Inactivo'}
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
                          <DropdownMenuItem onClick={() => onView(operator)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(operator)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(operator)}>
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
