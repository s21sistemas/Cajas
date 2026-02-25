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
import { Search, MoreHorizontal, Eye, Pencil, Trash2, Truck } from "lucide-react";
import type { Delivery } from "@/lib/types/delivery.types";

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'assigned': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in_transit': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
  'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  'pending': 'Pendiente',
  'assigned': 'Asignado',
  'in_transit': 'En tránsito',
  'completed': 'Completado',
  'cancelled': 'Cancelado',
};

interface DeliveryTableProps {
  deliveries: Delivery[];
  search: string;
  onSearchChange: (value: string) => void;
  onView: (delivery: Delivery) => void;
  onEdit: (delivery: Delivery) => void;
  onDelete: (delivery: Delivery) => void;
  loading?: boolean;
}

export function DeliveryTable({
  deliveries,
  search,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  loading = false,
}: DeliveryTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Entregas</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entregas..."
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
                <TableHead className="text-muted-foreground">Conductor</TableHead>
                <TableHead className="text-muted-foreground">Dirección de Origen</TableHead>
                <TableHead className="text-muted-foreground">Vehículo</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Inicio</TableHead>
                <TableHead className="text-muted-foreground">Completado</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay entregas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{delivery.driver}</TableCell>
                    <TableCell className="text-foreground">{delivery.originAddress}</TableCell>
                    <TableCell>
                      {delivery.vehicle ? (
                        <Badge variant="outline" className="font-mono">
                          {delivery.vehicle.licensePlate}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[delivery.status || 'pending'] || statusColors['pending']}>
                        {statusLabels[delivery.status || 'pending'] || delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {delivery.startedAt 
                        ? new Date(delivery.startedAt).toLocaleString('es-MX')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {delivery.completedAt 
                        ? new Date(delivery.completedAt).toLocaleString('es-MX')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(delivery)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(delivery)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(delivery)}>
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
