"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { ChevronLeft, ChevronRight, Edit, Trash2, Phone, Search } from "lucide-react";
import type { Branch } from "@/lib/types";

interface BranchTableProps {
  branches: Branch[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  loading: boolean;
  currentPage: number;
  lastPage: number;
  totalBranches: number;
  onPageChange: (page: number) => void;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: "Activa", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  inactive: { label: "Inactiva", class: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export function BranchTable({
  branches,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  loading,
  currentPage,
  lastPage,
  totalBranches,
  onPageChange,
}: BranchTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lista de Sucursales</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sucursal..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Sucursal</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Dirección</TableHead>
                <TableHead className="text-muted-foreground">Ciudad</TableHead>
                <TableHead className="text-muted-foreground">Contacto</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron sucursales
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id} className="border-border">
                    <TableCell className="text-foreground">
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-xs text-muted-foreground">{branch.code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{branch.client?.name || "N/A"}</TableCell>
                    <TableCell className="text-foreground max-w-[200px] truncate">{branch.address}</TableCell>
                    <TableCell className="text-foreground">{branch.city}, {branch.state}</TableCell>
                    <TableCell className="text-foreground">
                      <div>
                        <p>{branch.contact || "-"}</p>
                        {branch.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {branch.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[branch.status]?.class}>
                        {statusConfig[branch.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(branch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(branch)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalBranches > 0 && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {branches.length} de {totalBranches} sucursales
            </p>
            {lastPage > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
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
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
