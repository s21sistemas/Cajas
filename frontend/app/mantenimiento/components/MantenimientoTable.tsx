"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Play, Check, FileText, Settings, Clock } from "lucide-react";
import type { MaintenanceOrder } from "@/lib/types";

// Status configuration
const typeLabels: Record<string, { label: string; class: string }> = {
  preventive: { label: "Preventivo", class: "bg-blue-500/20 text-blue-400" },
  corrective: { label: "Correctivo", class: "bg-orange-500/20 text-orange-400" },
  emergency: { label: "Emergencia", class: "bg-red-500/20 text-red-400" },
};

const priorityLabels: Record<string, { label: string; class: string }> = {
  low: { label: "Baja", class: "bg-gray-500/20 text-gray-400" },
  medium: { label: "Media", class: "bg-yellow-500/20 text-yellow-400" },
  high: { label: "Alta", class: "bg-orange-500/20 text-orange-400" },
  critical: { label: "Urgente", class: "bg-red-500/20 text-red-400" },
};

const statusLabels: Record<string, { label: string; class: string }> = {
  scheduled: { label: "Pendiente", class: "bg-gray-500/20 text-gray-400" },
  "in-progress": { label: "En Progreso", class: "bg-yellow-500/20 text-yellow-400" },
  completed: { label: "Completado", class: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Cancelado", class: "bg-gray-500/20 text-gray-400" },
};

const formatDate = (date: string | null) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

interface MantenimientoTableProps {
  items: MaintenanceOrder[];
  search: string;
  filterStatus: string;
  filterType: string;
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onFilterTypeChange: (value: string) => void;
  onView: (item: MaintenanceOrder) => void;
  onEdit: (item: MaintenanceOrder) => void;
  onStart: (item: MaintenanceOrder) => void;
  onComplete: (item: MaintenanceOrder) => void;
  onCancel: (item: MaintenanceOrder) => void;
  loading?: boolean;
}

export function MantenimientoTable({
  items,
  search,
  filterStatus,
  filterType,
  onSearchChange,
  onFilterStatusChange,
  onFilterTypeChange,
  onView,
  onEdit,
  onStart,
  onComplete,
  onCancel,
  loading = false,
}: MantenimientoTableProps) {
  // Estado para actualizar el tiempo cada segundo
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el tiempo cada segundo si hay mantenimientos en progreso
  useEffect(() => {
    const hasInProgress = items.some(item => item.status === "in-progress");
    if (!hasInProgress) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [items]);

  // Función para calcular las horas transcurridas en tiempo real
  const calculateElapsedHours = (startDate: string | null): number => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const diffMs = currentTime.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // 2 decimales
  };
  const getTypeBadge = (type: string) => {
    const config = typeLabels[type] || { label: type, class: "bg-gray-500/20 text-gray-400" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityLabels[priority] || { label: priority, class: "bg-gray-500/20 text-gray-400" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || { label: status, class: "bg-gray-500/20 text-gray-400" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-foreground">Ordenes de Mantenimiento</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-input border-border"
              />
            </div>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full md:w-40 bg-input border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Pendiente</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger className="w-full md:w-40 bg-input border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="preventive">Preventivo</SelectItem>
                <SelectItem value="corrective">Correctivo</SelectItem>
                <SelectItem value="emergency">Emergencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Codigo</TableHead>
                <TableHead className="text-muted-foreground">Maquina</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Prioridad</TableHead>
                <TableHead className="text-muted-foreground">Tecnico</TableHead>
                <TableHead className="text-muted-foreground">Fecha Prog.</TableHead>
                <TableHead className="text-muted-foreground">Progreso</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No hay ordenes de mantenimiento registradas.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.machineName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-48">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(item.type)}</TableCell>
                    <TableCell>{getPriorityBadge(item.priority || "medium")}</TableCell>
                    <TableCell className="text-muted-foreground">{item.technician || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(item.scheduledDate)}</TableCell>
                    <TableCell>
                      {item.status === "in-progress" && item.estimatedHours && (
                        <div className="w-24">
                          <Progress
                            value={
                              item.estimatedHours
                                ? Math.min(((calculateElapsedHours(item.startDate) || 0) / item.estimatedHours) * 100, 100)
                                : 0
                            }
                            className={`h-2 ${(calculateElapsedHours(item.startDate) || 0) > item.estimatedHours ? 'bg-red-500' : ''}`}
                          />
                          <p className={`text-xs mt-1 ${(calculateElapsedHours(item.startDate) || 0) > item.estimatedHours ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {calculateElapsedHours(item.startDate) || 0}h / {item.estimatedHours}h
                            {(calculateElapsedHours(item.startDate) || 0) > item.estimatedHours && (
                              <span className="ml-1">⚠️</span>
                            )}
                          </p>
                        </div>
                      )}
                      {item.status === "completed" && (
                        <div className="w-24">
                          {item.estimatedHours ? (
                            <Progress
                              value={Math.min(((Number(item.actualHours) || 0) / item.estimatedHours) * 100, 100)}
                              className={`h-2 ${(Number(item.actualHours) || 0) > item.estimatedHours ? 'bg-red-500' : ''}`}
                            />
                          ) : (
                            <Progress value={0} className="h-2" />
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <span className={(Number(item.actualHours) || 0) > (item.estimatedHours || 0) ? "text-red-400 text-xs" : "text-green-400 text-xs"}>
                              {item.actualHours != null ? Number(item.actualHours).toFixed(2) + 'h' : '-'}
                            </span>
                            {item.estimatedHours && (
                              <span className="text-muted-foreground text-xs">/ {item.estimatedHours}h</span>
                            )}
                            {(Number(item.actualHours) || 0) > (item.estimatedHours || 0) && (
                              <span className="text-xs text-red-400" title={`Excedido por ${(Number(item.actualHours) || 0) - (item.estimatedHours || 0)}h`}>
                                ⚠️
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {(item.status === "scheduled" || item.status === "cancelled") && (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "scheduled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onStart(item)}
                            title="Iniciar"
                          >
                            <Play className="h-4 w-4 text-green-400" />
                          </Button>
                        )}
                        {item.status === "in-progress" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onComplete(item)}
                            title="Completar"
                          >
                            <Check className="h-4 w-4 text-green-400" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(item)}
                          title="Ver detalle"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Settings className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            {(item.status === "scheduled" || item.status === "in-progress") && (
                              <DropdownMenuItem className="text-destructive" onClick={() => onCancel(item)}>
                                <Clock className="h-4 w-4 mr-2" /> Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
