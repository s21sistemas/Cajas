"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Play,
  Square,
  CheckCircle,
  Pause,
} from "lucide-react";
import type { WorkOrder } from "@/lib/types";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-gray-500/20 text-gray-400", icon: Clock },
  in_progress: { label: "En Proceso", color: "bg-blue-500/20 text-blue-400", icon: Play },
  completed: { label: "Completada", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "bg-red-500/20 text-red-400", icon: Square },
  on_hold: { label: "Pausada", color: "bg-yellow-500/20 text-yellow-400", icon: Pause },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baja", color: "bg-gray-500" },
  medium: { label: "Media", color: "bg-blue-500" },
  high: { label: "Alta", color: "bg-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500" },
};

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onEdit: (order: WorkOrder) => void;
  onDelete: (order: WorkOrder) => void;
  onViewPipeline: (order: WorkOrder) => void;
}

export function WorkOrderTable({
  workOrders,
  onEdit,
  onDelete,
  onViewPipeline,
}: WorkOrderTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX");
  };

  if (workOrders.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No hay órdenes de trabajo</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Órdenes de Trabajo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Orden</TableHead>
              <TableHead className="text-muted-foreground">Producto</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Cantidad</TableHead>
              <TableHead className="text-muted-foreground">Progreso</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Prioridad</TableHead>
              <TableHead className="text-muted-foreground">Entrega</TableHead>
              <TableHead className="text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const priority = priorityConfig[order.priority] || priorityConfig.medium;
              const progress = order.progress;

              return (
                <TableRow key={order.id} className="border-border">
                  <TableCell>
                    <span className="font-mono text-sm">{order.code}</span>
                  </TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.client?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{order.quantity}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.completed} completadas
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-2 w-20" />
                      <span className="text-xs">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priority.color}>{priority.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(order.dueDate || '')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Ver Pipeline"
                        onClick={() => onViewPipeline(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar"
                        onClick={() => onEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Eliminar"
                        onClick={() => onDelete(order)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
