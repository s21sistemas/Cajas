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
import { Search, MoreHorizontal, Eye, Pencil, Trash2, Car, Truck } from "lucide-react";
import type { Vehicle } from "@/lib/types/vehicle.types";

const statusColors: Record<string, string> = {
  'Available': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Assigned': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Under repair': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Out of service': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'Accident': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Stolen': 'bg-red-700/20 text-red-600 border-red-700/30',
  'Sold': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const statusLabels: Record<string, string> = {
  'Available': 'Disponible',
  'Assigned': 'Asignado',
  'Under repair': 'En reparación',
  'Out of service': 'Fuera de servicio',
  'Accident': 'Accidentado',
  'Stolen': 'Robado',
  'Sold': 'Vendido',
};

interface VehicleTableProps {
  vehicles: Vehicle[];
  search: string;
  onSearchChange: (value: string) => void;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  loading?: boolean;
}

export function VehicleTable({
  vehicles,
  search,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  loading = false,
}: VehicleTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Lista de Vehículos</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vehículos..."
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
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Marca / Modelo</TableHead>
                <TableHead className="text-muted-foreground">Placa</TableHead>
                <TableHead className="text-muted-foreground">Color</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">GPS</TableHead>
                <TableHead className="text-muted-foreground">Póliza</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay vehículos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {vehicle.typeVehicle === 'car' ? (
                          <Car className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Truck className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-foreground">
                          {vehicle.typeVehicle === 'car' ? 'Automóvil' : 'Motocicleta'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-foreground">{vehicle.brand}</span>
                        <span className="text-muted-foreground"> {vehicle.model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{vehicle.licensePlate}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{vehicle.color}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[vehicle.status || 'Available'] || statusColors['Available']}>
                        {statusLabels[vehicle.status || 'Available'] || vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={vehicle.gps === 'YES' ? 'default' : 'secondary'}>
                        {vehicle.gps === 'YES' ? 'Sí' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {vehicle.numeroPoliza || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(vehicle)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(vehicle)}>
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
